const request = require('supertest');
const { describe, it } = require('mocha');
const {expect } = require('chai')

const Route = require('../route')
const core = require('../core')

const router = new Route();

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

describe('this function makes a call to the backend', () => {
    it('expects to have 200 back and body not undefined', async () => {
        const result = await request(core(router)).post(
            '/login/wale/gt'
        ).send({
            "boyd": "passss",
            "email":"reangulara@gmail.com"
        })
        expect(status).to.equal(200)
        expect(body).to.have.deep.property('data', {
            "name": "wale",
            "run": true,
            "body": {
                "boyd": "passss",
                "email": "reangulara@gmail.com"
            }
        })
    })
})


