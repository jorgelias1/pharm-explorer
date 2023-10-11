
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