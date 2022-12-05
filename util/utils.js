const http = require('http')

const HTTPMESSAGES2CODES = {}

for(let o in http.STATUS_CODES) {
    HTTPMESSAGES2CODES[http.STATUS_CODES[o].replace(/[\s-]/g, '')] = o
}

module.exports = {
    sendHttpError(code, res) {
        return res.writeHead(code, http.STATUS_CODES[code]).end()
    },
    codes2Messages: HTTPMESSAGES2CODES,
    cleanFirstSlash(content) {
        const has_slash = content[0] == '/'
        return has_slash ? content.slice(1) : content
    }
}