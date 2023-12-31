import axios from 'axios'
const baseUrl= 'https://36sg2kb115.execute-api.us-west-1.amazonaws.com/dev'

const getDrugData=(name)=>{
  return axios.get(`${baseUrl}/drugData/${name}`)
}
const getCompanies=(response, fuzzyPattern)=>{
  const filteredData=response.data.companies.filter(item=>{
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
    name=name[0].replace(/,/g, '')
  return axios.get(`${baseUrl}/api/trials/${name}`)
}
const getTrialsLogic=(name)=>{
    return axios.get(`https://clinicaltrials.gov/api/v2/studies?format=json&query.spons=${name}&filter.overallStatus=ACTIVE_NOT_RECRUITING%2CRECRUITING&pageSize=100`)
}

const getCik = async (name)=>{
  const companyURL = `https://json-server-companies.s3.us-west-1.amazonaws.com/companies.json`
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
const addUserToDb=(user)=>{
  console.log(user)
  return axios.post(`${baseUrl}/api/users`, user)
}
const getPositions=(id)=>{
  return axios.get(`${baseUrl}/api/positions/${id}`)
}
const getHistory=(id)=>{
  return axios.get(`${baseUrl}/api/history/${id}`)
}
const getCash=(id)=>{
  return axios.get(`${baseUrl}/api/cash/${id}`)
}
const postTrade=(id, trade, found)=>{
  return axios.post(`${baseUrl}/api/trade/${id}`, {trade, found})
}
const postCash=(id, cash)=>{
  return axios.post(`${baseUrl}/api/newCash/${id}`, {
    headers: {
      'Content-Type': 'application/json', 
    }, data: cash,
  })
}
const deletePosition=(id, position)=>{
  return axios.post(`${baseUrl}/api/position/${id}`, position)
}
const postHistory = (id, trade)=>{
  return axios.post(`${baseUrl}/api/history/${id}`, trade)
}
const getArn = () =>{
  return axios.get(`${baseUrl}/api/companies`)
}
const subscribe=(params)=>{
  return axios.post(`${baseUrl}/api/subscribe`, params)
}
const addToSubscriptions = (user, topicArn) =>{
  user = {...user, topicArn}
  return axios.post(`${baseUrl}/api/subscription`, user)
}
const unsubscribe = (topicArn, user)=>{
  const sub = user.attributes.sub
  const email = user.attributes.email
  return axios.post(`${baseUrl}/api/${topicArn}/${sub}`, {email})
}
const getSubscriptions = (user) =>{
  const sub = user.attributes.sub
  return axios.get(`${baseUrl}/api/subscriptions/${sub}`)
}
const submitThesis=(position, text, sub)=>{
  return axios.post(`${baseUrl}/api/thesis`, {position, text, sub})
}
const screen=(indication, moa)=>{
  moa = moa.trim().replace(/ /g, '+')
  if (moa===''){
    return axios.get(`https://api.fda.gov/drug/label.json?search=indications_and_usage:"${indication}"&limit=1000`)
  } else{
    return axios.get(`https://api.fda.gov/drug/label.json?search=indications_and_usage:"${indication}"+AND+mechanism_of_action:${moa}&limit=1000`)
  }
}
const togglePublic=(position, sub)=>{
  return axios.post(`${baseUrl}/api/public`, {position, sub})
}
const getPublicPositions=(ticker)=>{
  if (!ticker){
  return axios.get(`${baseUrl}/api/publicPositions`)
  } else{
    return axios.get(`${baseUrl}/api/publicPositions/${ticker}`)
  }
}
const getCompanyCatalysts=(ticker)=>{
  return axios.get(`${baseUrl}/api/catalysts/${ticker}`)
}
const fetchEvents=()=>{
  return axios.get('https://kyqhr40i80.execute-api.us-west-1.amazonaws.com/dev/api/events/')
}
export default{
    getCompanies,
    getSEC,
    getTrials,
    getTrialsLogic,
    getCik,
    getQuote,
    addUserToDb,
    getPositions,
    getCash,
    postTrade,
    postCash,
    deletePosition,
    postHistory,
    getHistory,
    getArn,
    subscribe,
    addToSubscriptions,
    unsubscribe,
    getSubscriptions,
    submitThesis,
    screen,
    getPublicPositions,
    togglePublic,
    getDrugData,
    getCompanyCatalysts,
    fetchEvents,
}
