const web3 = require("web3");
const utils = require("./utils");
const config = require('./config.json');

class TransactionError extends Error {};
class RequestError extends Error {};

const getTxQueue = () => {
    const queue = [];
    const start = async () => {
        while (true) {
            const nextTask = queue.shift();
            if (nextTask) {
                await nextTask();
            } else {
                await utils.sleep(config.queue.cooldown);
            }
        }
    };

    const push = task => {
        console.log('Pushing new task', {task, queue: queue.length})
        if (queue.length > config.queue.maxCapacity) {
            throw new TransactionError('Too many requests, please try again later');
        }
        return new Promise((resolve, reject) => {
            queue.push(async () => {
                try {
                    resolve(await task());
                } catch (e) {
                    reject(e);
                }
            });
        });
    };

    return {start, push};
}

const txQueue = getTxQueue();
txQueue.start();

class Airdrop {
    constructor(config, secrets, provider) {
        this.config = config;
        this.secrets = secrets;
        this.provider = provider
    }

    index = async(req, res) => {
        try {
            const toAddress = req.query.address;

            if (! utils.ethAddressRegex.test(toAddress)) {
                throw new RequestError('Invalid address: '+toAddress);
            }

            if (toAddress === this.secrets.address) {
                throw new RequestError('Cannot send to itself');
            }

            const amount = this.config.airdrop.amount;
            const createReceipt = await txQueue.push(async () => {
                const options = {
                    from: this.secrets.address,
                    to: toAddress,
                    value: web3.utils.toWei(amount.toString(), 'ether'),
                    gas: '21000',
                };

                console.log('Creating a new tx:', options);

                const tx = await this.provider.eth.accounts.signTransaction(options, this.secrets.privKey);

                console.log('Sending a new tx:', tx);

                return this.provider.eth.sendSignedTransaction(
                    tx.rawTransaction
                )
            });

            res.send({status: 'ok', amount, txid: createReceipt.transactionHash});
        } catch (e) {
            console.log('Airdrop error:', e);
            res.send({status: 'error', code: e.constructor.name, message: e.message});
        }
    }
}

module.exports = (...spread) => new Airdrop(...spread);