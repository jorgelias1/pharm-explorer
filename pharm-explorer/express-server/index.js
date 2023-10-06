import express from 'express'
const app = express()
import cors from 'cors'
import svg from './services/queryDb.js'
import puppeteer from 'puppeteer'
import {load} from 'cheerio'
import db from './db.js'
import drug from './services/drug.js'
import {Buffer} from 'buffer'

app.use(cors())

function formatDate(dateStr) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const parts = dateStr.split(' ');
  const monthIndex = months.indexOf(parts[0]) + 1; // Add 1 because months are 0-indexed
  const day = parts[1].replace(',', '');
  const year = parts[2];

  // Pad month and day with leading zeros if necessary
  const formattedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;

  return `${year}-${formattedMonth}-${day}`;
}

app.get('/api/svg', (request, response) => {
    svg.getSvgUrl()
    .then(url=>{
        response.send(url)
    })
    .catch(error=>{console.error(error)})
  })
app.get('/api/sec/:cik/:ticker/', (request, response)=>{
    let {cik, ticker}=request.params;
    svg.getSECLogic(cik, ticker)
    .then(re=>{

        const allResponses=[
          re[0].data,
          re[1].data,
          re[2].data,
          re[3].data,
          
        ]
        response.send(allResponses)
    })
    .catch(error=>{
        console.error(error)
    })
  })
app.get('/api/trials/:name', (request, response)=>{
  let {name}=request.params;
  svg.getTrialsLogic(name)
  .then(re=>{
    const currentDate=new Date();
    const studiesInit=re[0].data.studies.filter(study=>study.protocolSection.sponsorCollaboratorsModule.leadSponsor.class==='INDUSTRY')
    let sortedStudies=studiesInit.sort((a,b)=>{
      // check for known completion date
      let dateA=(a.protocolSection.statusModule.completionDateStruct.date) || '9999-12-31';
      let dateB=(b.protocolSection.statusModule.completionDateStruct.date) || '9999-12-31';
      // no prior dates
      dateA=(new Date(dateA) < currentDate) ? '9999-12-31' : dateA
      dateB=(new Date(dateB) < currentDate) ? '9999-12-31' : dateB
      // account for date not being complete
      const fullDateA=dateA.length===10 ? dateA : dateA+'-28'
      const fullDateB=dateB.length===10 ? dateB : dateB+'-28'
      
      return fullDateA.localeCompare(fullDateB)
    })
    if(sortedStudies.length>15){
      sortedStudies=sortedStudies.slice(0,15)
    }
    const allResponses=[
      sortedStudies,
    ]
    response.send(allResponses)
  })
  .catch(error=>console.error(error))
})
const dateFromMonthsAgo=(monthsAgo)=>{
  const today=new Date();
  today.setMonth(today.getMonth()-monthsAgo)

  const year=today.getFullYear();
  const month=String(today.getMonth()+1).padStart(2,'0')
  const day=String(today.getDate()).padStart(2,'0')

  return `${year}-${month}-${day}`
}

