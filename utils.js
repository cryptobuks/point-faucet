module.exports = {
    ethAddressRegex: new RegExp(/^0x[a-fA-F0-9]{40}$/),
    sleep: (time) => new Promise((resolve) => setTimeout(resolve, time))
}