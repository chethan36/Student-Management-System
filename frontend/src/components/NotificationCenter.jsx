import { useEffect, useState, useRef } from 'react'
import { Bell, Check, Trash } from 'lucide-react'
import api from '../services/api'

export default function NotificationCenter() {
  const [list, setList] = useState([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const load = async () => {
    try {
      const [resList, resCount] = await Promise.all([
        api.get('/notifications'),
        api.get('/notifications/unread-count')
      ])
      setList(resList.data)
      setUnread(resCount.data.count)
    } catch (e) {
      console.error("Failed to load notifications", e)
    }
  }

  useEffect(() => {
    load()
    // Poll every 30 seconds for new alerts
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all')
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const badgeColor = (type) => {
    if (type === 'DANGER') return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
    if (type === 'WARNING') return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
  }

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)} 
        className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition duration-150"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900 z-50">
          <div className="mb-3 flex items-center justify-between border-b pb-2 dark:border-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Notifications</h3>
            {unread > 0 && (
              <button 
                onClick={markAllAsRead} 
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300 flex items-center gap-1"
              >
                <Check size={14} /> Clear all
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {list.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
            ) : (
              list.map((n) => (
                <div 
                  key={n.id} 
                  className={`flex flex-col gap-1 rounded-xl p-2.5 text-xs transition border ${
                    !n.read 
                      ? 'bg-slate-50/50 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800' 
                      : 'bg-white border-transparent dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeColor(n.type)}`}>
                      {n.type}
                    </span>
                    {!n.read && (
                      <button 
                        onClick={() => markAsRead(n.id)} 
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Mark as read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 leading-normal">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
