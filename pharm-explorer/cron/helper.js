import axios from 'axios'
import {load} from 'cheerio'

const formatDate=(date)=>{
    const parts=date.split('-')
    const year=parts[0];
    const month=parts[1];
    const day=parts[2];

    date=`${month}/${day}/${year}`;
    return date;
}
const checkForDuplicates=async(events)=>{
    // current tmpSet
    const currentSet=new Set();
    // database set returned from db function.
    const response = await axios.get('http://127.0.0.1:3001/api/events')
    const dbEvents=response.data;
    const re= await axios.get('http://127.0.0.1:3001/keys')
    const dbKeys=re.data
    const allEvents=dbEvents.concat(events)
    const dupArray=sameEventDiffDate(allEvents)
    const uniqueEvents=[];
    for (const item of events){
      const key=`${item.standardDate}-${item.cik}-${item.type}`
      // if the current event is not already in the database 
      // and not in the current array, add it to the unique array
      if (!currentSet.has(key) && !(dupArray.includes(item)) && !dbKeys.includes(key)){
        currentSet.add(key);
        uniqueEvents.push(item);
      }
    }
    console.log('unique events', uniqueEvents)
    // After filtering the currentArray, if there
    // is still a sentence in uniqueEvents that matches 
    // the sentence in the duplicateArray, 
    // remove the one from the db. 
    let toRemove = dbEvents.filter(dbEvent=>{
      return ((uniqueEvents.some((e) => dbEvent.sentence === e.matchedSentence)) 
          && dupArray.includes(dbEvent))
    })
    let n = dbEvents.filter(dbEvent=>{
      return (dupArray.includes(dbEvent))})
    toRemove=toRemove.concat(n)
    console.log('in the duplicate array+db:', toRemove)
    console.log('removing from the db: ',toRemove.length,'events -',toRemove)
    if (toRemove.length>0){
      await axios.delete('http://127.0.0.1:3001/api/duplicates', {
        headers: {
          'Content-Type': 'application/json',
        },
        data: toRemove, 
      })
    }
    return uniqueEvents
}
const standardizeDates=(events)=>{
    const quarterPtrn=new RegExp('\\b(?:Q(\\d)|((?:first|second|third|fourth))\\s+quarter)\\s+(?:of\\s+)?(\\d{1,4})\\b', 'i');
    const halfPtrn=new RegExp('\\b(?:((?:1|2))\\H|((?:first|second))\\s+half)\\s+(?:of\\s+)?(\\d{1,4})\\b','i');
    const middlePtrn=new RegExp('\\b((?:mid\\s|mid-|middle\\s))+(?:of\\s+)?(\\d{1,4})\\b','i');
    const endPtrn=new RegExp('\\b((?:end|late))\\s+(?:of\\s+)?(\\d{1,4})\\b','i');
    const standardPtrn=new RegExp('\\b((?:January|February|March|April|May|June|July|August|September|October|November|December))\\s+(?:(?:(\\d{1,2}),\\s+)?(?:of\\s+)?)(\\d{4})\\b');

    const datePatternArray=[
      {pattern: quarterPtrn, quarter: true},
      {pattern: halfPtrn, half: true},
      {pattern: middlePtrn, middle: true},
      {pattern: endPtrn, end: true},
      {pattern: standardPtrn, standard: true},
    ]
    const numberMap={
      first: 1,
      second: 2,
      third: 3,
      fourth: 4,
    }
      const standardizedEvents=[];
      events.map(event=>{
      for (const pattern of datePatternArray){
        let month=null;
        let day=null;
        let year=null;
        const match = event.matchedDate.match(pattern.pattern)
        if (match){
          if (pattern.quarter){
            const num=match[1]||numberMap[match[2]]
            month=num*3
            day='28'
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
          else if (pattern.half){
            const num=match[1]||numberMap[match[2]]
            month=num*6
            day='28'
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
          else if (pattern.middle){
            month=8
            day='28'
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
          else if (pattern.end){
            month=12
            day='28'
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
          else if (pattern.standard){
            month=match[1]
            day=match[2]||'28'
            if (day.length===1){
              day='0'+day
            }
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
        }
        if (month){
          standardizedEvents.push(event)
        }
      }
    })
    return (standardizedEvents)
}
const filterPastDates=(events)=>{
    const finalEvents=events.filter(event=>{
      const currentDate = new Date();
      const eventDate = new Date(event.standardDate);
  
      return eventDate > currentDate;
    })
    // we shld implement authorization for routes to deleting/posting.
    axios
    .delete('http://127.0.0.1:3001/api/pastEvents')
    .then(console.log('cleaned up db'))
    .catch(error=>console.error(error))
  
    return finalEvents;
}
const getTickers = async (events)=>{
    const companyURL = 'http://localhost:3001/companies'
    const response = await axios.get(companyURL)
    const newEvents = await Promise.all(
      events.map(async event=>{
        const eventCIK = new RegExp(`${event.cik}`)
        try{
        const match=response.data.find(item=>{
          return item.cik.match(eventCIK)
        })
        if (match){
          event.ticker=match.ticker
        }
        else{
          event.ticker=null
        }
        return event
      } catch (error){
        console.log(event.cik)
      }
      })
    )
      return newEvents;
}
const sameEventDiffDate=(events)=>{
    const tmpSet = new Set();
    const specialStr = new RegExp('(\\b(?!FDA|NDA|PDUFA)[A-Z]+(?:-\\d{1,4})?\\b)', 'g')
    const dupArray=[];
    events.forEach(event=>{
        const key=`${event.ticker}-${event.type}`
        if(!tmpSet.has(key)){
            tmpSet.add(key)
        }
        // if it has the same ticker and type
        else{
            events.find(e=>{
                if (e.ticker===event.ticker && e.type===event.type && e.id!==event.id){
                  const wordsToCheck=['extends', 'extended', 'pushed back']
                  const pattern = new RegExp(wordsToCheck.join('|'), 'i')
                  if (e.type==='PDUFA' 
                  && ((e.sentence || e.matchedSentence).match(pattern) 
                  || (event.sentence || event.matchedSentence).match(pattern))
                  ){
                    console.log('PDUFA & extends?', event.sentence || event.matchedSentence, e.sentence || e.matchedSentence)
                    compareTwoDuplicates(event, e, dupArray)
                  }
                    let match1, match2;
                    if (e.sentence){
                      match1=e.sentence.match(specialStr)
                      match2=event.sentence 
                      ? event.sentence.match(specialStr)
                      : event.matchedSentence.match(specialStr)
                    } else {
                      match1=e.matchedSentence.match(specialStr)
                      match2=event.matchedSentence 
                      ? event.matchedSentence.match(specialStr)
                      : event.sentence.match(specialStr)
                    }
                    if (event.stage===e.stage && e.stage!==null && e.type==='topline' && e.url !== event.url){
                      console.log('same phase, diff url', event.sentence || event.matchedSentence, e.sentence || e.matchedSentence)
                      compareTwoDuplicates(event, e, dupArray)
                    }
                    if (match1 && match2){
                outerloop: for (const match of match1){
                            for (const Match of match2){
                            // if the sentence likely mentions the same event
                              if (match===Match && match.length>2){
                                console.log('same special str: ', match, event, e)
                                compareTwoDuplicates(event, e, dupArray)
                                break outerloop;                         
                              }
                            }
                        }
                    }
                }
            })            
        }
    })
    return dupArray;
}
const compareTwoDuplicates=(event, e, dupArray)=>{
    const dateEvent = new Date(event.postDate)
    const dateE = new Date(e.postDate)
    // compare the similar events and remove the older filing
    let toRemove;
    if (dateEvent < dateE){
      console.log('this date < ', dateEvent ,event, 'vs', dateE,e)
      toRemove=event;
    } else if (dateEvent > dateE){
      console.log('this date < ',dateE, e, 'vs',dateEvent, event)
      toRemove=e;
    } else{
      toRemove = (e.sentence && event.matchedSentence) ? 
      event
      : (event.sentence && e.matchedSentence) ?
      e
      : e
    }
    dupArray.push(toRemove)
    
}
const findMatches=async(relevantInfo, cik, url, postDate, regexArray, PDUFADatePtrn, PDUFAptrn, phasePtrn, dateExpression)=>{
    try{
      const response=await axios.get(url)
      if (response.status===200){
        // load the page contents
        const htmlContent = response.data
        const $ = load(htmlContent)
        let text = $('body').text()
  
        let matchedSentence=null;
        let matchedDate=null;
        let type=null;
        let conciseSentence=null;
        let phase=null;
        let stage=null;
  
        for (const regexpression of regexArray){
          let regex = new RegExp(regexpression, 'ig')
          let match=null;
          while ((match=regex.exec(text))!==null){
          // check for desired pattern matches
          if (match){
            matchedSentence=match[0];
            conciseSentence=match[1];
            phase = matchedSentence.match(phasePtrn)
            type = conciseSentence.match(PDUFAptrn) ? 'PDUFA' : 'topline';
            // check if sentence has valid date structure
            for (const exp of dateExpression){
              let date = new RegExp(exp, (type==='topline') ? 'i' : 'ig')
              const dateMatch=conciseSentence.match(date)
              if(dateMatch){
                matchedDate = (type === 'topline') ? dateMatch[0] : dateMatch[dateMatch.length-1] 
  
                if (type==='PDUFA' && (!matchedDate.match(PDUFADatePtrn)||matchedDate.length>23)){
                  matchedDate=null;
                }
                break;
              }
            }
          if (type==='topline'){
            stage = phase ? phase[phase.length-1] : null;
          }
          else {
            stage='Advanced';
          }
          if (matchedSentence && matchedDate){
            relevantInfo.push({
              matchedSentence,
              matchedDate,
              cik,
              type,
              url,
              stage,
              postDate,
            })
          }
          }
        }
        }
      }
    } catch (error){
      console.log('error connecting to the url at:', url)
    }
}
export default{
    formatDate,
    checkForDuplicates,
    standardizeDates,
    filterPastDates,
    getTickers,
    findMatches,
}