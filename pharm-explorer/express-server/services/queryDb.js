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
    '\\b(?:expect\\s)?(?:topline\\s+(?:data|results|submission|study))[^.;]*?\\s+(?:expected\\s+(?:in|through|for|to\\s+be)|on\\s+track\\s+for|end\\s|in\\s|report\\s+(?:to(?:p)?line\\s+results)?\\s+in|expected|anticipated\\s+(?:\\.{3})?\\s*((?:(?:first|second|third|fourth)\\s+)?(?:date|in|for|by|Q\\d)[^;]*?))[^;]*?\\s+(?:the\\s+)?(((?:\\w+\\s+)?(?:\\d{1,4}(?:st|nd|rd|th)?(?:[/\\s]\\d{1,4})?|(?:mid-)?(?:\\w+\\s+)?\\d{1,4}(?:[/\\s]\\d{1,4})?|Q\\d))\\b).*?',
    '\\btopline\\s+(?:data|results)\\s+(?:from|of|in)\\s+(?:.*?\\s+)?(((?:expected|readout)\\s+(?:early\\s+)?((?:(?:first|second|third|fourth)\\s+)?(?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{1,4}(?:\\s*[HQ]\\d)?)\\b)).*?',
    '\\btopline\\s+data[^.;]*?\\s+(((?:expected|read\\s+out|on\\s+track\\sto\\s+(?:report\\s+to(?:p)?line\\s+data|read\\s+out))[^.;]*?\\s+(?:early\\s+)?((?:(?:first|second|third|fourth)\\s+)?(?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{4})\\b)).*?',
    '\\b(((?:report\\s+to(?:p)?line\\s+data|share\\s+topline\\s+data|expects\\s+to\\s+report\\s+to(?:p)?line\\s+results)\\s+(?:in\\s+(?:the\\s+)?)?(((?:(?:first|second|third|fourth)\\s+)?quarter\\s+of\\s+\\d{4})\\b))).*?',
    '\\b(((?:report\\s+to(?:p)?line\\s+data|share\\s+topline\\s+data|expects\\s+to\\s+report\\s+to(?:p)?line\\s+results)[^.;]*?(?:in\\s+(?:the\\s+)?)?(((?:(?:first|second|third|fourth)\\s+)?quarter\\s+of\\s+\\d{4})\\b))).*?',
    '\\b(on\\s+track\\s+to\\s+report\\s+topline\\s+data\\s+(((?:(?:first|second|third|fourth)\\s+)?(?:in|for|on\\s+track\\s+to|read\\s+out\\s+in)\\s+(?:the\\s+)?(?:early\\s+)?((?:\\w+\\s+)?(?:\\.{3})?\\s*\\d{4}))\\b)).*?',
    '\\b(?:\\(?)PDUFA(?:\\))?[^.!?]*?(?:date|action date|target action date)[^.!?]*?(\\d{4})\\b'
]
const dateExpression = [
  '\\b((?:(?:first|second|third|fourth|middle)\\s+)?(?:(?:Q\\d|quarter|first-half|second-half|half|mid-|end\\s+of|late))[^.]*?)\\s+?(((?:\\w+\\s+)?(?:\\d{1,4}(?:st|nd|rd|th)?(?:[/\\s]\\d{1,4})?|(?:mid-|end\\s+of)?(?:\\w+\\s+)?\\d{1,4}(?:[/\\s]\\d{1,4})?|Q\\d)|(?:[A-Z][a-z]+)\\s+\\d{1,2}))\\b',
  '\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(?:\\d{1,2},\\s+)?(?:of\\s+)?)\\d{4}\\b',
];

const relevantInfo=[];
const maxConcurrentRequests=10;
const delayBetweenRequests=1000;
let currentRequestCount=0;
  // thorough filtering of urls
  console.log('length:', urlArray.length)
  for (let i=0, n=urlArray.length; i<20; i++){
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
          const limitedText=text.split(' ').slice(0, 750).join(' ')   
          // find matching expressions + dates
          // identify the type of event this is
          let matchedSentence=null;
          let matchedDate=null;
          let type=null;
          const PDUFAptrn = new RegExp(`\\b(?:\\(?)PDUFA(?:\\)?)\\b`, 'i');
          const PDUFADatePtrn = new RegExp(`\\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\\s+(?:(?:\\d{1,2},\\s+)?(?:of\\s+)?)\\d{4}\\b`, 'i');
          for (const regexpression of regexArray){
            let regex = new RegExp(regexpression, 'i')
            const match=limitedText.match(regex)
            // check for match and determine event type
            if (match){
              matchedSentence=match[0];
              type = matchedSentence.match(PDUFAptrn)
              ? 'PDUFA'
              : 'topline'
              // check if sentence has valid date structure
              for (const exp of dateExpression){
                let date = new RegExp(exp, 'i')
                const dateMatch=matchedSentence.match(date)
                if(dateMatch){
                  matchedDate=dateMatch[0]
                  if (type==='PDUFA' && !matchedSentence.match(PDUFADatePtrn)){
                    matchedDate=null;
                  }
                  break;
                }
              }
            }
          }
          if (matchedSentence && matchedDate){
          relevantInfo.push({
            matchedSentence,
            matchedDate,
            cik,
            type,
            url,
          })
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
  // filter out any duplicate events
  const filteredEvents=checkForDuplicates(relevantInfo)
  return filteredEvents
}

const checkForDuplicates=(events)=>{
  console.log('checking')
  const tmpSet=new Set();
  const uniqueEvents=[];
  for (const item of events){
    const key=`${item.matchedSentence}-${item.matchedDate}-${item.cik}`
    if (!tmpSet.has(key)){
      tmpSet.add(key);
      uniqueEvents.push(item);
    }
  }
  return uniqueEvents
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
