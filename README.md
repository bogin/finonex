# ETL System

A simple ETL (Extract, Transform, Load) system consisting of a client, server, and data processor, using Node.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- npm (usually comes with Node.js)

## Installation Steps

### 1. Install PostgreSQL

#### On Windows:
1. Download PostgreSQL installer from [official website](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Choose default port (5432)
4. Set password as 'postgres' (or update the connection settings in the code)
5. Complete the installation

#### On Mac (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

#### On Ubuntu/Debian:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Set Up PostgreSQL User and Database
After installation, set up the database user:

```bash
# For Mac/Linux
sudo -u postgres psql

# For Windows, open SQL Shell (psql)

# In psql shell:
ALTER USER postgres WITH PASSWORD 'postgres';
\q
```

### 3. Install Node.js Dependencies

Clone the repository and install dependencies:
```bash
git clone <your-repository-url>
cd <repository-directory>
npm install
```

### 4. Set Up Database Schema

```bash
# Create the database schema using npm script
npm run db:setup
```

## Available Scripts

```json
{
  "scripts": {
    "start": "node server.js",
    "client": "node client.js",
    "process": "node data_processor.js",
    "db:setup": "psql -U postgres -d postgres -f db.sql",
    "db:reset": "psql -U postgres -d postgres -c 'DROP TABLE IF EXISTS users_revenue;' && npm run db:setup"
  }
}
```

## Running the System

1. Start the server:
```bash
npm run start
```

2. Create `events.jsonl` file in project root:
```json
{"userId": "user1", "name": "add_revenue", "value": 98}
{"userId": "user1", "name": "subtract_revenue", "value": 72}
```

3. Run the client:
```bash
npm run client
```

4. Process data:
```bash
npm run process
```

## Additional Commands

Reset database (drops and recreates table):
```bash
npm run db:reset
```


## API Endpoints

- POST `/liveEvent`: Submit new event
  - Header required: `Authorization: secret`
  - Body: `{"userId": "string", "name": "string", "value": number}`

- GET `/userEvents/:userid`: Get user revenue
  - Returns: `{"user_id": "string", "revenue": number}`