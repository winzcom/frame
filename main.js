"use strict";
const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const app = core(router)

const server = http.Server(app);

router.post('/login/:bvn/gt/:run', (req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body, oh } = req;
    console.log({ oh })
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
app.use(function(req, res, next) {
    req.oh = 'yes'
    next();
})

router.get('/lk', (req, res) => {
    res.json({
        message: 'there '+ req.oh
    })
})

app.use('/run', router);

app.use('/see/me', (req, res, next) => {
   next()
}, (req, res) => {
    res.json({
        message: '5 millions ' + req.oh
    })
})

router.get('/login/:bvn/gt/:run', (req, res, next) => {
    try {
        req.user = 'sewtting user here'
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