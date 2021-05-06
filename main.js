"use strict";
const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const server = http.Server(core(router));

router.post('/login/:bvn/gt/:run', (req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body } = req;
    res.json({
        message:'I am there with you love',
        data: {
            name: bvn,
            run: Boolean(run),
            body
        }
    })
})

router.get('/lk', (req, res) => {
    console.log('there you are')
    res.json({
        message: 'there'
    })
})

router.get('/login/:bvn/gt/:run', (req, res, next) => {
    try {
        req.user = 'sewtting user here'
        console.log('this will be called first ')
        next()
    } catch (error) {
        res.statusCode = 400
        res.json({
            message: error.message
        })
    }
}, (req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body } = req;
    console.log({ next })
    res.json({
        message:'I am next to you '+ req.user,
        data: {
            name: bvn,
            run,
            body
        }
    })
})

server.listen('9080', () => {
    console.log('start listening');
})