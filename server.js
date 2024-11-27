const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 8000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

app.use(express.json());

const authMiddleware = (req, res, next) => {
    const auth = req.headers.authorization;
    if (auth !== 'secret') {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};


app.post('/liveEvent', authMiddleware, async (req, res) => {
    try {
        const event = req.body;
        const eventString = JSON.stringify(event) + '\n';

        await writeEventToFile(eventString);

        res.status(200).json({ message: 'Event received' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/userEvents/:userid', async (req, res) => {
    try {
        const { userid } = req.params;
        const result = await getUserById(userid);

        res.json(result.rows[0] || { user_id: userid, revenue: 0 });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

async function getUserById(userId) {
    const query = 'SELECT * FROM users_revenue WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result;
}

async function writeEventToFile(eventString) {
    await fs.appendFile(path.join(__dirname, 'server_events.jsonl'), eventString);
}
