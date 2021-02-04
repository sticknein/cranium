const express = require('express')
const bodyParser = require('body-parser')
const session = require('express-session')
const db = require('./util/queries')

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

app.use(express.static('views'));

const loggedOutRedirect = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

const loggedInRedirect = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/profile')
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    const {userId} = req.session;
    res.render('index', {userId : userId})
})

app.get('/profile', loggedOutRedirect, (req, res) => {
    const user_id = req.session.userId
    db.getUserById(user_id, (results) => {
        const user = results.rows[0];
        res.render('profile', {user: user});
    })
})

app.get('/register', (req, res) => {
    res.render('register')     
})

app.get('/login', loggedInRedirect, (req, res) => {
    res.render('login')
})

app.get('/events', (req, res) => {
    db.getEvents((results) => {
        const events = [];
        for (i = 0; i < results.rows.length; i++) {
            events.push(results.rows[i])
        }
        res.render('events', {events : events});
    })
})

app.get('/events/*', (req, res) => {
    const event_id = req.path.split('/').pop()
    db.getEventById(event_id, (results) => {
        const event = results.rows[0]
        res.render('event', {event : event});
    })
})

app.get('/purchase_tickets/*', (req, res) => {
    
    const event_id = req.path.split('/').pop()

    db.getEventById(event_id, (results) => {
        const event = results.rows[0]

        if (event.tix_available === 0) {
            res.render('sold_out', {event : event});
        } else {
            res.render('purchase', {event : event});
        }
    })
})

app.post('/login', db.login)

app.post('/register', db.registerUser)

app.post('/logout', loggedOutRedirect, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile')
        }

        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
})

app.listen(PORT, () => console.log(
    `http://localhost${PORT}`
))