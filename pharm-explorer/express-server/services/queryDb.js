import axios from 'axios'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import {load} from 'cheerio'

const getCompanies=(response, fuzzyPattern)=>{
         const filteredData=response.data.filter(item=>{
             return(
                 item.name.match(fuzzyPattern) ||
                 item.ticker.match(fuzzyPattern)
             )
         })
         let companies=[]
         filteredData.map(item=>{
             companies.push(item)
         })
         if (companies.length>6){
            companies=companies.slice(0,6)
         }
         return companies
 }
 
const getSVG=()=>{
    return axios.get('http://127.0.0.1:3001/api/svg')
}
const getSvgUrl = () => {
    const iconId = '4477632';
    const apikey = '1445d0ba0dc94fdf967062479562436e';
    const secret = 'ddd4495bcb8748fc9975ebc06e24f55b';
  
    return new Promise((resolve, reject) => {
      const oauth = OAuth({
        consumer: { key: apikey, secret: secret },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
          const hmac = crypto.createHmac('sha1', key)
          hmac.update(base_string)
          return hmac.digest('base64')
        },
      })
  
      const apiEndpoint = `https://api.thenounproject.com/v2/icon/${iconId}`;
      const requestData = {
        url: apiEndpoint,
        method: 'GET',
      }
      const authorization = oauth.authorize(requestData);
      const axiosInstance = axios.create({
        headers: {
          Authorization: oauth.toHeader(authorization).Authorization,
        },
      })
  
      // Make the authenticated API request
      axiosInstance
        .get(apiEndpoint)
        .then((response) => {
          const svgURL = response.data.icon.thumbnail_url;
          resolve(svgURL);
        })
        .catch((error) => {
          console.log('Error:')
          reject(error)
        })
    })
  }
