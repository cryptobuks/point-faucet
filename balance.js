const web3 = require('web3');
const utils = require('./utils');

class Balance {
    constructor(config, secrets, provider) {
        this.config = config;
        this.secrets = secrets;
        this.provider = provider
    }

    index = async(req, res) => {
        const address = req.query.address || this.secrets.address;
        if (! utils.ethAddressRegex.test(address)) throw new Error('Invalid address: '+address);

        const result = await this.provider.eth.getBalance(address);

        res.send({ "address": address, "balance": web3.utils.fromWei(result, "ether") });
    };
}

module.exports = (...spread) => new Balance(...spread);