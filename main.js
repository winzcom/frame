"use strict";
const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const app = core()

const server = http.Server(app);

const what = require('./what')
const other = require('./other');

app.use(function(req, res, next) {
    console.log('you should be second')
    req.oh = 'yes'
    next();
})
app.use(function(req, res, next) {
    console.log('you should be first')
    req.command = 'no'
    next();
})

app.use('/', what);

app.use('/run', other);

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