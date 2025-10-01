// Data Layer Setup
window.dataLayer = window.dataLayer || [];

function pushToDataLayer(event, data = {}) {
  window.dataLayer.push({
    event: event,
    timestamp: new Date().toISOString(),
    ...data
  });
}

// Enhanced E-commerce events (if needed)
function trackEcommerceEvent(eventName, ecommerceData) {
  pushToDataLayer(eventName, {
    ecommerce: ecommerceData
  });
}

// Custom event tracking
function trackCustomEvent(eventName, category, label, value = null) {
  pushToDataLayer('custom_event', {
    event_name: eventName,
    event_category: category,
    event_label: label,
    event_value: value
  });
}