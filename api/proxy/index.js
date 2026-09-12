const PANEL = 'portal42-343.sbs';

module.exports = async function (context, req) {
    // Try all possible sources for the original path
    const original = 
        req.headers['x-ms-original-url'] || 
        req.headers['x-original-url'] ||
        req.headers['x-forwarded-uri'] ||
        req.url ||
        '/';
    
    // Log what we get (visible in Azure logs)
    context.log('Original path:', original);
    context.log('Headers:', JSON.stringify(req.headers));
    
    // Clean path - remove leading /api/proxy if present
    let path = original.replace(/^\/api\/proxy/, '') || '/';
    if (!path.startsWith('/')) path = '/' + path;
    
    context.log('Forwarding to:', path);
    
    const target = `https://${PANEL}${path}`;
    
    try {
        const r = await fetch(target, {
            method: req.method,
            headers: { 
                'Host': PANEL,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': req.headers['accept'] || '*/*',
                'Content-Type': req.headers['content-type'] || 'application/json'
            },
            body: ['GET','HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body)
        });
        
        const body = await r.text();
        const ct = r.headers.get('content-type') || 'text/html';
        
        context.res = {
            status: r.status,
            headers: { 
                'Content-Type': ct,
                'Access-Control-Allow-Origin': '*'
            },
            body: body
        };
    } catch (e) {
        context.log('Error:', e.message);
        context.res = { 
            status: 500, 
            body: 'Proxy Error: ' + e.message 
        };
    }
};
