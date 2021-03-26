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
server.listen('9080', () => {
    console.log('start listening');
})