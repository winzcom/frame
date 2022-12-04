const Router = require('../router')
const Itearable = require('./iterator')
let router = new Router()
const precon = [function precon(req, res, next) {
    next()
}]

function handler(iterate, req, res) {
    
    function nextCaller() {
        const v = iterate.next()
        v.value(req, res, nextCaller)
    }
    nextCaller()
}


function express() {
    return function(req, res) {
        let path = req.path
        let method = req.method.toLowerCase()
        const route = router.find(path)
        if(!route) {
            throw new Error('cannot find route for path ', path)
        }

        const iterate = Itearable(route.controllers[method])
        
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
                for(let p of precon) {
                    const pname = Object.getOwnPropertyDescriptors(p).name.value
                    if(!path.preconset[pname]) controllers[control].unshift(p)
                    path.preconset[pname] = true
                }
            }
            return
        }
        if(path.controllers && path.controllers.length > 0) {
            if(!path.preconset[pname]) controllers[control].unshift(p)
                path.controllers.unshift(...precon)
            path.preconset[pname] = true
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

    //console.log({ first_args, rest })

    if(typeof first_args == 'function') {
        // add to precontrollers
        precon.push(first_args, ...rest)
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
                addPrecons()
                break
            }
        }
    } else {
        throw new Error('Cannot have a route without route class or functions')
    }
}

for(let m in Router.METHODS) {
    express[m.toLowerCase()] = function() {
        const [first_arg, ...rest] = arguments
        router.set(first_arg, rest, m.toLowerCase())
    } 
}

const t = new Router().set('logger', function logger(req, res) {
    console.log('i was called')
}, 'post')

t.set('user', function user(req, res) {}, 'post')
express.use('route', t)
express.use('set', t)

console.log({
    exp: express()({
        path:'route/logger',
        method:'post'
    }, {})
})
