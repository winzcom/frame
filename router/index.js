const { sendHttpError, codes2Messages, cleanFirstSlash } = require('../util/utils')
class Router {
    static METHODS = {
        GET: 'GET',
        POST: 'POST',
        HEAD: 'HEAD',
        DELETE: 'DELETE',
        PUT: 'PUT',
        PATCH: 'PATCH',
        OPTIONS: 'OPTIONS',
        ANY: 'ANY'
    }
    static startPoint = '0~0'

    constructor() {
        this.paths = { [Router.startPoint]: { 
            path: null, children: [], is_start: true,
            child_indexes: []
        } }

        for(let m in Router.METHODS) {
            this[m.toLocaleLowerCase()] = function() {
                arguments[0] = cleanFirstSlash(arguments[0])
                this.set(...arguments, m.toLocaleLowerCase())
            }
        }
    }

    set(path, controllers = [], method = 'get') {
       // path could be an instance of RegExp
       let is_reg_exp = false

       if(path instanceof RegExp) {
           const index = this.paths[Router.startPoint].children.push({
               path, methods: {[method]: method }, controllers: {
                   [method]: Array.isArray(controllers) ? controllers : [controllers]
               }, children: []
           })
           this.paths[Router.startPoint].child_indexes.push(index - 1)

           return
       }
       const path_split = path.split('/')
       if(typeof controllers == 'string' || (Array.isArray(controllers) && controllers.length == 0)) {
           throw new Error('No handler set for path '+ path)
       }
       let parent = this.paths[Router.startPoint], cur


       for(let i = 0; i < path_split.length;  i += 1) {
           let found
           cur = path_split[i]
           for(let j of parent.children) {
               if(j.path == cur) {
                 found = j
                 break
               }
           }
           if(found) {
               parent = found
           } else {
               const index = parent.children.push({
                   path: cur, methods: {},
                   children: [], controllers: {}
               })
               parent = parent.children[index - 1]
           }
       }
       if(method) {
           if(Array.isArray(controllers)) {
            parent.controllers[method] = controllers
           } else {
               if(parent.controllers[method]) {
                   parent.controllers[method].push(controllers)
               } else {
                   parent.controllers[method] = [controllers]
               }
           }
       }
       parent.methods[method] = method
       return this
    }

    addToList(path, router) {
        let route = this.find(path)
        if(route) {
            return route
        }
        // do we have it in the router
        const addition = {
            path, children: [],
            child_indexes: [],
            controllers: {}, methods: {}
        }
        
        const leader = this.paths[Router.startPoint]
        const index = leader.children.push(addition)
        const starter = router.paths[Router.startPoint].children

        for(let j of starter) {
            const child_index = leader.children[index - 1].children.push(j)
            if(j.path instanceof RegExp) {
                leader.children[index - 1].child_indexes.push(child_index - 1)   
            }
        }
        return this
    }

    find(path, method) {
        let parent = this.paths[Router.startPoint]

        //check for regexp
        if(parent.child_indexes.length > 0) {
            const child = parent.children[parent.child_indexes[0]]
            const newReg = new RegExp(child.path)
            if(newReg.test('/' + path)) {
                return { route: child, params: {} }
            }
            return
        }

        const path_split = path.split('/')

        const params = {}

        for(let i = 0; i < path_split.length; i += 1) {
            const cur = path_split[i]

            let found = false, first_param_occurence = -1
            
            for(let j = 0; j < parent.children.length; j += 1) {
                let p = parent.children[j]
                if(p.path == cur) {
                    parent = p
                    found = true
                    break
                } else if(/:/.test(p.path)) {
                    let found_with_method = p.methods[method]
                    const child_length = p.children.length > 0
                    if(!found_with_method) {
                        found_with_method = p.methods['any']
                    }
                    if(found_with_method || child_length) {
                        params[p.path.slice(1)] = cur
                        first_param_occurence = j
                    }
                }
            }
            if(!found) {
                if(first_param_occurence  < 0) {
                    return null
                }
                parent = parent.children[first_param_occurence]
            } else if(parent.child_indexes && parent.child_indexes.length > 0) {
                const child = parent.children[parent.child_indexes[0]]
                const newReg = new RegExp(child.path)
                let new_path = (path_split.slice(i + 1).join('/'))
                if((newReg.test('/' + new_path) || newReg.test(new_path)) && (child.methods[method] || child.methods['any'])) {
                    return { route: child, params: {} }
                }
                continue
            }
        }
        if(parent.is_start || !parent.methods || Object.keys(parent.methods).length == 0) {
            return null
        }
        return { route: parent, params }
    }
}

module.exports = Router
