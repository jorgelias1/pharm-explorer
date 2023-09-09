import { useState, useEffect } from 'react'
import searchService from './services/searching'

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
const Button=({text})=>{
  return(
    <button>{text}</button>
  )
}
const Search=({setQuery, query, setSearchResults, searchResults})=>{
  const resultWrapper={
    backgroundColor:'white',
    color:'black',
    borderRadius:'4px',
    padding:'5px',
    display: !query ? 'none': 'block'
  }
  const flexV={
    display:'flex',
    flexDirection:'column',
  }
  const search=(event)=>{
    setQuery(event.target.value)
    // resultWrapper.display='inline-block'
  }
  useEffect(() => {
    searchService
    .showResults(query, setSearchResults)

  }, [query]);

  const all=searchResults.map(compound=>(<div key={compound}>{compound}</div>))
  return (
    <>
    <form style={flexV}>
      <input onChange={search} type='search' placeholder='search...' autoFocus/>
      <div style={resultWrapper}>
        {query&&query.length<3
        ? <div>keep typing</div> 
        : all}
      </div>
      <Button text='submit'/>
    </form>
    </>
  )
}
const App=()=>{
  const [query, setQuery]=useState(null);
  const [searchResults, setSearchResults]=useState([]);
  // const [quote, setQuote]=useState('');
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
