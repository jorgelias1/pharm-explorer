import axios from 'axios'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import {load} from 'cheerio'
import helper from './helper.js'

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
// scraping is rather procedural, this code is too
const filterPressReleases=async (urlArray)=>{
  // define regexpressions for returning matches
  const regexArray = [
    '(?:[^\n.;•]*?(\\b(?:expect\\s)?(?:topline\\s+(?:data|results|submission|study))[^.;]*?\\s+(?:expected\\s+(?:in|through|for|to\\s+be)|on\\s+track\\s+for|end\\s|in\\s|report\\s+(?:to(?:p)?line\\s+results)?\\s+in|expected|anticipated\\s+(?:\\.{3})?\\s*((?:(?:first|second|third|fourth)\\s+)?(?:date|in|for|by|Q\\d|(?:1|2)\\H)[^;]*?))[^;\n]*?\\s+(?:the\\s+)?(((?:\\w+\\s+)?(?:\\d{1,4}(?:st|nd|rd|th)?(?:[/\\s]\\d{1,4})?|(?:mid-)?(?:\\w+\\s+)?\\d{1,4}(?:[/\\s]\\d{1,4})?|Q\\d))).*?))',
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
  const phasePtrn = new RegExp(`(?:phase|phase\\s)+(?:(?:1|i)|(?:2|ii)|(?:3|iii)|(?:4|iiii))+(?:a|b)?`, 'ig');
  const PDUFAptrn = new RegExp(`\\b(?:\\(?)PDUFA(?:\\)?)\\b`, 'i');
  const PDUFADatePtrn = new RegExp(`\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(?:\\d{1,2},\\s+)?(?:of\\s+)?)\\d{4}\\b`, 'i');

  const relevantInfo=[];
  const maxConcurrentRequests=10;
  const delayBetweenRequests=1000;
  let currentRequestCount=0;
  // thorough filtering of urls
  console.log('length:', urlArray.length)
  for (let i=0, n=urlArray.length; i<n; i++){
    // define base properties
    const url = urlArray[i].filingUrl
    const cik = urlArray[i].cik;
    let postDate = urlArray[i].postDate;
    postDate = helper.formatDate(postDate);

    // if there is a match, add it to the relevantInfo array.
    findMatches(relevantInfo, cik, url, postDate, regexArray, PDUFADatePtrn, PDUFAptrn, phasePtrn, dateExpression);
    // ensure no more than 10 axios requests/second
    currentRequestCount++;
    if ((currentRequestCount % maxConcurrentRequests)===0){
      console.log('waiting', i)
      await new Promise(resolve=>setTimeout(resolve, delayBetweenRequests))
    }
}
console.log('refining results...')
  try{
  // (1)getTickers
  const eventsAndTickers=await getTickers(relevantInfo)
  // (2)standardize dates to prepare for filtering and sorting
  const standardizedEvents=standardizeDates(eventsAndTickers)
  // (3)filter out any duplicate events.
  const filteredEvents=await checkForDuplicates(standardizedEvents)
  // (4)filter past events
  const finalEvents=filterPastDates(filteredEvents)
  console.log('finished! posting...', finalEvents.length, 'events')
  // post the final data to the database
  axios
  .post('http://127.0.0.1:3001/api/postEvents', finalEvents)
  .then(()=>{console.log('posted! all done :)')})
  .catch(()=>console.log('error posting to the db'))

  return finalEvents;
  } catch (error){
    ()=>{console.log('error at:', error)}
  }
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
  // After filtering the currentArray, if there
  // is still a sentence in uniqueEvents that matches 
  // the sentence in the duplicateArray, 
  // remove the one from the db. 
  const toRemove = dbEvents.filter(dbEvent=>{
    return ((uniqueEvents.some((e) => dbEvent.sentence === e.matchedSentence)) 
        && dupArray.includes(dbEvent))
  })
  console.log('removing from the db: ',toRemove.length,'events -',toRemove)
  if (toRemove.length>0){
    await axios.delete('http://127.0.0.1:3001/api/deleteEvents', {
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
  .delete('http://127.0.0.1:3001/api/deletePastEvents')
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
const getCik = async (name)=>{
  const companyURL = 'http://localhost:3001/companies'
  const response = await axios.get(companyURL)
  const entityName = new RegExp(`${name.replace(',', ',?')}`, 'i')
  let cik=null;

  try{
    const match=response.data.find(item=>{
      return item.name.match(entityName)
    })
    if (match){
      cik=match.cik;
    } 
  } catch (error){
      console.log(error)
    }
    return cik;
}
const sameEventDiffDate=(events)=>{
  const tmpSet = new Set();
  const specialStr = new RegExp('(\\b(?!FDA|PDUFA)[A-Z]+(?:-\\d{1,4})?\\b)', 'g')
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
                // if ((e.stdDate || event.standardDate)===(e.standardDate||event.stdDate)){
                //   compareTwoDuplicates(event, e, dupArray)
                // }
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
  const toRemove = dateEvent < dateE
  ? event
  : e
  if (dateEvent===dateE){
    (e.sentence && event.matchedSentence) ? 
    dupArray.push(event)
    : (event.sentence && e.matchedSentence) ?
    dupArray.push(e)
    : dupArray.push(e);
  } else {
  if (toRemove.sentence){
    console.log(toRemove.ticker)
  }
  dupArray.push(toRemove)        
  }
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
    getCik,
}
