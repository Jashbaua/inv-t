const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

// PostgreSQL connection
const pool = new Pool({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Endpoint to store data
app.post('/api/data', async (req, res) => {
    const { property1, property2, array_of_strings } = req.body;
    try {
        console.log('posted')
        // const result = await pool.query(
        //     'INSERT INTO mytable (property1, property2, array_of_strings) VALUES ($1, $2, $3) RETURNING *',
        //     [property1, property2, array_of_strings]
        // );
        // res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Endpoint to retrieve data
app.get('/api/data', async (req, res) => {
    console.log('getted')
    try {
        // const result = await pool.query('SELECT * FROM mytable');
        // res.status(200).json(result.rows);
        res.send('hello world')
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});