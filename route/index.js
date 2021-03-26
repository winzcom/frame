const Router = function() {
     this.methodPaths = {}
}
Router.prototype.get = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'get');
    // this.methodPaths[len].paths = {
    //     [path]: {
    //         method: 'get',
    //         controllers,
    //     }
    // }
}
Router.prototype.post = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'post');
    // this.methodPaths[len].paths = {
    //     [path]: {
    //         method: 'get',
    //         controllers,
    //     }
    // }
}
Router.prototype.regexPath = (path) => {
    if(!path) {
        throw new Error('Please provide a route')
    }
    const match = path.match(/^\/\w+((\/:?\w+)*$)/);

    if(!match) {
        throw new Error('Please provide a valid route');
    }

    return match;
}

Router.prototype.getParams = function (path, controllers, method) {
    const paths = this.regexPath(path);
    const first = paths[0];
    let splits = first.split('/')
    let len = splits.length;
    const params = []
    const param_position = {}
    if(!this.methodPaths[len]) {
        this.methodPaths[len] = {
            length: len,
            path: [],
        }
    }
    if(splits.length > 0) {
        for(let i = 0; i < splits.length; i += 1) {
            if(String(splits[i]).indexOf(':') == 0) {
                param_position[i] = splits[i];
                params.push(splits[i].replace(':', ''));
            }
        }
        this.methodPaths[len].paths = { ...this.methodPaths[len].paths, [path]: {
            method,
            controllers,
            params,
            splited: splits.splice(1),
            param_position,
        } }
        this.methodPaths[len].paths[path].param_length = splits.length
    }
    this.methodPaths[len].path.push(path);
    //console.log({ first: this.methodPaths[len].paths[path], path })
    return len;
}

Router.prototype.findPattern = function(len, path) {
    //this.regexPath(path);
    const path_split = path.split('/').splice(1);
    //console.log({ path_split });
    const exists = this.methodPaths[len];
    //console.log({ len, exists })
    if(exists) {
        const { path: all_paths, paths } = exists;
        for(let i = 0; i < all_paths.length; i += 1) {
            let it = all_paths[i];
            let set = paths[it];
            set.paramter = {}
            //console.log({ set: all_paths, path })
            if(all_paths[i] == path) { 
                // call handle to run controllers
                return set
            } else {
                const { param_length, params, param_position, splited } = set;
                let setdone = 0;
                for(let i = 0; i < splited.length; i += 1) {
                    if(splited[i] == path_split[i]) {
                        ++setdone
                    } else if(param_position[i + 1]) {
                        set.paramter[splited[i].replace(':', '')] = path_split[i]
                    }
                }
                if(setdone == splited.length - params.length) {
                    // call handle
                    return set;
                }
            }
        }
    }
    throw new Error(`No route found for ${path}`);
}

module.exports = Router

