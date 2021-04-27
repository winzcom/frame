const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const server = http.Server(core(router));

router.post('/login/:bvn/gt/:run', (req, res) => {
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

router.get('/login/:bvn/gt/:run', (req, res, next) => {
    try {
        const { bvn, run } = req.parameter;
        const { body } = req;
        console.log('status ', res.statusCode)
        res.json({
            message:'I am there with you not',
            data: {
                name: bvn,
                run,
                body
            }
        }) 
    } catch (error) {
        res.statusCode = 400
        res.json({
            message: error.message
        })
    }
})
server.listen('9080', () => {
    console.log('start listening');
})