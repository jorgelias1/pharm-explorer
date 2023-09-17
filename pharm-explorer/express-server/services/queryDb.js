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
const filterPressReleases=()=>{
  
}
// async function pressReleasesLogic(){
//   // wait for SEC page to render content
//   const browser=await puppeteer.launch();
//   const page=await browser.newPage();

//   await page.goto('https://www.sec.gov/edgar/search/#/q=%25E2%2580%259Ctopline%2520results%25E2%2580%259D%2520AND%2520%25E2%2580%259Cexpects%2520to%2520report%2520topline%2520results%2520in%25E2%2580%259D%2520OR%2520%2522topline%2520results%2520expected%2520in%25E2%2580%259D%2520OR%2520%25E2%2580%259Ctopline%2520results%2520by%2522&dateRange=custom&startdt=2023-01-01&enddt=2023-09-16')
//   await page.waitForSelector('.table tbody tr')
//   const htmlContent=await page.content();
//   const $ =load(htmlContent)

//   const urls=[];

//   $('.table tr').each((index, element)=>{
//     console.log('start')
//     const fileName=$(element).find('td a').attr('data-file-name')
//     const fileNumber=$(element).find('td a').attr('data-adsh').replace(/-/g, '')
//     const cik=$(element).find('td.cik.d-none').text().replace('CIK ', '').replace(/0+/, '')
//     const filingUrl=`https://www.sec.gov/Archives/edgar/data/${cik}/${fileNumber}/${fileName}`
    
//     urls.push(filingUrl);
//   })

//   await browser.close();
//   return urls;
// }
export default{
    getCompanies,
    getSVG,
    getSvgUrl,
    getSEC,
    getSECLogic,
    getTrials,
    getTrialsLogic,
    getPressReleases,
    // pressReleasesLogic,
}
