import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const getSECLogic=(cik, ticker, name)=>{
    const headers={
        'User-Agent': process.env.USERAGENT,
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
    return axios.get(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${process.env.FINAPIKEY}`)
}

export default{
    getSECLogic,
    getQuote,
}