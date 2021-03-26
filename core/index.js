const Router = require('../route');
const util = require('../utility')

const core = function(router) {
    return function(req, res) {
        handle(req, res, router);
    }
}

const handle = async (req, res, router) => {
    const url = req.url;
    const route_found = router.findPattern(url.split('/').length, url);

    util.extend(extendResponse(), res);

    if(!route_found) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end('Not found')
    }
    const readers = ['post', 'patch', 'put', 'patch']
    const content_type = req.headers['content-type']
    req.parameter = route_found.paramter;

    const method = req.method.toLowerCase();
    
    if(route_found.method.toLowerCase() != method) {
        res.statusCode = 400;
        return res.json({
            error: 'Method not allowed',
        })
    }
    const { controllers } = route_found;

    if(controllers.length == 0) {
        throw new Error('No handle set for route ', url);
    }

    if(readers.includes(method)) {
        // need to read the body
        req.body = await readContent(content_type, req);
    }

    for(let i = 0; i < controllers.length; i += 1) {
        controllers[i](req, res);
    }
}

const readContent = (content_type, req) => {
    let buffer = ''
    return new Promise((res) => {
        req.on('data', (buf) => {
            buffer += buf.toString('ascii');
        })
        req.on('end', () => {
            if(content_type == 'application/json') {
                buffer = JSON.parse(buffer);
            } else if(content_type == 'application/x-www-form-urlencoded') {
                const first_split = buffer.split('&');
                if(first_split.length > 0) {
                    let second = {}
                    for(let i = 0; i < first_split.length; i += 1) {
                        const second_split = first_split[i].split('=');
                        second[second_split[0]] = second_split[1];
                    }
                    buffer = second;
                }
            }
            res(buffer);
        })
    })
}

const extendResponse = () => {
    const extension = {};
    Object.defineProperty(extension, 'json', {
        value: function(body = {}) {
            const content_type = 'application/json';
            this.setHeader('Content-Type', content_type);
            return this.end(JSON.stringify(body));
        },
        configurable: false,
        enumerable: false,
        writable: true,
    })
    return extension;
}

const next = () => {
    
}

module.exports = core;