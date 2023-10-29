import '../App.css'

export const CardDecoration=()=>{
  
    return (
    <div className='aboveDivision'>
        <div style={{display:'flex', marginRight:'auto'}}></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
        <div className="diagonal-rectangle2"></div>
      </div>)
}
export const Candles=()=>{
  const random=((Math.random()-0.5)*100)
  const translate=`${random}`
  return(
    <div style={{width:'100%'}}>
      <div className='candlesContainer' id = 'candlesContainer'>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width="20" height="100" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="50" width="10" height="30" fill="rgb(68,180,68)" />
                <line x1="5" y1="80" x2="5" y2="90" stroke="rgb(68, 180, 68)" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="10" width="10" height="10" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="10" width="10" height="30" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="50" x2="10" y2="10" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="20" width="10" height="50" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="5" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="20" fill="red" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="20" fill="red" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" strokeWidth="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" strokeWidth="2" />
                <rect x="5" y="0" width="10" height="20" fill="red" />
          </svg>
        </div>
      </div>
    </div>
  )
}

const miniCalendar=()=>{
<div>   
      <svg width="200" height="130" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="30" fontSize="24" fontWeight="bold" fill='white'>October</text>
      
        <text x="10" y="60" fill='white'>Sun</text>
        <text x="70" y="60" fill='white'>Mon</text>
        <text x="130" y="60" fill='white'>Tue</text>
      
        <rect x="10" y="70" width="50" height="50" fill="grey" stroke="white" />
        <text x="30" y="100" fill='white'>1</text>
        <rect x="70" y="70" width="50" height="50" fill="grey" stroke="white" />
        <text x="90" y="100" fill='white'>2</text>
        <rect x="130" y="70" width="50" height="50" fill="ivory" stroke="green" />
          <circle cx="155" cy="95" r="21" fill="none" stroke="black" strokeWidth="2" />
          <path d="M25 50L45 70L75 30" stroke="black" transform='translate(130, 70) scale(0.5,0.5)' strokeWidth="3" fill="transparent" />
      </svg>
</div>
}
export const Arrow=()=>{
  return(
    <div style={{display:'flex'}}>
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" viewBox="0 0 20 50">
        <line x1="5" y1="16" x2="15" y2="25" stroke="white" strokeWidth="4" strokeLinecap='round'/>
        <line x1="5" y1="34" x2="15" y2="25" stroke="white" strokeWidth="4" strokeLinecap='round'/>
      </svg>
    </div>
  )
}
export const Check=()=>{
  return(
    <svg width='50' height='50'>
      <circle cx="25" cy="25" r="21" fill="none" stroke="white" strokeWidth="2" />
      <path d="M25 50L45 70L75 30" stroke="white" transform='scale(0.5,0.5)' strokeWidth="3" fill="transparent" />
    </svg>
  )
}
export const Symbol=()=>{
   return (
   <div style={{position:'absolute'}}>

       <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
         <circle cx="100" cy="100" r="90" fill="transparent" stroke="black" strokeWidth="10" />
        
         <line x1="100" y1="40" x2="100" y2="20" stroke="black" strokeWidth="12" />
         <line x1="100" y1="160" x2="100" y2="140" stroke="black" strokeWidth="12" />      
         <circle cx="100" cy="100" r="60" fill="transparent" stroke="black" strokeWidth="8" />
         <circle cx="100" cy="100" r="40" fill="transparent" stroke="black" strokeWidth="4" />
       </svg>
   </div>)
}
export const CalendarSvg=()=>{
  return(
    <svg data-name="01-Calendar" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path style={{fill:"#d6e0eb"}}d="M1 59h62v4H1z"/><path d="M1 4v11h62V4zm14 7H7V7h8zm14 0h-8V7h8zm14 0h-8V7h8zm14 0h-8V7h8z" style={{fill:"#e63b47"}}/><path d="M10 1h2a1 1 0 0 1 1 1v6H9V2a1 1 0 0 1 1-1zM24 1h2a1 1 0 0 1 1 1v6h-4V2a1 1 0 0 1 1-1zM38 1h2a1 1 0 0 1 1 1v6h-4V2a1 1 0 0 1 1-1zM52 1h2a1 1 0 0 1 1 1v6h-4V2a1 1 0 0 1 1-1z" style={{fill:"#d6e0eb"}}/><path style={{fill:"#fbfbfb"}} d="M1 15h62v44H1z"/><path d="M54 6h-1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h-1a1 1 0 0 0-1 1v6h4V5a1 1 0 0 1-1 1zM40 6h-1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h-1a1 1 0 0 0-1 1v6h4V5a1 1 0 0 1-1 1zM26 6h-1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h-1a1 1 0 0 0-1 1v6h4V5a1 1 0 0 1-1 1zM12 6h-1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h-1a1 1 0 0 0-1 1v6h4V5a1 1 0 0 1-1 1z" style={{fill:"#a8b7d4"}}/><path d="M1 15v44h62v-6H34C19.088 53 7 41.912 7 27V15z" style={{fill:"#edf4fa"}}/><path style={{fill:"#8394b2"}} d="M1 63v-4h62v2H6v1h57v1H1z"/><path style={{fill:"#4aa4f2"}} d="M6 27h4v4H6zM6 35h4v4H6zM6 43h4v4H6zM6 51h4v4H6zM14 27h4v4h-4zM14 35h4v4h-4zM14 43h4v4h-4zM14 51h4v4h-4zM22 27h4v4h-4zM22 35h4v4h-4zM22 43h4v4h-4zM30 27h4v4h-4zM30 35h4v4h-4zM30 43h4v4h-4zM38 27h4v4h-4zM38 35h4v4h-4zM38 43h4v4h-4zM46 27h4v4h-4zM46 35h4v4h-4zM46 43h4v4h-4z"/><path style={{fill:"#d13641"}} d="M54 19h4v4h-4zM54 27h4v4h-4zM54 35h4v4h-4zM54 43h4v4h-4z"/><path d="M6 31h1.3a26.76 26.76 0 0 1-.3-4H6zM6 39h3.921a25.077 25.077 0 0 1-1.685-4H6zM6 43h4v4H6zM6 51h4v4H6zM16.531 47A25.834 25.834 0 0 1 14 44.685V47zM14 51h4v4h-4z" style={{fill:"#378be3"}}/><path d="M62 58H2v-6H0v11a1 1 0 0 0 1 1h62a1 1 0 0 0 1-1V25h-2zM2 62v-2h60v2zM62 21h2v2h-2zM63 3h-5v2h4v9H2V5h4V3H1a1 1 0 0 0-1 1v46h2V16h60v3h2V4a1 1 0 0 0-1-1z"/><path d="M6 11a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5h8v1h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5h8v1h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5h8v1h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1h-8V2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1h-8V2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1h-8V2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4H7a1 1 0 0 0-1 1zm49-2a1 1 0 0 0 1-1v2h-6V8a1 1 0 0 0 1 1zm-3-7h2v5h-2zM41 9a1 1 0 0 0 1-1v2h-6V8a1 1 0 0 0 1 1zm-3-7h2v5h-2zM27 9a1 1 0 0 0 1-1v2h-6V8a1 1 0 0 0 1 1zm-3-7h2v5h-2zM10 2h2v5h-2zM8 8a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v2H8zM6 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2H7zM5 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1zm2-3h2v2H7zM5 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1zm2-3h2v2H7zM5 55a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1zm2-3h2v2H7zM14 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM13 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM13 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM13 55a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM22 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM21 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM21 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM30 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM29 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM29 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM38 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM37 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM37 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM46 32h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM45 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM45 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM54 24h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm1-4h2v2h-2zM53 31a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM53 39a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2zM53 47a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1zm2-3h2v2h-2z"/></svg>
  )
}
