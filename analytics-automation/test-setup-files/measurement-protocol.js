// Measurement Protocol v2 Setup
const MEASUREMENT_ID = 'G-4NZR3HR3J1';
const API_SECRET = 'YOUR_API_SECRET'; // 需要在GA4中创建

async function sendEventToGA4(eventData) {
  const response = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${MEASUREMENT_ID}&api_secret=${API_SECRET}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: await getClientId(),
      events: [eventData]
    })
  });

  return response.json();
}

async function getClientId() {
  // 从cookie或localStorage获取client_id
  let clientId = localStorage.getItem('ga_client_id');
  if (!clientId) {
    clientId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('ga_client_id', clientId);
  }
  return clientId;
}