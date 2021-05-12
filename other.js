const Router = require('./route');

const router = new Router();

router.post('/login/:bvn/gt/:run', (req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body, oh } = req;
    console.log({ oh })
    next(new Error('i am throwing an error here'))
},(req, res, next) => {
    const { bvn, run } = req.parameter;
    const { body } = req;
    const { save, picked } = req.query;
    res.json({
        message:'I am there with you love right now',
        data: {
            name: bvn,
            run: Boolean(run),
            body,
            save,
            picked,
        }
    })
})

router.get('/lk', (req, res) => {
    res.json({
        message: 'there '+ req.oh + ' '+ req.command
    })
})

module.exports = router;