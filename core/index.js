const Router = require('../route');
const util = require('../utility')

const core = function(router) {
    return function(req, res) {
        handle(req, res, router);
    }
}

const handle = async (req, res, router) => {
    const url = req.url;
    const method = req.method.toLowerCase();
    const route_found = router.findPattern(url.split('/').length, url, method);

    util.extend(extendResponse(), res);

    if(!route_found) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end('Not found')
    }
    const readers = ['post', 'patch', 'put', 'patch']
    const content_type = req.headers['content-type'];
    req.parameter = route_found.paramter;
    
    if(route_found.method.toLowerCase() != method) {
        res.statusCode = 400;
        return res.json({
            error: 'Method not allowed',
        })
    }
    const { controllers } = route_found;

    if(controllers.length == 0) {
        throw new Error('No handle set for route ', url);
    }

    if(readers.includes(method)) {
        // need to read the body
        req.body = await readContent(content_type, req).then((data) => {
            req.body = data;
            for(let i = 0; i < controllers.length; i += 1) {
                controllers[i](req, res);
            }
        }, (val) => {
            req.body = null
            controllers[0](req, res)
        })
    }
}

const readContent = (content_type, req) => {
    let buffer = Buffer.alloc(0)
    return new Promise((res) => {
        req.on('data', (buf) => {
            buffer = Buffer.concat([buffer, buf], buf.length + buffer.length);
        })
        req.on('end', () => {
            if(!content_type) {
                return res()
            }
            if(content_type == 'application/json') {
                buffer = JSON.parse(buffer);
            } else if(content_type == 'application/x-www-form-urlencoded') {
                const first_split = buffer.split('&');
                if(first_split.length > 0) {
                    let second = {}
                    for(let i = 0; i < first_split.length; i += 1) {
                        const second_split = first_split[i].split('=');
                        second[second_split[0]] = second_split[1];
                    }
                    buffer = second;
                }
            } else if(content_type.indexOf('multipart/form-data') > -1) {
                console.log({ buffer: buffer.toString() })
                let matched = buffer.toString().split(/-+\d+\r\n/).splice(1);   
                //console.log({ buffer: buffer.toString() })
                let json = {};
                /**
                 * The anonymous function to run for normal field
                 */
                // run for normal field;
                (function() {
                    for(let i = 0; matched && i < matched.length; i += 1) {
                        const val = matched[i];
                        //console.log({ val })
                        let key = val.match(/name=(["](?=(.+?)")\2)/);
                        if(!key) {
                            continue
                        }
                        key = key[1].replace(/\W+/g, '');
                        const key_val = val.match(/\r\n\r\n(.+)\r\n/);
                        if(key_val) {
                            json[key] = key_val[1];
                        } else {
                            const is_file = val.match(/filename="(.*?)"\r\n(content-type:(.*)\r\n)?/i)
                            if(!is_file) {
                                continue
                            }
                            json[key] = {
                                field_name: key,
                                file_name: is_file[1],
                                file_type: is_file[3].trim()
                            }
                            const file = val.match(/content-type:\s*.*?\r\n\r\n(?=(.*?\n))\1/i)
                            //console.log({ file })
                        }
                    }
                    buffer = json;
                })(); /*** end for normal field */

                /** this for file content */ 
                // (function(filematched) {
                //     if(!filematched) {
                //         return;
                //     }
                //     file['file_name'] = filematched[1].replace(/["\r\n]+/, '');
                //     file['file_type'] = filematched[2].replace(/["\r\n]+/, '');
                // })(filematched)
                /** end of file content */
            }
            res(buffer);
        })
    })
}

const extendResponse = () => {
    const extension = {};
    Object.defineProperty(extension, 'json', {
        value: function(body = {}, status = 200) {
            const content_type = 'application/json';
            this.setHeader('Content-Type', content_type);
            this.statusCode = status;
            return this.end(JSON.stringify(body));
        },
        configurable: false,
        enumerable: false,
        writable: true,
    })
    return extension;
}

const next = () => {
    
}

module.exports = core;