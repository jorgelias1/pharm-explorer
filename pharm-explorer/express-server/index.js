import express from 'express'
const app = express()
import cors from 'cors'
import svg from './services/queryDb.js'
import puppeteer from 'puppeteer'
import {load} from 'cheerio'
import db from './db.js'

app.use(cors())


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
app.get('/api/pressReleases', async(request, response)=>{
  async function pressReleasesLogic(){
    const e=Date.now()
    // wait for SEC page to render content
    
    let allFileUrls=[];
    let searchUrl;
    for (let i=0;i<2;i++){
      searchUrl = (i===0)
      ? `https://www.sec.gov/edgar/search/#/q=%2522topline%2520results%2522%2520OR%2520%2522topline%2520data%25E2%2580%259D%2520AND%2520%2522expects%2522%2520OR%2520%2522expected%2520by%2522%2520OR%2520%2522anticipated%2522&dateRange=custom&category=form-cat1&startdt=2023-03-01&enddt=2023-09-16`
      : `https://www.sec.gov/edgar/search/#/q=PDUFA&dateRange=custom&category=form-cat1&startdt=2023-03-01&enddt=2023-09-16`
    try{
      const browser=await puppeteer.launch({
        headless:'new'
      });
      const page=await browser.newPage();
      await page.goto(searchUrl)
      let hasNextPage=true;
      let pageIndex=1;
      while (hasNextPage){
        await page.waitForSelector('.table tbody tr')
        const htmlContent=await page.content();
        const $ =load(htmlContent)
        
        const noResultsDiv=await page.$('div#no-results-grid[style="display: none;"]')
        if (!noResultsDiv){
          hasNextPage=false;
        }
        else{
        $('.table tr').each((index, element)=>{
          if ($(element).find('td a').attr('data-adsh')){
            const fileName=$(element).find('td a').attr('data-file-name')
            const fileNumber=$(element).find('td a').attr('data-adsh').replace(/-/g, '')
            const cik=$(element).find('td.cik.d-none').text().replace('CIK ', '').replace(/^0+/, '')
            const filingUrl=`https://www.sec.gov/Archives/edgar/data/${cik}/${fileNumber}/${fileName}`;
            
            (i===0) 
            ? allFileUrls.push({filingUrl, cik})
            : allFileUrls.push({filingUrl, cik, newVersion: '2'})
          }
        })
        let nextPageUrl=searchUrl+`&page=${pageIndex+1}`
        pageIndex++;
        await page.goto(nextPageUrl)
      }
    }
      await page.close();
      await browser.close();
      }
      catch(error) {
        console.error(error)
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
const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})