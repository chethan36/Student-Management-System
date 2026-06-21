import { useEffect, useState } from 'react'
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, Users, Brain, Sun, Moon, Briefcase, FileText } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NotificationCenter from '../components/NotificationCenter'
import AiAssistantChat from '../components/AiAssistantChat'

const links = {
  ADMIN: [
    ['/admin', 'Overview', LayoutDashboard],
    ['/admin/students', 'Students', GraduationCap],
    ['/admin/faculty', 'Faculty', Users],
    ['/admin/catalog', 'Catalog', BookOpen],
    ['/admin/ai', 'AI Intelligence', Brain],
    ['/admin/placement', 'Placement Intelligence', Briefcase]
  ],
  FACULTY: [
    ['/faculty', 'My courses', BookOpen],
    ['/faculty/students', 'Student search', Users],
    ['/faculty/assignments', 'Assignments', FileText],
    ['/faculty/ai', 'AI Intelligence', Brain],
    ['/faculty/placement', 'Placement Intelligence', Briefcase]
  ],
  STUDENT: [
    ['/student', 'My dashboard', LayoutDashboard],
    ['/student/profile', 'Profile', GraduationCap],
    ['/student/assignments', 'Assignments', FileText],
    ['/student/placement', 'Placement Intelligence', Briefcase]
  ]
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  const leave = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen lg:flex bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-150">
      <aside className="bg-brand-900 dark:bg-slate-900 p-5 text-white lg:min-h-screen lg:w-64 flex flex-col justify-between">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500">
              <GraduationCap />
            </div>
            <div>
              <b>Campus Core</b>
              <p className="text-xs text-slate-300">Student management</p>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto lg:flex-col">
            {links[user.role].map(([to, label, Icon]) => (
              <NavLink 
                key={to} 
                end 
                to={to} 
                className={({ isActive }) => 
                  `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                    isActive 
                      ? 'bg-white text-brand-900 dark:bg-brand-500 dark:text-white' 
                      : 'text-slate-200 hover:bg-white/10 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <button 
          onClick={leave} 
          className="mt-8 flex items-center gap-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 p-2 rounded-lg transition duration-150"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </aside>

      <main className="min-w-0 flex-1 flex flex-col">
        <header className="border-b dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 flex items-center justify-between shadow-sm transition-colors duration-150">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider text-xs">CampusCore AI</span>
          </div>
          <div className="flex items-center">
            {/* Dark Mode Toggle */}
            <button 
              onClick={() => setDark(!dark)} 
              className="mr-3 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition duration-150"
              aria-label="Toggle Dark Mode"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Notification Center */}
            <NotificationCenter />

            <div className="flex items-center gap-2 border-l pl-4 dark:border-slate-800">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="rounded-full bg-brand-50 dark:bg-brand-950/50 px-2 py-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
                {user.role}
              </span>
            </div>
          </div>
        </header>
        <div className="p-5 lg:p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
      <AiAssistantChat />
    </div>
  )
}

