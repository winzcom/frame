const Router = require('../router')
let router = new Router()
const precon = []
function express() {
    return function(req, res) {
        
    }
}

express.use = function() {
    if(arguments.length == 0) {
        throw new Error('Cannot call use without a parameter')
    }
    const [ first_args, ...rest ] = arguments

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
                // need to open
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

console.log(express.get('/route', function(req, res) {}, function(req, res) {}))