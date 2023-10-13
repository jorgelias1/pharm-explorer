import axios from 'axios'
const baseUrl= 'http://127.0.0.1:3001'

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
const getSEC=(item)=>{
    return axios.get(`${baseUrl}/api/sec/${item.cik}/${item.ticker}`)
}
const getQuote=(item)=>{
  return axios.get(`${baseUrl}/api/quote/${item.ticker}`)
}
const getTrials=(name)=>{
    name=name.split(' ')
    name=name[0]
  return axios.get(`${baseUrl}/api/trials/${name}`)
}
const getTrialsLogic=(name)=>{
  const Promises=[
    axios
    .get(`https://clinicaltrials.gov/api/v2/studies?format=json&query.spons=${name}&filter.overallStatus=ACTIVE_NOT_RECRUITING%2CRECRUITING&pageSize=100`),
  ]
  return Promise.all(Promises)
}

const getCik = async (name)=>{
  const companyURL = `http://localhost:3001/companies`
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
const getPositions=(id)=>{
  return axios.get(`${baseUrl}/api/positions/${id}`)
}
export default{
    getCompanies,
    getSEC,
    getTrials,
    getTrialsLogic,
    getCik,
    getQuote,
    getPositions,
}
