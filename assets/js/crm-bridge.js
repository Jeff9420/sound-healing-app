(function () {
    const globalConfig = window.SITE_CONFIG || {};

    /**
     * 检测端点类型并转换为对应格式
     */
    function detectEndpointType(endpoint) {
        if (!endpoint) return 'unknown';
        if (endpoint.includes('hsforms.com')) return 'hubspot';
        if (endpoint.includes('zapier.com')) return 'zapier';
        if (endpoint.includes('make.com')) return 'make';
        return 'custom';
    }

    /**
     * 转换为 HubSpot Forms API 格式
     * https://developers.hubspot.com/docs/api/marketing/forms
     */
    function convertToHubSpotFormat(payload) {
        const fields = [];

        // 映射常见字段
        const fieldMap = {
            'email': 'email',
            'name': 'name',
            'goal': 'meditation_goal',
            'time': 'preferred_time',
            'firstname': 'firstname',
            'lastname': 'lastname',
            'phone': 'phone',
            'company': 'company'
        };

        // 转换字段格式
        for (const [key, value] of Object.entries(payload)) {
            // 跳过特殊字段
            if (['event', 'form_name', 'funnel_step', 'source', 'form_id'].includes(key)) {
                continue;
            }

            // 处理 name 字段（拆分为 firstname 和 lastname）
            if (key === 'name' && typeof value === 'string') {
                const nameParts = value.trim().split(/\s+/);
                fields.push({
                    name: 'firstname',
                    value: nameParts[0] || ''
                });
                if (nameParts.length > 1) {
                    fields.push({
                        name: 'lastname',
                        value: nameParts.slice(1).join(' ')
                    });
                }
                continue;
            }

            // 映射字段名
            const hubspotFieldName = fieldMap[key] || key;

            fields.push({
                name: hubspotFieldName,
                value: value
            });
        }

        // 添加生命周期阶段
        fields.push({
            name: 'lifecyclestage',
            value: payload.goal ? 'lead' : 'subscriber'
        });

        // 添加来源追踪
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source') || 'website';
        const utmMedium = urlParams.get('utm_medium') || 'form';
        const utmCampaign = urlParams.get('utm_campaign') || '';

        if (utmSource) fields.push({ name: 'utm_source', value: utmSource });
        if (utmMedium) fields.push({ name: 'utm_medium', value: utmMedium });
        if (utmCampaign) fields.push({ name: 'utm_campaign', value: utmCampaign });

        // 添加语言信息
        fields.push({
            name: 'preferred_language',
            value: navigator.language || 'zh-CN'
        });

        return {
            fields: fields,
            context: {
                pageUri: window.location.href,
                pageName: document.title || 'SoundFlows',
                ipAddress: '{{auto}}' // HubSpot 会自动填充
            },
            legalConsentOptions: {
                // 根据需要添加同意选项
                consent: {
                    consentToProcess: true,
                    text: "I agree to allow Example Company to process my personal data.",
                    communications: [
                        {
                            value: true,
                            subscriptionTypeId: 999,
                            text: "I agree to receive marketing communications from Example Company."
                        }
                    ]
                }
            }
        };
    }

    /**
     * 通用格式（用于 Zapier, Make.com 等）
     */
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

        // 检测端点类型
        const endpointType = detectEndpointType(endpoint);

        // 根据端点类型转换数据格式
        let body;
        if (endpointType === 'hubspot') {
            body = JSON.stringify(convertToHubSpotFormat(payload));
        } else {
            body = JSON.stringify(normalisePayload(payload));
        }

        console.log('[CRM Bridge] Endpoint type:', endpointType);
        console.log('[CRM Bridge] Request body:', body);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            body,
            credentials: "omit"
        });

        console.log('[CRM Bridge] Response status:', response.status);

        if (!response.ok) {
            // 尝试获取错误详情
            let errorDetails = '';
            try {
                const errorBody = await response.text();
                console.error('[CRM Bridge] Error response:', errorBody);
                errorDetails = errorBody;
            } catch (e) {
                // 忽略解析错误
            }

            const error = new Error(`CRM request failed with status ${response.status}${errorDetails ? ': ' + errorDetails : ''}`);
            error.status = response.status;
            error.details = errorDetails;
            throw error;
        }

        try {
            const result = await response.json();
            console.log('[CRM Bridge] Success response:', result);
            return result;
        } catch (err) {
            return { success: true };
        }
    }

    if (!window.crmBridge) {
        window.crmBridge = {
            config: globalConfig,
            sendToCrm,
            detectEndpointType,
            convertToHubSpotFormat
        };
    }
})();

