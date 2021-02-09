const Pool = require('pg').Pool
const bcrypt = require('bcrypt');

let ssl = undefined;
if (process.env.NODE_ENV === 'production') {
    ssl = {
        rejectUnauthorized: false
      }
}

const pool = new Pool ({
    connectionString: process.env.DATABASE_URL,
    ssl: ssl
})

const getUserById = (user_id, callback) => {
    if (user_id) {
    
        pool.query('SELECT * FROM users WHERE id = $1', [user_id], (error, results) => {
            if (error) {
                throw error
            } 
            callback(results)
    })}
}

const getUserByEmail = (email, callback) => {
    if (email) {
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
            if (error) {
                throw error
            } 
            callback(results)
    })}
}    

const registerUser = async (req,res) => {
    const {last_name, first_name, email, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    getUserByEmail(email, (results) => {
        const user = results.rows[0];
        if (user) {
            res.redirect.login
        } else {
            pool.query('INSERT INTO users (last_name, first_name, email, password) VALUES ($1, $2, $3, $4)', [last_name, first_name, email, hash], (error) => {
                if (error) {
                    throw error
                } 
                login(req, res);
            })
        }
    })  
}

const login = (req, res) => {
    const {email, password} = req.body;
    if (email) {
        pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
            if (error) {
                throw error
            }
            if (results.rows.length > 0 && password) {
                req.session.userId = results.rows[0].id;
                const user = results.rows[0];
                const validPass = bcrypt.compareSync(password, user.password);
                if (validPass) {
                    return res.redirect('/profile')
                }
            }
            res.redirect('/login')
        })
    }
}

const getEvents = (callback) => {
    pool.query('SELECT * FROM events ORDER BY id ASC', (error, results) => {
        if (error) {
            throw error
        }
        callback(results)
    })
}

const logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/profile')
        }

        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
}

const tix_available = (event_id) => {
    pool.query('SELECT * FROM events WHERE id = $1', [event_id], (error, results) => {
        if (error) {
            throw error
        } else if (results.rows.tix_available > 0) {
            return true;
        } else {
            return false;
        }
    })
}

const getEventById = (event_id, callback) => {
    if (event_id) {
    
        pool.query('SELECT * FROM events WHERE id = $1', [event_id], (error, results) => {
            if (error) {
                throw error
            } 
            callback(results)
    })}
}

module.exports = {
    getUserById,
    getUserByEmail,
    login,
    getEvents,
    registerUser,
    logout,
    tix_available,
    getEventById,
    pool
}