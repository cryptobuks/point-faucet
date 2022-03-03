const web3 = require("web3");
const utils = require("./utils");

class Airdrop {
    constructor(config, secrets, provider) {
        this.config = config;
        this.secrets = secrets;
        this.provider = provider
    }

    index = async(req, res) => {
        const airdropAddress = this.secrets.address;
        const airdropPrivateKey = this.secrets.privKey;
        const toAddress = req.query.address;
        if (! utils.ethAddressRegex.test(toAddress)) throw new Error('Invalid address: '+toAddress);

        const amount = this.config.airdrop.amount;
        if (!amount || amount <= 0) throw new Error('Invalid amount in config: '+amount);

        if (toAddress === airdropAddress) throw new Error('Cannot send to itself');

        const createTransaction = await this.provider.eth.accounts.signTransaction(
            {
                from: airdropAddress,
                to: toAddress,
                value: web3.utils.toWei(amount.toString(), 'ether'),
                gas: '21000',
            },
            airdropPrivateKey
        );

        const createReceipt = await this.provider.eth.sendSignedTransaction(
            createTransaction.rawTransaction
        );

        res.send({ "amount": amount, "txid": createReceipt.transactionHash });
    }
}

module.exports = (...spread) => new Airdrop(...spread);