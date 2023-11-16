import { useState, useEffect } from 'react'
import searchService from '../express-server/services/searching'
import service from '../express-server/services/axiosRequests'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from './assets/53.svg'
import {BioactivityTable, PubmedTrials, PastInvestigators, Indications, FDAStatus, Svg, SearchIcon} from './components/drug-component.jsx'
import { SignUpForm, Overlay, LoginForm, ProfileSvg, SubscribeForm, UnSubscribeForm } from './components/sign-up'
import { PaperTradePage } from './components/trading'
import {Options} from './functions/filterOptions'
import { CardDecoration, Symbol, Check, Arrow, Nav, Sidebar} from './components/decorations'
import tmp from './assets/aedrian-OKNJX7B-cbc-unsplash.jpg'
import tmp2 from './assets/behnam-norouzi-uqlWT5rmMxM-unsplash.jpg'

import './App.css'

const MainMenuCard=({text, handleClick})=>{
  return(
    <div className='menuCard' onClick={handleClick}>
      <div className='tag'>
        <div className='tmp'>
          {text==='Paper Trading' ? 'Refine your strategy' : 'Find upcoming events'}
        </div>
      </div>
      <CardDecoration text={text}/>
      <div className='division'></div>
      {text==='Paper Trading' ? 
      (<img src={tmp}/>)
      : 
      (<img src={tmp2}/>)
    }
      <div type='outer'><div>{text}</div></div>
    </div>
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
    borderRadius:'0px 0px 4px 4px',
    display: !query ? 'none': 'block',
    fontSize: '1rem',
    textAlign:'left',
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease',
    top:'100%',
    width:'100%'
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
    service.getDrugData(compoundName)
    .then(response=>{
      setLoading(false);
      let data=response.data
      navigate(`/drug`, {state :{data}})
      setQuery('')
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
          <div><Button text='submit'/></div>
          <input onChange={search} type='search' placeholder={placeholder} autoFocus value={query}/>
        </div>
        <div style={resultWrapper}>
          <div className='searchSeparator'></div>
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
    service.getCompanyCatalysts(ticker)
    .then(re=>{
      setCatalysts(re.data)
    })
  })
  }, [profile.companyName])
  const imgStyle={
    width: '10%',
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
  const color = profile.changes>0 ? 'rgb(68, 230, 68)' : 'red';
  let financial;
  const title='Upcoming Clinical Trials';
  data[1].facts['us-gaap']
  ? financial=data[1].facts['us-gaap'] 
  : financial=data[1].facts['ifrs-full']
  return (
  <div className='all'>
  <Search query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>
  <div className='companyTitle'>
    <img src={profile.image} style={imgStyle}></img>
    {profile.companyName} ({profile.exchangeShortName} - {profile.country}) 
  </div>
  <div>
    <div className='flexHorizontal' style={{paddingBottom:'1rem'}}>
      <div>
        <div className='flexHorizontal price'>
          <div>
            ${profile.price}
          </div>
          <div style={{color: `${color}`}}>
            <div style={{marginBottom:'-0.5rem'}}>{profile.changes>0 ? `+${profile.changes}` : `${profile.changes}`}</div>
            <div style={{fontSize:'0.78rem'}}>({(parseInt(10000*profile.changes/profile.price))/100}%)</div>
          </div>
        </div>
      </div>
      <div>
        <div>
          CEO: {profile.ceo}
        </div>
        <div>
          employees: {profile.fullTimeEmployees}
        </div>
        <div>
          <a href={profile.website}>{profile.website}</a>
        </div>
      </div>
    </div>
    <div>
      <div className='ratioContainer'>
          <div>mkt cap: {roundVal(profile.mktCap)}</div>
          <div>Avg Volume(3mo): {roundVal(profile.volAvg)} </div>
          <div>{shares ? (`Shares Outstanding: ${roundVal(shares)}`) : ''}</div>
          <div>current ratio: {roundVal(ratios.currentRatioTTM)}</div>
          <div>cash/share: {roundVal(ratios.cashPerShareTTM)}</div>
          <div>debt/equity: {roundVal(ratios.debtEquityRatioTTM)}</div>
          <div>FCF/share: {roundVal(ratios.freeCashFlowPerShareTTM)}</div>
          <div>gross profit margin: {roundVal(ratios.grossProfitMarginTTM)}</div>
          <div>P/B: {roundVal(ratios.priceBookValueRatioTTM)}</div>
          <div>P/E: {roundVal(ratios.priceEarningsRatioTTM)}</div>
      </div>
    </div>
  </div>
  {catalysts && <CalendarTable calendarEvents={catalysts} />}
  <CTGovTable trialData={trialData} trialTableBody={trialTableBody} title={title}/>
  </div>
  )

}
const CTGovTable=({trialData, trialTableBody, title})=>{
  if (trialData && trialData.length>0){
  return (
    <div>
      <div>{title}</div>
      <div className='scrollTable'>
      <table>
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
      if (date.completionDateStruct){return(
        <tr key={NCTID}>
          <td>{date.completionDateStruct.date}</td>
          <td>{(base.designModule.phases && base.designModule.phases.length>1) ? (base.designModule.phases[0]+', '+base.designModule.phases[1]) : base.designModule.phases ? base.designModule.phases : 'N/A'}</td>
          <td><a href={`https://clinicaltrials.gov/study/${NCTID}`}>
          {NCTID}
          </a>
          </td>
          <td>{base.designModule.enrollmentInfo.count || 'N/a'}</td>
          <td><div className='customTd'>{interventions&& interventions.length>0 ? interventions.map(intervention=>intervention.name+', ') : interventions}</div></td>
          <td><ToggleTd toggleText={read} showText={showDesc} text={desc}/></td>
          <td>{date.startDateStruct && date.startDateStruct.date}</td>
        </tr>
      )
      }
  }
}
const ToggleTd=({text, toggleText, showText, })=>{

  return (
    <div onClick={toggleText} className='customTd'>
      {showText ? text : 'click to read'}
    </div>
  )
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
  const properties=data[1] ? data[1].PropertyTable.Properties[0] : null;
  let bioactivityColumns=null, bioactivityRows=null, remove=null, activeRows=null;
  if (data[6]){
    bioactivityColumns=data[6].Table.Columns.Column;
    bioactivityRows=data[6].Table.Row
    remove=[1,2,3,4,bioactivityColumns.length-1]
    activeRows=bioactivityRows.filter(row=>{
    return row.Cell[4]==='Active'
  })
  }
  const trialData=data[3] ? data[3].studies : null;
  const imgSrc = `data:image/png;base64,${png}`
  const flexVertical={
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  }
  const flexHorizontal={
    display: 'flex',
    gap: '1rem',
    justifyContent: 'space-evenly',
  }
  const miniFlex={
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: '1rem'
  }
  const title=`Clinical Trials with ${name} (CT.gov)`
  const trialTableBody=trialData && (trialData.map(trial=>{
    return <TrialTableRow trial={trial} key={trial.protocolSection.identificationModule.nctId}/>
 }))
  return (
  <div className='all' style={{maxWidth:'95vw', gap:'2rem'}}>
  <Search query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults}/>
  {mechanismOfAction ? 
  <div>
  <h1 style={{textShadow:'2px 0 0 blue'}}>{name}</h1>
  <div className='mainDrugCard'>
    <div style={flexVertical}>
      <img src={imgSrc} className='drugImg'/>
    </div>
    <div style={flexVertical}>
      <div>
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
  </div>
  : 
  <div>
    <div style={flexHorizontal}>
      <div style={flexVertical}>
        <img src={imgSrc} className='drugImg alternate'/>
      </div>
      <div style={flexVertical}>
        <h2>{name}</h2>
        <div>
          <PastInvestigators trialData={trialData}/>
        </div>
      </div>
    </div>
    {properties && <div style={miniFlex}>
      <div>Formula: {properties.MolecularFormula}</div>
      <div>Mr: {properties.MolecularWeight} amu</div>
      <div>SMILES: {properties.CanonicalSMILES}</div>
    </div>}
  </div>
}
  <FDAStatus fdaStatus={fdaStatus} />
  <Indications trialData={trialData} />
  <CTGovTable trialData={trialData} trialTableBody={trialTableBody} title={title}/>
  <PubmedTrials pubmedArray={data[8]}/>
    {data[6] && <BioactivityTable bioactivityColumns={bioactivityColumns} activeRows={activeRows} remove={remove}/>}
  </div>
  )
}

