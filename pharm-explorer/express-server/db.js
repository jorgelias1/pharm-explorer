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
const getCompanyCatalysts=async(ticker)=>{
    const events = await getEvents();
    const companyCatalysts = events.filter(event=>{
        return event.ticker===ticker
    })
    return companyCatalysts
}
const addUserToDb = async(user)=>{
    try{
        const query = 'INSERT INTO users (cognito_sub, username, email) VALUES ($1, $2, $3)'
        await pool.query(query, [user.attributes.sub, user.username, user.attributes.email])
    } catch(error){
        console.error(error)
    }
}
const getPositions = async(id)=>{
    const query = 'SELECT * FROM positions WHERE user_cognito_sub = $1'
    const result = await pool.query(query, [id])
    let positions=[];
    for (const row of result.rows){
        let tmpObj={};
        tmpObj.id=row.id;
        tmpObj.type=row.type;
        tmpObj.ticker=row.ticker;
        tmpObj.quantity=row.quantity;
        tmpObj.price=row.price;
        tmpObj.initialAvgPrice=row.initialavgprice;
        tmpObj.thesis=row.thesis
        positions.push(tmpObj);
    }
    return positions
}
const getHistory =  async(id)=>{
    const query = 'SELECT * FROM history WHERE user_cognito_sub = $1'
    const result = await pool.query(query, [id])
    let positions=[];
    for (const row of result.rows){
        let tmpObj={};
        for (const prop in row){
            tmpObj[prop] = row[prop]
        }
        positions.push(tmpObj);
    }
    return positions
}
const getCash = async(id)=>{
    const query = 'SELECT cash FROM users WHERE cognito_sub = $1'
    const cash = await pool.query(query, [id])
    return cash
}
const postCash = async(id, cash)=>{
    try{
    const query = 'UPDATE users SET cash = $1 WHERE cognito_sub = $2'
    await pool.query(query, [Number(cash), id])
    } 
    catch(error){console.error(error)}
}
const updatePositions=async(id, trade, found)=>{
    try{
        if (found===false){
            const query = 'INSERT INTO positions (user_cognito_sub, type, ticker, quantity, price, initialavgprice) VALUES ($1, $2, $3, $4, $5, $6)'
            await pool.query(query, [id, trade.type, trade.ticker, trade.quantity, trade.price, trade.initialAvgPrice])
    } else{
        const query = 'UPDATE positions SET price = $1, quantity = $2, initialavgprice = $3 WHERE user_cognito_sub = $4 AND ticker = $5 AND type = $6'
        await pool.query(query, [trade.price, trade.quantity, trade.initialAvgPrice, id, trade.ticker, trade.type])
    }
    } 
    catch(error){console.error(error)}
}
const deletePosition=async(id, position)=>{
    try{
        const query = 'DELETE FROM positions WHERE user_cognito_sub = $1 AND ticker = $2 AND type = $3'
        await pool.query(query, [id, position.ticker, position.type])
    } catch(error){
        console.error(error)
    }
}  
const addToHistory = async(id, trade)=>{
    try{
        const query = 'INSERT INTO history (user_cognito_sub, type, ticker, quantity, price, initialavgprice) VALUES ($1, $2, $3, $4, $5, $6)'
        await pool.query(query, [id, trade.type, trade.ticker, trade.quantity, trade.price, trade.initialAvgPrice])
    } catch(error){
        console.error(error)
    }
}
const addToSubcriptions = async(user, topicArn)=>{
    const sub = user.attributes.sub;
    try{
        const query = 
        `UPDATE users 
        SET subscriptions = array_append(subscriptions, $1)
        WHERE cognito_sub = $2`
        await pool.query(query, [topicArn, sub])
    } catch(error){
        console.error(error)
    }
}
const removeFromSubscriptions = async(sub, arn)=>{
    try{
        const query = 
        `UPDATE users 
        SET subscriptions = array_remove(subscriptions, $1)
        WHERE cognito_sub = $2`
        await pool.query(query, [arn, sub])
    } catch(error){
        console.error(error)
    }
}
const getSubscriptions = async(sub)=>{
    try{
        const query = 
        `SELECT subscriptions FROM users WHERE cognito_sub = $1`
        const re = await pool.query(query, [sub])
        return re
    } catch(error){
        console.error(error)
    }
}
const postThesis = async(sub, obj)=>{
    const position = obj.position;
    const text = obj.text;
    try{
        const query = 
        `UPDATE positions 
        SET thesis=$1 
        WHERE user_cognito_sub = $2 AND ticker = $3 AND type = $4`
        await pool.query(query, [text, sub, position.ticker, position.type])
    } catch(err){
        console.log(err)
    }
}
export default{
    getDbKeys,
    postToDb,
    getEvents,
    removeEvents,
    removePastEvents,
    getCompanyCatalysts,
    addUserToDb,
    getPositions,
    getCash,
    postCash,
    updatePositions,
    deletePosition,
    addToHistory,
    getHistory,
    addToSubcriptions,
    removeFromSubscriptions,
    getSubscriptions,
    postThesis,
}