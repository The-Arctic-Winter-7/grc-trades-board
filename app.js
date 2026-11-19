import express from 'express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';

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

// Express looks into public folder when getting webpages
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

// Home Route
app.get('/', (req, res) => {
    res.render('home', { title: 'HOME' });
});

// Add a Job Form Route
app.get('/add-job', (req, res) => {
    res.render('add-job');
});

// This is where form submissions are sent to and saved on the database
app.post('/submit-job', async (req, res) => {
    try {
        const job = req.body;
        console.log(job);

        const sql = 'INSERT INTO jobs (job_title, company_name, trade_area, location, listing_type, job_type, post_date, expiration_date, application_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

        const params = [
            job.jobTitle,
            job.companyName,
            job.tradeArea,
            job.location,
            job.listingType,
            job.jobType,
            job.postDate,
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
app.get('/confirm', (req, res) => {
    res.render('confirm');
});

// Data is taken from the database and sent to the Jobs Route, where they are displayed on a datatable
app.get('/jobs', async (req, res) => {
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

// Application listens on the specified PORT number
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});