const http = require('http')
const express = require('../core')
const Router = require('../router')
const Server = http.createServer(express())




const t = new Router()



t.any(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res) {
    return res.json({
        message: 'parsed body',
        body: req.body
    })
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

express.use(express.parser)

express.get('/params/:b/okay/:c', function(req, res, next) {
    res.json({
        message: `Binding ${this.helper_tool.hello_message}`
    }, 400)
    next()
}, function after(req, res, next) {
    console.log('after was called')
})


express.any('/hello/world', function(req, res) {
    res.end('No Precons')
})

t.get('/commits/steve', function(req, res) {
    return res.end('SHOW')
})

express.use('/event', t)

Server.listen("9089")

