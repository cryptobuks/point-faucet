const express = require('express');
require('express-async-errors');
const Web3 = require('web3');

const app = express();

const secrets = {
    address: process.env.FAUCET_ADDRESS,
    privKey: process.env.FAUCET_PRIVKEY
};
const config = require('./config.json');
const port = process.env.PORT || 9090;
const provider = new Web3(config.blockchain_node);

if (!config.airdrop.amount || config.airdrop.amount <= 0) {
    throw new Error('Invalid airdrop amount: ' + amount);
}

if (!secrets.privKey) {
    throw new Error('Wallet key is not set');
}

if (!secrets.address) {
    throw new Error('Wallet address is not set');
}

// Load and init modules
const airdropController = require('./airdrop')(config, secrets, provider);
const balanceController = require('./balance')(config, secrets, provider);

app.get('/', (req, res) => { res.send('Hi from faucet'); })
app.get('/airdrop', airdropController.index);
app.get('/balance', balanceController.index);

app.listen(port, () => {
    console.log(`Faucet listening on port ${port}`);
});