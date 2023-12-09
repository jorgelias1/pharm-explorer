import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig);
import { useEffect, useState } from 'react'
import service from '../../express-server/services/axiosRequests'
import { useNavigate } from 'react-router-dom'
import {Message} from '../App'

export const SignUpForm=()=>{
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verification, showVerification] = useState(null)
    const [verified, setVerified] = useState(false);
    const [invalidParams, setInvalidParams] = useState(false)
    const [emptyErr, setEmptyErr] = useState(false);
    const [passwordErr, setPasswordErr] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async(e)=>{
      e.preventDefault();
      if (email==='' || password===''){
        setEmptyErr(true)
        return
      } else if (password.length<8){
        setPasswordErr(true)
        return
      }  
      try{
        await Auth.signUp({
          username: email,
          attributes:{email: email},
          password: password,
        })
        setPasswordErr(false);
        setEmptyErr(false);
        setInvalidParams(false);
        showVerification(true);
      } catch{
        setInvalidParams(true)
      }
    }
  
    return(
    <div className='all'>
      <form onSubmit={handleSignUp} className='form'>
      <div><div>Sign up to enable paper trading,</div><div> get notifications
      for companies in your watchlist,<div>and more</div></div></div>
 
        <label>
          Email: <input type='email' value={email} 
          onChange={e=>setEmail(e.target.value)}
          placeholder='example@email.com' 
          autoFocus={true}/>
        </label>
        <label>
          Password: <input type='password' value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder='8 character minimum'/>
        </label>
        <button type='submit' style={{background:'white', color:'black'}}>Verify</button>
        {emptyErr && <div className='warning'>Must enter both an email and a password</div>}
        {passwordErr && <div className='warning'>password must be at least 8 characters</div>}
        {invalidParams && <div className='warning'>Please re-enter a valid email or password</div>}
        <div>already have an account? {''}
          <span onClick={()=>navigate('/login')} className='clickMe'>
            sign in
          </span>
        </div>
        {verification && <VerificationForm email={email} setVerified={setVerified} password={password}/>}
      </form>
    </div>
    )
}
const VerificationForm=({email, setVerified, password})=>{
    const [code, setCode] = useState('')
    const [resent, updateResent] = useState(false)
    const navigate = useNavigate();

    const handleVerification = async(e)=>{
        e.preventDefault()
        try{
            const re=await Auth.confirmSignUp(email, code)
            console.log(re)
            await Auth.signIn(email, password);
            const user = await Auth.currentAuthenticatedUser()
            service.addUserToDb(user)
            console.log('success signing up!')
            setVerified(true)
            navigate('/')
        } catch(error){
            console.error(error)
        }
    }
    const handleResend=async()=>{
    Auth.resendSignUp(email)
    .then(() => {updateResent(true)})
    .catch((error) => {console.error(error)});}
    return(
        <div>
            <form onSubmit={handleVerification}>
                <label>
                    Please enter your verification code: <input type="text" value={code} onChange={e=>setCode(e.target.value)}/>
                </label>
                <div>
                <button type='submit'>Verify</button>
                <button onClick={handleResend}>resend code</button>
                </div>
            </form>
        </div>
    )
}
export const LoginForm=()=>{
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [forgot, setForgot] = useState(false)
    const [change, setChange] = useState(false)
    const [code, setCode] = useState('')
    const navigate = useNavigate();
    const handleLogin=async(e)=>{
        e.preventDefault()
        try{
            await Auth.signIn(username, password)
            navigate('/')
            console.log('success!')
        } catch(error){
            console.error(error)
        }
    }
    const handleForgot=async(e)=>{
      e.preventDefault()
      setForgot(true)
    }
    const sendCode=async(e)=>{
      e.preventDefault();
      try {
        const re = await Auth.forgotPassword(username)
        setChange(true)
      } catch(err){
        console.log(err)
      }
    }
    const verifyChange=async(e)=>{
      e.preventDefault()
      try {
        const re = await Auth.forgotPasswordSubmit(username, code, password)
        // this should enable user to login with new password
        setForgot(false); 
      } catch (err){
        console.log(err)
      }
    }
    return(
      <>
        {forgot ? <>
        <Message msg='please enter your email for a reset code' type='success'/>
        <form onSubmit={handleLogin}>
          <label>
              Email: <input type='email' value={username} onChange={e=>setUsername(e.target.value)} autoFocus={true}/>
          </label>
          {!change 
          ? <button type='submit' onClick={sendCode}>send code</button>
          : (
          <div className='flexV'>
            <label>
              Verification code: <input type='text' value={code} onChange={e=>setCode(e.target.value)}/>
            </label>
            <label>
              New password: <input type='password' value={password} onChange={e=>setPassword(e.target.value)}/>
            </label>
            <button type='submit' onClick={verifyChange}>confirm change</button>
          </div>
          )}
        </form>
      </> :
      <form onSubmit={handleLogin}>
          <label>
              Email: <input type='email' value={username} onChange={e=>setUsername(e.target.value)} autoFocus={true}/>
          </label>
          <label>
              Password: <input type='password' value={password} onChange={e=>setPassword(e.target.value)}/>
          </label>
          <button type='submit'>Login</button>
          <div className='clickMe' onClick={handleForgot}>forgot password?</div>
      </form>}
        
      </>
    )
}
export const SignUpButton=()=>{
    const [signUpForm, showSignUpForm] = useState(false);
    return(
        <>
            <button onClick={()=>showSignUpForm(true)} className='position'>Sign Up</button>
            {signUpForm && (<div className='position2'><Overlay content={<SignUpForm showSignUpForm={showSignUpForm}/>}/></div>)}
        </>
    )
}
export const SubscribeForm=()=>{
  const [ticker, setTicker] = useState('')
  const [invalidTicker, setInvalidTicker] = useState(false)
  const [valid, setValid] = useState(false);
  const [notSignedIn, setNotSignedIn] = useState(false);
  const navigate = useNavigate();
  useEffect(()=>{
    const async = async()=>{
      try{
        await Auth.currentAuthenticatedUser()
      } catch{setNotSignedIn(true)}
    }
    async()
  }, [])
  const handleSub = async (e) =>{
    e.preventDefault();
    const re = await service.getArn();
    const company = re.data.companies.find(company=>company.ticker===ticker.toUpperCase())
    if (!company){
      setInvalidTicker(true);
      return
    } 
    setInvalidTicker(false)
    const user = await Auth.currentAuthenticatedUser()
    const email = user.attributes.email
    const params = {
      Protocol: 'email',
      TopicArn: company.topicArn,
      Endpoint: email,
      user: user,
      company: company,
    }
    service.subscribe(params).then(()=>{setValid(true)})
    .catch((err)=>{console.log(err)})
  }
  return(
    <div className='form'>
      {notSignedIn && <div>
        <div className='warning'>you must be signed in to sign up for notifications</div>
        <div className='clickMe' onClick={()=>navigate('/signUp')}>sign up here</div>
      </div>}
      <form>
        <div className="formHeader">
          <div>enter a ticker to sign up for company updates</div>
          <div className="separator"></div>
        </div>
        <div style={{maxWidth: '70%'}}>The catalyst calendar updates daily, never miss important updates for companies you are tracking and sign up for notifications!</div>
        <div>
        <input type='text' placeholder='enter a ticker' value={ticker} onChange={e=>setTicker(e.target.value)}/>
        <button type='submit' onClick={handleSub}>submit</button>
        </div>
      </form>
      {invalidTicker && <div className='warning'>please enter a valid ticker <div>(must be a biotech/pharmaceutical company)</div></div>}
      {valid && 'please check your email to confirm your subscription'}
    </div>
  )
}
export const UnSubscribeForm=()=>{
  const [ticker, setTicker] = useState('')
  const [noSubs, setNoSubs] = useState(false)
  const [valid, setValid] = useState(false);
  const [companySubscriptions, setCompanySubscriptions] = useState(null)

  const handleUnsubClick = async (e) =>{
    e.preventDefault();
    const user = await Auth.currentAuthenticatedUser()
    const re1 = await service.getSubscriptions(user);
    const re2 = await service.getArn();
    const subs = re1.data.rows[0].subscriptions
    const subscriptions = re2.data.companies.filter(
      company=>subs.includes(`${company.topicArn}`)
    )
    setCompanySubscriptions(subscriptions)

    if (subscriptions.length===0){
      setNoSubs(true);
      return
    }
    setNoSubs(false)
  }
    const unsubscribe=async(topicArn)=>{
    const user = await Auth.currentAuthenticatedUser()
    service.unsubscribe(topicArn, user).then(()=>{setValid(true)})
    .catch((err)=>{console.log(err)})
  }
  return(
    <div>
      <form>
        <button type='submit' onClick={handleUnsubClick}>remove subscriptions</button>
      </form>
      {noSubs ? 'you are not currently subscribed to receive company updates'
      : companySubscriptions && companySubscriptions.map(company=>(
        <button key={company.topicArn} onClick={()=>unsubscribe(company.topicArn)}>Click to Remove: {company.ticker}</button>
      ))}
      {valid && (
        <Message msg={'Successfully unsubscribed!'} type={'success'}/>
      )}
    </div>
  )
}

export const Overlay=({content})=>{
  return(
    <div className='background'>
      <div className='overlay'>
        {content}
      </div>
    </div>
  )
}
export const ProfileSvg=()=>{
  return(
    <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="44" fill="white" />
        <circle cx="50" cy="50" r="40" fill="black" />
        <circle cx="50" cy="40" r="16" fill="white" />
        <ellipse cx="50" cy="73" rx="25" ry="10" fill="white" />
    </svg>
  )
}