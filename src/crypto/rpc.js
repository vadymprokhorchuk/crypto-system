const {ethers} = require("ethers");
const https = require('https');
const {add} = require("winston");
const {config} = require("../config");

class RPC {
    static version
    static node

    constructor(node, version) {
        this.version = version
        this.node = node
    }

    requestWeb(url){
        const options = {
            method: 'GET',
        }
        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString()
                    resolve(resString)
                })
            })

            req.on('error', (err) => {
                reject(err)
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })

            req.end()
        })
    }

    requestRPC(method, params){
        if (!this.node || !this.version){
            return false
        }
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        }
        const data = JSON.stringify({
            "jsonrpc": this.version,
            "method": method,
            "params": params,
            "id": 1
        })
        return new Promise((resolve, reject) => {
            const req = https.request(this.node, options, (res) => {
                const body = []
                res.on('data', (chunk) => body.push(chunk))
                res.on('end', () => {
                    const resString = Buffer.concat(body).toString()
                    resolve(resString)
                })
            })

            req.on('error', (err) => {
                reject(err)
            })

            req.on('timeout', () => {
                req.destroy()
                reject(new Error('Request time out'))
            })

            req.write(data)
            req.end()
        })
    }

    async getBalance(address) {
        const response = await this.requestRPC('eth_getBalance', [address, 'latest'])
        const result = JSON.parse(response)
        if (result.result) {
            const balance = parseInt(result.result, 16);
            return ethers.utils.formatEther(balance.toString())
        }else{
            return false
        }
    }

    async getTransactions(address) {
        const url = `https://api.covalenthq.com/v1/56/address/${address}/transactions_v2/?key=${config.tx_api_key}`
        const response = await this.requestWeb(url)
        const result = JSON.parse(response)
        if (result.data) {
            const items = result.data.items
            items.sort(function(a,b){
                return new Date(b.block_signed_at) - new Date(a.block_signed_at);
            })
            return items.slice(0,5)
        }else{
            return false
        }
    }
}

const handler = new RPC('https://rpc.ankr.com/bsc', 2.0)

module.exports = {RPC, handler}