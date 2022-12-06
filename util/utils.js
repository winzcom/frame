const http = require('http')
const http2 = require('node:http2')
const queryString = require('querystring')

const HTTPMESSAGES2CODES = {}

for(let o in http.STATUS_CODES) {
    HTTPMESSAGES2CODES[http.STATUS_CODES[o].replace(/[\s-]/g, '')] = o
}

function cleanFirstSlashFunc(content) {
    const has_slash = content[0] == '/'
    return has_slash ? content.slice(1) : content
}

function claeanLastSlashFunc(path) {
    let last_index = 0
    for(let i = 0; i < path.length; i += 1) {
        if(path[i] == '/') {
            last_index = i
        }
    }
    return last_index >= path.length - 1 ? path.substring(0, last_index) : path
}

module.exports = {
    sendHttpError(code, res) {
        return res.writeHead(code, http.STATUS_CODES[code]).end()
    },
    codes2Messages: HTTPMESSAGES2CODES,
    cleanFirstSlash: cleanFirstSlashFunc,
    cleanLastSlash: claeanLastSlashFunc,
    cleanSlashs(path) {
        return this.cleanFirstSlash(path)
    },
    extractQuery(req) {
        //find the ? in the url
        const qindex = Array.prototype.findIndex.call(req.url, ((v) => v == '?' || v == '#'))
        let query_string = undefined, path = undefined
        if(qindex > - 1) {
            path = req.url.substring(0, qindex)
            query_string = req.url.substring(qindex+1)
            req.query = { ...queryString.decode(query_string) }
            return cleanFirstSlashFunc(claeanLastSlashFunc(path))
        }
        return cleanFirstSlashFunc(claeanLastSlashFunc(req.url))
    }
}