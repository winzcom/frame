const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const server = http.Server(core(router));

let string = '/resolve/:jk/kl/jk/:as'

let login = '/login/:wale';

router.post('/login/:bvn/gt/:run', (req, res, next) => {
    console.log('i am login in ', req.parameter);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        message:'I am there with you love',
        data: {
            name: req.parameter.bvn,
            run: Boolean(req.parameter.run)
        }
    }));
})

router.get(string, () => {
    console.log('help')
}, () => {})

//string = '/resolve/jk/kl/jk'


string = '/resolve/jk/klsd/jk/kl'

router.get(string, () => {
    console.log('help')
}, () => {})


//let pat = router.findPattern(login.split('/').length, login);

server.listen('9808', () => {
    console.log('start listening')
})