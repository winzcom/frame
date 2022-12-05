const Router = require('../router')
const Itearable = require('./iterator')
let router = new Router()
const precon = []

function handler(iterate, req, res) {
    
    function nextCaller() {
        const v = iterate.next()
        typeof v.value == 'function' && v.value(req, res, nextCaller)
    }
    nextCaller()
}


function express() {
    return function(req, res) {
        let path = req.path
        let method = req.method.toLowerCase()
        const route_tree = router.find(path)
        if(!route_tree) {
            throw new Error('Cannot find specified route')
        }
        const { route, params } = route_tree
        req.params = params
        const controllers = route.controllers[method] || route.controllers['any']
        //console.log({ controllers, path })
        if(!controllers) {
            throw new Error('No route found for path '+ path)
        }
        const iterate = Itearable(controllers)
        
        handler(iterate, req, res)
    }
}

function addPrecons() {
    const path = router.paths[Router.startPoint]
    const child = path.children[path.children.length - 1]
    function dfs(path) {
        const children = path.children
        if(!path.preconset) path.preconset = {}
        if(children.length == 0) {
            // add precons at the starts of controllers
            const controllers = path.controllers
            for(control in controllers) {
                let new_controllers = []
                for(let i = 0; i < precon.length; i += 1) {
                    const pname = Object.getOwnPropertyDescriptors(precon[i]).name.value
                    
                    if(!path.preconset[pname]) {
                        new_controllers.push(precon[i])
                    }
                    path.preconset[pname] = true
                }
                controllers[control].unshift(...new_controllers)
            }
            return
        }
        const shouldset = ((Object.keys(path.controllers).length > 0) 
                            && Object.keys(path.methods).length > 0 
                            && path.children.length == 0)

        if(path.controllers && path.controllers.length > 0 || shouldset) {
            const controllers = path.controllers
            for(control in controllers) {
                for(let i = precon.length - 1; i >= 0; i -= 1) {
                    const pname = Object.getOwnPropertyDescriptors(precon[i]).name.value
                    if(!path.preconset[pname]) controllers[control].unshift(precon[i])
                    path.preconset[pname] = true
                }
            }
        }

        for(let j of children) {
            dfs(j)
        }
    }

    dfs(child)
}

express.use = function() {
    if(arguments.length == 0) {
        throw new Error('Cannot call use without a parameter')
    }
    const [ first_args, ...rest ] = arguments

    if(typeof first_args == 'function') {
        // add to precontrollers
        if(rest.length == 0) {
            precon.push(first_args)
            return
        }
        precon.push(first_args, ...rest)
        // for (let index = rest.length - 1; index >= 0; index -= 1) {
        //     precon.push(rest[index])
        // }
        precon.push(first_args)  
    } else if(typeof first_args == 'string' && rest.length > 0) {
        let is_route = false, is_func = false
        for(let t of rest) {
            if(typeof t == 'function') {
                is_func = true
                if(is_route) {
                    throw new Error('Cannot use route class with functions declaration')
                }
                // create a route with funcs
                router.set(first_args, t)
            } else if(t instanceof Router) {
                router.addToList(first_args, t)
                // need to open
                break
            }
        }
        addPrecons()
    } else {
        throw new Error('Cannot have a route without route class or functions')
    }
}

for(let m in Router.METHODS) {
    express[m.toLowerCase()] = function() {
        const [first_arg, ...rest] = arguments
        router.set(first_arg, rest, m.toLowerCase())
        addPrecons()
    } 
}

express.any = function() {
    const [first_arg, ...rest] = arguments
    router.set(first_arg, rest, 'any')
    addPrecons()
}

const t = new Router().set('logger', function logger(req, res) {
    console.log('i was called')
}, 'post')

t.set('user', function user(req, res) { console.log('user runner was called ')}, 'post')

express.use('event', t)

//express.use('route', t)
express.use(function precon(req, res, next) {
    console.log('hello world')  
    next()
}, function precon2(req, res, next) {
    console.log('hello world how do you')  
    next()
})
//express.use('set', t)
express.any('route', function(req, res, next) {
    console.log('runner2 was called')
    next()
}, 'any')

express.use(function okay(req, res, next) {
    console.log('last')
    next()
})

express.any('route/logger', function(req, res, next) {
    console.log('runner2 was called')
    next()
}, 'any')

express.use(function cors(req, res, next) {
    console.log('called cors')
    next()
})
express.get('route/logger/log', function(req, res, next) {
    console.log('runner2.5 was called')
    next()
}, 'get')

express.get('route/logger/log/:l', function(req, res, next) {
    console.log('runner3 was called')
    next()
}, 'get')


console.log({
    exp: express()({
        path:'route/logger/log',
        method:'get'
    }),
    // expas: express()({
    //     path: 'route/logger/log',
    //     method:'post'
    // }, {})
})
