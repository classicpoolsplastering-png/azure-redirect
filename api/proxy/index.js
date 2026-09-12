const PANEL = 'portal42-343.sbs';

module.exports = async function (context, req) {
    // Get the full original URL path
    const originalUrl = req.headers['x-ms-original-url'] || 
                       req.headers['x-ms-original-url'.toLowerCase()] ||
                       req.url || '/';
    
    let path = originalUrl;
    try { if (path.startsWith('http')) path = new URL(path).pathname; } catch(e){}
    path = path.replace(/^\/api\/proxy/, '') || '/';
    if (!path.startsWith('/')) path = '/' + path;
    
    context.log('Forwarding to:', `https://${PANEL}${path}`);
    
    try {
        const r = await fetch(`https://${PANEL}${path}`, {
            method: req.method,
            headers: { 'Host': PANEL, 'User-Agent': 'Mozilla/5.0' },
            body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
        });
        context.res = {
            status: r.status,
            headers: { 'Content-Type': r.headers.get('content-type') || 'text/html' },
            body: await r.text()
        };
    } catch (e) {
        context.res = { status: 500, body: 'Proxy Error: ' + e.message };
    }
};
