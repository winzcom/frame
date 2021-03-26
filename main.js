const Route = require('./route')
const core = require('./core')
const http = require('http');


const router = new Route();

const server = http.Server(core(router));

let string = '/resolve/:jk/kl/jk/:as'

let login = '/login/:name';

router.post(login, (req, res) => {
    console.log('i am login in ', req.parameter.name);
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('okay');
})

router.get(string, () => {
    console.log('help')
}, () => {})

//string = '/resolve/jk/kl/jk'


string = '/resolve/jk/klsd/jk/kl'

router.get(string, () => {
    console.log('help')
}, () => {})


let pat = router.findPattern(login.split('/').length, login);

server.listen('9808', () => {
    console.log('start listening')
})