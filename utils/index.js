const os = require('os')
const getLocalIP = () => {
    let ifaces = os.networkInterfaces();
    let result = ""
    for (let dev in ifaces) {
        ifaces[dev].forEach(function (details, alias) {
            if (details.family == 'IPv4' && !details.internal) {
                result = details.address
            }
        });
    }
    return result
}
module.exports = { getLocalIP }