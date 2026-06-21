import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { GraduationCap, Users, Shield, Lock, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Alert } from '../components/UI'
import { errorMessage } from '../services/api'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // Selection states: 'STUDENT' | 'FACULTY' | 'ADMIN'
  const [roleType, setRoleType] = useState('STUDENT')
  
  // Credentials mapping for demo convenience
  const defaultCredentials = {
    STUDENT: { email: 'student@sms.local', password: 'password' },
    FACULTY: { email: 'faculty@sms.local', password: 'password' },
    ADMIN: { email: 'admin@sms.local', password: 'password' }
  }

  const [form, setForm] = useState(defaultCredentials.STUDENT)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    return <Navigate to={`/${user.role.toLowerCase()}`} />
  }

  // Handle role tab change
  const handleRoleTabChange = (role) => {
    setRoleType(role)
    setForm(defaultCredentials[role])
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const u = await login(form.email, form.password)
      navigate(`/${u.role.toLowerCase()}`)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // Dynamic icon and titles mapping
  const roleConfig = {
    STUDENT: {
      title: 'Student Portal',
      subtitle: 'Access grades, curriculum courses, and placement reports',
      icon: GraduationCap,
      color: 'bg-brand-500 text-white',
      demoText: 'student@sms.local / password'
    },
    FACULTY: {
      title: 'Faculty Workspace',
      subtitle: 'Manage curriculum attendance, submit exam marks, and evaluate tasks',
      icon: Users,
      color: 'bg-violet-500 text-white',
      demoText: 'faculty@sms.local / password'
    },
    ADMIN: {
      title: 'Admin Control Center',
      subtitle: 'Monitor institutional assets, departments roster, and AI operations',
      icon: Shield,
      color: 'bg-amber-500 text-white',
      demoText: 'admin@sms.local / password'
    }
  }

  const activeConfig = roleConfig[roleType]
  const IconComponent = activeConfig.icon

  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 p-4 transition-all duration-300">
      <div className="w-full max-w-md space-y-6">
        
        {/* Logo / Header Branding */}
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-brand-400 font-extrabold tracking-widest text-xs uppercase flex items-center gap-1">
              <Sparkles size={12} /> CampusCore AI
            </span>
          </div>
          <h2 className="text-xl font-bold text-white">Academic Intelligence Platform</h2>
        </div>

        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-2xl border dark:border-slate-800 space-y-6">
          
          {/* Tabs Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400">
            {Object.keys(roleConfig).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleTabChange(role)}
                className={`py-2.5 rounded-xl transition duration-200 capitalize ${
                  roleType === role
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {role.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Form Header */}
          <div className="flex items-center gap-4 border-b dark:border-slate-800 pb-5">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${activeConfig.color} shadow-lg transition-all duration-300`}>
              <IconComponent size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 transition-all duration-300">
                {activeConfig.title}
              </h1>
              <p className="mt-0.5 text-xs text-slate-450 dark:text-slate-500 leading-normal">
                {activeConfig.subtitle}
              </p>
            </div>
          </div>

          <Alert message={error} />

          {/* Login Form */}
          <form onSubmit={submit} className="space-y-4 font-semibold text-xs text-slate-500 dark:text-slate-400">
            <div>
              <label className="block mb-1.5">Email Address</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-brand-500"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="enter your email"
              />
            </div>

            <div>
              <label className="block mb-1.5">Password</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-brand-500"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={busy}
              type="submit"
              className={`w-full py-3 mt-2 rounded-xl text-white font-bold transition duration-200 flex items-center justify-center gap-1.5 shadow-md ${
                roleType === 'STUDENT' ? 'bg-brand-600 hover:bg-brand-700' :
                roleType === 'FACULTY' ? 'bg-violet-600 hover:bg-violet-700' :
                'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Lock size={14} />
              {busy ? 'Verifying Secure Token...' : 'Sign In'}
            </button>
          </form>

          {/* Demo helper info */}
          <div className="border-t dark:border-slate-800 pt-4 flex flex-col items-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Demo Account Details</span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-350 mt-1">
              {activeConfig.demoText}
            </span>
          </div>
        </div>
      </div>
    </main>
  )
}
