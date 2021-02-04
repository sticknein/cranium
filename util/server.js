const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const db = require('./queries')

const TWO_HOURS = 1000 * 60 * 60 * 2;

const {
    PORT = 3000,
    NODE_ENV = 'development',

    SESS_NAME = 'sid',
    SESS_SECRET = 'dd53ax9i2iauj56x90p2d',
    SESS_LIFETIME = TWO_HOURS
} = process.env 

const IN_PROD = NODE_ENV === 'production'

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    store: new (require('connect-pg-simple')(session))({pool:db.pool}),
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie: {
        maxAge: SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
}))

app.set('view engine', 'ejs');

module.exports = {
    app
}