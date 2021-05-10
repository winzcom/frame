"use strict";
const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const app = core(router)

const server = http.Server(app);

router.post('/login/:bvn/gt/:run', (req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body } = req;
    next()
},(req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body } = req;
    next()
    res.json({
        message:'I am there with you love right now',
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
app.use('/run', router);

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