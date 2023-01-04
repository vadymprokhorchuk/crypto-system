const winston = require('winston');

const errorStackFormat = winston.format(info => {
    if (info && info.stack && info.message) {
        return Object.assign({}, info, {
            stack: info.stack,
            message: info.message
        })
    }
    return info
})

const logger = winston.createLogger({
    level: 'info',
    format:  winston.format.combine(errorStackFormat(), winston.format.timestamp(), winston.format.json()),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ],
});

module.exports = {logger}