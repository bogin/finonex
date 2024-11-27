const fs = require('fs');
const readline = require('readline');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

const BATCH_SIZE = 10000;

async function* readFileInChunks() {
    const fileStream = fs.createReadStream('server_events.jsonl');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let batch = [];
    
    for await (const line of rl) {
        if (line.trim()) {
            batch.push(JSON.parse(line));
            
            if (batch.length >= BATCH_SIZE) {
                yield batch;
                batch = [];
            }
        }
    }

    if (batch.length > 0) {
        yield batch;
    }
}

async function updateUsers(userEvents) {console.log(userEvents)
    for (const [userId, revenueChange] of Object.entries(userEvents)) {
        const lockId = await lokeUserById(userId);
        
        try {
            await upsert(userId, revenueChange);
        } finally {
            await freeUserLockById(lockId);
        }
    }
}

async function freeUserLockById(lockId) {
    await pool.query('SELECT pg_advisory_unlock($1)', [lockId]);
}

async function lokeUserById(userId) {
    const lockId = createLockId(userId);

    await pool.query('SELECT pg_advisory_lock($1)', [lockId]);
    return lockId;
}

async function upsert(userId, revenueChange) {
    await pool.query(
        `INSERT INTO users_revenue (user_id, revenue)
         VALUES ($1, $2)
         ON CONFLICT (user_id)
         DO UPDATE SET revenue = users_revenue.revenue + $2`,
        [userId, revenueChange]
    );
}

function createLockId(userId) {
    return Buffer.from(userId).reduce((a, b) => a + b, 0);
}

function groupByUser(events) {
    const userEvents = {};
    for (const event of events) {
        if (!userEvents[event.userId]) {
            userEvents[event.userId] = 0;
        }
        
        const value = event.name === 'add_revenue' ? event.value : -event.value;
        userEvents[event.userId] += value;
    }
    return userEvents;
}

async function processEvents() {
    try {
        for await (const eventsBatch of readFileInChunks()) {
            const userEvents = groupByUser(eventsBatch);
            await updateUsers(userEvents);   
        }
    } catch (error) {
        console.error('Error processing data:', error);
    } finally {
        await pool.end();
    }
}

processEvents();

