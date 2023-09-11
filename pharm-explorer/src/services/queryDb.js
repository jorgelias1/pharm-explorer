import axios from 'axios'

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
export default{
    getCompanies,
    getSVG,
}
