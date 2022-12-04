function Iterator(iteratable) {
    const iterate = iteratable[Symbol.iterator]()

    return iterate
} 

module.exports = Iterator