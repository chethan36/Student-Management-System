import { useEffect, useState } from 'react'
import { Award, BookOpen, Users, AlertTriangle, CheckCircle, Brain, Calendar, FileText, Sparkles, TrendingUp } from 'lucide-react'
import api, { errorMessage } from '../services/api'
import { Alert, Empty, Loading, PageTitle, Stat } from '../components/UI'

export default function FacultyDashboard() {
  const [courses, setCourses] = useState(null)
  const [selected, setSelected] = useState(null)
  const [roster, setRoster] = useState([])
  const [statuses, setStatuses] = useState({})
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [mark, setMark] = useState({ enrollmentId: '', assessment: 'Internal 1', score: '', maxScore: '50', grade: '' })
  const [aiDashboard, setAiDashboard] = useState(null)
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const [coursesRes, aiRes] = await Promise.all([
        api.get('/faculty/courses'),
        api.get('/ai/dashboard')
      ])
      setCourses(coursesRes.data)
      setAiDashboard(aiRes.data)
    } catch (e) {
      console.error(e)
      setError('Failed to retrieve faculty dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCourse = async (c) => {
    setSelected(c)
    setError('')
    setMessage('')
    try {
      const { data } = await api.get(`/faculty/courses/${c.id}/students`)
      setRoster(data)
      setStatuses(Object.fromEntries(data.map(e => [e.id, 'PRESENT'])))
      // Pre-fill student dropdown for marks upload
      if (data.length > 0) {
        setMark(prev => ({ ...prev, enrollmentId: data[0].id.toString() }))
      } else {
        setMark(prev => ({ ...prev, enrollmentId: '' }))
      }
    } catch (e) {
      setError('Failed to fetch course student roster.')
    }
  }

  const handleAttendanceSubmit = async () => {
    try {
      await api.post(`/faculty/courses/${selected.id}/attendance`, {
        date,
        records: roster.map(e => ({ enrollmentId: e.id, status: statuses[e.id] }))
      })
      setMessage('Attendance roster saved successfully!')
      setError('')
      // Refresh AI data to update predictions
      const aiRes = await api.get('/ai/dashboard')
      setAiDashboard(aiRes.data)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  const handleSaveMark = async (e) => {
    e.preventDefault()
    if (!mark.enrollmentId) {
      setError('Please select a student.')
      return
    }
    try {
      await api.post('/faculty/marks', {
        ...mark,
        enrollmentId: parseInt(mark.enrollmentId),
        score: parseFloat(mark.score),
        maxScore: parseFloat(mark.maxScore)
      })
      setMessage('Academic marks uploaded and saved!')
      setError('')
      // Reset form
      setMark({
        enrollmentId: roster.length > 0 ? roster[0].id.toString() : '',
        assessment: 'Internal 1',
        score: '',
        maxScore: '50',
        grade: ''
      })
      // Refresh AI
      const aiRes = await api.get('/ai/dashboard')
      setAiDashboard(aiRes.data)
    } catch (e) {
      setError(errorMessage(e))
    }
  }

  if (loading || !courses) return <Loading />

  const highRiskStudents = aiDashboard?.studentsAtRisk?.filter(s => s.risk === 'High') || []
  const totalStudentsMonitored = aiDashboard?.riskCounts 
    ? (aiDashboard.riskCounts.Low + aiDashboard.riskCounts.Medium + aiDashboard.riskCounts.High) 
    : 0

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Faculty Academic Intelligence & Portal" 
        subtitle="Submit daily class attendance, log student evaluation marks, and track AI detention risk alerts"
      />

      <Alert message={error} />
      {message && <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{message}</div>}

      {/* Aggregate Overview KPI Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Assigned Curriculum Courses" value={courses.length} detail="Active syllabus subjects" />
        <Stat label="Monitored Students" value={totalStudentsMonitored} detail="Enrolled candidates in courses" />
        <Stat label="High Risk Alerts" value={highRiskStudents.length} detail="Detention probability > 75%" />
        <Stat label="Top Performers" value={aiDashboard?.topPerformers?.length || 0} detail="Predicted to score A / A+ grades" />
      </div>

      {/* AI Intelligence Insights Alerts & Charts */}
      {aiDashboard && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Risk Alerts */}
          <div className="card lg:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col h-[350px]">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 mb-3">
              <AlertTriangle className="text-amber-500 shrink-0" size={18} />
              AI Academic & Attendance Risk Alerts
            </h3>
            
            {aiDashboard.studentsAtRisk?.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                <CheckCircle className="text-emerald-500 mr-1.5" size={16} /> All students satisfy the safe academic margins.
              </div>
            ) : (
              <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                {aiDashboard.studentsAtRisk.map(s => (
                  <div 
                    key={s.id} 
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                        <span className="text-[10px] text-slate-400">USN: {s.usn}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Attendance: <span className="font-bold text-slate-700 dark:text-slate-300">{s.attendance}%</span> · Projected Grade: <span className="font-bold text-violet-600 dark:text-violet-400">{s.predictedGrade}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                        s.risk === 'High' 
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 animate-pulse' 
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {s.risk} Risk ({Math.round(s.confidence * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Predictor Engine Metadata */}
          <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-[350px]">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Brain size={18} className="text-violet-500" />
              Model Predictor Specs
            </h3>
            
            <div className="space-y-4 my-auto text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850">
                <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-0.5">XGBoost Classifier Engine</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                  Identifies detention status using cumulative GPA, assignment submissions status, and mock DSA/aptitude tests.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850">
                <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wider mb-0.5">Predictive Rationale</span>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                  Enables early academic intervention for faculty before term-end examinations.
                </p>
              </div>
            </div>

            <div className="text-[10px] text-slate-450 dark:text-slate-500 border-t pt-2 dark:border-slate-800 flex justify-between items-center">
              <span>Model accuracy: ~94.8%</span>
              <span className="flex items-center gap-0.5 text-brand-500 font-bold"><Sparkles size={11} /> Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid List */}
      <div className="card dark:bg-slate-900 border dark:border-slate-800 space-y-4">
        <h3 className="font-bold text-slate-850 dark:text-slate-150">My Assigned Curriculum Courses</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(c => (
            <button 
              onClick={() => openCourse(c)} 
              key={c.id} 
              className={`card text-left transition duration-150 hover:border-brand-500 p-5 ${
                selected?.id === c.id 
                  ? 'ring-2 ring-brand-500 border-brand-500 bg-brand-50/10 dark:bg-brand-950/20' 
                  : 'border-slate-100 dark:border-slate-800'
              }`}
            >
              <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{c.code}</span>
              <h4 className="mt-1.5 font-bold text-slate-900 dark:text-slate-100">{c.name}</h4>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                Semester {c.semester} · {c.credits} Credits
              </p>
            </button>
          ))}
        </div>
        {courses.length === 0 && <Empty>No courses are assigned to your schedule.</Empty>}
      </div>

      {/* Selected Course Workspaces (Attendance & Marks) */}
      {selected && (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Attendance Roster Panel */}
          <section className="card lg:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="mb-4 flex flex-wrap justify-between items-center gap-3 border-b pb-3 dark:border-slate-850">
                <h3 className="font-bold text-slate-850 dark:text-slate-150 flex items-center gap-1.5">
                  <Calendar size={16} className="text-brand-500" />
                  Attendance Roster ({selected.code})
                </h3>
                <input 
                  type="date" 
                  className="rounded-xl border border-slate-200 bg-white dark:bg-slate-850 dark:border-slate-700 p-2 text-xs font-semibold"
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              {roster.length === 0 ? (
                <Empty>No students are currently enrolled in this subject course.</Empty>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>USN</th>
                        <th>Student Name</th>
                        <th className="text-right">Attendance Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map(e => (
                        <tr key={e.id}>
                          <td className="font-bold text-slate-450 dark:text-slate-500">{e.student.usn}</td>
                          <td>{e.student.name}</td>
                          <td className="text-right">
                            <select 
                              className="rounded-lg border border-slate-250 bg-white dark:bg-slate-800 dark:border-slate-700 p-1.5 text-xs font-bold"
                              value={statuses[e.id] || 'PRESENT'} 
                              onChange={x => setStatuses({ ...statuses, [e.id]: x.target.value })}
                            >
                              <option value="PRESENT">PRESENT</option>
                              <option value="ABSENT">ABSENT</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <button 
              className="btn mt-4 w-full bg-brand-500 hover:bg-brand-650 text-white font-bold py-2.5 rounded-xl transition duration-150" 
              onClick={handleAttendanceSubmit} 
              disabled={!roster.length}
            >
              Save Attendance Record
            </button>
          </section>

          {/* Marks Upload Panel */}
          <form onSubmit={handleSaveMark} className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between h-fit">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-slate-150 flex items-center gap-1.5 border-b pb-3 dark:border-slate-850 mb-4">
                <FileText size={16} className="text-violet-500" />
                Upload Academic Marks
              </h3>

              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="block text-slate-450 dark:text-slate-500 mb-1">Select Student</label>
                  <select 
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5" 
                    value={mark.enrollmentId} 
                    onChange={e => setMark({ ...mark, enrollmentId: e.target.value })} 
                    required
                  >
                    <option value="">Select student...</option>
                    {roster.map(e => (
                      <option key={e.id} value={e.id.toString()}>{e.student.name} ({e.student.usn})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 dark:text-slate-500 mb-1">Assessment Title</label>
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5" 
                    value={mark.assessment} 
                    onChange={e => setMark({ ...mark, assessment: e.target.value })}
                    required
                    placeholder="e.g. Internal 1, Quiz 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-450 dark:text-slate-500 mb-1">Score Secured</label>
                    <input 
                      className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5" 
                      type="number" 
                      step="0.01" 
                      placeholder="Score" 
                      value={mark.score} 
                      onChange={e => setMark({ ...mark, score: e.target.value })} 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 dark:text-slate-500 mb-1">Maximum Points</label>
                    <input 
                      className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5" 
                      type="number" 
                      step="0.01" 
                      placeholder="Out of" 
                      value={mark.maxScore} 
                      onChange={e => setMark({ ...mark, maxScore: e.target.value })} 
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-450 dark:text-slate-500 mb-1">Grade (Optional)</label>
                  <input 
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5" 
                    placeholder="e.g. A, B+, S" 
                    value={mark.grade} 
                    onChange={e => setMark({ ...mark, grade: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <button className="btn w-full mt-5 bg-violet-600 hover:bg-violet-750 text-white font-bold py-2.5 rounded-xl transition duration-150">
              Save Academic Marks
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
