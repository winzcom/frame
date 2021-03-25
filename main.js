const Route = require('./route')

const router = new Route();

let string = '/resolve/:jk/kl/jk/:as'

router.get(string, () => {
    console.log('help')
}, () => {})

//string = '/resolve/jk/kl/jk'


string = '/resolve/jk/klsd/jk/kl'

router.get(string, () => {
    console.log('help')
}, () => {})


let pat = router.findPattern(string.split('/').length, string);

console.log({ pat })