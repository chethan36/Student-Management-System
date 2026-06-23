import { useEffect, useState } from 'react'
import { Download, AlertTriangle, CheckCircle, HelpCircle, FileSpreadsheet, User, BookOpen, FileText, Activity } from 'lucide-react'
import api from '../services/api'
import { Loading, PageTitle } from '../components/UI'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [courses, setCourses] = useState([])
  const [aiInsights, setAiInsights] = useState(null)
  const [activeTab, setActiveTab] = useState('attendance')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [resProfile, resAtt, resMarks, resCourses, resAi] = await Promise.all([
        api.get('/student/profile'),
        api.get('/student/attendance'),
        api.get('/student/marks'),
        api.get('/student/courses'),
        api.get('/ai/student/mine')
      ])
      setProfile(resProfile.data)
      setAttendance(resAtt.data)
      setMarks(resMarks.data)
      setCourses(resCourses.data)
      setAiInsights(resAi.data)
    } catch (e) {
      console.error("Error fetching profile details", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading || !profile) return <Loading />

  // Reports download handlers
  const downloadReport = async (format) => {
    try {
      const response = await api.get(`/reports/students/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `student-profile-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      console.error("Report download failed", e)
    }
  }

  // Helper computations
  const totalClasses = attendance.length
  const presentClasses = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePct = totalClasses ? Math.round((presentClasses / totalClasses) * 100) : 100

  // Segregate marks
  const internalMarks = marks.filter(m => !m.assessment.toLowerCase().includes('assignment'))
  const assignments = marks.filter(m => m.assessment.toLowerCase().includes('assignment'))

  // Attendance Chart Data
  const attendanceData = courses.map(e => {
    const courseAtt = attendance.filter(a => a.enrollment.course.id === e.course.id)
    const total = courseAtt.length
    const present = courseAtt.filter(a => a.status === 'PRESENT').length
    return {
      name: e.course.code,
      'Attendance %': total ? Math.round((present / total) * 100) : 100
    }
  })

  // Grade Radar Data
  const gradeData = marks.map(m => ({
    subject: m.enrollment.course.code + ' (' + m.assessment + ')',
    score: parseFloat(m.score),
    fullMark: parseFloat(m.maxScore)
  }))

  return (
    <div className="space-y-6">
      <PageTitle 
        title="My profile" 
        subtitle="Detailed personal details, performance, and academic intelligence insights"
        action={
          <div className="flex gap-2">
            <button onClick={() => downloadReport('pdf')} className="btn flex items-center gap-1.5 text-xs">
              <Download size={14} /> PDF Profile
            </button>
            <button onClick={() => downloadReport('excel')} className="btn-secondary flex items-center gap-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
              <FileSpreadsheet size={14} /> Excel Summary
            </button>
          </div>
        }
      />

      {/* Profile Info Header Panel */}
      <div className="card grid gap-6 md:grid-cols-3 items-center bg-white dark:bg-slate-900 border dark:border-slate-800">
        <div className="flex items-center gap-4 md:col-span-2">
          <div className="h-20 w-20 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 grid place-items-center">
            <User size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">USN: {profile.usn}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-0.5 text-xs font-semibold">
                {profile.department.name}
              </span>
              <span className="rounded-full bg-brand-50 dark:bg-brand-950 px-3 py-0.5 text-xs font-semibold text-brand-700 dark:text-brand-300">
                Semester {profile.semester}
              </span>
            </div>
          </div>
        </div>
        <div className="border-t pt-4 md:border-t-0 md:pt-0 md:border-l md:pl-6 space-y-2 dark:border-slate-800 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Email:</span>
            <span className="font-semibold">{profile.user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 dark:text-slate-500 font-medium">Phone:</span>
            <span className="font-semibold">{profile.phone || '-'}</span>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b dark:border-slate-800 overflow-x-auto gap-2">
        {[
          { id: 'attendance', label: 'Attendance', icon: Activity },
          { id: 'marks', label: 'Academic Marks', icon: FileText },
          { id: 'courses', label: 'My Courses', icon: BookOpen },
          { id: 'ai', label: 'AI Intelligence Insights', icon: Brain }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition duration-150 shrink-0 ${
              activeTab === t.id 
                ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-4">
        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card space-y-4 dark:bg-slate-900 border dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Overall Attendance</h3>
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle className="text-slate-100 dark:text-slate-800" strokeWidth="10" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                    <circle 
                      className="text-brand-600 dark:text-brand-400" 
                      strokeWidth="10" 
                      strokeDasharray={314.15} 
                      strokeDashoffset={314.15 - (314.15 * attendancePct) / 100} 
                      strokeLinecap="round" 
                      stroke="currentColor" 
                      fill="transparent" 
                      r="50" 
                      cx="64" 
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-2xl font-black text-slate-900 dark:text-slate-100">{attendancePct}%</span>
                </div>
                <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 text-center">
                  Attended {presentClasses} out of {totalClasses} scheduled sessions
                </p>
              </div>
            </div>

            <div className="card lg:col-span-2 flex flex-col justify-between dark:bg-slate-900 border dark:border-slate-800">
              <h3 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Course-wise Attendance Rate</h3>
              {attendanceData.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No attendance records found</div>
              ) : (
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                      <XAxis dataKey="name" stroke="currentColor" className="text-[10px] text-slate-400 dark:text-slate-600" />
                      <YAxis domain={[0, 100]} stroke="currentColor" className="text-[10px] text-slate-400 dark:text-slate-600" />
                      <Tooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="Attendance %" fill="#1687d9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Marks Tab */}
        {activeTab === 'marks' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="card lg:col-span-2 space-y-4 dark:bg-slate-900 border dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Internal & Assignment Records</h3>
              {marks.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No marks entered yet</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Course</th>
                        <th>Assessment</th>
                        <th>Marks Secured</th>
                        <th>Grade Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marks.map(m => (
                        <tr key={m.id}>
                          <td className="font-bold">{m.enrollment.course.code}</td>
                          <td>{m.assessment}</td>
                          <td>{m.score} / {m.maxScore}</td>
                          <td>
                            <span className="rounded bg-brand-50 dark:bg-brand-950 px-2 py-0.5 text-xs font-black text-brand-700 dark:text-brand-300">
                              {m.grade || '-'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="card flex flex-col justify-between dark:bg-slate-900 border dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Grades Radar Graph</h3>
              {gradeData.length === 0 ? (
                <div className="py-10 text-center text-slate-400">No data points</div>
              ) : (
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" r="70%" data={gradeData}>
                      <PolarGrid className="stroke-slate-100 dark:stroke-slate-800" />
                      <PolarAngleAxis dataKey="subject" className="text-[9px] text-slate-400" />
                      <PolarRadiusAxis />
                      <Radar name="Scored Marks" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="card space-y-4 dark:bg-slate-900 border dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-slate-100">Enrolled Course Curriculum</h3>
            {courses.length === 0 ? (
              <div className="py-10 text-center text-slate-400">No courses assigned</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map(e => (
                  <div key={e.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 hover:border-brand-500 transition duration-150">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                      {e.course.code}
                    </span>
                    <h4 className="mt-1 font-extrabold text-slate-900 dark:text-slate-100">{e.course.name}</h4>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                      Credits: <span className="font-semibold text-slate-600 dark:text-slate-300">{e.course.credits}</span> · Semester {e.course.semester}
                    </p>
                    <div className="mt-4 border-t pt-3 dark:border-slate-800 flex justify-between items-center text-xs">
                      <span className="text-slate-400">Faculty:</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{e.course.faculty?.name || 'Pending assignment'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai' && aiInsights && (
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Attendance Risk Card */}
              <div className="card dark:bg-slate-900 border dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Activity size={18} className="text-brand-500" />
                  AI Attendance Risk Prediction
                </h3>
                
                <div className="mt-5 p-4 rounded-xl flex items-start gap-4 border border-transparent transition-all duration-300 bg-slate-50 dark:bg-slate-800/30">
                  {aiInsights.riskPrediction.risk === 'Low' && (
                    <>
                      <CheckCircle className="text-emerald-500 shrink-0" size={24} />
                      <div>
                        <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Attendance Safe</h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Your calculated probability of detention is extremely low. Keep attending classes regularly!
                        </p>
                      </div>
                    </>
                  )}
                  {aiInsights.riskPrediction.risk === 'Medium' && (
                    <>
                      <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                      <div>
                        <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">Needs Attention</h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Your attendance levels are currently bordering the margin limits. Focus on attending coming lectures.
                        </p>
                      </div>
                    </>
                  )}
                  {aiInsights.riskPrediction.risk === 'High' && (
                    <>
                      <AlertTriangle className="text-rose-500 shrink-0 animate-pulse" size={24} />
                      <div>
                        <h4 className="font-bold text-rose-800 dark:text-rose-300 text-sm">High Risk of Detention</h4>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          Attention required! Model suggests a high probability of detention. Contact department academic staff.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <span className="text-slate-400 block mb-1">Inference Engine:</span>
                    <span className="font-bold">Scikit-Learn Logistic Regression</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <span className="text-slate-400 block mb-1">Model Confidence:</span>
                    <span className="font-bold text-brand-500">
                      {Math.round(aiInsights.riskPrediction.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Grade Prediction Card */}
              <div className="card dark:bg-slate-900 border dark:border-slate-800">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain size={18} className="text-violet-500" />
                  AI Academic Grade Forecast
                </h3>

                <div className="mt-5 flex items-center gap-6 justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                  <div>
                    <h4 className="text-xs text-slate-400 dark:text-slate-500">Predicted Term End Grade</h4>
                    <p className="text-4xl font-black text-violet-600 dark:text-violet-400 mt-1">
                      {aiInsights.gradePrediction.predicted_grade}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-2">
                      Forecast computed from average score performance trend and class attendance rates.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Classifier Confidence</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                      {Math.round(aiInsights.gradePrediction.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <span className="text-slate-400 block mb-1">Classifier Engine:</span>
                    <span className="font-bold">Scikit-Learn Random Forest</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg">
                    <span className="text-slate-400 block mb-1">Performance Trend:</span>
                    <span className="font-bold text-emerald-500">Positive Alignment</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Predictions Probabilities Bar Chart */}
            <div className="card dark:bg-slate-900 border dark:border-slate-800">
              <h3 className="font-bold mb-4 text-slate-900 dark:text-slate-100">Class Probability Projections</h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={
                      aiInsights.gradePrediction.probabilities 
                        ? Object.keys(aiInsights.gradePrediction.probabilities).map(k => ({
                            grade: k,
                            'Probability Score': Math.round(aiInsights.gradePrediction.probabilities[k] * 100)
                          }))
                        : []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                    <XAxis dataKey="grade" stroke="currentColor" className="text-[10px] text-slate-400" />
                    <YAxis domain={[0, 100]} stroke="currentColor" className="text-[10px] text-slate-400" />
                    <Tooltip contentStyle={{ background: 'var(--tw-slate-900)', border: 'none', borderRadius: '8px' }} />
                    <Bar dataKey="Probability Score" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
