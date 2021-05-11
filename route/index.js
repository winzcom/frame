let instance;
const Router = function() {
    if(instance) {
        return instance;
    }
     this.methodPaths = {}
     instance = this;
}
Router.prototype.get = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'get');
}
Router.prototype.post = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'post');
}
Router.prototype.put = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'put');
}
Router.prototype.patch = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'patch');
}
Router.prototype.delete = function (path, ...controllers)  {
    const len = this.getParams(path, controllers, 'delete');
}
Router.regexPath = (path) => {
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
    const paths = Router.regexPath(path);
    const first = paths[0];
    let splits = first.split('/')
    let len = splits.length;
    const params = []
    const param_position = {}
    if(!this.methodPaths[`${len}_${method}`]) {
        this.methodPaths[`${len}_${method}`] = {
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
        this.methodPaths[`${len}_${method}`].paths = { ...this.methodPaths[`${len}_${method}`].paths, [path]: {
            method,
            controllers,
            params,
            splited: splits.splice(1),
            param_position,
        } }
        this.methodPaths[`${len}_${method}`].paths[path].param_length = splits.length
    }
    this.methodPaths[`${len}_${method}`].path.push(path);
    //console.log({ first: this.methodPaths[len].paths[path], path })
    return len;
}

Router.prototype.findPattern = function(len, path, method) {
    const path_split = path.split('/').splice(1);
    const exists = this.methodPaths[`${len}_${method}`];
    //console.log({ exists: exists.paths['/see/me'] })
    if(exists) {
        const { path: all_paths, paths } = exists;
        for(let i = 0; i < all_paths.length; i += 1) {
            let it = all_paths[i];
            let set = paths[it];
            if(!set) {
                return
            }
            set.paramter = {}
            if(all_paths[i] == path) { 
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
                    return set;
                }
            }
        }
    }
    return;
}

module.exports = Router

