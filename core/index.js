const Router = require('../route');
const util = require('../utility');


const core = function(router) {
    const apps = function(req, res) {
        handle(req, res, router);
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
                   }
               } else {
                   buildNewPaths(first, router, arguments.slice(1), this.positions);
               }
           }
        } else if(typeof first == 'function') {
             this.positions.push(first);
        }
    }
    return apps
}

const handle = async (req, res, router) => {
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
            // else if(content_type.indexOf('multipart/form-data') > -1) {
            //     console.log({ buffer: buffer.toString() })
            //     let matched = buffer.toString().split(/-+\d+\r\n/).splice(1);   
            //     //console.log({ buffer: buffer.toString() })
            //     let json = {};
            //     /**
            //      * The anonymous function to run for normal field
            //      */
            //     // run for normal field;
            //     (function() {
            //         for(let i = 0; matched && i < matched.length; i += 1) {
            //             const val = matched[i];
            //             //console.log({ val })
            //             let key = val.match(/name=(["](?=(.+?)")\2)/);
            //             if(!key) {
            //                 continue
            //             }
            //             key = key[1].replace(/\W+/g, '');
            //             const key_val = val.match(/\r\n\r\n(.+)\r\n/);
            //             if(key_val) {
            //                 json[key] = key_val[1];
            //             } else {
            //                 const is_file = val.match(/filename="(.*?)"\r\n(content-type:(.*)\r\n)?/i)
            //                 if(!is_file) {
            //                     continue
            //                 }
            //                 json[key] = {
            //                     field_name: key,
            //                     file_name: is_file[1],
            //                     file_type: is_file[3].trim()
            //                 }
            //                 const file = val.match(/content-type:\s*.*?\r\n\r\n(?=(.*?\n))\1/i)
            //                 //console.log({ file })
            //             }
            //         }
            //         buffer = json;
            //     })(); /*** end for normal field */
            // }
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

module.exports = core;