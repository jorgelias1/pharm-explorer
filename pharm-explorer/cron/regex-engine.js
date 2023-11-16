import axios from 'axios'
import helper from './helper.js'

const getPressReleases=()=>{
    return axios.get(`http://127.0.0.1:3001/api/pressReleases`)
}
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
      helper.findMatches(relevantInfo, cik, url, postDate, regexArray, PDUFADatePtrn, PDUFAptrn, phasePtrn, dateExpression);
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
    const eventsAndTickers = await helper.getTickers(relevantInfo)
    // (2)standardize dates to prepare for filtering and sorting
    const standardizedEvents = helper.standardizeDates(eventsAndTickers)
    // (3)filter out any duplicate events.
    const filteredEvents = await helper.checkForDuplicates(standardizedEvents)
    // (4)filter past events
    const finalEvents = helper.filterPastDates(filteredEvents)
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

  export default {
    getPressReleases,
    filterPressReleases
}
