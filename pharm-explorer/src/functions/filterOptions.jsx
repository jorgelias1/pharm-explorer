import { useState } from "react"
import '../App.css'

const stages = [
    {type: 'Phase 1', pattern: new RegExp(`(?:phase|phase\\s)+((?:1|i))(?:a|b)?\\b`, 'ig')},
    {type: 'Phase 2', pattern: new RegExp(`(?:phase|phase\\s)+((?:2|ii))(?:a|b)?\\b`, 'ig')},
    {type: 'Phase 3', pattern: new RegExp(`(?:phase|phase\\s)+((?:3|iii))(?:a|b)?\\b`, 'ig')},
    {type: 'Phase 4', pattern: new RegExp(`(?:phase|phase\\s)+((?:4|iv))`, 'ig')},
    {type: 'PDUFA', pattern: new RegExp(`Advanced`, 'ig')}
]
export const Options=({events, setEvents})=>{
    const [ticker, setTicker] = useState('')
    const findStageMatches=(stage)=>{    
        const filteredEvents = events.filter(event=>
            event.stage && event.stage.match(stage.pattern)
        )
        setEvents(filteredEvents)
    }
    const findCompanyMatches=()=>{
        const filteredEvents=events.filter(event=>
            event.ticker===ticker.toUpperCase()
        )
        setEvents(filteredEvents)
    }
    return(
        <>
        <div className="wrapper">
        {stages.map(stage=>
            <div key={stage.type} onClick={()=>{findStageMatches(stage)}}>
                {stage.type}</div>
        )}
        </div>
        <div style={{display: 'flex'}}>
            <input onChange={(e)=>setTicker(e.target.value)} value={ticker} placeholder="Enter a ticker..." style={{minWidth: '7rem'}}/>
            <button onClick={()=>findCompanyMatches()}>filter ticker</button>
        </div>
        </>
    )
}

