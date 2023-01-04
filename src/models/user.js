const mongoose = require('mongoose');
const {logger} = require("../helpers/logger");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    wallet:{
        type: {
            privateKey: String,
            address: String,
            mnemonic: Schema.Types.Mixed
        },
        required: false
    },
    registered:{
        type: Date,
        default: () => { return new Date() }
    }
});


async function registerUser(doc, res) {
    let user
    try {
        user = await new User(doc).save()
        return user
    } catch (err) {
        logger.error(err)
        console.log(err)
        return false
    }
}

async function findUser(doc) {
    try {
        let user = await User.findOne(doc)
        return user
    }catch (err){
        logger.error(err)
        console.log(err)
        return false
    }
}

async function updateUser(user, data){
    try {
        let updatedUser = await User.findOneAndUpdate(user, data)
        return user
    }catch (err){
        logger.error(err)
        console.log(err)
        return false
    }
}

const User = mongoose.model('User', UserSchema, 'users');

module.exports = { User, findUser, registerUser, updateUser}