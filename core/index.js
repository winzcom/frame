const Router = require('../route');

const router = new Router();

const core = function(req, res) {
    handle(req, res);
}

const handle = (req, res) => {
    const url = req.url;

    const route_found = router.findPattern(url);

    if(route_found.method.toLowerCase() != req.method.toLowerCase()) {
        throw new Error('No Method for the route ', url);
    }

    const { controllers } = route_found;

    if(controllers.length == 0) {
        throw new Error('No handle set for route ', url);
    }

    for(let i = 0; i < controllers.length; i += 1) {
        controllers[i](req, res);
    }
}

const next = () => {
    
}

module.exports = core;