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

module.exports = router