app.get('/api/pressReleases', async(request, response)=>{
  async function pressReleasesLogic(){
    const e=Date.now()
    // wait for SEC page to render content
    
    let allFileUrls=[];
    let searchUrl;
    let retry;
    let tryCount=0;
    const today=dateFromMonthsAgo(0);
    const oldDate=dateFromMonthsAgo(6);
    const olderDate=dateFromMonthsAgo(9);

    const searchUrls=[
      `https://www.sec.gov/edgar/search/#/q=%2522topline%2520results%2522%2520OR%2520%2522topline%2520data%25E2%2580%259D%2520AND%2520%2522expects%2522%2520OR%2520%2522expected%2520by%2522%2520OR%2520%2522anticipated%2522&dateRange=custom&category=form-cat1&startdt=${today}&enddt=${today}`,
      `https://www.sec.gov/edgar/search/#/q=PDUFA%2520OR%2520present%2520topline%2520data%2520OR%2520results&dateRange=custom&category=form-cat1&startdt=${today}&enddt=${today}`,
      `https://www.sec.gov/edgar/search/#/q=PDUFA&dateRange=custom&category=form-cat1&startdt=${today}&enddt=${today}`,
      `https://www.globenewswire.com/search/keyword/topline/date/[${today}%2520TO%2520${today}]?pageSize=50`,
      `https://www.globenewswire.com/search/keyword/pdufa/date/[${today}%2520TO%2520${today}]?pageSize=50`,
    ]
    for (let i=0, n=searchUrls.length;i<n;i++){
      searchUrl = searchUrls[i]

      try{
        retry=async()=>{
        const browser=await puppeteer.launch({
          headless:'new'
        });
        const page=await browser.newPage();
        await page.goto(searchUrl)
        let hasNextPage=true;
        let pageIndex=1;
        while (hasNextPage){
          if(i<3){
          const resultsDiv=await page.$('div#no-results-grid[style="display: none;"]')
          if (!resultsDiv){
            hasNextPage=false;
            console.log('url', i, 'terminated at page index:', pageIndex)
          }
          else{
          await page.waitForSelector('.table tbody tr', {timeout: 15000})
          const htmlContent=await page.content();
          const $ =load(htmlContent)

          $('.table tr').each((index, element)=>{
            if ($(element).find('td a').attr('data-adsh')){
              const fileName=$(element).find('td a').attr('data-file-name')
              const fileNumber=$(element).find('td a').attr('data-adsh').replace(/-/g, '')
              const cik=$(element).find('td.cik.d-none').text().replace('CIK ', '').replace(/^0+/, '')
              const postDate=$(element).find('td.filed').text()
              const filingUrl=`https://www.sec.gov/Archives/edgar/data/${cik}/${fileNumber}/${fileName}`;
              
              allFileUrls.push({filingUrl, cik, postDate})
            }
          })
          let nextPageUrl=searchUrl+`&page=${pageIndex+1}`
          pageIndex++;
          await page.goto(nextPageUrl)
        }
      } else{
        await page.waitForSelector('div.main-container', {timeout: 15000})
          const htmlContent=await page.content();
          const $ =load(htmlContent)
          
          const resultsDiv=await page.$('div[style="margin-top: 2.3rem; min-height: 1000px"]')
          if (!resultsDiv){
            hasNextPage=false;
            console.log('url', i, 'terminated at page index:', pageIndex)
          }
          else{
            const baseUrl='https://www.globenewswire.com'

            $('div.col-12.pagging-list-item').each((index, element) => {
              const articleUrl = $(element).find('a[data-autid="article-url"]').attr('href');
              const filingUrl=baseUrl+articleUrl;

              const dateSpan = $(element).find('div.dataSource span.pagging-list-item-text-date.dataAndtimeH');
              const date = dateSpan.text().split(' ').slice(0,3).join(' '); 
              const postDate = formatDate(date);

              const entityName = $(element).find('span.sourceLinkH a.dashboard-organization-name').text().trim();
              svg.getCik(entityName).then(cik=>{
                allFileUrls.push({filingUrl, cik, postDate})
              })
            });
            let nextPageUrl=searchUrl+`&page=${pageIndex+1}`
            pageIndex++;
            await page.goto(nextPageUrl)
          }
      }
      }
        await page.close();
        await browser.close();
        } 
        if (tryCount<4){
          await retry();
        }
      }
        catch(error) {
          if (tryCount>3){
            console.error(error)
            return null;
          }
          console.log('retrying... attempt: ', tryCount)
          tryCount++;
          await retry();
        } 
      } 
      const d=Date.now()
      console.log(d-e)
      
      return allFileUrls
    }
  try{
    const urls=await pressReleasesLogic();
    const responses=await svg.filterPressReleases(urls)
    response.send(responses)
  } catch(e){
    console.error(e)
  } 
})
app.get('/keys', async(request, response)=>{
  const re=await db.getDbKeys()
  response.send(re)
})
app.get('/api/events', async (request, response)=>{
  const re=await db.getEvents();
  response.send(re);
})
app.use(express.json())
app.post('/api/postEvents', async (request, response)=>{
  const events=request.body
  try{
    await db.postToDb(events);
    response.status(200)
  } catch (error){
    console.error(error)
  }
})
app.delete('/api/deletePastEvents', async (request, response)=>{
  try{
    await db.removePastEvents();
    response.status(200)
  } catch(error){
    console.error(error)
  }
})
app.delete('/api/deleteEvents', async (request, response)=>{
  const events=request.body
  try{
    await db.removeEvents(events);
    response.status(200)
  } catch(error){
    console.error(error)
  }
})
app.get('/getDrugData/:name', async (request, response)=>{
  const {name} = request.params
  const re = await drug.getDrugLogic(name);
  const synonyms=re[1].data.InformationList.Information[0].Synonym.slice(0,12)
  const pubmed = await drug.queryPubmed(synonyms)

  const moaArray=pubmed.slice(0,12);
  const pubmedArray=pubmed.slice(12,24);
  const patentArray=re[4].data.InformationList.Information[0].PatentID
  const MOA=drug.findMoa(moaArray, synonyms)
  const pubmedTrials=drug.findPubmedTrials(pubmedArray)
  const pngData=re[3].data
  const croppedImage=await drug.cropImageToCompound(pngData, 10)
  const base64=Buffer.from(croppedImage).toString('base64')

  const allResponses=[
    name,
    re[0].data,
    re[1].data,
    re[2].data,
    base64,
    re[4].data,
    re[5].data,
    MOA,
    pubmedTrials,
  ]
  response.send(allResponses)
})
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})