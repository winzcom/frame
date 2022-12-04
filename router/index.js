class Router {
    static METHODS = {
        GET: 'GET',
        POST: 'POST',
        HEAD: 'HEAD',
        DELETE: 'DELETE',
        PUT: 'PUT',
        PATHC: 'PATCH',
        OPTIONS: 'OPTIONS'
    }
    static startPoint = '0~0'

    constructor() {
        this.paths = { [Router.startPoint]: { 
            path: null, children: [], is_start: true,
        } }
    }

    set(path = '', controllers = [], method) {
       const path_split = path.split('/')

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
       return parent
    }

    addToList(path, router) {
        let route = this.find(path)
        if(route) {
            return route
        }
        // do we have it in the router
        const addition = {
            path, children: []
        }
        
        const leader = this.paths[Router.startPoint]
        const index = leader.children.push(addition)
        const starter = router.paths[Router.startPoint].children

        for(let j of starter) {
            leader.children[index - 1].children.push(j)
        }
    }

    insert(path, router) {
        
    }

    find(path) {
        let parent = this.paths[Router.startPoint]

        const path_split = path.split('/')

        for(let i = 0; i < path_split.length; i += 1) {
            const cur = path_split[i]
            let found = false, first_param_occurence = -1
            
            for(let j = 0; j < parent.children.length; j += 1) {
                let p = parent.children[j]
                if(p.path == cur) {
                    parent = p
                    found = true
                    break
                } else if(/:/.test(p.path) && first_param_occurence > -1){
                    first_param_occurence = j
                }
            }
            if(!found) {
                if(first_param_occurence  < 0) {
                    return null
                }
                parent = parent.children[first_param_occurence]
            }
        }

        if(parent.is_start || Object.keys(parent.methods).length == 0) {
            return null
        }
        return parent
    }
}

const test = new Router()

test.set('trace/run/test/go', [function world() {}, function cup() {} ], 'post')
test.set('trace/run/test', [function worldRunner() {}, function cupRunner() {} ], 'post')
test.set('log/run/test', [function hello() {}, function afcon(){} ], 'post')
test.set('run/test', [function hello() {}, function afcon(){} ], 'patch')
test.set('run/test', [function learning() {}, function algo(){} ], 'post')
test.set('run/test/hello', [function Testhello() {}, function Testafcon(){} ], 'head')
test.set('run/running/runner', [function running() {}, function track(){} ], 'patch')
const n = new Router()
n.addToList('run', test)

let d = test.paths[Router.startPoint].children[0]

console.log({
    //routers: d.children[0].children,
    finda: n.find('run/trace/run/test/go').controllers
})


module.exports = Router
