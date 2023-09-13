import axios from 'axios'
import func from './queryDb.js'
import Fuse from 'fuse.js'

let drugURL1='https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/'
let drugURL2='/property/Title/TXT'
// prolly pubchem
// pubmed to show studies
// pubchem gets moa 
const companyURL='http://localhost:3001/companies';

const indicationURL=''
// allow for smiles, company name to be input.
const showResults=(query, setResults)=>{
    if (!query){
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
                keys:['name'],
                ignoreLocation: true,
            })
            setResults(fuse.search(query)
            .map(result=>result.item))
        })
//     return axios
//     .get(drugURL)
//     .then(response=>{
//         let compounds=response.data.dictionary_terms.compound
//         setResults(compounds)
//     })
//     .catch(()=>{
//         return ([]);
//     }
//     )
}

export default{
    showResults,
}