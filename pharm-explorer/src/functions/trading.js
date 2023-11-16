import service from '../../express-server/services/axiosRequests'

const consolidatePosition=(trade, operation, positions, signedIn)=>{
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
const roundVal=(val)=>{
    return Number(parseFloat(val).toFixed(2))
}
const enoughShares=(trade, positions)=>{
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
const executeTrade=(updateCash, updatePositions, updateHistory, ticker, quantity, selectedTransaction, quote, cash, positions, signedIn, setError1, setError2, setError3, setSuccess, setQuery, history)=>{
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
    const buy=(trade)=>{
        // check for sufficient cash
        if (roundVal((quote*quantity)) > cash){
          setError1(true)
          return false;
        } 
        updateCash(subtract(cash, quote*quantity))
        updatePositions(consolidatePosition(trade, add, positions, signedIn))
        return true;
      }
      const sell=(trade)=>{
        // check for sufficient shares
        if (!enoughShares(trade, positions)){
          setError2(true)
          return false;
        } 
        updateCash(add(cash, quote*quantity))
        updatePositions(consolidatePosition(trade, subtract, positions, signedIn))
        return true;
      }
      const short=(trade)=>{
        // unlimited leverage. no limits.
        updateCash(add(cash, quote*quantity))
        updatePositions(consolidatePosition(trade, add, positions, signedIn))
        return true;
      }
      const buyToCover=(trade)=>{
        // check for sufficient shares
        if (!enoughShares(trade, positions)){
          setError2(true)
          return false;
        }
        updateCash(subtract(cash, quote*quantity))
        updatePositions(consolidatePosition(trade, subtract, positions, signedIn))
        return true;
      }
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

  const getPositions=async(user, signedIn, positions, updatePositions)=>{
    if (!signedIn){
      return positions
    } else{
      const re = await service.getPositions(user)        
      updatePositions(re.data)
    }
  }
  const getCurrentPrices=async(user, signedIn, updatePositions)=>{
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
  const calculateCash=async(user, signedIn, currentCash)=>{
    if (!signedIn){
      return currentCash
    } else {
      // axios call to database and see current cash
      const cash = await service.getCash(user)
      return cash.data.rows[0].cash
    }
  }
export{
    roundVal,
    executeTrade,
    getPositions, 
    getCurrentPrices, 
    calculateCash,
}