const http = require('http')
const express = require('./core')
const Router = require('./router')
const Server = http.createServer(express())




const t = new Router()



t.patch(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res) {
    return res.end('OK')
})

t.any(/\/users\/(.*)\/allow/, function (req, res) {
    return res.end('USER')
})

express.use(function(req, res, next) {
    next()
})

express.decorate(function helloWorld() {
    console.log('hello world my people')
}, 'hello_world')

express.decorate({
    db: 'some.db',
    port: 3000
}, 'conf')

express.get('/params/:b/okay/:c', function(req, res, next) {
    res.writeHead(200, {
        'content-type': 'application/json'
    }).end(JSON.stringify({
        message: 'Hello world '+ req.params.b + ' and '+ req.params.c + ' getting the decorated function here '+this.hello_world()
    }))
})


express.any('/hello/world', function(req, res) {
    res.end('No Precons')
})

t.get('/commits/steve', function(req, res) {
    return res.end('SHOW')
})

console.log('match ', /\/users\/.*/.test('/users/match'))

express.use('/event', t)

Server.listen("9089")

