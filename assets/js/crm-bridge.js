(function () {
    const globalConfig = window.SITE_CONFIG || {};

    function normalisePayload(payload) {
        const base = typeof payload === "object" && payload !== null ? payload : {};
        return Object.assign(
            {
                path: window.location.pathname,
                user_agent: window.navigator.userAgent,
                timestamp: new Date().toISOString()
            },
            base
        );
    }

    async function sendToCrm(endpoint, payload) {
        if (!endpoint) {
            return { skipped: true };
        }

        const body = JSON.stringify(normalisePayload(payload));
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body,
            credentials: "omit"
        });

        if (!response.ok) {
            const error = new Error(`CRM request failed with status ${response.status}`);
            error.status = response.status;
            throw error;
        }

        try {
            return await response.json();
        } catch (err) {
            return {};
        }
    }

    if (!window.crmBridge) {
        window.crmBridge = {
            config: globalConfig,
            sendToCrm
        };
    }
})();

