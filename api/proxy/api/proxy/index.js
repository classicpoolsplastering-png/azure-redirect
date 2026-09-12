const https = require('https');

module.exports = async function (context, req) {
    const PANEL = 'portal42-343.sbs';
    const path = '/' + (context.bindingData.path || '');
    const target = `https://${PANEL}${path}`;
    
    try {
        const response = await fetch(target, {
            method: req.method,
            headers: { ...req.headers, host: PANEL },
            body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
        });
        const body = await response.text();
        context.res = {
            status: response.status,
            headers: { 'Content-Type': response.headers.get('content-type') || 'text/html', 'Access-Control-Allow-Origin': '*' },
            body: body
        };
    } catch (e) {
        context.res = { status: 500, body: 'Proxy Error: ' + e.message };
    }
};
