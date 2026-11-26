import express from 'express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';
import session from 'express-session';
dotenv.config();

// Creates express application
const app = new express();

// App port number
const PORT = 3050;

// Saves data from form data and stores it in this array
const jobs = [];

// Create a pool of connections
const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();

app.set('view engine', 'ejs');

// Express looks into public folder when getting webpages
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 } // session expires after 1 hour
}));

// Makes isAdmin available in every EJS view (your teammate needs this for Step 4's Add Job link)
app.use((req, res, next) => {
    res.locals.isAdmin = !!req.session.isAdmin;
    next();
});

// Blocks anyone who is not logged in
function requireAdmin(req, res, next) {
    // Stops the browser from caching protected pages, so Back after logout doesn't show them
    res.set('Cache-Control', 'no-store');
    if (req.session.isAdmin) {
        return next();
    }
    res.redirect('/login');
}

// Login form
app.get('/login', (req, res) => {
    if (req.session.isAdmin) {
        return res.redirect('/add-job');
    }
    res.render('login', { error: null, username: '' });
});

// Check credentials
app.post('/login', (req, res) => {
    const { username = '', password = '' } = req.body;

    if (!username.trim() || !password) {
        return res.status(400).render('login', {
            error: 'Please enter both a username and password.',
            username
        });
    }

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.redirect('/add-job');
    }

    // Password is not sent back, so the field is cleared
    res.status(401).render('login', {
        error: 'Incorrect username or password. Please try again.',
        username
    });
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

// Home Route: the home page IS the job listings page
// Data is taken from the database and sent to the jobs view, where it is displayed in a datatable
app.get('/', async (req, res) => {
    try {
        //selects only active jobs and orders them by newest first
        const sql = 'SELECT * FROM jobs WHERE expiration_date >= CURDATE() ORDER BY post_date DESC';

        const [jobs] = await pool.query(sql);

        res.render('jobs', { jobs: jobs });
    } catch (err) {
        console.error('Database error: ', err);
        res.status(500).send('Database error ocurred.');
    }
});

// Old /jobs URL still works: it sends people to the home page
app.get('/jobs', (req, res) => {
    res.redirect('/');
});

//Student Resources Route Page
app.get('/student-resources', (req, res) => {
    res.render('student-resources');
});

// Add a Job Form Route
app.get('/add-job', requireAdmin, async (req, res) => {
    try{
        const [trades]= await pool.query('SELECT id, name FROM trades ORDER BY name ASC');
        res.render('add-job',{ trades });
    } catch (err) {
        console.error('Error fetching trades: ', err);
        res.status(500).send('Error Loading the Trades');
    }
});

// This is where form submissions are sent to and saved on the database
app.post('/submit-job', requireAdmin, async (req, res) => {
    try {
        const job = req.body;
        console.log(job);

        const jobTypevalue = job.jobType ? job.jobType : null;

        const sql = 'INSERT INTO jobs (job_title, company_name, trade_area, location, listing_type, job_type, expiration_date, application_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

        const params = [
            job.jobTitle,
            job.companyName,
            job.tradeArea,
            job.location,
            job.listingType,
            jobTypevalue,
            job.expirationDate,
            job.applicationUrl
        ];

        const [result] = await pool.execute(sql, params);

        res.render('confirm', { job });
    } catch (err) {
        console.error('Error inserting job: ', err);
        res.status(500).send('Sorry, there was an error processing this job. Please try again.');
    }
});

// Job Submission Confirmation Route
app.get('/confirm', requireAdmin, (req, res) => {
    res.render('confirm');
});

// Application listens on the specified PORT number
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});