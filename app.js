import express from 'express';
import mysql2 from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const app = new express();

const PORT = 3050;

const jobs = [];

const pool = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
}).promise();

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home', { title: 'HOME' });
});

app.get('/add-job', (req, res) => {
    res.render('add-job');
});

app.post('/submit-job', async (req, res) => {
    /*const job = {
        jobTitle: req.body.jobTitle,
        companyName: req.body.companyName,
        tradeArea: req.body.tradeArea,
        location: req.body.location,
        jobType: req.body.jobType,
        postDate: new Date().toLocaleDateString(),
        expirationDate: req.body.expirationDate,
        applicationUrl: req.body.applicationUrl,
        timestamp: new Date()
    };*/
    try {
        const job = req.body;
        console.log(job);

        const sql = 'INSERT INTO jobs (jobTitle, companyName, tradeArea, location, listingType, jobType, postDate, expirationDate, applicationURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

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

app.get('/confirm', (req, res) => {
    res.render('confirm');
});

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

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});