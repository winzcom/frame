const { methodPaths } = require('../other');
const Router = require('../route');
const util = require('../utility');


const core = function(router) {
    const router_arrays = {};
    let error_handler = undefined;
    const apps = function(req, res) {
        const first_path = req.url.match(/\/[^/]+/)
        const route = router_arrays[first_path];
        if(!route){
            sendNotFound(res);
            return;
        }
        //console.log({ route: route.methodPaths['3_post'].paths['/rich/:id'] })
        handle(req, res, route, error_handler);
    }
    apps.positions = [];
    apps.use = function() {
        if(arguments.length == 0) {
            return;
        }
       
        arguments = Array.from(arguments);

        const first = arguments[0]
        
        if(typeof first == 'string' && first.indexOf('/') > -1) {
           for(let i = 1; i <= arguments.slice(1).length; i += 1) {
               const func = arguments[i]
               if(!func || !(func.constructor == Function || func instanceof Router)) {
                   throw new TypeError('Argument after path should be a function or an instance of router');
               }
               if(func instanceof Router) {
                if(first.length == 1) {
                    buildRouterMap(func, router_arrays, this.positions)
                    return;
                }
                   const keys = Object.keys(func.methodPaths);
                   for(let j = 0; j < keys.length; j += 1) {
                    const split = keys[j].split('/').length;

                    const paths = func.methodPaths[keys[j]].paths;
                    const path_array = func.methodPaths[keys[j]].path;
                    for(let k = 0; k < path_array.length; k += 1) {
                        path_array[k] = `${first}${path_array[k]}`
                    }
                    func.methodPaths.path = path_array;
                    const path_key = Object.keys(paths);
                    buildNewPathsWithRouter(path_key, paths, first, func, this.positions);
                    router_arrays[first] = func;
                   }
               } else {
                   buildNewPaths(first, router, arguments.slice(1), this.positions);
               }
           }
        } else if(typeof first == 'function') {
             this.positions.push(first);
             const func_signature = Object.getOwnPropertyDescriptors(first);
             const argument_length = func_signature.length.value;
             if(argument_length == 4 && !error_handler) {
                 // this is an error handler to be called with an error for all route.
                 error_handler = first;
                 console.log({ error_handler })
             }
        }
    }
    return apps
}

const handle = async (req, res, router, error_handler) => {
    const url = req.url;
    const method = req.method.toLowerCase();
    const route_found = router.findPattern(url.split('/').length, url, method);

    util.extend(extendResponse(), res);

    if(!route_found) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end('Not found')
    }
    const readers = ['post', 'patch', 'put', 'patch', 'get', 'delete']
    const content_type = req.headers['content-type'];
    req.parameter = route_found.paramter;
    
    if(route_found.method.toLowerCase() != method) {
        res.statusCode = 415;
        return res.json({
            error: 'Method not allowed',
        })
    }
    const { controllers } = route_found;

    if(controllers.length == 0) {
        throw new Error('No handle set for route ', url);
    }

    const controller_iterator = controllers[Symbol.iterator]();

    const next = function(err) {
        if(err) {
            if(error_handler) {
                error_handler(req, res, next, err);
                return;
            }
        }
        const { value, done } = controller_iterator.next();
        if(!done && value && value.constructor == Function) {
            value(req, res, next, err);
        }
    }


    if(readers.includes(method)) {

        // need to read the body
        req.body = await readContent(content_type, req).then((data) => {
        req.body = data;
            next()
        }, (val) => {
            req.body = null
            controllers[0](req, res)
        })
    }
}

const readContent = (content_type, req) => {
    let buffer = Buffer.alloc(0)
    return new Promise((res) => {
        req.on('data', (buf) => {
            buffer = Buffer.concat([buffer, buf], buf.length + buffer.length);
        })
        req.on('end', () => {
            if(!content_type) {
                return res()
            }
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
        value: function(body = {}, status = 200) {
            const content_type = 'application/json';
            this.setHeader('Content-Type', content_type);
            this.statusCode = status;
            this.end(JSON.stringify(body));
            if(this.socket) {
                this.socket.destroy()
            }
        },
        configurable: false,
        enumerable: false,
        writable: true,
    })
    return extension;
}

const buildNewPathsWithRouter = (keys, object, prepend, router, positions) => {
    if(!keys || keys.length == 0) {
        return;
    }
    for(let i = 0; i < keys.length; i += 1) {
        const method = object[keys[i]].method;
        const controllers = object[keys[i]].controllers;
        for(let j = positions.length - 1; j >=0 ; j -= 1) {
            controllers.unshift(positions[j]);
        }
        router[method](`${prepend}${keys[i]}`, ...controllers)
        delete object[keys[i]];
    }
}

const buildNewPaths = (path, router, controllers, positions) => {
    const methods = ['get', 'post', 'patch', 'put', 'delete'];
    const new_router = new Router();
    for(let j = positions.length - 1; j >=0 ; j -= 1) {
        controllers.unshift(positions[j]);
    }
    for(let i = 0; i < methods.length; i += 1) {
        new_router[methods[i]](path, ...controllers);
    }
}

const buildRouterMap = (router, router_arrays, positions) => {
    const { methodPaths } = router;
    for(let j in methodPaths) {
       const df = methodPaths[j];
       //console.log({ df })
       const { paths: pc } = df;
        for(let k in pc) {
            const { controllers } = pc[k]
            for(let j = positions.length - 1; j >=0 ; j -= 1) {
                controllers.unshift(positions[j]);
            }
        }
        const paths = df.path
        for(let i = 0; i < paths.length; i += 1) {
            const f = paths[i].match(/\/[^/]+/)[0]
            router_arrays[f] = router; 
        }
    }
}

const sendNotFound = (res) => {
    res.statusCode = 404;
    res.end('NOT FOUND')
}

module.exports = core;