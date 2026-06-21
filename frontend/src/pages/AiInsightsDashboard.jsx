import { useEffect, useState } from 'react'
import { Download, AlertTriangle, Trophy, Brain, Activity, FileSpreadsheet, Sparkles } from 'lucide-react'
import api from '../services/api'
import { Loading, PageTitle, Stat } from '../components/UI'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function AiInsightsDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const res = await api.get('/ai/dashboard')
      setData(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading || !data) return <Loading />

  // Report Export triggers
  const downloadReport = async (type, format) => {
    try {
      const response = await api.get(`/reports/${type}/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${type}-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      console.error(`Exporting ${type} ${format} failed`, e)
    }
  }

  // Formatting Pie Chart Data
  const riskPieData = [
    { name: 'Low Risk', value: data.riskCounts.Low || 0, color: '#10b981' },
    { name: 'Medium Risk', value: data.riskCounts.Medium || 0, color: '#f59e0b' },
    { name: 'High Risk', value: data.riskCounts.High || 0, color: '#ef4444' }
  ].filter(item => item.value > 0)

  // Formatting Bar Chart Data
  const gradeBarData = Object.keys(data.gradeCounts).map(k => ({
    grade: k,
    'Students': data.gradeCounts[k]
  }))

  return (
    <div className="space-y-6">
      <PageTitle 
        title="AI Academic Intelligence" 
        subtitle="Institution-level machine learning models predicting detention risk and final term grades"
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative group inline-block">
              <button className="btn flex items-center gap-1 text-xs">
                <Download size={14} /> Export PDF Report
              </button>
              <div className="absolute right-0 top-full hidden group-hover:block bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-slate-800 dark:text-slate-200 min-w-40">
                <button onClick={() => downloadReport('students', 'pdf')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Student Directory</button>
                <button onClick={() => downloadReport('attendance', 'pdf')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Attendance Summary</button>
                <button onClick={() => downloadReport('performance', 'pdf')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Academic Performance</button>
                <button onClick={() => downloadReport('placement', 'pdf')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Placement Readiness</button>
                <button onClick={() => downloadReport('ai', 'pdf')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">AI Insights Summary</button>
              </div>
            </div>

            <div className="relative group inline-block">
              <button className="btn-secondary flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                <FileSpreadsheet size={14} /> Export Excel
              </button>
              <div className="absolute right-0 top-full hidden group-hover:block bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg shadow-xl py-1 z-50 text-slate-800 dark:text-slate-200 min-w-40">
                <button onClick={() => downloadReport('students', 'excel')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Student Directory</button>
                <button onClick={() => downloadReport('attendance', 'excel')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Attendance Summary</button>
                <button onClick={() => downloadReport('performance', 'excel')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Academic Performance</button>
                <button onClick={() => downloadReport('placement', 'excel')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">Placement Readiness</button>
                <button onClick={() => downloadReport('ai', 'excel')} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">AI Insights Summary</button>
              </div>
            </div>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Students at Risk" value={data.studentsAtRisk.length} detail="Requires immediate contact" />
        <Stat label="High Detention Risk" value={data.riskCounts.High || 0} detail="Attendance below 75%" />
        <Stat label="Top Performers (A+/A)" value={data.topPerformers.length} detail="High GPA prediction" />
        <div className="card flex items-center justify-between dark:bg-slate-900 border dark:border-slate-800">
          <div>
            <p className="text-sm font-medium text-slate-500">AI Platform Status</p>
            <p className="mt-2 text-2xl font-black text-emerald-500 flex items-center gap-1.5">
              <Sparkles size={20} className="animate-spin" style={{ animationDuration: '3s' }} /> Active
            </p>
          </div>
          <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400">
            <Brain size={24} />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Risk Distribution Chart */}
        <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between">
          <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-2 flex items-center gap-1.5">
            <Activity size={16} className="text-emerald-500" /> Attendance Detention Risk
          </h3>
          {riskPieData.length === 0 ? (
            <div className="py-20 text-center text-slate-400">No predictions recorded</div>
          ) : (
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Grade Distribution Bar Chart */}
        <div className="card md:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between">
          <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-2 flex items-center gap-1.5">
            <Brain size={16} className="text-violet-500" /> Grade Forecast Distribution
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeBarData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="grade" stroke="currentColor" className="text-[10px] text-slate-400" />
                <YAxis stroke="currentColor" className="text-[10px] text-slate-400" />
                <Tooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px' }} />
                <Bar dataKey="Students" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lists Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* At-Risk Students List */}
        <div className="card dark:bg-slate-900 border dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <AlertTriangle size={18} className="text-rose-500" /> Students Needing Intervention
            </h3>
            <span className="rounded bg-rose-50 px-2 py-0.5 text-xs text-rose-700 font-bold dark:bg-rose-950/50 dark:text-rose-300">
              {data.studentsAtRisk.length} active
            </span>
          </div>

          <div className="table-wrap max-h-96 overflow-y-auto">
            {data.studentsAtRisk.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No students are currently classified at risk.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>USN</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Att. %</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studentsAtRisk.map(s => (
                    <tr key={s.id}>
                      <td className="font-bold">{s.usn}</td>
                      <td>{s.name}</td>
                      <td>{s.department}</td>
                      <td>{s.attendance}%</td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          s.risk === 'High' 
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {s.risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Performers List */}
        <div className="card dark:bg-slate-900 border dark:border-slate-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Trophy size={18} className="text-amber-500" /> High Performing Candidates
            </h3>
            <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 font-bold dark:bg-emerald-950/50 dark:text-emerald-300">
              {data.topPerformers.length} candidates
            </span>
          </div>

          <div className="table-wrap max-h-96 overflow-y-auto">
            {data.topPerformers.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No students currently forecasted with an A/A+ grade.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>USN</th>
                    <th>Name</th>
                    <th>Dept</th>
                    <th>Forecasted Grade</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPerformers.map(s => (
                    <tr key={s.id}>
                      <td className="font-bold">{s.usn}</td>
                      <td>{s.name}</td>
                      <td>{s.department}</td>
                      <td>
                        <span className="bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 px-2 py-0.5 rounded text-xs font-bold">
                          {s.predictedGrade}
                        </span>
                      </td>
                      <td>{Math.round(s.confidence * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
