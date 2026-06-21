import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Brain, Sparkles, User } from 'lucide-react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AiAssistantChat() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [history, setHistory] = useState([
    { sender: 'bot', text: 'Hello! I am your Campus AI assistant. I have access to academic metrics and intelligence charts. How can I help you today?' }
  ])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, open])

  const send = async (txt) => {
    const query = txt || message
    if (!query.trim()) return

    setHistory(prev => [...prev, { sender: 'user', text: query }])
    setMessage('')
    setLoading(true)

    try {
      const res = await api.post('/ai/assistant/chat', { message: query })
      setHistory(prev => [...prev, { sender: 'bot', text: res.data.response }])
    } catch (e) {
      console.error(e)
      setHistory(prev => [...prev, { sender: 'bot', text: 'Sorry, I encountered an error compiling response context. Please verify that port 8080 and port 5001 are active.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') send()
  }

  const suggestions = [
    { label: 'At-Risk Candidates', query: 'Which students are at-risk?' },
    { label: 'Low Attendance', query: 'Show students below 75% attendance' },
    { label: 'Java Code Quiz', query: 'Generate Java quiz' },
    { label: 'Top Performers', query: 'Show top performers' }
  ]

  if (!open) {
    return (
      <button 
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-2xl hover:bg-brand-900 hover:scale-105 active:scale-95 transition-all duration-200 group"
        title="Campus AI Assistant"
      >
        <Brain size={24} className="group-hover:rotate-12 transition-transform duration-200" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-brand-500"></span>
        </span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col h-[500px] transition-all duration-200">
      {/* Header */}
      <div className="bg-brand-900 dark:bg-slate-950 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-brand-400" />
          <div>
            <h4 className="font-extrabold text-sm flex items-center gap-1">
              Campus AI Assistant <Sparkles size={12} className="text-amber-400 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-400">Context-Aware Academic Engine</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-lg transition duration-150">
          <X size={16} />
        </button>
      </div>

      {/* Suggestion tags */}
      <div className="p-2 bg-slate-50 dark:bg-slate-950 border-b dark:border-slate-800 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {suggestions.map((s, idx) => (
          <button 
            key={idx}
            onClick={() => send(s.query)}
            className="rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:border-brand-500 transition duration-150 shrink-0"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
        {history.map((h, i) => (
          <div key={i} className={`flex gap-2.5 max-w-[85%] ${h.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-xs ${
              h.sender === 'user' 
                ? 'bg-brand-500 text-white' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}>
              {h.sender === 'user' ? <User size={14} /> : <Brain size={14} />}
            </div>
            <div className={`rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
              h.sender === 'user'
                ? 'bg-brand-600 text-white border-transparent'
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {h.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 max-w-[85%]">
            <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <Brain size={14} />
            </div>
            <div className="rounded-2xl p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex gap-1 items-center">
              <span className="h-2 w-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce"></span>
              <span className="h-2 w-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="h-2 w-2 bg-slate-400 dark:bg-slate-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
        <input 
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a campus or analytics question..."
          className="flex-1 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-brand-50"
        />
        <button 
          onClick={() => send()}
          className="bg-brand-600 hover:bg-brand-900 text-white rounded-xl p-2 shrink-0 transition duration-150"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
