import express from 'express'
const app = express()
import cors from 'cors'
import svg from './services/queryDb.js'
import puppeteer from 'puppeteer'
import {load} from 'cheerio'

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
    // wait for SEC page to render content
    const browser=await puppeteer.launch({
      headless:'new'
    });
    const page=await browser.newPage();
    const searchUrl=`https://www.sec.gov/edgar/search/#/q=%25E2%2580%259Ctopline%2520results%25E2%2580%259D%2520AND%2520%25E2%2580%259Cexpects%2520to%2520report%2520topline%2520results%2520in%25E2%2580%259D%2520OR%2520%2522topline%2520results%2520expected%2520in%25E2%2580%259D%2520OR%2520%25E2%2580%259Ctopline%2520results%2520by%25E2%2580%259D&dateRange=custom&category=form-cat1&startdt=2023-03-01&enddt=2023-09-16`
    let allFileUrls=[]
    let tmpUrl
    for (let i=0;i<10;i++){
      tmpUrl=searchUrl+`&page=${i+1}`
      allFileUrls.push(tmpUrl)
    }
    await page.goto(searchUrl)
    await page.waitForSelector('.table tbody tr')
    const htmlContent=await page.content();
    const $ =load(htmlContent)
  
    const urls=[];
  
    $('.table tr').each((index, element)=>{
      if ($(element).find('td a').attr('data-adsh')){
        const fileName=$(element).find('td a').attr('data-file-name')
        const fileNumber=$(element).find('td a').attr('data-adsh').replace(/-/g, '')
        const cik=$(element).find('td.cik.d-none').text().replace('CIK ', '').replace(/^0+/, '')
        const filingUrl=`https://www.sec.gov/Archives/edgar/data/${cik}/${fileNumber}/${fileName}`
        
        urls.push(filingUrl);
      }
    })
  
    await browser.close();
    return urls;
  }
  try{
    const urls=await pressReleasesLogic();
    response.send(urls)
  } catch(e){console.error(e)}

})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})