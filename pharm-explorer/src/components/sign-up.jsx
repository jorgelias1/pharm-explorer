import { Amplify, Auth } from 'aws-amplify';
import awsconfig from '../aws-exports';
Amplify.configure(awsconfig);
import { useState } from 'react'
import service from '../../express-server/services/axiosRequests'
import { useNavigate } from 'react-router-dom'

export const SignUpForm=()=>{
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [verification, showVerification] = useState(null)
    const [verified, setVerified] = useState(false);

    const handleSignUp = async(e)=>{
      e.preventDefault();
      try{
        await Auth.signUp({
          username: email,
          attributes:{email: email},
          password: password,
        })
        showVerification(true);
      } catch(error){
        console.error(error)
      }
    }
  
    return(
    <div className='all'>
      <form onSubmit={handleSignUp} className='form'>
      <div><div>Sign up to enable paper trading,</div><div> get notifications
      for companies in your watchlist,<div>and more</div></div></div>
 
        <label>
          Email: <input type='email' value={email} 
          onChange={e=>setEmail(e.target.value)}/>
        </label>
        <label>
          Password: <input type='password' value={password}
          onChange={e=>setPassword(e.target.value)}/>
        </label>
        <button type='submit' style={{background:'white', color:'black'}}>Sign Up</button>
        <div>already have an account? sign in</div>
      </form>
      {verification && <VerificationForm email={email} setVerified={setVerified} password={password}/>}
      <SubscribeForm />
      <UnSubscribeForm/>
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
                <button type='submit'>Verify</button>
            </form>
            <button onClick={handleResend}>resend code</button>
        </div>
    )
}
export const LoginForm=()=>{
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    
    const handleLogin=async(e)=>{
        e.preventDefault()
        try{
            await Auth.signIn(username, password)
            console.log('success!')
        } catch(error){
            console.error(error)
        }
    }
    return(
        <div>
            <form onSubmit={handleLogin}>
                <label>
                    username: <input type='username' value={username} onChange={e=>setUsername(e.target.value)}/>
                </label>
                <label>
                    Password: <input type='password' value={password} onChange={e=>setPassword(e.target.value)}/>
                </label>
                <button type='submit'>Login</button>
            </form>
        </div>
    )
}
export const SignUpButton=()=>{
    const [signUpForm, showSignUpForm] = useState(false);
    return(
        <>
            <button onClick={()=>showSignUpForm(true)} className='position'>Sign Up</button>
            {sigâUpForm && (<div className='position2'><Overlay content={<SignUpForm showSignUpForm={showSignUpForm}/>}/></div>)}
        </>
    )
}
export const SubscribeForm=()=>{
  const [ticker, setTicker] = useState('')
  const [invalidTicker, setInvalidTicker] = useState(false)
  const [valid, setValid] = useState(false);
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
    }
    sns.subscribe(params, (err, data)=>{
      if (err){
        console.error(err)
      } else {
        setValid(true)
        service.addToSubscriptions(user, {topicArn: company.topicArn, subscriptionArn: data.subscriptionArn})
      }
    })
  }
  return(
    <div>
      <form>
        enter a ticker to sign up for company updates
        <input type='text' placeholder='enter a ticker' value={ticker} onChange={e=>setTicker(e.target.value)}/>
        <button type='submit' onClick={handleSub}>submit</button>
      </form>
      {invalidTicker && 'please enter a valid ticker'}
      {valid && 'you have been successfully signed up for notifs!'}
    </div>
  )
}
export const UnSubscribeForm=()=>{
  const [ticker, setTicker] = useState('')
  const [noSubs, setNoSubs] = useState(false)
  const [valid, setValid] = useState(false);
  const handleSub = async (e) =>{
    e.preventDefault();
    const user = await Auth.currentAuthenticatedUser()
    const re1 = await service.getSubscriptions(user);
    const re2 = await service.getArn();
    const arnSubs = re1.data.rows[0].subscriptions
    const subs = re2.data.companies.filter(
      company=>arnSubs.includes(company.topicArn))
    if (subs.length===0){
      setNoSubs(true);
      return
    } 
    setNoSubs(false)
    const email = user.attributes.email
    const params = {
      Protocol: 'email',
      TopicArn: company.topicArn,
      Endpoint: email,
    }
    // sns.subscribe(params, (err)=>{
    //   if (err){
    //     console.error(err)
    //   } else {
    //     setValid(true)
    //     service.addToSubscriptions(user, company.topicArn)
    //   }
    // })
  }
  return(
    <div>
      <form>
        <button type='submit' onClick={handleSub}>remove subscriptions</button>
      </form>
      {noSubs && 'you are not currently subscribed to receive company updates'}
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