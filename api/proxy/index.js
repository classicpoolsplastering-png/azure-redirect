const PANEL = 'portal42-343.sbs';

module.exports = async function (context, req) {
    // Reconstruct path + query string
    let path = req.headers['x-ms-original-url'] || req.url || '/';
    
    // Handle full URL in header
    try { if (path.startsWith('http')) path = new URL(path).pathname + new URL(path).search; } catch(e){}
    
    // Strip /api/proxy prefix
    path = path.replace(/^\/api\/proxy/, '') || '/';
    if (!path.startsWith('/')) path = '/' + path;
    
    // Ensure query string is preserved
    if (req.query && Object.keys(req.query).length > 0) {
        const qs = new URLSearchParams(req.query).toString();
        if (!path.includes('?')) path += '?' + qs;
    }
    
    context.log('Forwarding to:', path);
    
    try {
        const r = await fetch(`https://${PANEL}${path}`, {
            method: req.method,
            headers: { 'Host': PANEL, 'User-Agent': 'Mozilla/5.0' },
            body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body),
            redirect: 'manual'
        });
        context.res = {
            status: r.status,
            headers: { 
                'Content-Type': r.headers.get('content-type') || 'text/html',
                'Location': r.headers.get('location') || ''  // preserve redirects
            },
            body: await r.text()
        };
    } catch (e) {
        context.res = { status: 500, body: 'Proxy Error: ' + e.message };
    }
};
