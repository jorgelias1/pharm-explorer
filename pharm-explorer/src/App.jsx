import { useState, useEffect } from 'react'
import searchService from '../express-server/services/searching'
import service from '../express-server/services/axiosRequests'
import scrape from '../cron/regex-engine'
import { BrowserRouter as Router, Routes, Route, useAsyncError } from 'react-router-dom'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import drugModule from '../express-server/services/drug.js'
import axios from 'axios'
import logo from './assets/53.svg'
import {BioactivityTable, PubmedTrials, PastInvestigators, Indications, FDAStatus, Svg, SearchIcon} from './components/drug-component.jsx'
import { SignUpForm, Overlay, LoginForm } from './components/sign-up'
import { PaperTradePage } from './components/trading'

import './App.css'

const MainMenuCard=({text, handleClick})=>{
  return(
    <div><button onClick={handleClick}>{text}</button></div>
  )
}
const Button=({text})=>{
  if (text!=='submit'){
  return(
    <button type={text}>{text}</button>
  )
  } else {
    return(
      <button type='search'><SearchIcon/></button>
    )
  }
}
// logic for company/drug search
export const Search=({setQuery, query, setSearchResults, searchResults, trade, setamt})=>{
  const navigate=useNavigate();
  const [loading, setLoading]=useState(false);
  let placeholder = trade 
  ? 'Search for a Ticker or Name'
  : 'Search for a drug or company'
  // get icon URL
  const resultWrapper={
    backgroundColor:'white',
    color:'black',
    borderRadius:'4px',
    padding:'1px',
    display: !query ? 'none': 'block',
    fontSize: '1rem',
    textAlign:'left',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    maxWidth:'100%',
  }
  if (loading){
    resultWrapper.borderColor='yellow';
    resultWrapper.boxShadow='0 0 20px black';
  }
  const search=(event)=>{
    setQuery(event.target.value)
  }
  // when user input changes, reflect in searchResults
  useEffect(() => {
    if (!trade){
      searchService
        .showResults(query, setSearchResults)
    } else {
      searchService
        .tradeResults(query, setSearchResults)
    }
  }, [query]);
  
  const handleCompanyClick=(item)=>{
    setLoading(true);
    if(!trade){
      service.getSEC(item)
      .then(response=>{
        let data=response.data
        navigate(`/company/`, {state :{data}})
        setLoading(false)
      })
    } else{
      service.getQuote(item)
        .then(re=>{
          const data=re.data
          setamt([data[0].price, item.ticker])
          setLoading(false)
        })
    }
    setQuery('')
  }
  const handleDrugClick=(item)=>{
    const compoundName=item.name
    setLoading(true);
    drugModule.getDrugData(compoundName)
    .then(response=>{
      setLoading(false);
      let data=response.data
      navigate(`/drug`, {state :{data}})
      setQuery(null)
    })
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
        (${item.ticker}) | {item.name} </div>)
      :(<div key={item.name} onClick={()=>handleDrugClick(item)}
        onMouseEnter={handleHover}
        onMouseLeave={handleLeave}
        style={optionStyle}>
        <Svg/>
        {' '}{item.name}
        </div>)
      )
    }
  )
  }
  return (
    <div className='container'>
      <div className='searchContainer'>
        <input onChange={search} type='search' placeholder={placeholder} autoFocus value={query}/>
        <Button text='submit'/>
      </div>
      <div style={resultWrapper}>
        <div style={{maxWidth: '18rem', marginLeft: '0.1rem', padding: '0.05rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4rem'}}></div>
          {all}
      </div>
      {loading && <Loading/>}
    </div>
  )
}

