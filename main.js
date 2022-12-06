const http = require('http')
const express = require('./core')
const Router = require('./router')
const Server = http.createServer(express())




const t = new Router()



t.patch(/^\/commits\/(\w+)(?:\.\.(\w+))?$/, function(req, res) {
    return res.end('OK')
})

express.use(function(req, res, next) {
    console.log('what are you saying')
    next()
})


express.any('/hello/world', function(req, res) {
    res.end('No Precons')
})

t.get('/commits/steve', function(req, res) {
    return res.end('SHOW')
})



express.use('/event', t)

Server.listen("9089")

