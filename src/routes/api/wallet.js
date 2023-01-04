const express = require('express')
const {logger} = require("../../helpers/logger");
const {Wallet} = require("../../crypto/wallet");
const {add} = require("winston");
const {handler} = require("../../crypto/rpc");

const wallet = express.Router();

wallet.get('/api/wallet', async (req, res) => {
    try {
        if (req.session.user) {
            if (req.session.user.wallet){
                const wallet = new Wallet(req.session.user.wallet.privateKey)
                res.send(JSON.stringify({
                    privateKey: wallet.privateKey,
                    address: wallet.address
                }))
            }else{
                res.send(JSON.stringify({
                    error: "No have wallet."
                }));
            }
        } else {
            res.send(JSON.stringify({
                error: "Not authorized."
            }));
        }
    }catch (err){
        res.send(JSON.stringify({
            error: "Unknown error."
        }));
        logger.error(err)
    }
})

wallet.get('/api/wallet/balance/:address?', async (req, res) => {
    try {
        let address = req.params.address
        if (!address){
            address = req.session.user.wallet.address
        }
        const balance = await handler.getBalance(address)
        if (balance){
            res.send(JSON.stringify({
                address: address,
                balance: balance
            }))
        }else{
            res.send(JSON.stringify({
                error: "Unknown error."
            }));
        }
    }catch (err){
        res.send(JSON.stringify({
            error: "Unknown error."
        }));
        logger.error(err)
    }
})

wallet.get('/api/wallet/transactions/:address?', async (req, res) => {
    try {
        let address = req.params.address
        if (!address){
            address = req.session.user.wallet.address
        }
        const transactions = await handler.getTransactions(address)
        if (transactions){
            res.send(JSON.stringify({
                address: address,
                transactions: transactions
            }))
        }else{
            res.send(JSON.stringify({
                error: "Unknown error."
            }));
        }
    }catch (err){
        res.send(JSON.stringify({
            error: "Unknown error."
        }));
        console.log(err)
        logger.error(err)
    }
})

wallet.post('/api/wallet/create', async (req, res) => {
    try{
        const wallet = await Wallet.createRandom(req.session.user.username)
        res.send(JSON.stringify({
            mnemonic: wallet.mnemonic
        }))
    }catch (err){
        res.send(JSON.stringify({
            error: "Not authorized."
        }));
        logger.error(err)
    }
})

module.exports = {wallet}