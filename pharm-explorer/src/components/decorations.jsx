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
                <line x1="5" y1="80" x2="5" y2="90" stroke="rgb(68, 180, 68)" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="10" width="10" height="10" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="10" width="10" height="30" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="50" x2="10" y2="10" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="20" width="10" height="50" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="5" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" stroke-width="2" />
                <rect x="5" y="0" width="10" height="20" fill="red" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" stroke-width="2" />
                <rect x="5" y="0" width="10" height="20" fill="red" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="rgb(68, 180, 68)" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="rgb(68, 180, 68)" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="30" width="10" height="40" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <rect x="5" y="40" width="10" height="60" fill="red" />
                <line x1="10" y1="80" x2="10" y2="10" stroke="red" stroke-width="2" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='100'>
                <line x1="10" y1="20" x2="10" y2="100" stroke="rgb(68, 180, 68)" stroke-width="2" />
                <rect x="5" y="0" width="10" height="80" fill="rgb(68, 180, 68)" />
          </svg>
        </div>
        <div style={{transform:`translateY(${translate/2}px)`}}>
          <svg width='20' height='80'>
                <line x1="10" y1="70" x2="10" y2="0" stroke="red" stroke-width="2" />
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
const symbol=()=>{
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <circle cx="100" cy="100" r="90" fill="transparent" stroke="black" stroke-width="10" />
  
  <line x1="100" y1="40" x2="100" y2="20" stroke="black" stroke-width="12" />
  <line x1="100" y1="160" x2="100" y2="140" stroke="black" stroke-width="12" />
  
  <circle cx="100" cy="100" r="60" fill="transparent" stroke="black" stroke-width="8" />
  
  <circle cx="100" cy="100" r="40" fill="transparent" stroke="black" stroke-width="4" />
</svg>
}
