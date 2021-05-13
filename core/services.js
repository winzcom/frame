const Router = require('../route');

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

const buildNewPathsWithRouter = (keys, object, prepend, router, positions, router_arrays) => {
    if(!keys || keys.length == 0) {
        return;
    }
    for(let i = 0; i < keys.length; i += 1) {
        const method = object[keys[i]].method;
        const controllers = object[keys[i]].controllers;
        for(let j = positions.length - 1; j >= 0 ; j -= 1) {
            controllers.unshift(positions[j]);
        }
        router[method](`${prepend}${keys[i]}`, ...controllers)
        delete object[keys[i]];
        let has_param = false;
        if(/:\w+?/.test(`${prepend}${keys[i]}`)) {
            has_param = true;
        }
        //router_arrays[`${prepend}${keys[i]}`] = router;
        
        saveRouteForPath(`${prepend}${keys[i]}`, router_arrays, router, has_param, method);
    }
}

const buildNewPaths = (path, controllers, positions, router_arrays) => {
    const methods = ['get', 'post', 'patch', 'put', 'delete'];
    const new_router = new Router();
    for(let j = positions.length - 1; j >=0 ; j -= 1) {
        controllers.unshift(positions[j]);
    }
    let has_param = false;
    if(/:\w+?/.test(path)) {
        has_param = true;
    }
    for(let i = 0; i < methods.length; i += 1) {
        new_router[methods[i]](path, ...controllers);
        //console.log({ has_param, path, m:  methods[i] })
        saveRouteForPath(path, router_arrays, new_router, has_param, methods[i]);
    }
    //console.log(`/#######################/`)
}

const buildRouterMap = (router, router_arrays, positions) => {
    const { methodPaths } = router;
    for(let j in methodPaths) {
       const df = methodPaths[j];
       const { paths: pc } = df;
        for(let k in pc) {
            const { controllers } = pc[k]
            for(let j = positions.length - 1; j >=0 ; j -= 1) {
                controllers.unshift(positions[j]);
            }
            saveRouteForPath(k, router_arrays, router, pc[k].has_param, pc[k].method);
        }
    }
}

const saveRouteForPath = (path, router_array, router, has_param, method) => {
    const len_path = path.split('/');
    if(!has_param) {
        router_array[`${method}_${path}`] = router
    } else {
        const set = `${method}_/${len_path[1]}`
        router_array[set] = router;
    }
}

const getRouteForPath = (path, router_array, method) => {
    const len_path = path.split('/');
    method = method.toLowerCase()
    if(router_array[`${method.toLowerCase()}_${path}`]) {
        return `${method.toLowerCase()}_${path}`;
    } else return `${method}_/${len_path[1]}`
}

const sendNotFound = (res) => {
    res.statusCode = 404;
    res.end('NOT FOUND')
}

module.exports = {
    sendNotFound,
    buildNewPaths,
    buildNewPathsWithRouter,
    buildRouterMap,
    readContent,
    extendResponse,
    getRouteForPath,
}