const express = require('express')
const {logger} = require('../helpers/logger')
const {findUser, registerUser} = require("../models/user");

const register = express.Router();

register.get('/register', (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/panel');
        } else {
            res.render('register');
        }
    }catch (err){
        logger.error(err)
    }
})

register.post('/register', async (req, res) => {
    try {
        const found = await findUser({username:req.body.username})
        if (found) {
            await res.redirect('/login');
        } else {
            const newUser = await registerUser({
                username:req.body.username,
                password:req.body.password,
            })
            await req.session.regenerate(async function () {
                req.session.user = newUser;
                await res.redirect('/panel');
            });
        }
    } catch (err) {
        logger.error(err)
    }
})

module.exports = {register}