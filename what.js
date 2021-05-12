const Router = require('./route')

const router = new Router();

router.get('/wealth/give/them', (req, res) => {
    res.json({
        message: 'i am from there right '
    })
})

router.get('/rich', (req, res) => {
    res.json({
        message: 'I am rich'
    })
})

router.get('/healed', (req, res) => {
    res.json({
        message: 'I am healed '+ req.oh + ' '+req.command
    })
})

router.post('/healed', (req, res) => {
    res.json({
        message: 'I am healed.'
    })
});

router.post('/rich/:id/:pos', (req, res) => {
    const { id, pos } = req.parameter;
    console.log('called')
    res.json({
        message: pos
    })
})

module.exports = router