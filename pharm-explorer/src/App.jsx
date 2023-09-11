import { useState, useEffect } from 'react'
import searchService from './services/searching'
import svg from './services/queryDb'
import axios from 'axios'

import './App.css'
// header component
// flex cont component

// const Results=()=>{
  
// }
const MainMenuCard=({text})=>{
  return(
    <div><button>{text}</button></div>
  )
}
function Pill() {
  return (
    <>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />  
  <span className="material-symbols-outlined">pill</span>    
  </>
  );
}
const Button=({text})=>{
  return(
    <button>{text}</button>
  )
}
// logic for company/drug search
const Search=({setQuery, query, setSearchResults, searchResults})=>{
  const [svgURL, setSvgURL]=useState('');
  // get icon URL
  useEffect(()=>{
      svg.getSVG().then(response=>{setSvgURL(response.data)})
      
  }, [])
  const resultWrapper={
    backgroundColor:'white',
    color:'black',
    borderRadius:'4px',
    padding:'5px',
    display: !query ? 'none': 'block',
    fontSize: '1rem',
    textAlign:'left'
  }
  const flexV={
    display:'flex',
    flexDirection:'column',
  }
  const search=(event)=>{
    setQuery(event.target.value)
  }

  // when user input changes, reflect in searchResults
  useEffect(() => {
    searchService
    .showResults(query, setSearchResults)
    
  }, [query]);
  
  const handleCompanyClick=(item)=>{
    axios
      .get(`https://data.sec.gov/submissions/CIK${item.cik}.json`)
      .then(response=>console.log(response))
  }
  const handleDrugClick=(item)=>{
    console.log(item.name, 'drugs!')
  }
  const all=searchResults.map(item=>{
    return(
    (item.type==='company') 
    ?(<div key={item.name} onClick={()=>handleCompanyClick(item)}>{item.name} (${item.ticker})</div>)
    :(<div key={item.name} onClick={()=>handleDrugClick(item)}>
      <img src={svgURL} style={{width: '0.8rem'}}/>
      {' '}{item.name}
      </div>)
    )
  }
)
  return (
    <>
    <form style={flexV}>
      <input onChange={search} type='search' placeholder='search...' autoFocus/>
      <div style={resultWrapper}>
        {all}
      </div>
      <Button text='submit'/>
    </form>
    </>
  )
}
const App=()=>{
  const [query, setQuery]=useState(null);
  const [searchResults, setSearchResults]=useState([]);
  const mainStyle={
    display:'flex',
    gap: '4rem',
  }
  return (
    <>
      <h1>hello</h1>
      <div style={mainStyle}>
        <MainMenuCard text='screener'/>
        <Search setQuery={setQuery} query={query} setSearchResults={setSearchResults} searchResults={searchResults} />
        <MainMenuCard text='calendars' />
      </div>
    </>
  )
}

export default App
