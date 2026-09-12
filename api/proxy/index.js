const PANEL = 'portal42-343.sbs';

module.exports = async function (context, req) {
    const path = '/' + (context.bindingData.path || '');
    try {
        const r = await fetch(`https://${PANEL}${path}`, {
            method: req.method,
            headers: { ...req.headers, host: PANEL },
            body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
        });
        context.res = {
            status: r.status,
            headers: { 'Content-Type': r.headers.get('content-type') || 'text/html' },
            body: await r.text()
        };
    } catch (e) {
        context.res = { status: 500, body: 'Proxy Error' };
    }
};
