(function () {
    const config = (window.SITE_CONFIG && window.SITE_CONFIG.emailAutomation) || null;

    function isEnabled() {
        return !!(config && config.endpoint);
    }

    function buildHeaders(extraHeaders = {}) {
        const headers = Object.assign({}, extraHeaders);

        if (!headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }
        if (!headers.Accept) {
            headers.Accept = "application/json";
        }

        if (config) {
            const authScheme = config.authScheme || "Bearer";
            if (config.apiKey && config.apiSecret && authScheme.toLowerCase() === "basic") {
                const token = btoa(`${config.apiKey}:${config.apiSecret}`);
                headers.Authorization = `Basic ${token}`;
            } else if (config.apiKey && authScheme) {
                headers.Authorization = `${authScheme} ${config.apiKey}`;
            } else if (config.apiKey && !authScheme) {
                headers.Authorization = config.apiKey;
            }
        }

        return headers;
    }

    function buildPayload(action, payload) {
        const base = {
            action,
            provider: (config && config.provider) || "custom",
            timestamp: new Date().toISOString(),
            path: window.location.pathname
        };
        return Object.assign(base, config?.defaultPayload || {}, payload || {});
    }

    async function sendRequest(action, payload) {
        if (!isEnabled()) {
            return { skipped: true };
        }

        const body = JSON.stringify(buildPayload(action, payload));
        const response = await fetch(config.endpoint, {
            method: config.method || "POST",
            headers: buildHeaders(config.headers || {}),
            body,
            credentials: config.credentials || "omit"
        });

        if (!response.ok) {
            const error = new Error(`Email automation request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }

        try {
            return await response.json();
        } catch (error) {
            return {};
        }
    }

    async function subscribe(email, options = {}) {
        if (!email) {
            throw new Error("Email is required for subscription.");
        }

        const payload = {
            email,
            listId: options.listId || config?.listId || null,
            doubleOptIn: options.doubleOptIn ?? config?.doubleOptIn ?? false,
            mergeFields: options.mergeFields || {},
            tags: options.tags || config?.tags || [],
            extra: options.extraPayload || {}
        };

        return sendRequest("subscribe", payload);
    }

    async function triggerJourney(eventName, properties = {}) {
        if (!eventName) {
            throw new Error("Event name is required for triggerJourney.");
        }
        return sendRequest("journey", {
            eventName,
            properties
        });
    }

    async function emitEvent(eventName, properties = {}) {
        if (!eventName) {
            throw new Error("Event name is required for emitEvent.");
        }
        return sendRequest("event", {
            eventName,
            properties
        });
    }

    if (!window.emailAutomation) {
        window.emailAutomation = {
            config,
            isEnabled,
            subscribe,
            triggerJourney,
            emitEvent
        };
    }
})();

