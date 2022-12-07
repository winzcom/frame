const http = require('http')
const express = require('../core')
const Router = require('../router')
const Server = http.createServer(express())




const t = new Router()



t.patch(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res) {
    return res.end('OK')
})

t.any(/\/users\/(.*)\/allow/, function (req, res) {
    return res.end('USER')
})

express.use(function(req, res, next) {
    this.decorate({
        hello_message: 'welcome to my express'
    }, 'helper_tool')
    next()
})

express.get('/params/:b/okay/:c', function(req, res, next) {
    res.writeHead(200, {
        'content-type': 'application/json'
    }).end(JSON.stringify({
        message: `Binding ${this.helper_tool.hello_message}`
    }))
})


express.any('/hello/world', function(req, res) {
    res.end('No Precons')
})

t.get('/commits/steve', function(req, res) {
    return res.end('SHOW')
})

express.use('/event', t)

Server.listen("9089")

