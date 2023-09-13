import { useState, useEffect } from 'react'
import searchService from './services/searching'
import svg from './services/queryDb'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
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
const Button=({text})=>{
  return(
    <button>{text}</button>
  )
}
// logic for company/drug search
const Search=({setQuery, query, setSearchResults, searchResults})=>{
  const navigate=useNavigate();
  const [svgURL, setSvgURL]=useState('');
  // get icon URL
  useEffect(()=>{
      svg.getSVG().then(response=>{setSvgURL(response.data)})
  }, [])
  const resultWrapper={
    backgroundColor:'white',
    color:'black',
    borderRadius:'4px',
    padding:'1px',
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
    console.log('search clicked')
    svg.getSEC(item)
    .then(response=>console.log(response.data))
    navigate('/company')
  }
  const handleDrugClick=(item)=>{
    console.log(item.name, 'drugs!')
    navigate('/drug')
  }
  const handleHover=(e)=>{
    e.target.style.backgroundColor='#EBF5FD';
    e.target.style.cursor='pointer';
  }
  const handleLeave=(e)=>{
    e.target.style.backgroundColor='white';
    e.target.style.cursor='pointer';
  }
  const optionStyle={
    transition: 'background-color 0.2s ease',
    padding:'4px',
  }
  const all=searchResults.map(item=>{
    return(
    (item.type==='company') 
    ?(<div key={item.ticker+item.name} onClick={()=>handleCompanyClick(item)}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      style={optionStyle}>
      {item.name} (${item.ticker})</div>)
    :(<div key={item.name} onClick={()=>handleDrugClick(item)}
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
      style={optionStyle}>
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
// const SearchResult=({item, handleClick, handleHover, handleLeave})=>{
//   return(
//     <div key={item.name} onClick={()=>handleClick(item)}
//       onMouseEnter={handleHover}
//       onMouseLeave={handleLeave}
//       >
//       {item.name} (${item.ticker})</div>
//   )
// }
const CompanyPage=()=>{
  return <div>Hello, Company</div>
}
const DrugPage=()=>{
  return <div>Hello, Drug</div>
}
const MainLayout=({children})=>{
  const mainStyle={
    display:'flex',
    gap: '4rem',
  }
  return(
  <>
    <h1>hello</h1>
    <div style={mainStyle}>
      <MainMenuCard text='screener' />
      {children}
      <MainMenuCard text='calendars' />
    </div>
  </>
  )
}
const App=()=>{
  const [query, setQuery]=useState(null);
  const [searchResults, setSearchResults]=useState([]);
  
  return (
    <Router>
        <Routes>
        <Route path='/'
            element={
              <MainLayout>
            <Search 
              setQuery={setQuery} 
              query={query} 
              setSearchResults={setSearchResults} 
              searchResults={searchResults} />
              </MainLayout>}
             />
          <Route path='/company' element ={<CompanyPage />} />
          <Route path='/drug' element={<DrugPage />} />
        </Routes>
    </Router>
  )
}

export default App
