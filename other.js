const Router = require('./route');

const router = new Router();

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

router.get('/lk', (req, res) => {
    res.json({
        message: 'there '+ req.oh + ' '+ req.command
    })
})

module.exports = router;