const CalendarPage=()=>{
  const [calendarEvents, setCalendarEvents]=useState(null);
  const [filterForm, showFilterForm]=useState(false);
  const [filter, clearFilter] = useState(0);
  const navigate=useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []); 
  const displayFilters=()=>{
    showFilterForm(true);
  }
  const getEvents=async()=>{
    const events = await service.fetchEvents();
    setCalendarEvents(events.data)
  }
  useEffect(()=>{
    getEvents()
  }, [filter])
  return (
    <div className='all' style={{gap:'1rem'}}>
      <div className='calendarTitle' >Catalyst Calendar</div>
      <div className='calendarDesc'>Our calendar is a tool designed to capture binary, price-moving events on a daily basis. Filter by catalyst type, company, or even <span className='clickMe' onClick={()=>navigate('/subscription')}>subscribe</span> to companies you're tracking to receive notifications when we've received an update.</div>
      <div style={{display:'flex', gap:'1rem'}}>
        <button onClick={()=>navigate('/subscription')}>company notifications</button>
        <div className='flexHorizontal'>
          <button onClick={displayFilters}>Filter Content</button>
          <button onClick={()=>{clearFilter(filter+1)}}>clear filters</button>
        </div>
      </div>
      {filterForm && (
        <Overlay content={<FilterForm showFilterForm={showFilterForm} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} clearFilter={clearFilter} filter={filter}/>}/>
      )}
      <CalendarTable calendarEvents={calendarEvents}/>
    </div>
  )
}
const FilterForm=({showFilterForm, calendarEvents, setCalendarEvents, clearFilter, filter})=>{
  return(
    <div className='form'>
      <div>Select Filter Criteria</div>
      <Options events={calendarEvents} setEvents={setCalendarEvents}/>
      <button onClick={()=>{clearFilter(filter+1)}}>clear filters</button>
      <button onClick={()=>showFilterForm(false)}>Close</button>
    </div>
  )
}
const CalendarTable=({calendarEvents})=>{
  if (calendarEvents && calendarEvents.length>0){
    return(
    <div className='scrollTable' id='calendar'>
      <table>
          <thead>
              <tr className='secondSticky'>
                  <th>ticker</th>
                  <th>catalyst type</th>
                  <th>date</th>
                  <th>info</th>
                  <th>status</th>
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
          <td>{event.date}</td>
          <td><div className='customTd'>{event.sentence}</div></td>
          <td>{event.stage || 'unknown'}</td>
          <td><a href={event.url}>source</a></td>
      </tr>
  )
}
const ScreenPage=()=>{
  const [indication, setIndication] = useState('')
  const [moa, setMoa] = useState('')
  const [err, setErr] = useState(false)
  const [results, setResults] = useState([])
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [trials, setTrials] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); 
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try{
    if (indication===''){
      setErr(true)
      return
    } else{
      setErr(false)
      const re = await service.screen(indication, moa)
      const arr=[];
      const tmpSet=new Set()
      re.data.results.forEach(re=>{
        if (!re.openfda.brand_name){
          return
        }
        if(!tmpSet.has(re.openfda.brand_name[0].toUpperCase()) && !Array.from(tmpSet).some(existing => existing.includes(re.openfda.brand_name[0].toUpperCase()))){
          arr.push(re)
          tmpSet.add(re.openfda.brand_name[0].toUpperCase())
        }
      })
      setResults(arr)
      setFinished(true)
    }
  } catch{
    setResults([])
    setFinished(true)
  }
  }
  const headers = ['name', 'moa'];
  return(
    <div className='screen'>
      <div style={{maxWidth: '90vw'}}>
        <h3>Welcome to the drug screener.</h3> 
        <p>To get started, enter a disease name - and optionally a mechanism of action.</p> 
        <div>Ex: "Alzheimer's" and "antibody" or</div> 
        "Diabetes" and "alpha-glucosidase inhibitor"
      </div>
      <form style={{marginTop:'2rem'}}>
        <input type='drug' placeholder='Enter an indication...' onChange={(e)=>setIndication(e.target.value)}value={indication} autoFocus={true}/>
        <input type='drug' placeholder='Enter a MOA...' onChange={(e)=>setMoa(e.target.value)} value={moa}/>
        <button type='submit' onClick={handleSubmit}>submit</button>
      </form>
      {(finished && !trials) &&(
        <Message msg='insufficient info for this drug' type='warning'/>
      )}
      {err && <div className='warning'>please enter an indication</div> }
      {(finished && results.length>0) ? (
         <div className='scrollTable'>
         <table>
           <thead>
             <tr>{headers.map(h=><th key={h}>{h}</th>)}</tr>
           </thead>
           <tbody>
             {results.map(drug=>(
              <ScreenTableRow key={drug.id} drug={drug} setLoading={setLoading} trials={trials} setTrials={setTrials}/>
             ))}
           </tbody>
         </table>
       </div>
      ) : (finished) && (
        <div>sorry, could not find results for this MOA.</div>
      )}
    </div>
  )
}
const ScreenTableRow=({drug, setLoading, trials, setTrials})=>{
  const navigate = useNavigate();
  const navToDrug=(compoundName1, compoundName2)=>{
    setLoading(true);
    service.getDrugData(compoundName1)
    .then(response=>{
      setLoading(false);
      if (response.data===''){
        setTrials(false);
        return
      }
      let data=response.data
      navigate(`/drug`, {state :{data}})
    })
    .catch(()=>{
      service.getDrugData(compoundName2)
      .then(response=>{
        setLoading(false);
        if (response.data===''){
          setTrials(false);
          return
        }
        let data=response.data
        navigate(`/drug`, {state :{data}})
      })})
    .catch(()=>{
      setTrials(false);
    })
  }

  return(
    <tr>
      <td className='table-name'><div onClick={()=>navToDrug(drug.openfda.brand_name, drug.openfda.generic_name)}>{drug.openfda.brand_name}/{drug.openfda.generic_name}</div></td>
      <td className='poop'><div style={{maxHeight:'10rem', overflow:'scroll', width:'20rem'}}>{drug.mechanism_of_action || drug.clinical_pharmacology || drug.description|| 'N/A'}</div></td>
    </tr>
  )
}
// Pop-up msg that fades
export const Message=({msg, type})=>{
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false); 
    }, 2000)

    return () => {
      clearTimeout(timer);
    }
  }, []);

  return visible ? (
    <div className={`fade ${type}`}>{msg}</div>
  ) : null;
}
const SignUpPage=()=>{
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []); 
  return (
    <div>
      <SignUpForm/>
    </div>
  )
}
const SubscriptionPage=()=>{
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []); 
  return(
    <div className='all'>
      <SubscribeForm/>
      <UnSubscribeForm/>
    </div>
  )
}
const TermsOfUse=()=>{
  return(
    <div className='all'>
      <h2>Terms of Use</h2>
      <p >This website makes use of various APIs, which themselves cannot guarantee the accuracy of their data. We can not guarantee the accuracy of the data presented herein either, though we do make our best effort to check for quality. Make all financial decisions at your own risk. This site solely aims to provide information.</p>
      <div>sources</div>
      <ul className='wrapper'>
        <li>SEC.gov API</li>
        <li>Financialmodelingprep</li>
        <li>globenewswire</li>
        <li>CT.gov API</li>
        <li>Pubchem API</li>
        <li>Pubmed</li>
        <li>OpenFDA API</li>
      </ul>
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
  const handleCalendarClick=()=>{
    navigate('/calendar')
  }
  const handleTradeClick=()=>{
    navigate('/trade')
  }
  const search=true;
  return(
  <>   
  <div>
  <div className="separator home top" style={{background:'rgb(64, 52, 37)'}}></div>
    <div className='titleContainer'>
      <div className='HomeTitle'>PharmExplorer</div>
      <div>let's explore some drugs™</div>
    </div>
    <div className='homeLayout'>
      <MainMenuCard text='Catalyst Calendar' handleClick={handleCalendarClick}/>
      <div className='menuCard' id='search'>
        <div className='potential'>
          <Symbol/>
        </div>
        <CardDecoration />
        <div className="division"></div>
        <div type='outer'>
        {children}
        </div>
      </div>
      <MainMenuCard text='Paper Trading' handleClick={handleTradeClick}/>
    </div>
    <div className='sectionDivider'>
      <h3 className='sectionTitle'><div>Additional Features</div></h3>
      <div className="separator home"></div>
    </div>
    <div className='tertiaryCard'>
      <div className='secondaryCard' onClick={()=>navigate('/screen')}>
        <div className='flexCenter'>
          Screen FDA-Approved Drugs
        </div>
        <div className='clickMe2'>try it out now<div className='arrow'><Arrow/></div></div>
      </div>
      <div className='secondaryCard' id='myid' onClick={()=>{navigate('/subscription')}}>
        <div>Receive notifications for company-specific catalysts</div>
        <div className='clickMe2'>subscribe<div className='arrow'><Arrow/></div></div>
      </div>
    </div>
    <div className='sectionDivider'>
      <div className="separator home"></div>
      <h3 className='sectionTitle'><div>Tool Summary</div></h3>
    </div>
    <div style={{maxWidth:'90vw'}}>
      <ul className='featureContainer'>
        <li>Catalyst Calendar</li>
        <li>Paper Trading</li>
        <li>Drug Screener</li>
        <li>Drug Research</li>
        <li>Company Research</li>
      </ul>
      <h3>About PharmExplorer</h3>
      <div>This website is meant to be a starting point to aid both researchers and investors alike in the fundamental analysis of clinical trials. By providing our own tools and by pointing to relevant resources, we hope users will leave more confident in their analyses.</div>
    </div>
  </div>
  </>
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
  return(
    <div className='header'>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
        <div className='diagonal-rectangle'></div>
      <div className='flexLeft' onClick={handleHomeClick}>
        <img src={logo} className='logo'/>
        <b>PharmExplorer</b>
      </div>
      <div onClick={handleTradeClick} className='headerOption'>trade</div>
      <div onClick={handleCalendarClick} className='headerOption'>calendar</div>
      <div onClick={()=>{navigate('/screen')}} className='headerOption'>screener</div>
      <div onClick={()=>navigate('/signUp')} className='flexCenter'><ProfileSvg/></div>
    </div>
  )
}
const Layout=({children})=>{
  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []); 
  return(
    <div className='layout'>
      <div className='bgColor'>
      </div>
      <Header />
      <Nav />
        <div className='all'>
          {children}
        </div>
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
          <Route path='/screen' element={<ScreenPage />}/>
          <Route path='/signUp' element={<SignUpPage/>}/>
          <Route path='/logIn' element={<LogInPage/>}/>
          <Route path='/subscription' element={<SubscriptionPage/>}/>
          <Route path='/tos' element={<TermsOfUse/>}/>
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
