import express from 'express';

const app = new express();

const PORT = 3050;

const jobs = [];

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('home', {title: 'HOME' });
});

app.get('/add-job', (req, res) => {
    res.render('add-job');
});

app.post('/submit-job', (req, res) => {
    const job = {
        jobTitle: req.body.jobTitle,
        companyName: req.body.companyName,
        tradeArea: req.body.tradeArea,
        location: req.body.location,
        jobType: req.body.jobType,
        postDate: new Date().toLocaleDateString(),
        expirationDate: req.body.expirationDate,
        applicationUrl: req.body.applicationUrl,
        submittedAt: new Date()
    };

    jobs.push(job);
    res.redirect('/confirm');
});

app.get('/confirm', (req, res) => {
    res.render('confirm');
});

app.get('/jobs', (req, res) => {
    res.render('jobs', { jobs: jobs });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});