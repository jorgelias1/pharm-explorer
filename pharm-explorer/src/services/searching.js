import axios from 'axios'
let drugURL1='https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/'
let drugURL2='/property/Title/TXT?limit=5'
// prolly pubchem
// pubmed to show studies
// pubchem gets moa 

const companyURL=''

const indicationURL=''

// allow for smiles, company name to be input.
const showResults=(query, setResults)=>{
    if (!query){
        return Promise.resolve('no query found');
    }
    const drugURL=`https://pubchem.ncbi.nlm.nih.gov/rest/autocomplete/compound/${query}/json?limit=6`
    
    // const promises=[
    //     axios
    //     .get(drugURL),
    //     mongoose fetching
    // })
    // ]
    // return Promise.all(promises)
    //     .then((responses)=>{
    //         const compounds=response[0].data.dictionary_terms.compound
    //         const companies=response[1].data

    //         setResults({
    //             compounds,
    //             companies
    //         })
    //     })
    return axios
    .get(drugURL)
    .then(response=>{
        let compounds=response.data.dictionary_terms.compound
        setResults(compounds)
    })
    .catch(()=>{
        return ([]);
    }
    )
}

export default{
    showResults,
}