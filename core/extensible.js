module.exports = {
    request: {
        json(object, status = 200) {
            const message_string = JSON.stringify(object)
            return this.writeHead(status, {
                'content-type': 'application/json'
            }).end(message_string)
        }
    }
}