const getSEC=(item)=>{
    return axios.get(`http://127.0.0.1:3001/api/sec/${item.cik}/${item.ticker}`)
}
const getSECLogic=(cik, ticker, name)=>{
    const Promises=[
        axios
        .get(`https://data.sec.gov/submissions/CIK${cik}.json`),
        axios
        .get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`),
        axios
        .get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=1b6723937facb669b72c54ab25a440b0`),
        axios
        .get(`https://financialmodelingprep.com/api/v3/ratios-ttm/${ticker}?apikey=1b6723937facb669b72c54ab25a440b0`),
      ]
        return Promise.all(Promises)
}
const getTrials=(name)=>{
    name=name.split(' ')
    name=name[0]
  return axios.get(`http://127.0.0.1:3001/api/trials/${name}`)
}
const getTrialsLogic=(name)=>{
  const Promises=[
    axios
    .get(`https://clinicaltrials.gov/api/v2/studies?format=json&query.spons=${name}&filter.overallStatus=ACTIVE_NOT_RECRUITING%2CRECRUITING&pageSize=100`),
  ]
  return Promise.all(Promises)
}
const getPressReleases=()=>{
  return axios.get(`http://127.0.0.1:3001/api/pressReleases`)
}
const filterPressReleases=async (urlArray)=>{
  const regexArray = [
    '(?:[^\n.;•]*?(\\b(?:expect\\s)?(?:topline\\s+(?:data|results|submission|study))[^.;]*?\\s+(?:expected\\s+(?:in|through|for|to\\s+be)|on\\s+track\\s+for|end\\s|in\\s|report\\s+(?:to(?:p)?line\\s+results)?\\s+in|expected|anticipated\\s+(?:\\.{3})?\\s*((?:(?:first|second|third|fourth)\\s+)?(?:date|in|for|by|Q\\d|(?:1|2)\\H)[^;]*?))[^;\n]*?\\s+(?:the\\s+)?(((?:\\w+\\s+)?(?:\\d{1,4}(?:st|nd|rd|th)?(?:[/\\s]\\d{1,4})?|(?:mid-)?(?:\\w+\\s+)?\\d{1,4}(?:[/\\s]\\d{1,4})?|Q\\d))\\b).*?))',
    '(?:[^\n.;•]*?(\\btopline\\s+(?:data|results)\\s+(?:from|of|in)\\s+(?:.*?\\s+)?(((?:expected|readout)\\s+(?:early\\s+)?((?:(?:first|second|third|fourth)\\s+)?(?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{1,4}(?:\\s*[HQ]\\d)?)\\b)).*?))',
    '(?:[^\n.;•]*?(\\btopline\\s+data[^.;]*?\\s+(((?:expected|read\\s+out|on\\s+track\\sto\\s+(?:report\\s+to(?:p)?line\\s+data|read\\s+out))[^.;]*?\\s+(?:early\\s+)?((?:(?:first|second|third|fourth)\\s+)?(?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{4})\\b)).*?))',
    '(?:[^\n.;•]*?(\\b(((?:report\\s+to(?:p)?line\\s+data|share\\s+topline\\s+data|expects\\s+to\\s+report\\s+to(?:p)?line\\s+results)\\s+(?:in\\s+(?:the\\s+)?)?(((?:(?:first|second|third|fourth)\\s+)?quarter\\s+of\\s+\\d{4})\\b))).*?))',
    '(?:[^\n.;•]*?(\\b(((?:report\\s+to(?:p)?line\\s+data|share\\s+topline\\s+data|expects\\s+to\\s+report\\s+to(?:p)?line\\s+results)[^.;]*?(?:in\\s+(?:the\\s+)?)?(((?:(?:first|second|third|fourth)\\s+)?quarter\\s+of\\s+\\d{4})\\b))).*?))',
    '(?:[^\n.;•]*?(\\b(on\\s+track\\s+to\\s+report\\s+topline\\s+data\\s+(((?:(?:first|second|third|fourth)\\s+)?(?:in|for|on\\s+track\\s+to|read\\s+out\\s+in)\\s+(?:the\\s+)?(?:early\\s+)?((?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{4}))\\b)).*?))',
    '(?:[^\n.;•]*?(\\b(?:\\(?)PDUFA(?:\\))?[^.:!?]{0,40}?(?:date|action date|target action date)(?!\\s+\\w*date\\b)[^.!?]{0,40}?(\\d{4})\\b))'
] 
const dateExpression = [
  '\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(?:\\d{1,2},\\s+)?(?:of\\s+)?)\\d{4}\\b',
  '\\b((?:(?:first|second|third|fourth|middle)\\s+)?(?:(?:Q\\d\\s|(?:1|2)\\H\\s|quarter\\s|first-half\\s|second-half\\s|half\\s|mid-|mid\\s|middle\\s|end\\s+of\\s|late\\s))[^.]*?)+?(((?:\\w+\\s+)?(?:\\d{1,4}(?:st|nd|rd|th)?(?:[/\\s]\\d{1,4})?|(?:mid-|end\\s+of)?(?:\\w+\\s+)?\\d{1,4}(?:[/\\s]\\d{1,4})?|Q\\d)|(?:[A-Z][a-z]+)\\s+\\d{1,2}))\\b',
];

const relevantInfo=[];
const maxConcurrentRequests=10;
const delayBetweenRequests=1000;
let currentRequestCount=0;
  // thorough filtering of urls
  console.log('length:', urlArray.length)
  for (let i=0, n=urlArray.length; i<200; i++){
    const url=urlArray[i].filingUrl
    const cik=urlArray[i].cik;

    (async ()=>{
      try{
        const response=await axios.get(url)
        if (response.status===200){
          // get first 750 words from the file to filter
          const htmlContent=response.data
          const $=load(htmlContent)
          const text=$('body').text()
          // const limitedText=text.split(' ').slice(0, 750).join(' ')   
          // find matching expressions + dates
          // identify the type of event this is
          let matchedSentence=null;
          let matchedDate=null;
          let type=null;
          let conciseSentence=null;
          let phase=null;
          let stage=null;

          const phasePtrn= new RegExp(`(?:phase|phase\\s)+(?:(?:1|i)|(?:2|ii)|(?:3|iii)|(?:4|iiii))+(?:a|b)?`, 'i');
          const PDUFAptrn = new RegExp(`\\b(?:\\(?)PDUFA(?:\\)?)\\b`, 'i');
          const PDUFADatePtrn = new RegExp(`\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(?:\\d{1,2},\\s+)?(?:of\\s+)?)\\d{4}\\b`, 'i');
          let toplineCount=0, pdufaCount=0;
          for (const regexpression of regexArray){
            let regex = new RegExp(regexpression, 'i')
            const match=text.match(regex)
            // check for match and determine event type
            if (match){
              matchedSentence=match[0];
              conciseSentence=match[1];
              phase = matchedSentence.match(phasePtrn)
              type = conciseSentence.match(PDUFAptrn)
              ? 'PDUFA'
              : 'topline';
              type==='PDUFA'
              ? pdufaCount++
              : toplineCount++;
              // check if sentence has valid date structure
              for (const exp of dateExpression){
                let date = (type==='topline')
                ? new RegExp(exp, 'i')
                : new RegExp(exp, 'ig')
                const dateMatch=conciseSentence.match(date)
                if(dateMatch){
                  matchedDate=dateMatch[0]                 
                  if (type==='PDUFA'){
                    matchedDate=dateMatch[dateMatch.length-1]
                  }
                  if (type==='PDUFA' && (!matchedDate.match(PDUFADatePtrn)||matchedDate.length>23)){
                    matchedDate=null;
                  }
                  break;
                }
              }
            let typeCount;
            if (type==='topline'){
              stage = phase ? phase[0] : null;
              typeCount=toplineCount;
            }
            else if(type==='PDUFA'){
              stage='Advanced';
              typeCount=pdufaCount;
            }
            if (matchedSentence && matchedDate && typeCount<=1){
              relevantInfo.push({
                matchedSentence,
                matchedDate,
                cik,
                type,
                url,
                stage,
              })
            }
            }
          }
        }
      } catch (error){
        console.error(error)
      }
  })()
  // ensure no more than 10 axios requests/second
  currentRequestCount++;
  if ((currentRequestCount % maxConcurrentRequests)===0){
    console.log('waiting', i)
    await new Promise(resolve=>setTimeout(resolve, delayBetweenRequests))
  }
}
console.log('refining results...')
  // (1)getTickers
  const eventsAndTickers=await getTickers(relevantInfo)
  // (2)standardize dates to prepare for filtering and sorting
  const standardizedEvents=standardizeDates(eventsAndTickers)
  // (3)filter out any duplicate events.
  const filteredEvents=await checkForDuplicates(standardizedEvents)
  // (4)filter past events
  const finalEvents=filterPastDates(filteredEvents)
  console.log('finished! posting...')
  // post the final data to the database
  axios
  .post('http://127.0.0.1:3001/api/postEvents', finalEvents)
  .then(console.log('posted! all done :)'))
  .catch(error=>console.error(error))
  return finalEvents;
}

const checkForDuplicates=async(events)=>{
  // current tmpSet
  const tmpSet=new Set();
  // database set returned from db function.
  const response = await axios.get('http://127.0.0.1:3001/keys')
  const dbSet=response.data;
  const uniqueEvents=[];
  for (const item of events){
    const key=`${item.standardDate}-${item.cik}-${item.type}`
    // if the current event is not already in the database 
    // and not in the current array, add it to the unique array
    if (!tmpSet.has(key) && !(dbSet.includes(key))){
      tmpSet.add(key);
      uniqueEvents.push(item);
    }
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
            day='31'
            year=match[match.length-1]
            event.standardDate=`${month}/${day}/${year}`
          }
          else if (pattern.end){
            month=12
            day='31'
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
  .delete('http://127.0.0.1:3001/api/deleteEvents')
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

  
export default{
    getCompanies,
    getSVG,
    getSvgUrl,
    getSEC,
    getSECLogic,
    getTrials,
    getTrialsLogic,
    getPressReleases,
    filterPressReleases,
}
