module.exports = {
    extend: (src, target) => {
        const properties = Object.getOwnPropertyNames(src)

        for(let i = 0; i < properties.length; i += 1) {
            const descriptor = Object.getOwnPropertyDescriptor(src, properties[i]);

            Object.defineProperty(target, properties[i], descriptor);
        }
        return target;
    }
}