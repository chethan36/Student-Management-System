import { useEffect, useState } from 'react'
import { GraduationCap, Users, BookOpen, Activity, Briefcase, AlertTriangle, Sparkles, TrendingUp } from 'lucide-react'
import api from '../services/api'
import { Loading, PageTitle, Stat, Empty } from '../components/UI'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [placementData, setPlacementData] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/placement/analytics').catch(() => null),
      api.get('/ai/dashboard').catch(() => null)
    ])
      .then(([dbRes, plRes, aiRes]) => {
        setData(dbRes.data)
        if (plRes) setPlacementData(plRes.data)
        if (aiRes) setAiData(aiRes.data)
      })
      .catch(err => console.error("Error fetching admin stats", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !data) return <Loading />

  // Process data for Recharts Bar Chart
  const institutionData = [
    { name: 'Students', count: data.students, fill: '#1687d9' },
    { name: 'Faculty', count: data.faculty, fill: '#8b5cf6' },
    { name: 'Courses', count: data.courses, fill: '#10b981' },
    { name: 'Departments', count: data.departments, fill: '#f59e0b' }
  ]

  // Skills radar chart data
  const radarData = placementData ? [
    { subject: 'Aptitude', score: parseFloat(placementData.avgAptitude) },
    { subject: 'DSA', score: parseFloat(placementData.avgDsa) },
    { subject: 'Coding', score: parseFloat(placementData.avgCoding) },
    { subject: 'Communication', score: parseFloat(placementData.avgCommunication) },
    { subject: 'Resume', score: parseFloat(placementData.avgResume) }
  ] : []

  const highRiskCount = aiData?.studentsAtRisk?.filter(s => s.risk === 'High').length || 0

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Campus Operations & Executive Intelligence" 
        subtitle="A live operational and predictive overview of the institution's departments, placement stats, and student risk assessments"
      />

      {/* Primary Operations Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Enrolled Students" value={data.students} detail="Across all branches & semesters" />
        <Stat label="Active Faculty Members" value={data.faculty} detail="Department instruction staff" />
        <Stat label="Syllabus Courses" value={data.courses} detail="Registered academic curricula" />
        <Stat label="Overall Attendance Rate" value={`${data.attendancePercentage}%`} detail="Institutional average attendance" />
      </div>

      {/* AI & Placement Predictive Stats */}
      {placementData && aiData && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card border border-brand-100 bg-brand-50/10 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-start p-5">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Average Placement score</span>
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400 mt-2 block">{placementData.avgReadiness}%</span>
            </div>
            <Briefcase size={20} className="text-brand-500" />
          </div>

          <div className="card border border-violet-100 bg-violet-50/10 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-start p-5">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Hiring readiness ratio</span>
              <span className="text-3xl font-black text-violet-600 dark:text-violet-400 mt-2 block">
                {placementData.totalReady} / {placementData.totalStudents}
              </span>
            </div>
            <Sparkles size={20} className="text-violet-500" />
          </div>

          <div className="card border border-rose-100 bg-rose-50/10 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-start p-5">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">High Detention risk count</span>
              <span className={`text-3xl font-black mt-2 block ${highRiskCount > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500'}`}>
                {highRiskCount} Students
              </span>
            </div>
            <AlertTriangle size={20} className="text-rose-500" />
          </div>

          <div className="card border border-emerald-100 bg-emerald-50/10 dark:bg-slate-900 dark:border-slate-800 flex justify-between items-start p-5">
            <div>
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Avg Interview Success</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-450 mt-2 block">{placementData.avgInterviewProbability}%</span>
            </div>
            <TrendingUp size={20} className="text-emerald-500" />
          </div>
        </div>
      )}

      {/* Analytics Charts Renders */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Campus Totals Bar Chart */}
        <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-2">Campus Operational Assets</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={institutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-slate-400" />
                <YAxis stroke="currentColor" className="text-[10px] text-slate-400" />
                <Tooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {institutionData.map((entry, index) => (
                    <rect key={`rect-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skills Radar Chart */}
        <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-2">Campus Average Skills Breakdown</h3>
          {radarData.length === 0 ? (
            <Empty>No skills data points calculated yet.</Empty>
          ) : (
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" r="70%" data={radarData}>
                  <PolarGrid className="stroke-slate-100 dark:stroke-slate-800" />
                  <PolarAngleAxis dataKey="subject" className="text-[10px] text-slate-400 font-bold" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="Campus Avg" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Roster of At-Risk Students for admin follow up */}
      {aiData && aiData.studentsAtRisk?.length > 0 && (
        <div className="card dark:bg-slate-900 border dark:border-slate-800">
          <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={17} className="text-rose-500" />
            Executive Attention: High/Medium Detention Risk Roster
          </h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>USN</th>
                  <th>Department</th>
                  <th>Attendance</th>
                  <th>Predicted Grade</th>
                  <th>Risk Tier</th>
                </tr>
              </thead>
              <tbody>
                {aiData.studentsAtRisk.map(s => (
                  <tr key={s.id}>
                    <td className="font-bold">{s.name}</td>
                    <td>{s.usn}</td>
                    <td>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                        {s.department}
                      </span>
                    </td>
                    <td>
                      <span className={`font-semibold ${s.attendance < 75 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                        {s.attendance}%
                      </span>
                    </td>
                    <td className="font-bold text-violet-600 dark:text-violet-400">{s.predictedGrade}</td>
                    <td>
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                        s.risk === 'High' 
                          ? 'bg-rose-55 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' 
                          : 'bg-amber-55 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {s.risk} ({Math.round(s.confidence * 100)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
