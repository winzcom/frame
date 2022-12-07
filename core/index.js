const { createSecureServer } = require('node:http2')
const Router = require('../router')
const Itearable = require('./iterator')
const { sendHttpError, codes2Messages, 
    cleanFirstSlash, 
    extractQuery 
} = require('../util/utils')
let router = new Router()
const precon = []

router.precon = precon

function handler(iterate, req, res) {
    
    function nextCaller() {
        const v = iterate.next()
        //console.log({ ser: req.params, v })
        typeof v.value == 'function' && v.value(req, res, nextCaller)
    }
    nextCaller()
}

function extend(funcs, name) { 
    if(typeof funcs == 'function') {
        express = Object.assign(express, {
            [name]: funcs
        })
    } else if(typeof funcs == 'object') {
        Object.defineProperty(express, name, {
            configurable: true, value: {}
        })
        const names = Object.getOwnPropertyNames(funcs)

        for(let n of names) {
            const desc = Object.getOwnPropertyDescriptor(funcs, n)
            Object.defineProperty(express[name], n, desc)
        }
    }
}



function express(server) {
    return function(req, res) {
        let path  = extractQuery(req)
        let method = req.method.toLowerCase()
        path = cleanFirstSlash(path)
        const route_tree = router.find(path, method)
        if(!route_tree) {
            return sendHttpError(codes2Messages.NotFound, res)
        }
        const { route, params } = route_tree
        req.params = params
        const controllers = route.controllers[method] || route.controllers['any']
        if(!controllers) {
            return sendHttpError(codes2Messages.NotFound, res)
        }
        const iterate = Itearable(controllers)
        
        handler(iterate, req, res)
    }
}

function addPrecons() {
    const path = router.paths[Router.startPoint]
    const child = path.children[path.children.length - 1]
    //console.log({ precon })
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
                            /*&& path.children.length == 0*/)

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

express.decorate = extend

express.use = function() {
    if(arguments.length == 0) {
        throw new Error('Cannot call use without a parameter')
    }
    const [ first_args, ...rest ] = arguments

    if(typeof first_args == 'function') {
        // add to precontrollers
        if(rest.length == 0) {
            precon.push(first_args.bind(express))
            return
        }
        precon.push(first_args, ...rest)
    } else if(typeof first_args == 'string' && rest.length > 0) {
        let is_route = false, is_func = false
        let clean_path = cleanFirstSlash(first_args)
        for(let t of rest) {
            if(typeof t == 'function') {
                is_func = true
                if(is_route) {
                    throw new Error('Cannot use route class with functions declaration')
                }
                // create a route with funcs
                router.set(clean_path, t.bind(express))
            } else if(t instanceof Router) {
                router.addToList(clean_path, t, express)
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
        const clean_path = cleanFirstSlash(first_arg)
        for(let j = 0; j < rest.length; j += 1) {
            console.log({ afaf: rest[j] })
            rest[j] = rest[j].bind(express)
        }
        router.set(clean_path, rest, m.toLowerCase())
        addPrecons()
    } 
}

express.any = function() {
    const [first_arg, ...rest] = arguments
    const clean_path = cleanFirstSlash(first_arg)
    router.set(clean_path, rest, 'any')
    addPrecons()
}

module.exports = express