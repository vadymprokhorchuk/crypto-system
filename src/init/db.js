const mongoose = require('mongoose');
const {config} = require("../config");
const {logger} = require("../helpers/logger");

function setupMongoose(callback) {
    logger.log({level: 'info',message: `Connecting to database....`});
    console.log("Connecting to database....")
    const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        socketTimeoutMS: 10000,
        connectTimeoutMS: 50000,
    }

    mongoose.connect(config.MONGO_URL, options)
    const db = mongoose.connection;

    db.on('error', function (err) {
        //logger.log({level: 'error',message: `Failed to connect to database.`});
        logger.error(err)
        console.log('Failed to connect to database')
        process.exit(1);
    });

    db.on('open', function () {
        logger.info(`MongoDB connected: ${db.name}`)
        console.log('MongoDB connected:', db.name)
        callback();
    });

    mongoose.connection.on('disconnected', (e) => {
        //logger.log({level: 'error',message: `Disconnected from database, reconnecting....`});
        logger.error(`Disconnected from database....`)
        console.log("Disconnected from database....")
        //mongoose.connect(config.MONGO_URL, options)
    })
}

module.exports = setupMongoose