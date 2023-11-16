import { useState, useEffect } from 'react'
import { Overlay } from './sign-up';
import { Search } from '../App';
import service from '../../express-server/services/axiosRequests'
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { useNavigate } from 'react-router-dom';
import {roundVal, executeTrade, getPositions, getCurrentPrices, calculateCash} from '../functions/trading'
Amplify.configure(awsconfig);

export const PaperTradePage=({setQuery, query, setSearchResults, searchResults})=>{
    const [tradeForm, setTradeForm] = useState(false)
    const [currentCash, setCurrentCash] = useState(10000);
    const [history, updateHistory] = useState([]);
    const [positions, updatePositions] = useState([]);
    const [signedIn, setSignedIn] = useState(false)
    const [traded, setTraded] = useState(false)
    const trade=true;
    const navigate=useNavigate();
    useEffect(() => {
      window.scrollTo(0, 0); 
    }, []); 
    const checkForUser=async()=>{
        try{
            const user = await Auth.currentAuthenticatedUser()
            return user.attributes.sub
        } catch{
            return false;
        }
    }
    
    useEffect(()=>{
        const fetchData=async()=>{
            const user = await checkForUser();
            await setSignedIn(user)
            const cash = await calculateCash(user, signedIn, currentCash)
            await getCurrentPrices(user, signedIn, updatePositions)
            await setCurrentCash(Number(cash));
            await getPositions(user, signedIn, positions, updatePositions)
        }
        fetchData();
    }, [signedIn])
    // no need to get after posting, shld already be displayed.
    useEffect(()=>{
      if (signedIn && !isNaN(currentCash)){
        service.postCash(signedIn, Number(currentCash));
      }
    }, [currentCash])

    const handleTradeClick=()=>{
      setTradeForm(true);
      setQuery('')
    }
    return(
      <div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', padding:'none', }}>
        <h2>Paper Trading</h2>
        {!signedIn && (
        <div className='warning' style={{width: '100%'}}>Warning: You are not signed in. Your history, including any trades you make, will not be saved. 
        <div>To save your history, <span className='clickMe' onClick={()=>navigate('/logIn')}>sign in</span> or <span onClick={()=>navigate('/signUp')}className='clickMe'>create an account.</span></div></div>
        )}
        <PortfolioTable signedIn={signedIn} positions={positions} cashTotal={currentCash}/>
        <button onClick={handleTradeClick} style={{maxWidth: '8rem', background:'black', boxShadow:'0px 0px 2px 2px grey'}}>Trade</button>
        {tradeForm && (
          <Overlay content={<TradeForm setTradeForm={setTradeForm} trade={trade} query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults} updateCash={setCurrentCash} cash={currentCash} history={history} updateHistory={updateHistory} positions={positions} updatePositions={updatePositions} setTraded={setTraded} signedIn={signedIn}/>}/>
        )}
        <GlobalTrades/>
      </div>
    )
  }
  const TradeForm=({setTradeForm, trade, query, setQuery, searchResults, setSearchResults, updateCash, cash, history, updateHistory, positions, updatePositions, setTraded, signedIn})=>{
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
  
    return(
      <div className='form'>
        <div className='none'style={{display:'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'}}>
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
        <button onClick={()=>executeTrade(updateCash, updatePositions, updateHistory, ticker, quantity, selectedTransaction, quote, cash, positions, signedIn, setError1, setError2, setError3, setSuccess, setQuery, history)}>confirm trade</button>
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
  const PortfolioTable=({positions, cashTotal, signedIn})=>{
    const [thesis, setThesis] = useState(false)
    let i = 0;
    const calculateGainLoss=(position)=>{
      const value = !(position.type==='buy')
      ? ((Number(position.initialAvgPrice)*position.quantity)-(position.price*position.quantity))
      : (position.price*position.quantity) - (Number(position.initialAvgPrice)*position.quantity)
      return value
    }
    const columns=['action','ticker', 'qty', 'current value', '% of portfolio', 'total gain/loss', 'thesis']
    // day chg, current value(data.price*qty) are values received from the axios call
    return(
    <>
    {thesis && <ThesisTemplate props={thesis} setVisible={setThesis} user={signedIn}/>}
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
            position.type!=='sell short' && (i+=position.quantity*position.price)
            return(
            <tr key={index}>
              <td>{position.type}</td>
              <td>{position.ticker}</td>
              <td>{position.quantity}</td>
              <td>${position.quantity*position.price}</td>
              <td>{parseFloat(100*(position.quantity*position.price)/(i+cashTotal)).toFixed(2)}%</td>
              <td>${calculateGainLoss(position)}</td>
              <td>{(signedIn && !position.thesis) ? (<button onClick={()=>setThesis({position, pct: parseFloat(100*(position.quantity*position.price)/(i+cashTotal)).toFixed(2)})}>click to add your thesis</button>) : (signedIn && position.thesis) ? <button onClick={()=>setThesis({position, pct: parseFloat(100*(position.quantity*position.price)/(i+cashTotal)).toFixed(2)})}>click to see thesis</button> : ('you must be signed to add your thesis')}</td>
            </tr>
            )
          })}
        </tbody>
        <tfoot> 
          <tr>   
            <td colSpan={2}>Cash Total: ${cashTotal}</td>
            <td colSpan={columns.length-2}>Account Value: ${i+cashTotal}</td>
          </tr>  
        </tfoot>
      </table>
    </div>
    </>
    )
  }
  // user rationale for trade entry
  const ThesisTemplate=({props, setVisible, user})=>{
    const position = props.position
    console.log(position)
    const init = position.thesis ? position.thesis : '';
    const [text, updateText] = useState(init)
    const pct = props.pct
    const submitThesis=async(position, text, user)=>{
      try{
      await service.submitThesis(position, text, user)
      } catch(err){
        console.log(err)
      }
    }
    const togglePublic=async(position, user)=>{
      try{
        // toggle trade public status
          await service.togglePublic(position, user)
      } catch(err){
        console.log(err)
      }
    }

    return(
      <div className="form" style={{minWidth: '90%'}}>
        <div>
          <b style={{fontSize: '1.1rem', textDecoration: 'underline'}}>{position.ticker} - {position.type} {position.quantity} shares - {pct}% of portfolio</b>
          <p>Why did you make this trade?</p>
        </div>
        <textarea onChange={(e)=>updateText(e.target.value)} style={{display: 'flex', flex: '1', minWidth: '100%', minHeight: '100%',border: '2px solid grey', borderRadius: '0.3rem', fontFamily:'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', fontSize:'1rem'}} value={text}/>
        <div style={{display: 'flex', justifyContent:'space-evenly'}}>
          <button onClick={()=>{togglePublic(props.position, user)}}>toggle public</button>
          <button onClick={()=>{submitThesis(props.position, text, user)}}>submit</button>
          <button onClick={()=>setVisible(false)}>close</button>
        </div>
      </div>
    )
  }
  // trade sharing with other users
  const GlobalTrades=()=>{
    const [publicPositions, setPublicPositions] = useState([]);
    const [ticker, setTicker] = useState('')
    const [clicked, setClicked] = useState(false)
    
    const seeTrades=async(ticker)=>{
      setClicked(true);
      try{
      const re = await service.getPublicPositions(ticker);
      setPublicPositions(re.data.rows);
      } catch{
        setPublicPositions([])
      }
    }
    const handleSubmit=(e)=>{
      e.preventDefault();
      seeTrades(ticker);
    }
    return(
      <div>
        <p className="separator"></p>
        <div className='flexCenter'>
          <div className='tertiaryCard' style={{paddingLeft:'1rem', paddingRight:'1rem', width:'40%'}}>
            <button className="secondaryCard" onClick={()=>{seeTrades()}} >
              See recent public trade ideas
            </button>
          </div>
          <div style={{display:'flex', flexWrap:'wrap', maxWidth:'40%', justifyContent:'center', alignItems:'center', paddingTop:'1rem', paddingBottom:'1rem', borderRadius:'1rem', height:'6rem', fontWeight:'bold', background:'black'}} >
          Enter a ticker to see what others are saying:
            <form onSubmit={handleSubmit} >
              <div style={{display:'flex'}}>
                <div style={{width:'5rem', overflow:'hidden'}}>
                  <input style={{width:'2rem', overflow:'hidden'}} autoFocus={true} onChange={(e)=>setTicker((e.target.value).toUpperCase())} value={ticker}/>
                </div>
                <button type='submit'>submit</button>
              </div>
            </form>
          </div>
        </div>
        {publicPositions.length>0 
        ? <ul className='scrollTable' style={{padding:'1rem'}}>
          {publicPositions.map(pos=>(
            <div key={pos.thesis}>
              <li>Company: {pos.ticker}</li>
              <li>{pos.thesis}</li>
              <p className='separator'></p>
            </div>
          ))}
        </ul>
        : clicked && <div className='warning'>there are currently no public matches for the given ticker</div>}
      </div>
    )
  }