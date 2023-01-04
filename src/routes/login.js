const express = require('express')
const {logger} = require('../helpers/logger')
const {findUser} = require("../models/user")

const login = express.Router();

login.get('/login', (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/panel');
        } else {
            res.render('login');
        }
    }catch (err){
        logger.error(err)
    }
})

login.post('/login', async (req, res) => {
    try {
        const found = await findUser({
            username: req.body.username,
            passsword: req.body.password
        })
        if (found) {
            await req.session.regenerate(async function () {
                req.session.user = found;
                await res.redirect('/panel');
            });
        } else {
            await res.redirect('/login');
        }
    } catch (err) {
        logger.error(err)
    }
})

module.exports = {login}