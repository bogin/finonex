const fs = require('fs').promises;
const axios = require('axios');

const SERVER_URL = 'http://localhost:8000/liveEvent';
const SECRET = 'secret';

async function sendEvent(event) {
    try {
        await axios.post(SERVER_URL, event, {
            headers: {
                'Authorization': SECRET,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(`Error sending event: ${error.message}`);
    }
}

async function processEvents() {
    try {
        const fileContent = await fs.readFile('events.jsonl', 'utf-8');
        
        // Process each line
        const events = fileContent.trim().split('\n');
        
        for (const eventString of events) {
            if (eventString) {
                const event = JSON.parse(eventString);
                await sendEvent(event);
            }
        }
        
    } catch (error) {
        console.error('Error processing events:', error);
    }
}

processEvents();