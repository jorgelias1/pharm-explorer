import axios from 'axios'
import func from './axiosRequests.js'
import Fuse from 'fuse.js'

const companyURL='https://json-server-companies.s3.us-west-1.amazonaws.com/companies.json';

const showResults=(query, setResults)=>{
    if (query===''){
        return Promise.resolve('no query found');
    }
    const drugURL=`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${query}/json?limit=6`
    
    const promises=[
        axios
        .get(drugURL),
        axios
        .get(companyURL)
    ]
    return Promise.all(promises)
        .then((responses)=>{
            const fuzzyPattern=new RegExp(`${query}`, 'i');
            const companyInfo=func.getCompanies(responses[1], fuzzyPattern)
            let compounds=null;
            let completeArr=[];

            if (responses[0].data.dictionary_terms){
                compounds=responses[0].data.dictionary_terms.compound
                compounds=compounds.slice(0,2)
                
                completeArr=[
                    ...compounds.map((name)=>({name, type: 'compound'})),
                    ...companyInfo.map((company)=>({name: company.name, ticker:company.ticker, cik:company.cik, type: 'company'})),
                ]
            }
            else{
                completeArr=[
                    ...companyInfo.map((company)=>({name:company.name, ticker: company.ticker, cik:company.cik, type: 'company'})),
                ]
            }
            const fuse=new Fuse(completeArr, {
                keys:['name', 'ticker'],
                ignoreLocation: true,
            })
            setResults(fuse.search(query)
            .map(result=>result.item))
        })
}
const tradeResults = async (query, setResults)=>{
    if (query===''){
        return Promise.resolve('no query found');
    }
    const response = await axios.get(companyURL)
    const fuzzyPattern=new RegExp(`${query}`, 'i');
    const companyInfo=func.getCompanies(response, fuzzyPattern)
    const searchResults=companyInfo.map(company=>({name: company.name, ticker: company.ticker, cik: company.cik, type: 'company'}))
    const fuse=new Fuse(searchResults, {
        keys:['name', 'ticker'],
        ignoreLocation: true,
    })
    setResults(fuse.search(query)
    .map(result=>result.item))
}

export default{
    showResults,
    tradeResults,
}