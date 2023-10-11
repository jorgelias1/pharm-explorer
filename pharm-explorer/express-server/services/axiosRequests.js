import axios from 'axios'
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'

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
const getQuote=(item)=>{
  return axios.get(`http://127.0.0.1:3001/api/quote/${item.ticker}`)
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
export default{
    getCompanies,
    getSVG,
    getSvgUrl,
    getSEC,
    getTrials,
    getTrialsLogic,
    getCik,
    getQuote,
}
