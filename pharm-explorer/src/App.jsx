import { useState, useEffect } from 'react'
import searchService from '../express-server/services/searching'
import svg from '../express-server/services/queryDb'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import axios from 'axios'

import './App.css'
// header component
// flex cont component

// const Results=()=>{
  
// }
const MainMenuCard=({text, handleClick})=>{
  return(
    <div><button onClick={handleClick}>{text}</button></div>
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
  const [loading, setLoading]=useState(false);
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
    textAlign:'left',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
  }
  if (loading){
    resultWrapper.borderColor='yellow';
    resultWrapper.boxShadow='0 0 20px white';
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
    setLoading(true);
    svg.getSEC(item)
    .then(response=>{
      setLoading(false);
      let data=response.data
      navigate(`/company/`, {state :{data}})
      setQuery(null)
    })
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
  let all=null;
  if (searchResults){
    all=searchResults.map(item=>{
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
  }
  return (
    <form style={flexV}>
      <input onChange={search} type='search' placeholder='search...' autoFocus/>
      <div style={resultWrapper}>
        {all}
      </div>
      <Button text='submit'/>
    </form>
  )
}

const CompanyPage=({query, setQuery, searchResults, setSearchResults})=>{
  const navigate=useNavigate();
  const location = useLocation();
  const [trialData, setTrialData]=useState(null);

  const roundVal=(val)=>{
    
    return (isNaN(val) || null) ? 'N/A'
      : val<1000 ? parseInt(100*val)/100
      : val<1000000 ? parseInt(10*val/1000)/10+'K'
      : val<1000000000 ? parseInt(10*val/1000000)/10+'M'
      : parseInt(100*val/1000000000)/100+'B '
  }
  // 
  useEffect(()=>{
    if (!location.state){
      navigate('/')
    }
  }, [location.state, navigate])
  if (!location.state){
    return null;
  }
  const {data}=location.state
  const profile=data[2][0]
  const ratios=data[3][0]
  const filings=data[0].filings.recent
  useEffect(()=>{
    svg.getTrials(profile.companyName)
    .then(response=>{
    setTrialData(response.data[0])
  })
  }, [profile.companyName])
  const imgStyle={
    width: '10%',
  }
  const scrollTable={
    maxHeight:'20rem',
    overflow: 'auto',
  }
  const trialTable=trialData && (trialData.map(trial=>{
    return <TrialTableRow trial={trial} key={trial.protocolSection.identificationModule.nctId}/>
 }))
  let index=null, shares=null;
  if(data[1].facts.dei){
    if (data[1].facts.dei.EntityCommonStockSharesOutstanding){
      index=data[1].facts.dei.EntityCommonStockSharesOutstanding.units.shares.length-1,
      shares=data[1].facts.dei.EntityCommonStockSharesOutstanding.units.shares[index].val
    }
  }

  let financial;
  data[1].facts['us-gaap']
  ? financial=data[1].facts['us-gaap'] 
  : financial=data[1].facts['ifrs-full']
  return (
  <>
  <Search query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>
  <div><img src={profile.image} style={imgStyle}></img>{profile.companyName} ({profile.exchangeShortName} - {profile.country}) </div>
  
  <div>
    <div>
      ${profile.price} {profile.changes} {(parseInt(10000*profile.changes/profile.price))/100}%
    </div>
    <div>
      CEO: {profile.ceo} 
    </div>
    <div>
    employees: {profile.fullTimeEmployees}
    </div>
    <div>
      <a href={profile.website}>{profile.website}</a>
    </div>
    <div>
      ratios: 
    </div>
    <div>
      mkt cap: {roundVal(profile.mktCap)} 
      Avg Volume(3mo): {roundVal(profile.volAvg)} {shares ? (`Shares Outstanding: ${roundVal(shares)}`) : ''}
    </div>
    <div>
      current ratio: {roundVal(ratios.currentRatioTTM)} 
      cash/share: {roundVal(ratios.cashPerShareTTM)}
      debt/equity: {roundVal(ratios.debtEquityRatioTTM)}
      FCF/share: {roundVal(ratios.freeCashFlowPerShareTTM)}
    </div>
    <div>
      gross profit margin: {roundVal(ratios.grossProfitMarginTTM)}
      P/B: {roundVal(ratios.priceBookValueRatioTTM)}
      P/E: {roundVal(ratios.priceEarningsRatioTTM)}
    </div>
  </div>
  {trialData && (
    <div style={scrollTable}>
    <table>
      <caption>Upcoming Clinical Trials</caption>
      <thead>
        <tr>
          <th>Completion Date (est)</th>
          <th>Phase</th>
          <th>NCT Number</th>
          <th>Enrollment</th>
          <th>Treatment</th>
          <th>Description</th>
          <th>Start Date</th>
        </tr>
      </thead>
      <tbody>
      {trialTable}
      </tbody>
    </table>
    </div>
  )}
  </>
  )

}
const TrialTableRow=({trial})=>{
    const base=trial.protocolSection
    const date=base.statusModule
    const NCTID=base.identificationModule.nctId
    const interventions=base.armsInterventionsModule.interventions
    const desc=base.descriptionModule.briefSummary
    const [showDesc, setShowDesc]=useState(false);
    const read=()=>{setShowDesc(!showDesc)}
    const rowStyle={
      maxHeight:'8rem',
      overflow: 'auto',
    }
    return(
      <tr key={NCTID}>
        <td>{date.completionDateStruct.date}</td>
        <td>{(base.designModule.phases && base.designModule.phases.length>1) ? (base.designModule.phases[0]+', '+base.designModule.phases[1]) : base.designModule.phases}</td>
        <td><a href={`https://clinicaltrials.gov/study/${NCTID}`}>
        {NCTID}
        </a>
        </td>
        <td>{base.designModule.enrollmentInfo.count}</td>
        <td>{interventions&& interventions.length>0 ? interventions.map(intervention=>intervention.name+', ') : interventions}</td>
        <td><div onClick={read} style={rowStyle}>{showDesc ? desc : 'click to read'}</div></td>
        <td>{date.startDateStruct.date}</td>
      </tr>
    )
}
const DrugPage=()=>{
  return <div>Hello, Drug</div>
}
const MainLayout=({children})=>{
  const mainStyle={
    display:'flex',
    gap: '4rem',
  }
  const handleCalendarClick=()=>{
    svg
    .getPressReleases()
    .then(re=>console.log(re.data))
  }
  return(
  <>
    <h1>hello</h1>
    <div style={mainStyle}>
      <MainMenuCard text='Paper Trading' />
      {children}
      <MainMenuCard text='calendars' handleClick={handleCalendarClick}/>
    </div>
  </>
  )
}
const App=()=>{
  const [query, setQuery]=useState(null);
  const [searchResults, setSearchResults]=useState([]);
  // useEffect(()=>{
  //   svg
  //   .getPressReleases()
  //   .then(re=>console.log(re.data))
  // }, [])
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
          <Route path='/company' element ={<CompanyPage query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>} />
          <Route path='/drug' element={<DrugPage />} />
        </Routes>
    </Router>
  )
}

export default App
