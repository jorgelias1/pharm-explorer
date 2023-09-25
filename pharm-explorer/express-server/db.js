import pg from 'pg'
import fs from 'fs'

const pool = new pg.Pool({
    user: 'jorgelias',
    host: 'host',
    database: 'db',
    password: 'pw',
    port: 5432,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('../../../../tmp/certs/global-bundle.pem'),
    }
});

const getDbEvents=async()=>{
    // case 1: no events
    // case 2: there are events
    const query = 'SELECT * from "events"';
    try {
        pool.connect();
        const result = pool.query(query);
        if (result.rows.length===0){
            
        }
    }
}

const postToDb=(events)=>{
    const query = 'SELECT NOW() AS current_time';
    pool.connect()
    // Use the pool to query the database
    pool.query(query, (err, result) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        // If the query was successful, log the current time
        console.log('Connected to the database. Current time:', result.rows[0].current_time);
    }

    // Close the database connection
    pool.end();
    console.log('Connection to the database has been closed')
    });
}

export default{
    getDbEvents,
    postToDb,
}