import { useState } from 'react'
import { authApi, setAuthToken } from '../services/api'
import { USER_LOGIN_URL, USER_SIGNUP_URL } from '../constants/api'
import { useNavigate, Link } from 'react-router-dom'
import { useUserStore, useErrorStore } from '../store'
import Icon from '../components/Icon'

const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { error, showError } = useErrorStore()
  const { login } = useUserStore()
  const navigate = useNavigate()

    // const handleRegister = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   if (!name || !password) {
  //     showError('Name and password are required')
  //     return
  //   }
  //   const avatarUrl = "icon.png"
  //   try {
  //     // Check if user exists
  //     // const existingUser = await authApi.get(`${USER_CHECK_NAME_URL}?name=${encodeURIComponent(name)}`)
  //     // const existingUser = res.data.find((u: any) => u.name === name)
  //     if (existingUser) {
  //       // Check password
  //       if (existingUser.password === password) {
  //         login(existingUser)
  //         localStorage.setItem('userId', existingUser.id)
  //         navigate('/')
  //       } else {
  //         showError('User already exists with a different password')
  //       }
  //       return
  //     }
  //     // Register new user
  //     const response = await authApi.post(USER_SIGNUP_URL, { name, password, avatarUrl })
  //     login(response.data)
  //     localStorage.setItem('userId', response.data.id)
  //     navigate('/')
  //   } catch (e) {
  //     showError('Registration or login failed')
  //   }
  // }


  const handleLoginOrRegister = async (email: string, password: string) => {
    try {
      // Try login first
      const loginRes = await authApi.post(USER_LOGIN_URL, { email, password })

      // If login succeeds, set token and proceed
      const { token } = loginRes.data
      if (token) {
        localStorage.setItem('token', token)
        setAuthToken(token)
      }
      
      return loginRes.data
    } catch (loginErr: any) {
      // If login fails, check error message
      const errorMsg = loginErr?.response?.data?.detail
      if (errorMsg === "Invalid credentials" || errorMsg === "User not found" || loginErr?.response?.status === 400) {
        // Try register
        try {
          const registerRes = await authApi.post(USER_SIGNUP_URL, { email, password })
          
          // After successful register, try login again
          const loginRes2 = await authApi.post(USER_LOGIN_URL, { email, password })

          // Set token after successful login
          const { token } = loginRes2.data
          if (token) {
            localStorage.setItem('token', token)
            setAuthToken(token)
          }
          
          return loginRes2.data
        } catch (registerErr) {
          // Handle register error (e.g., email already exists)
          showError('Email already exists')
        }
      } else {
        // Other login error
        showError('Registration or login failed')
      }
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen w-full bg-black overflow-hidden font-cinzel">
      {/* Cinematic background image overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/bladerunner.jpg"
          alt="cinematic background"
          className="w-full h-full object-cover object-center opacity-60 blur-[2px] scale-110"
          style={{filter: 'brightness(0.7) saturate(1.2)'}}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/60 to-yellow-200/20 mix-blend-multiply"></div>
      </div>
      {/* Cinematic blurred yellow circles and sparkles */}
      <div className="absolute -top-32 -left-32 w-[40vw] h-[40vw] bg-yellow-100 rounded-full opacity-30 z-10 blur-2xl animate-float-slow"></div>
      <div className="absolute bottom-0 right-0 w-[30vw] h-[30vw] bg-yellow-200 rounded-full opacity-20 z-10 blur-2xl animate-float-slow2"></div>
      {/* Sparkle effects */}
      <div className="pointer-events-none absolute inset-0 z-20">
        {[...Array(18)].map((_,i) => (
          <div key={i} className={`absolute w-2 h-2 bg-yellow-300 rounded-full opacity-70 animate-sparkle`} style={{top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, animationDelay: `${Math.random()*3}s`}}></div>
        ))}
      </div>
      {/* Cinematic card with glassmorphism, neon border, and 3D effect */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const result = await handleLoginOrRegister(email, password);
          if (result) {
            login(result);
            navigate('/');
          }
        }}
        className="relative z-30 bg-white/80 backdrop-blur-2xl p-12 md:p-16 rounded-[3rem] shadow-2xl flex flex-col gap-10 min-w-[340px] max-w-lg border-4 border-yellow-400/80 animate-fade-in"
        style={{boxShadow: '0 12px 60px 0 rgba(0,0,0,0.40), 0 2px 16px 0 rgba(255, 193, 7, 0.18), 0 0 0 10px rgba(255, 221, 51, 0.10)'}}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border-4 border-yellow-400 shadow-2xl flex items-center justify-center mb-4 animate-pulse-slow">
            <Icon name="UserIcon" size={64} className="text-yellow-700 drop-shadow-xl" />
          </div>
          <h2 className="text-6xl font-extrabold text-yellow-400 drop-shadow-2xl mb-2 tracking-tight font-cinzel animate-title-glow">Welcome!</h2>
          <p className="text-yellow-900 text-xl font-semibold italic text-center">Register or log in to continue<br/><span className='text-yellow-600 text-base font-normal'>Enjoy a cinematic experience</span></p>
        </div>
        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border-2 border-yellow-400 px-7 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl transition-all bg-white/80 shadow-inner placeholder-yellow-400 font-semibold tracking-wide mb-2 hover:scale-[1.04] focus:scale-[1.05] duration-200"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border-2 border-yellow-400 px-7 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 text-xl transition-all bg-white/80 shadow-inner placeholder-yellow-400 font-semibold tracking-wide mb-2 hover:scale-[1.04] focus:scale-[1.05] duration-200"
        />
        {error && (
          <div className="text-red-600 text-center font-semibold bg-red-50 rounded-xl py-2 px-3 shadow border border-red-200 animate-pulse">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-200 px-12 py-4 rounded-2xl text-yellow-900 font-extrabold text-3xl shadow-2xl hover:from-yellow-300 hover:to-yellow-100 transition-all tracking-wide border-2 border-yellow-200/80 drop-shadow-xl mt-2 animate-glow"
        >
          Register / Login
        </button>
        <Link
          to="/"
          className="mt-2 text-yellow-700 font-bold text-lg bg-yellow-100/80 hover:bg-yellow-200/90 px-6 py-2 rounded-xl shadow transition-all border border-yellow-300/60 text-center animate-glow"
        >
          ← Back to Home
        </Link>
      </form>
      {/* Cinematic overlay vignette */}
      <div className="pointer-events-none absolute inset-0 z-40 rounded-3xl" style={{boxShadow: 'inset 0 0 180px 40px rgba(0,0,0,0.32)'}}></div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
        @keyframes pulse-slow { 0%, 100% { box-shadow: 0 0 0 0 rgba(255,221,51,0.3); } 50% { box-shadow: 0 0 60px 18px rgba(255,221,51,0.6); } }
        .animate-pulse-slow { animation: pulse-slow 3.5s infinite; }
        @keyframes glow { 0%, 100% { filter: drop-shadow(0 0 0px #ffe066); } 50% { filter: drop-shadow(0 0 32px #ffe066); } }
        .animate-glow { animation: glow 2.5s infinite; }
        @keyframes title-glow { 0%, 100% { text-shadow: 0 0 0px #ffe066, 0 0 0px #fff; } 50% { text-shadow: 0 0 32px #ffe066, 0 0 8px #fff; } }
        .animate-title-glow { animation: title-glow 2.5s infinite; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        @keyframes float-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(30px); } }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        @keyframes float-slow2 { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .animate-float-slow2 { animation: float-slow2 10s ease-in-out infinite; }
        @keyframes sparkle { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.7); } }
        .animate-sparkle { animation: sparkle 2.5s infinite; }
      `}</style>
    </div>
  )
}

export default RegisterPage
