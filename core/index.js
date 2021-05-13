
const http = require('http');
//************* */
const Router = require('../route');
const util = require('../utility');
const services = require('./services');


const core = function(options) {
    const router_arrays = {};
    let server;
    let error_handler = undefined;
    const apps = function(req, res) {
        //const route = router_arrays[req.url];
        const fg = services.getRouteForPath(req.url, router_arrays, req.method);
        console.log({ fg })
        const router = router_arrays[fg]
        if(!router){
            services.sendNotFound(res);
            return;
        }
        handle(req, res, router, error_handler);
    }
    if(options.https && options.key && options.cert) {
        const https = require('https');
        console.log('this is https')
        server = https.Server(options, apps);
    } else {
        server = http.Server(apps);
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
                    services.buildRouterMap(func, router_arrays, this.positions)
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
                    services.buildNewPathsWithRouter(path_key, paths, first, func, this.positions,router_arrays);
                    //router_arrays[first] = func;
                   }
               } else {
                   services.buildNewPaths(first, arguments.slice(1), this.positions, router_arrays);
               }
           }
        } else if(typeof first == 'function') {
             const func_signature = Object.getOwnPropertyDescriptors(first);
             const argument_length = func_signature.length.value;
             if(argument_length == 4 && !error_handler) {
                 // this is an error handler to be called with an error for all route.
                 error_handler = first;
                 return
             }
             this.positions.push(first);
        }
    }
    apps.listen = (port, callback) => {
        server.listen(port, callback);
    }
    return apps
}

const handle = async (req, res, router, error_handler) => {
    const url = req.url;
    const method = req.method.toLowerCase();
    const url_split = url.split('/')
    const len = url_split.length;
    let route_found = router.findPattern(len, url, method);

    util.extend(services.extendResponse(), res);

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

    const query_entries = new URL(`${req.headers.host}${req.url}`).searchParams.entries();
    const query = {}
    for(let val of query_entries) {
        query[val[0]] = val[1];
    }

    req.query = query


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

const readContent2 = function* (content_type, req) {
    req.on()
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

module.exports = core;