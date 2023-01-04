const {ethers} = require("ethers");
const {WORDLISTS} = require("./words");
const {updateUser} = require("../models/user");

class Wallet {
    static privateKey
    static address
    static mnemonic

    constructor(privateKey) {
        this.privateKey = privateKey
        this.address = (new ethers.Wallet(privateKey)).address
    }

    static fromMnemonic(mnemonic){
        const wallet = new ethers.Wallet.fromMnemonic(mnemonic)
        const newWallet = new Wallet(wallet.privateKey)
        newWallet.mnemonic = wallet._mnemonic().phrase
        return newWallet
    }

    static async createRandom(username) {
        const wallet = new ethers.Wallet.createRandom()
        const newWallet = new Wallet(wallet.privateKey)
        newWallet.mnemonic = wallet._mnemonic().phrase
        if (username) {
            await this.bindToUser(username, newWallet)
        }
        return newWallet
    }

    static async bindToUser(username, wallet) {
        if (wallet.privateKey && wallet.address) {
            const update = await updateUser({
                username: username,
            },{
                wallet:{
                    privateKey: wallet.privateKey,
                    mnemonic: wallet.mnemonic,
                    address: wallet.address
                }
            })
        }
    }

    static validate(mnemonic) {
        try {
            mnemonic = mnemonic.toLowerCase()

            const arr = mnemonic.split(" ")
            if (arr.length %3 === 0) {
                for (const list in WORDLISTS) {
                    if (arr.every(word => WORDLISTS[list].includes(word))) {
                        return true
                    }
                }
                return false
            } else {
                return false
            }
        } catch (err) {
            return false
        }
    }
}

module.exports = {Wallet}