const CompanyPage=({query, setQuery, searchResults, setSearchResults})=>{
  const navigate=useNavigate();
  const location = useLocation();
  const [trialData, setTrialData]=useState(null);
  const [catalysts, setCatalysts]=useState(null);

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
  const ticker=profile.symbol
  useEffect(()=>{
    service.getTrials(profile.companyName)
    .then(response=>{
    setTrialData(response.data[0])
    axios.get(`http://127.0.0.1:3001/api/catalysts/${ticker}`)
    .then(re=>{
      setCatalysts(re.data)
    })
  })
  }, [profile.companyName])
  const imgStyle={
    width: '10%',
  }
  const scrollTable={
    maxHeight:'20rem',
    overflow: 'auto',
    position: 'relative',
  }
  const trialTableBody=trialData && (trialData.map(trial=>{
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
  const title='Upcoming Clinical Trials';
  data[1].facts['us-gaap']
  ? financial=data[1].facts['us-gaap'] 
  : financial=data[1].facts['ifrs-full']
  return (
  <div className='all'>
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
  {catalysts && <CalendarTable calendarEvents={catalysts} />}
  <CTGovTable trialData={trialData} trialTableBody={trialTableBody} scrollTable={scrollTable} title={title}/>
  </div>
  )

}
const CTGovTable=({trialData, trialTableBody, scrollTable, title})=>{
  if (trialData && trialData.length>0){
  return (
    <div style={scrollTable}>
    <table>
      <caption>{title}</caption>
      <thead className='sticky'>
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
      {trialTableBody}
      </tbody>
    </table>
    </div>
  )
  }
}
const TrialTableRow=({trial})=>{
    const base=trial.protocolSection
    const date=base.statusModule
    const NCTID=base.identificationModule.nctId
    if (base.armsInterventionsModule){
      const interventions=base.armsInterventionsModule.interventions
      const desc=base.descriptionModule.briefSummary
      const [showDesc, setShowDesc]=useState(false);
      const read=()=>{setShowDesc(!showDesc)}
      const rowStyle={
        maxHeight:'8rem',
        overflow: 'auto',
      }
      if (date.completionDateStruct){return(
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
  }
}
const DrugPage=({query, setQuery, searchResults, setSearchResults})=>{
  const navigate = useNavigate();
  const location = useLocation();
  const scrollTable={
    maxHeight:'20rem',
    overflow: 'auto',
    margin: '1rem',
    position: 'relative',
    backgroundColor: 'rgb(36,36,36)'
  }
  useEffect(()=>{
    if (!location.state){
      navigate('/')
    }
  }, [location.state, navigate])
  if (!location.state){
    return null;
  }
  const {data}=location.state
  const name=data[0]
  const png=data[4]
  const fdaStatus=data[5]

  const mechanismOfAction=data[7]
  const properties=data[1].PropertyTable.Properties[0]
  let bioactivityColumns=null, bioactivityRows=null, remove=null, activeRows=null;
  if (data[6]){
    bioactivityColumns=data[6].Table.Columns.Column;
    bioactivityRows=data[6].Table.Row
    remove=[1,2,3]
    activeRows=bioactivityRows.filter(row=>{
    return row.Cell[4]==='Active'
  })
  }
  const trialData=data[3].studies
  const imgSrc = `data:image/png;base64,${png}`
  const flexVertical={
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
  const flexHorizontal={
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-evenly'
  }
  const miniFlex={
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: '1rem'
  }
  const title=`Clinical Trials with ${name} (US)`
  const trialTableBody=trialData && (trialData.map(trial=>{
    return <TrialTableRow trial={trial} key={trial.protocolSection.identificationModule.nctId}/>
 }))
  return (
  <div className='all'>
  <Search query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>
  {mechanismOfAction ? 
  <>
  <div style={flexHorizontal}>
    <div style={flexVertical}>
      <img src={imgSrc} style={{minWidth: '15rem', maxHeight: '25rem', maxWidth: '25rem',boxShadow: '0 0 10px white', margin: '0.5rem', padding: '0.5rem', backgroundColor: 'rgb(245,245,245)', borderRadius: '5px'}}/>
    </div>
    <div style={flexVertical}>
      <div>
      <h2>{name}</h2>
      <a href={mechanismOfAction.url}>
      Mechanism of Action: 
      </a>
      {mechanismOfAction.text}
      </div>
      <div style={{marginTop: '1rem'}}>
        <PastInvestigators trialData={trialData}/>
      </div>
    </div>
  </div>
  <div style={miniFlex}>
    <div>Formula: {properties.MolecularFormula}</div>
    <div>Mr: {properties.MolecularWeight} amu</div>
    <div>SMILES: {properties.CanonicalSMILES}</div>
  </div>
  </>
  : 
  <div>
    <div style={flexHorizontal}>
      <div style={flexVertical}>
        <img src={imgSrc} style={{minWidth: '15rem', maxHeight: '20rem',boxShadow: '0 0 10px white', margin: '0.5rem', padding: '0.5rem', backgroundColor: 'rgb(245,245,245)', borderRadius: '5px'}}/>
      </div>
      <div style={flexVertical}>
        <h2>{name}</h2>
        <div>
          <PastInvestigators trialData={trialData}/>
        </div>
      </div>
    </div>
    <div style={miniFlex}>
      <div>Formula: {properties.MolecularFormula}</div>
      <div>Mr: {properties.MolecularWeight} amu</div>
      <div>SMILES: {properties.CanonicalSMILES}</div>
    </div>
  </div>
}
  <FDAStatus fdaStatus={fdaStatus} />
  <Indications trialData={trialData} />
  <CTGovTable trialData={trialData} trialTableBody={trialTableBody} scrollTable={scrollTable} title={title}/>
  <PubmedTrials pubmedArray={data[8]} scrollTable={scrollTable}/>
  <div style={scrollTable}>
    {data[6] && <BioactivityTable bioactivityColumns={bioactivityColumns} activeRows={activeRows} remove={remove}/>}
  </div>
  </div>
  )
}

const CalendarPage=()=>{
  const [calendarEvents, setCalendarEvents]=useState(null);
  const [filterForm, showFilterForm]=useState(false);
  const displayFilters=()=>{
    showFilterForm(true);
  }
  const getEvents=async()=>{
    const events = await axios.get('http://127.0.0.1:3001/api/events')
    setCalendarEvents(events.data)
  }
  getEvents();
  return (
    <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding:'none', }}>

      <div onClick={()=>{scrape.getPressReleases()}}>hello, calendar</div>
      <button onClick={displayFilters}>Filter Content</button>
      {filterForm && (
        <Overlay content={FilterForm(showFilterForm)}/>
      )}
      <CalendarTable calendarEvents={calendarEvents}/>
    </div>
  )
}
const FilterForm=(showFilterForm)=>{
  return(
    <div className='form'>
      <div>Select Filter Criteria</div>
      <div>
        <div>Phase 1</div>
        <div>Phase 2</div>
        <div>Phase 3</div>

      </div>
      <button onClick={()=>showFilterForm(false)}>Close</button>
    </div>
  )
}
const CalendarTable=({calendarEvents})=>{
  if (calendarEvents && calendarEvents.length>0){
    return(
    <div className='scrollTable'>
      <table>
          <thead>
              <tr className='secondSticky'>
                  <th>ticker</th>
                  <th>catalyst type</th>
                  <th>status</th>
                  <th>info</th>
                  <th>date</th>
                  <th>src</th>
              </tr>
          </thead>
          <tbody>
            {(calendarEvents.map(event=>{
              return <CalendarRow key={event.id} event={event}/>
            })
          )}
          </tbody>
      </table>
      </div>
    )
  }
}
const CalendarRow=({event})=>{
  event.catalyst=(event.type==='topline') 
  ? 'topline data expected'
  : 'PDUFA date'
  return(
      <tr>
          <td>{event.ticker || 
          <a href={event.url}>see source</a>}
          </td>
          <td>{event.catalyst}</td>
          <td>{event.stage || 'unknown'}</td>
          <td>{event.sentence}</td>
          <td>{event.date}</td>
          <td><a href={event.url}>source</a></td>
      </tr>
  )
}
// Pop-up msg that fades
const Message=({msg})=>{
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false); 
    }, 1000)

    return () => {
      clearTimeout(timer);
    }
  }, []);

  return visible ? (
    <div className='fade'>{msg}</div>
  ) : null;
}
const SignUpPage=()=>{
  return (
    <div>
      <SignUpForm/>
    </div>
  )
}
const LogInPage=()=>{
  return(
    <LoginForm/>
  )
}
const HomeLayout=({children})=>{
  const navigate=useNavigate();
  const mainStyle={
    display:'flex',
    gap: '4rem',
    justifyContent: 'center'
  }
  const handleCalendarClick=()=>{
    navigate('/calendar')
  }
  const handleTradeClick=()=>{
    navigate('/trade')
  }
  return(
  <div className='all'>
    <h1>hello</h1>
    <div style={mainStyle}>
      <MainMenuCard text='Paper Trading' handleClick={handleTradeClick}/>
      {children}
      <MainMenuCard text='calendars' handleClick={handleCalendarClick}/>
    </div>
  </div>
  )
}
const Header=()=>{
  const navigate=useNavigate()
  const handleHomeClick=()=>{
    navigate('/')
  }
  const handleTradeClick=()=>{
    navigate('/trade')
  }
  const handleCalendarClick=()=>{
    navigate('/calendar')
  }
  const handleHover=(e)=>{
    e.target.style.cursor='pointer'
  }
  return(
    <div className='header' onMouseEnter={handleHover}>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
      <div className='flexLeft' onClick={handleHomeClick}>
        <img src={logo} style={{maxWidth: '3rem', backgroundColor: 'white', transform:'scaleX(-1)'}}/>
        <b>Pharm Explorer</b>
      </div>
      <div onClick={handleHomeClick} className='headerOption'>home</div>
      <div onClick={handleTradeClick} className='headerOption'>trade</div>
      <div onClick={handleCalendarClick} className='headerOption'>calendar</div>
      <div onClick={()=>navigate('/signUp')} className='headerOption'>sign up</div>
      <div onClick={()=>navigate('/logIn')} className='headerOption'>log in</div>
    </div>
  )
}
const Layout=({children})=>{
  const universalStyle={
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '1rem'
  }
  return(
    <>
      <Header />
      <Nav />
      <div style={universalStyle}>
        {children}
      </div>
    </>
  )
}
const Nav = ()=>{
  return(
    <div style={{display: 'flex', justifyContent: 'flex-end', margin: '1rem'}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill='white' transform='scale(-1, 1)'>
          <rect x="7" y="5" width="18" height="2"/>
          <rect x="7" y="11" width="12.5" height="2"/>
          <rect x="7" y="17" width="10" height="2"/>
      </svg>
    </div>
  )
}
const Loading=()=>{
  return(
    <div className='loading'>loading...</div>
  )
}
const App=()=>{
  const [query, setQuery]=useState('');
  const [searchResults, setSearchResults]=useState([]);

  return (
    <Router>
      <Layout>
        <Routes>
        <Route path='/'
            element={
              <HomeLayout>
            <Search 
              setQuery={setQuery} 
              query={query} 
              setSearchResults={setSearchResults} 
              searchResults={searchResults} />
              </HomeLayout>}
             />
          <Route path='/trade' element={<PaperTradePage query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>} />
          <Route path='/company' element ={<CompanyPage query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>} />
          <Route path='/drug' element={<DrugPage query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>} />
          <Route path='/calendar' element={<CalendarPage />} />
          <Route path='/signUp' element={<SignUpPage/>}/>
          <Route path='/logIn' element={<LogInPage/>}/>
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
