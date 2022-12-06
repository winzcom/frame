const http = require('http')
const express = require('./core')
const Router = require('./router')
const Server = http.createServer(express())


const t = new Router()

express.use(function params(req, res, next) {
    req.params.hello = 'world'
    next()
})

t.get(':u', function user(req, res) {
    const json_message = {
        message: `this is u ${req.params.u} and has hello ${req.params.hello}`
    }
    const message_2_string = JSON.stringify(json_message)

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(message_2_string),
        'Content-Type': 'application/json'
      }).end(message_2_string + '\n')
})

t.get(':u/:s', function user(req, res) {
    const json_message = {
        message: `Got at all steve ${req.params.s}`
    }
    const message_2_string = JSON.stringify(json_message)

    res.writeHead(200, {
        'Content-Length': Buffer.byteLength(message_2_string),
        'Content-Type': 'application/json'
      }).end(message_2_string + '\n')
})

t.post('/hello/world', function(req, res) {
    const json_message = {
        message: 'Hello my ' + req.params.hello,
        status: true
    }

    const message_2_string = JSON.stringify(json_message)

    res.writeHead(201, {
        'Content-Length': Buffer.byteLength(message_2_string),
        'Content-Type': 'application/json'
    }).end(message_2_string + '\n')
})


// t.post('user/:c', function user(req, res) { 
//     const json_message = {
//         message: `Got this from params ${req.params.c}`
//     }
//     const message_2_string = JSON.stringify(json_message)

//     res.writeHead(200, {
//         'Content-Length': Buffer.byteLength(message_2_string),
//         'Content-Type': 'application/json'
//       }).end(message_2_string + '\n')
// })

// t.get('user/:b', function user(req, res) { 
//     const json_message = {
//         message: `Got this from paramssss ${req.params.b}`
//     }
//     const message_2_string = JSON.stringify(json_message)

//     res.writeHead(200, {
//         'Content-Length': Buffer.byteLength(message_2_string),
//         'Content-Type': 'application/json'
//       }).end(message_2_string + '\n')
// })


express.use('/event', t)

//express.use('route', t)
// express.use(function precon(req, res, next) {
//     console.log('hello world')  
//     next()
// }, function precon2(req, res, next) {
//     console.log('hello world how do you ')  
//     next()
// })
// //express.use('set', t)
// express.any('/route', function(req, res, next) {
//     console.log('runner2 was called')
//     res.end('OK')
//     next()
// })

// express.use(function okay(req, res, next) {
//     console.log('last')
//     next()
// })

// express.any('/route/logger', function(req, res, next) {
//     console.log('runner2 was called')
//     next()
// }, 'any')

// express.use(function cors(req, res, next) {
//     console.log('called cors')
//     next()
// })
// express.get('/route/logger/log', function(req, res, next) {
//     console.log('runner2.5 was called')
//     next()
// }, 'get')

// express.get('/route/logger/log/:l', function(req, res, next) {
//     console.log('runner3 was called')
//     next()
// }, 'get')

Server.listen("9089")

