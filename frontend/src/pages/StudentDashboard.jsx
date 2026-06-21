import { useEffect, useState } from 'react'
import { Doughnut } from 'react-chartjs-2'
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Download, FileSpreadsheet, Brain, ArrowRight, User, BookOpen, Clock, Calendar, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { Empty, Loading, PageTitle, Stat } from '../components/UI'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'

ChartJS.register(ArcElement, Tooltip, Legend)

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null)
  const [courses, setCourses] = useState([])
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [assignments, setAssignments] = useState([])
  const [aiSummary, setAiSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/student/courses'),
      api.get('/student/attendance'),
      api.get('/student/marks'),
      api.get('/assignments/student/mine'),
      api.get('/ai/student/mine').catch(() => null)
    ])
      .then(([pRes, cRes, aRes, mRes, asRes, aiRes]) => {
        setProfile(pRes.data)
        setCourses(cRes.data)
        setAttendance(aRes.data)
        setMarks(mRes.data)
        setAssignments(asRes.data)
        if (aiRes) setAiSummary(aiRes.data)
      })
      .catch(err => console.error("Error loading dashboard data", err))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !profile) return <Loading />

  // Attendance metrics
  const present = attendance.filter(a => a.status === 'PRESENT').length
  const total = attendance.length
  const attendancePct = total ? Math.round(present * 100 / total) : 100

  // Exports Handlers
  const downloadPdfReport = async () => {
    try {
      const response = await api.get('/student/report-card', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'academic-report-card.pdf')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      console.error(e)
    }
  }

  const downloadExcelReport = async () => {
    try {
      const response = await api.get('/reports/performance/excel', { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'marks-performance.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      console.error(e)
    }
  }

  // Filter pending/upcoming assignments
  const upcomingAssignments = assignments.filter(item => !item.submitted)

  // Map marks to chronological performance trend chart data
  const trendData = marks.map((m, index) => ({
    name: `Exam ${index + 1} (${m.enrollment.course.code})`,
    Score: parseFloat((m.score / m.maxScore * 100).toFixed(1)),
    course: m.enrollment.course.code
  }))

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Student Academic Intelligence Portal" 
        subtitle="Your personalized academic health metrics, course schedules, and performance insights" 
        action={
          <div className="flex gap-2">
            <button className="btn flex items-center gap-1.5 text-xs" onClick={downloadPdfReport}>
              <Download size={14} /> PDF Report Card
            </button>
            <button className="btn-secondary flex items-center gap-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700" onClick={downloadExcelReport}>
              <FileSpreadsheet size={14} /> Excel Grades
            </button>
          </div>
        }
      />

      {/* Profile Card Summary Panel */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <div className="card md:col-span-2 bg-white dark:bg-slate-900 border dark:border-slate-800 flex items-center gap-4 py-5 px-6">
          <div className="h-16 w-16 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 grid place-items-center shrink-0">
            <User size={32} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate">{profile.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">USN: {profile.usn} · {profile.department?.name}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 truncate">{profile.user?.email}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="rounded-full bg-brand-50 dark:bg-brand-950 px-3 py-1 text-xs font-bold text-brand-700 dark:text-brand-300">
              Semester {profile.semester}
            </span>
          </div>
        </div>

        {/* GPA Quick Display Card */}
        <div className="card bg-white dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between py-5 px-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">Current Cumulative GPA</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-brand-600 dark:text-brand-400">{profile.previousGpa || '7.50'}</span>
              <span className="text-xs text-slate-400">/ 10.00</span>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 border-t pt-1.5 dark:border-slate-800">
            Qualifies for all placement tiers
          </div>
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Course Enrollment" value={courses.length} detail="Enrolled core & elective courses" />
        <Stat label="Attendance Percentage" value={`${attendancePct}%`} detail={`${present} / ${total} sessions attended`} />
        <Stat label="Total Assignments" value={assignments.length} detail={`${assignments.filter(item => item.submitted).length} tasks completed`} />
      </div>

      {/* AI Quick Insight Summary Card */}
      {aiSummary && (
        <div className="card bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-100 dark:from-slate-900 dark:to-slate-900/50 dark:border-slate-800 p-5 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500 rounded-xl text-white shrink-0">
              <Brain size={20} />
            </div>
            <div>
              <h4 className="font-extrabold text-slate-850 dark:text-slate-150">AI Academic Intelligence Insight</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Attendance Risk Status: <span className="font-bold text-emerald-600 dark:text-emerald-450">{aiSummary.riskPrediction?.risk}</span> · Predicted End-Term Grade: <span className="font-bold text-violet-600 dark:text-violet-400">{aiSummary.gradePrediction?.predicted_grade}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/student/profile')} 
            className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300 transition duration-150 shrink-0"
          >
            Explore AI details <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Main Grid Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Performance Trend Chart */}
        <section className="card lg:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-2">
            <TrendingUp size={18} className="text-brand-500" />
            Academic Performance Trend Chart
          </h2>
          {trendData.length === 0 ? (
            <Empty>No marks recorded to build trend chart.</Empty>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                  <XAxis dataKey="name" stroke="currentColor" className="text-[9px] text-slate-400" />
                  <YAxis domain={[0, 100]} stroke="currentColor" className="text-[9px] text-slate-400" />
                  <RechartsTooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px', fontSize: '10px' }} />
                  <Line type="monotone" dataKey="Score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Attendance Doughnut */}
        <section className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-[360px]">
          <h2 className="font-bold text-slate-900 dark:text-slate-100">Attendance Ratio</h2>
          <div className="h-56 flex items-center justify-center py-2">
            <Doughnut 
              data={{
                labels: ['Present', 'Absent'],
                datasets: [{
                  data: [present, total - present],
                  backgroundColor: ['#10b981', '#f87171'],
                  borderWidth: 0
                }]
              }} 
              options={{ cutout: '75%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } } }}
            />
          </div>
          <div className="text-[10px] text-slate-400 text-center">
            Min requirement for exams is 75%
          </div>
        </section>
      </div>

      {/* Upcoming Assignments & Enrolled Courses Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Assignments */}
        <section className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col max-h-[350px]">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-3">
            <Clock size={16} className="text-amber-500" /> Upcoming Assignments
          </h2>
          {upcomingAssignments.length === 0 ? (
            <Empty>Hooray! No pending assignments to submit.</Empty>
          ) : (
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {upcomingAssignments.map(item => (
                <div 
                  key={item.assignment.id} 
                  className="flex justify-between items-center p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:border-brand-500 transition duration-150 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-bold text-[10px] text-brand-650 dark:text-brand-400 uppercase block">
                      {item.assignment.course.code}
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">{item.assignment.title}</span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1"><Calendar size={11} /> Due: {item.assignment.dueDate}</span>
                  </div>
                  <button 
                    onClick={() => navigate('/student/assignments')}
                    className="btn py-1 px-3 text-[10px] bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shrink-0"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enrolled Courses */}
        <section className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col max-h-[350px]">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-3">
            <BookOpen size={16} className="text-brand-500" /> Enrolled Courses
          </h2>
          <div className="overflow-y-auto flex-1 space-y-2 pr-1">
            {courses.map(e => (
              <div 
                key={e.id} 
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs"
              >
                <div>
                  <span className="font-bold text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-wider block">
                    {e.course.code}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1 mt-0.5">{e.course.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Faculty</span>
                  <span className="font-bold text-slate-600 dark:text-slate-300">{e.course.faculty?.name || 'TBD'}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
