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
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);
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
const Search=({setQuery, query, setSearchResults, searchResults, trade, setamt})=>{
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
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
  }
  if (loading){
    resultWrapper.borderColor='yellow';
    resultWrapper.boxShadow='0 0 20px black';
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
    setQuery(null)
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
        (${item.ticker}) {item.name} </div>)
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
    <div style={flexV}>
      <div>
      <input onChange={search} type='search' placeholder={placeholder} autoFocus/>
      <Button text='submit'/>
      </div>
      <div style={resultWrapper}>
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
  {catalysts && <CalendarTable calendarEvents={catalysts} />}
  <CTGovTable trialData={trialData} trialTableBody={trialTableBody} scrollTable={scrollTable} title={title}/>
  </>
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
const DrugPage=()=>{
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
  <>
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
  </>
  )
}

const PaperTradePage=({setQuery, query, setSearchResults, searchResults})=>{
  const [tradeForm, setTradeForm] = useState(false)
  const [currentCash, setCurrentCash] = useState(0);
  const [history, updateHistory] = useState([]);
  const [positions, updatePositions] = useState([]);
  const [signedIn, setSignedIn] = useState(false)
  const trade=true;
  const roundVal=(val)=>{
    return Number(parseFloat(val).toFixed(2))
  }
  const getPositions=async()=>{
    if (!signedIn){
      return positions
    } else{
      
      updatePositions(service.getPositions())
    }
    // else make axios call to db and get positions+history.
    // set the positions' ??price/value column and price?? to the current price (finprep->price+'changes' endpoints)
  }
  const calculateCash=()=>{
    if (!signedIn && history.length===0){
      if (history.length===0){
        return 10000
      } 
    } else {
      // axios call to database and see current cash
      return currentCash
    }
  }
  console.log(history, positions)
  useEffect(() => {
    setCurrentCash(calculateCash());
    getPositions()
  }, [signedIn])

  const handleTradeClick=()=>{
    setTradeForm(true);
    setQuery(null)
  }
  return(
    <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding:'none', }}>
      <h2>Paper Trading</h2>
      {!signedIn && (
      <div className='warning' style={{width: '100%'}}>Warning: You are not signed in; your history, including any trades you make, will not be saved. 
      <div>To save your history, <button>sign in</button> or <button>create an account.</button></div></div>
      )}
      <PortfolioTable signedIn={signedIn} positions={positions} cashTotal={currentCash}/>
      <button onClick={handleTradeClick} style={{maxWidth: '8rem'}}>Trade</button>
      {tradeForm && (
        <Overlay content={<TradeForm setTradeForm={setTradeForm} trade={trade} query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults} updateCash={setCurrentCash} cash={currentCash} history={history} updateHistory={updateHistory} positions={positions} updatePositions={updatePositions} roundVal={roundVal}/>}/>
      )}
    </div>
  )
}
const Overlay=({content})=>{
  return(
    <div className='background'>
      <div className='overlay'>
        {content}
      </div>
    </div>
  )
}
const TradeForm=({setTradeForm, trade, query, setQuery, searchResults, setSearchResults, updateCash, cash, history, updateHistory, positions, updatePositions, roundVal})=>{
  const [transactionAmount, setTransactionAmount] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState('buy')
  const [quantity, setQuantity] = useState(1)
  const [error1, setError1]=useState(false)
  const [error2, setError2]=useState(false)
  const [error3, setError3]=useState(false);
  const [success, setSuccess]=useState(false)
  const errors=['insufficient funds','insufficient shares', 'invalid input']
  let quote;
  let ticker;
  transactionAmount ? quote=roundVal(((transactionAmount[0]*quantity))/quantity) : null
  transactionAmount ? ticker=transactionAmount[1] : null
  const executeTrade=()=>{
    let bool;
    if (!ticker || !(quantity>0)){
      setError3(true)
      bool=false
      return
    }
    const Trade = function(){
      this.type=selectedTransaction
      this.ticker=ticker
      this.quantity=quantity
      this.price=quote
      this.transactionAmount=(quote*quantity).toFixed(2)
      this.initialAvgPrice=quote
    }
    const trade = new Trade();
    console.log(history)
    // define a boolean to see if the trade is valid. 
    bool=selectedTransaction==='buy'
    ? buy(trade)
    : selectedTransaction==='sell'
    ? sell(trade)
    : selectedTransaction==='sell short'
    ? short(trade)
    : buyToCover(trade)
    if (bool){
      setSuccess(true)
      setError1(false)
      setError2(false)
      setError3(false)
      setQuery(null)
      updateHistory(history.concat({type: trade.type, ticker: trade.ticker, quantity: trade.quantity, price: trade.price}));
    } else{
      setSuccess(false)
    }
  }
  const buy=(trade)=>{
    // check for sufficient cash
    if (roundVal((quote*quantity)) > cash){
      setError1(true)
      return false;
    } 
    updateCash(subtract(cash, quote*quantity))
    updatePositions(consolidatePosition(trade, add))
    return true;
  }
  const sell=(trade)=>{
    // check for sufficient shares
    if (!enoughShares(trade)){
      setError2(true)
      return false;
    } 
    updateCash(add(cash, quote*quantity))
    updatePositions(consolidatePosition(trade, subtract))
    return true;
  }
  const short=(trade)=>{
    // unlimited leverage. no limits.
    updateCash(add(cash, quote*quantity))
    updatePositions(consolidatePosition(trade, add))
    return true;
  }
  const buyToCover=(trade)=>{
    // check for sufficient shares
    if (!enoughShares(trade)){
      setError2(true)
      return false;
    }
    updateCash(subtract(cash, quote*quantity))
    updatePositions(consolidatePosition(trade, subtract))
    return true;
  }
  const enoughShares=(trade)=>{
    let sameTickers;
    if (trade.type==='sell'){
      sameTickers = positions.filter(position=>{
        return (position.ticker===trade.ticker && position.type==='buy')
      })
    } else {
      sameTickers = positions.filter(position=>{
        return (position.ticker===trade.ticker && position.type==='sell short')
      })
    }
    const positionQuantity = sameTickers.reduce((sum, position)=>position.quantity+sum, 0)
    if (positionQuantity >= trade.quantity){
      return true
    }
    return false
  }
  const consolidatePosition=(trade, operation)=>{
    let found=false;
    const consolidated = positions.map(position=>{
      if (position.ticker===trade.ticker && (position.type===trade.type 
        || ((position.type==='buy'||position.type==='sell')&&(trade.type==='buy'||trade.type==='sell')&&(trade.type!==position.type))
        || ((position.type==='buy to cover short'||position.type==='sell short')&&(trade.type==='buy to cover short'||trade.type==='sell short')&&(trade.type!==position.type)))){
        let newPrice, newInitialPrice;
        // if adding to a position, since we are calculating positions as totals,
        // then the price will reflect the addition to the position.
        // else, the average will not change with removal (since its the same average)
        if (trade.type==='buy' || trade.type==='sell short'){
          newPrice=meanPrice(position.price, position.quantity, trade.price, trade.quantity);
          newInitialPrice=meanPrice(position.initialAvgPrice, position.quantity, trade.price, trade.quantity)
        } else{
          newPrice=position.price;
          newInitialPrice=position.initialAvgPrice;
        }
        const newQuantity=operation(position.quantity,trade.quantity);
        found=true;
        return {...position, price: newPrice, quantity: newQuantity, initialAvgPrice: newInitialPrice}
      } 
      return position
    })
    if (!found){
      return positions.concat(trade)
    }
    const filterConsolidated = consolidated.filter(position=>position.quantity!==0)
    return filterConsolidated;
  }
  const meanPrice=(currentPrice, currentQty, tradePrice, tradeQty)=>{
    const avg = 
    (add((currentPrice*currentQty),(tradePrice*tradeQty)))
    /(add(currentQty,tradeQty))
    return avg;
  }
  const subtract=(a,b)=>{
    return roundVal(a-b)
  }
  const add=(a,b)=>{
    return roundVal(a+b)
  }
  return(
    <div className='form'>
      <div style={{minWidth: '100%', display:'flex', flexDirection: 'column', gap: '1rem'}}>
        <div style={{fontSize: '1.1rem', fontWeight: 'bold'}}>Available Cash: ${cash}</div>
        <Search query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults} trade={trade} setamt={setTransactionAmount}/>
        <div className='separator'></div>
      </div>
      {transactionAmount && <div><b>${transactionAmount[1]}</b> quote: ${quote}</div>}
      <TransactionType setSelectedTransaction={setSelectedTransaction} selectedTransaction={selectedTransaction} quantity={quantity} setQuantity={setQuantity}/>
      {transactionAmount && (
        <div>Transaction Amount: ${(quote*quantity).toFixed(2)}</div>
      )}
      {error1 && (<div className='warning'>{errors[0]}</div>)} 
      {error2 && (<div className='warning'>{errors[1]}</div>)}
      {error3 && (<div className='warning'>{errors[2]}</div>)}
      {success && <div>success!</div>}
      <button onClick={executeTrade}>confirm trade</button>
      <button onClick={()=>setTradeForm(false)}>close</button>
    </div>
  )
}
const TransactionType=({setSelectedTransaction, selectedTransaction, quantity, setQuantity})=>{
  const options=['buy', 'sell', 'sell short', 'buy to cover short']
  const handleChange=(e)=>{
    setSelectedTransaction(e.target.value)
  }
  const handleQuantity=(e)=>{
    setQuantity(Number(e.target.value))
  }
  return(
  <div>
    <div className='formRow'>
      <div>Action:</div>
      <select onChange={handleChange} value={selectedTransaction}>
        <option disabled value='choose'>choose</option>
        {options.map(option=>
        <option key={option} value={option}>{option}</option>
        )}
      </select>
    </div>
    <div className="separator"></div>
    <div className='formRow'>
        Quantity: <input type='number' placeholder='1' onChange={handleQuantity} value={quantity}></input>
    </div>
  </div>
  )
}
const PortfolioTable=({positions, cashTotal})=>{
  
  const columns=['type','ticker', 'qty', 'current value', 'day change(val/%)', 'total gain/loss', 'thesis']
  // day chg, current value(data.price*qty) are values received from the axios call
  return(
  <div className='scrollTable'>
    <table>
      <thead>
        <tr>
            {columns.map(columnName=>
              <th key={columnName}>{columnName}</th>
              )}
        </tr>
      </thead>
      <tbody>
        {positions.length===0
        ? <tr><td colSpan={columns.length}>No Open Positions</td></tr>
        : positions.map((position, index)=>{
          return(
          <tr key={index}>
            <td>{position.type}</td>
            <td>{position.ticker}</td>
            <td>{position.quantity}</td>
            <td>{position.quantity*position.price}</td>
            <td>axios call</td>
            <td>{(position.initialAvgPrice*position.quantity)-position.price}</td>
            <td><button>click to add your thesis</button></td>
          </tr>
          )
        })}
      </tbody>
      <tfoot> 
        <tr>   
          <td colSpan={2}>Cash Total: ${cashTotal}</td>
          <td colSpan={columns.length-2}>Account Value: </td>
        </tr>  
      </tfoot>
    </table>
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
  <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '20rem', padding:'none', }}>
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
      <div style={universalStyle}>
        {children}
      </div>
    </>
  )
}
const Loading=()=>{
  return(
    <div className="background">
        loading...
    </div>
  )
}
const App=()=>{
  const [query, setQuery]=useState(null);
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
          <Route path='/drug' element={<DrugPage />} />
          <Route path='/calendar' element={<CalendarPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
