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
            const key=`${row.standarddate}-${row.cik}-${row.type}`
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
        (type, ticker, url, sentence, matcheddate, standarddate, cik, stage, postdate) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`;
        // post all events to the database
        await pool.query(query, 
            [
            event.type,
            event.ticker, 
            event.url, 
            event.matchedSentence, 
            event.matchedDate, 
            event.standardDate, 
            event.cik, 
            event.stage,
            event.postDate,
        ])
        }
    } catch (error){
        console.error(error)
    }
}
// load events from db into array
const getEvents=async()=>{
    const events=[];
    const query = `SELECT * FROM events ORDER BY
    CASE
      WHEN standardDate ~ '^\\d{1,2}/\\d{1,2}/\\d{4}$' THEN TO_DATE(standardDate, 'MM/DD/YYYY')
      ELSE TO_DATE(standardDate, 'Month/DD/YYYY')
    END;`
    const result = await pool.query(query)
    for (const row of result.rows){
        let tmpObj={};
        tmpObj.type=row.type;
        tmpObj.ticker=row.ticker;
        tmpObj.url=row.url;
        tmpObj.sentence=row.sentence;
        tmpObj.date=row.matcheddate;
        tmpObj.stdDate=row.standardDate;
        tmpObj.cik=row.cik;
        tmpObj.stage=row.stage;
        tmpObj.id=row.id;
        tmpObj.postDate=row.postdate;
        events.push(tmpObj);
    }
    return events;
}
const removeEvents=async(events)=>{
    events.forEach(async (event)=>{
        const query=`DELETE FROM events WHERE id = $1`
        await pool.query(query, [event.id])
    })
}
const removePastEvents=async()=>{
    const events=await getEvents();
    const eventsToBeRemoved=events.filter(event=>{
        const currentDate=new Date();
        const eventDate = new Date(event.stdDate);

        return eventDate<currentDate
    })
    removeEvents(eventsToBeRemoved);
}

export default{
    getDbKeys,
    postToDb,
    getEvents,
    removeEvents,
    removePastEvents,
}