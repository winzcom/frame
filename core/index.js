const Router = require('../route');

const core = function(router) {
    return function(req, res) {
        handle(req, res, router);
    }
}

const handle = (req, res, router) => {
    const url = req.url;

    console.log({ url, })

    const route_found = router.findPattern(url.split('/').length, url);
    if(!route_found) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end('Not found')
    }
    req.parameter = route_found.paramter;

    if(route_found.method.toLowerCase() != req.method.toLowerCase()) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
            error: 'Wrong Method Http method for route '+ url
        }))
    }

    const { controllers } = route_found;

    if(controllers.length == 0) {
        throw new Error('No handle set for route ', url);
    }

    for(let i = 0; i < controllers.length; i += 1) {
        controllers[i](req, res);
    }
}

const next = () => {
    
}

module.exports = core;