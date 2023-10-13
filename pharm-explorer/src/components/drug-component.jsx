
export const BioactivityTable=({bioactivityColumns, activeRows, remove})=>{
    let i=0;
    return (<table>
      <caption>Bioactivity</caption>
      <thead style={{position: 'sticky', top: '0', backgroundColor: 'rgb(36,36,36)'}}>
        <tr>
          {bioactivityColumns.map((column, index)=>
          !remove.includes(index) && 
          (<th key={column}>{column}</th>)
          )}
        </tr>
      </thead>
      <tbody>
         {activeRows.map(row=>
          <tr key={i}>{row.Cell.map((cell, index)=>
            { i++;
              return (!remove.includes(index) &&
            (<td key={i}>{cell}</td>))
          }
          )}</tr>
         )}
      </tbody>
    </table>)
  }
export const PubmedTrials=({pubmedArray, scrollTable})=>{
    return (
      <>
        <div>Clinical Trials from Pubmed</div>
        <ol style={scrollTable}>
        {pubmedArray.map(trial=>
          <li key={trial.url}style={{marginBottom: '1rem'}}>
            <a href={trial.url}>{trial.text}</a>
          </li>
        )}
        </ol>
      </>
    )
  }
export const PastInvestigators=({trialData})=>{
    if (trialData.length>0){
      const investigators=[]
      trialData.map(trial=>{
        investigators.push(trial.protocolSection.sponsorCollaboratorsModule.leadSponsor)
      })
      const tmpSet = new Set()
      const uniqueInvestigators=investigators.filter(sponsor=>{
        if (!tmpSet.has(sponsor.name)){
          tmpSet.add(sponsor.name)
          return (sponsor.class==='INDUSTRY')
        }
        
      })
      if (uniqueInvestigators.length>0){
        return <div> Investigated by:
          {uniqueInvestigators.map(sponsor=>
            <div key={sponsor.name}>{sponsor.name}</div>
            )}
        </div>
      }
    }
  }
export const Indications=({trialData})=>{
    const miniFlex={
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      marginBottom: '1rem'
    }
    if (trialData.length>0){
      const indications=[]
      trialData.map(trial=>{
        indications.push(trial.protocolSection.conditionsModule.conditions[0])
      })
      const tmpSet = new Set()
      const uniqueIndications=indications.filter(indication=>{
        if (!tmpSet.has(indication)){
          tmpSet.add(indication)
          return true
        }
      })
      if (uniqueIndications.length>0){
        return <div style={miniFlex}> Indications:
          {uniqueIndications.map(indication=>
            <div key={indication}>{indication}</div>
            )}
        </div>
      }
    }
  }
  
export const FDAStatus=({fdaStatus})=>{
    const miniFlex={
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      marginBottom: '1rem'
    }
    let approvalsNotShown;
    let approvedSubmissions;
    if (fdaStatus){
      approvalsNotShown=fdaStatus.meta.results.total-fdaStatus.meta.results.limit;
      const tmpSet=new Set()
      approvedSubmissions=fdaStatus.results.filter(submission=>{
        if (!tmpSet.has(submission.sponsor_name)){
          tmpSet.add(submission.sponsor_name)
          return(submission.submissions[0].submission_status==='AP')
        }
      });
    }
    return (
      <>
      { !fdaStatus ?
        <div style={{marginBottom: '1rem'}}>
        Not FDA Approved
        </div>
        : 
        <>
          <div>FDA Approved to:</div>
          <div style={miniFlex}>
          {approvedSubmissions.map(submission=>
            <div key={submission.application_number}>
              {submission.sponsor_name}
            </div>)} and {approvalsNotShown} more
          </div>
        </>
      } 
      </>
    )
  }
export const Svg=()=>{
    return(
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="8" viewBox="0 0 48 16" transform="rotate(-45) translate(5, 0) scale(1, 1.17)">
        <rect x="4" y="0" width="24" height="16" rx="4" ry="4" fill="#000"/>
        <circle cx="8" cy="8" r="8" fill="#000"/>
        <circle cx="8" cy="8" r="6" fill="#fff"/>
        <rect x="4" y="2" width="24" height="12" rx="4" ry="4" fill="#fff"/>
        <rect x="18" y="0" width="16" height="16" rx="2" ry="4" fill="#000" />
        <circle cx="32" cy="8" r="8" fill="#000" />
        <path d="M22 2 Q 32 1.5, 35 2.5" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
    )
}
export const SearchIcon=()=>{
    return(
        <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    )
}