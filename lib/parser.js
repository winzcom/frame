const fs = require('fs')
const querystring = require('querystring')

const CONTANTS = {
    BOUNDARY_NAME:'boundary',
    CRFL: '\r',
    NEW_LINE: '\n',
    BODY_NAME:'name',
    SPACE: ' ',
    COLUMN: ':',
    SCOLUMN: ';',
    EQ: '=',
}

const FORM_PART = {
    NAME: 'name',
    FILE: 'filename',
}

const CONTENT_TYPES = {
    urlencoded: 'application/x-www-form-urlencoded',
    formdata: 'multipart/form-data',
    json: 'application/json',
    jpeg: 'image/jpeg',
}

const PAYLOAD_IGNORES = {
    formdata: 'formdata',
    boundary_sig: '-'
}

function readMultiPart(chunk, boundary) {
    let headers = {}, body = {}, val = ''
    chunk = chunk.toString()
    let head = '', is_file = false, crfl = {
        [CONTANTS.NEW_LINE]: 0
    }, key = '', body_next = false, is_boundary = false
    for(let i = 0; i < chunk.length; i += 1) {
        if(chunk[i] == CONTANTS.NEW_LINE && chunk[i-1] == CONTANTS.CRFL) {
            if(val) {
                if(val == boundary) {
                    val = ''
                    body_next = false
                    continue
                }
                if(body_next) {
                    if(!is_file && key) {
                        for(let k = 0; k < boundary.length; k += 1) {
                            if(boundary[k] == val[k]) {
                                is_boundary = true
                            }
                        }
                        if(is_boundary) {
                            val = ''
                            continue
                        }
                        key = key.replace(/['"]/g, '')
                        body[key] = val
                        //body_next = false
                    } else {
                        // check if we have the boundary
                        for(let k = 0; k < boundary.length; k += 1) {
                            if(boundary[k] == val[k]) {
                                is_boundary = true
                            }
                        }
                        if(!is_boundary) {
                            headers.file = val
                            is_boundary = false
                        }
                    }
                }
                if(!body_next) {
                    const spl = val.split(';')
                    spl.forEach(element => {
                        let sple = element.split(':')
                        if(sple.length > 1) {
                            headers[sple[0]] = sple[1]
                        } else {
                            sple = element.split('=')
                            if(sple.length > 1) {
                                key = sple[1]
                                if(sple[0] == FORM_PART.FILE) {
                                    is_file = true
                                    headers.filename = sple[1].replace(/"/g,  '')
                                    key = ''
                                }
                            }
                        }
                    });
                }
                val = ''
            } else {
                body_next = true
                val = ''
            }
            continue
        }
        if(chunk[i] == CONTANTS.CRFL || CONTANTS.SPACE == chunk[i]) {
            continue
        }
        val += chunk[i]
    }
    return {
        headers, body
    }
}

function readJSON(reader, next) {
    let json_body
    reader.on('data', (chunk) => {
        try {
            const to_json = JSON.parse(chunk)
            json_body = to_json
        } catch (error) {
            next(error)
        }
    })

    reader.on('end', () => {
        reader.body = json_body
        next()
    })
}

function readURLEncoded(reader, next) {
    let content
    reader.on('data', (chunk) => {
        let s = chunk.toString()
        content = querystring.parse(s)
    })

    reader.on('end', () => {
        reader.body = content
        next()
    })
}

function readContent(type, reader, next, boundary) {
    let headers = {}, body = {}
    if(type == CONTENT_TYPES.formdata) {
        reader.on('data', (chunk) => {
            const v = readMultiPart(chunk, boundary)
            headers = v.headers
            body = v.body
        })
    
        reader.on('end', function() {
            reader.body = body
            reader.file = headers.file
            next()
        })   
        return
    }
    if(type == CONTENT_TYPES.json) {
        return readJSON(reader, next)
    }

    if(type == CONTENT_TYPES.urlencoded) {
        readURLEncoded(reader, next)
    }
}

function readHeader(header) {
    let is_formdata = false
    const content_type = header['content-type']
    if(!content_type) {
        return 
    }
    let type, reader = '', boundary = '', value
    for(let i = 0; i < content_type.length; i += 1) {
        if(content_type[i] == ';' && !type) {
            type = reader
            reader = ''
            i += 1
            continue
        }
        if(content_type[i] == CONTANTS.SPACE) {
            continue
        }
        if(reader == CONTANTS.BOUNDARY_NAME) {
            is_formdata = true
            i += 1
            reader = ''
            continue
        }
        // if(is_formdata) {
        //     continue
        // }
        reader += content_type[i]
    }
    if(!type) {
        type = reader
    }else boundary = '---' + reader
    return {
        type,
        boundary
    }
}

function parser(req, res, next) {
    const { type, boundary } = (readHeader(req.headers)) || {}

    if(!type) {
        next()
    }

    readContent(type, req, next, boundary)
}

module.exports = parser