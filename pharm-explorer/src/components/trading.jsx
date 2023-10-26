import { useState, useEffect } from 'react'
import { Overlay } from './sign-up';
import { Search } from '../App';
import service from '../../express-server/services/axiosRequests'
import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
import { useNavigate } from 'react-router-dom';
// import tradeService from '../functions/trading'
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
    const roundVal=(val)=>{
      return Number(parseFloat(val).toFixed(2))
    }
    const checkForUser=async()=>{
        try{
            const user = await Auth.currentAuthenticatedUser()
            return user.attributes.sub
        } catch{
            return false;
        }
    }
    const getPositions=async(user)=>{
      if (!signedIn){
        return positions
      } else{
        const re = await service.getPositions(user)        
        updatePositions(re.data)
      }
    }
    const getCurrentPrices=async(user)=>{
      if (signedIn){
        const re = await service.getPositions(user)
        const oldPositions = re.data
        const updatedPrices = []
        // get current prices
        await Promise.all(
        oldPositions.map(async(position)=>{
          const re = await service.getQuote(position)
          updatedPrices.push({price: re.data[0].price, change: re.data[0].changes})
        }))
        const updatedPositions = oldPositions.map((position, index)=>{
          service.postTrade(signedIn, {...position, price: updatedPrices[index].price, change: updatedPrices[index].changes})
          return{
          ...position, price: updatedPrices[index].price, change: updatedPrices[index].changes
        }})
        updatePositions(updatedPositions)
      }
    }
    const calculateCash=async(user)=>{
      if (!signedIn){
        return currentCash
      } else {
        // axios call to database and see current cash
        const cash = await service.getCash(user)
        return cash.data.rows[0].cash
      }
    }
    console.log(history, positions)
    useEffect(()=>{
        const fetchData=async()=>{
            const user = await checkForUser();
            await setSignedIn(user)
            const cash = await calculateCash(user)
            await getCurrentPrices(user)
            await setCurrentCash(Number(cash));
            await getPositions(user)
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
        <div className='warning' style={{width: '100%'}}>Warning: You are not signed in; your history, including any trades you make, will not be saved. 
        <div>To save your history, <span className='clickMe' onClick={()=>navigate('/logIn')}>sign in</span> or <span onClick={()=>navigate('/signUp')}className='clickMe'>create an account.</span></div></div>
        )}
        <PortfolioTable signedIn={signedIn} positions={positions} cashTotal={currentCash}/>
        <button onClick={handleTradeClick} style={{maxWidth: '8rem'}}>Trade</button>
        {tradeForm && (
          <Overlay content={<TradeForm setTradeForm={setTradeForm} trade={trade} query={query} setQuery={setQuery} searchResults={searchResults} setSearchResults={setSearchResults} updateCash={setCurrentCash} cash={currentCash} history={history} updateHistory={updateHistory} positions={positions} updatePositions={updatePositions} roundVal={roundVal} setTraded={setTraded} signedIn={signedIn}/>}/>
        )}
      </div>
    )
  }
  const TradeForm=({setTradeForm, trade, query, setQuery, searchResults, setSearchResults, updateCash, cash, history, updateHistory, positions, updatePositions, roundVal, setTraded, signedIn})=>{
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
        setQuery('')
        if (signedIn){
          service.postHistory(signedIn, {type: trade.type, ticker: trade.ticker, quantity: trade.quantity, price: trade.price})
        }
        updateHistory(history.concat({type: trade.type, ticker: trade.ticker, quantity: trade.quantity, price: trade.price}));
        // setTraded(true)
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
          if(signedIn){
            newQuantity!==0 ? service.postTrade(signedIn, {...position, price: newPrice, quantity: newQuantity, initialAvgPrice: newInitialPrice})
            : service.deletePosition(signedIn, {...position, price: newPrice, quantity: newQuantity, initialAvgPrice: newInitialPrice})
          }
          return {...position, price: newPrice, quantity: newQuantity, initialAvgPrice: newInitialPrice}
        } 
        return position
      })
      if (!found){
        if(signedIn){
          service.postTrade(signedIn, trade, found)
        }
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
  const PortfolioTable=({positions, cashTotal, signedIn})=>{
    const [thesis, setThesis] = useState(false)
    const [desc, setDesc] = useState(false)
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
  const ThesisTemplate=({props, setVisible, user})=>{
    const [text, updateText] = useState('')
    const position = props.position
    const pct = props.pct
    const submitThesis=async(position, text, user)=>{
      try{
      await service.submitThesis(position, text, user)
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
        <div contentEditable='true' onInput={(e)=>updateText(e.target.textContent)} style={{display: 'flex', flex: '1', minWidth: '100%', minHeight: '100%',border: '2px solid grey', borderRadius: '0.3rem'}}>
          {position.thesis && position.thesis}
        </div>
        <div style={{display: 'flex'}}>
          <button onClick={()=>{submitThesis(props.position, text, user)}} style={{marginLeft: '30%'}}>submit</button>
          <button style={{marginLeft: '70%'}}onClick={()=>setVisible(false)}>close</button>
        </div>
      </div>
    )
  }