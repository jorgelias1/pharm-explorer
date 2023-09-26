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
        ca: fs.readFileSync('./global-bundle.pem'),
    }
});

const getDbKeys=async()=>{
    const query = 'SELECT * from "events"';
    try {
        const result = await pool.query(query);
        let dbSet = [];
        if (result.rows.length===0){
            return dbSet;
        }
        for (const row of result.rows){
            const key=`${row.sentence}-${row.matcheddate}-${row.cik}-${row.type}`
            dbSet.push(key)
        }
        return dbSet;
    } catch (error){
        console.error(error)
    }
}
const postToDb = async (events)=>{
    try {
        for (const event of events){
        const query = `INSERT INTO events 
        (type, ticker, url, sentence, matcheddate, standarddate, cik) 
        VALUES (${event.type}, ${event.ticker}, ${event.url}, ${event.matchedSentence}, ${event.matchedDate}, ${event.standardDate}, ${event.cik})`;
        // Use the pool to query the database
        await pool.query(query)
        }
    } catch (error){
        console.error(error)
    }
}
export default{
    getDbKeys,
    postToDb,
}