// Global site configuration for API endpoints.
// Update subscribeEndpoint and planEndpoint to match your CRM or marketing automation webhook.
window.SITE_CONFIG = window.SITE_CONFIG || {
    subscribeEndpoint: "",
    planEndpoint: "",
    emailAutomation: {
        provider: "custom",
        endpoint: "",
        method: "POST",
        listId: "",
        doubleOptIn: false,
        tags: [],
        headers: {},
        authScheme: "Bearer",
        apiKey: "",
        apiSecret: "",
        defaultPayload: {}
    },
    account: {
        signupEndpoint: "",
        loginEndpoint: "",
        redirectUrl: ""
    }
};
