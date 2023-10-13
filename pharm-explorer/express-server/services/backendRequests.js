import axios from 'axios'

const getSECLogic=(cik, ticker, name)=>{
    const headers={
        'User-Agent': 'Jorge jorgelias.200421@gmail.com',
        'Accept-Encoding': 'gzip, deflate',
        'Host': 'data.sec.gov',
    }
    const Promises=[
        axios
        .get(`https://data.sec.gov/submissions/CIK${cik}.json`, {headers}),
        axios
        .get(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`, {headers}),
        axios
        .get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=1b6723937facb669b72c54ab25a440b0`),
        axios
        .get(`https://financialmodelingprep.com/api/v3/ratios-ttm/${ticker}?apikey=1b6723937facb669b72c54ab25a440b0`),
      ]
        return Promise.all(Promises)
}
const getQuote=(ticker)=>{
    return axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=1b6723937facb669b72c54ab25a440b0`)
}

export default{
    getSECLogic,
    getQuote,
}