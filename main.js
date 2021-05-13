"use strict";
const core = require('./core')


const app = core({
    https: true,
})

//const server = http.Server(app);

const what = require('./what')
const other = require('./other');

app.use((req, res, next) => {
    next()
})

app.use(function(req, res, next) {
    req.oh = 'yes'
    next();
})
app.use(function(req, res, next) {
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

app.use('/see/me/kl', (req, res, next) => {
    next()
 }, (req, res) => {
     res.json({
         message: '6 millions ' + req.oh
     })
 })

app.use(function(req, res, next, err) {
    next()
})

app.listen('9080', () => {
    console.log('start listening');
})