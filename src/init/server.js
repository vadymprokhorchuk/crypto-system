const express = require("express");
const path = require("path");
const session = require("express-session");
const {login} = require("../routes/login");
const {register} = require("../routes/register");
const {notFound} = require("../routes/404");
const {panel} = require("../routes/panel");

const bodyParser = require('body-parser');
const {create} = require("../routes/create");
const {wallet} = require("../routes/api/wallet");
const {RPC} = require("../crypto/rpc");
const {config} = require("../config");
const {logout} = require("../routes/logout");

const port = 3000

function setupServer(){
    const app = express()
    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(express.json({limit: '50mb', extended: true}))

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../../src/views'));
    app.use('/assets', express.static('../src/public'))

    app.use(session({
        resave: false,
        saveUninitialized: false,
        secret: 'crypto-system'
    }));

    app.use(login)
    app.use(register)
    app.use(panel)
    app.use(create)
    app.use(wallet)
    app.use(logout)

    app.use(notFound)

    app.listen(port, () => {
        console.log(`Listening... http://localhost:${port}/`)
    })
}

module.exports = {setupServer}