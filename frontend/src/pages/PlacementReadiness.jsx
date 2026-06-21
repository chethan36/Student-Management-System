import { useEffect, useState } from 'react'
import { Briefcase, Download, FileSpreadsheet, Award, Target, BookOpen, AlertCircle, TrendingUp, Sparkles, Star } from 'lucide-react'
import api from '../services/api'
import { Loading, PageTitle, Stat } from '../components/UI'
import { useAuth } from '../context/AuthContext'
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

export default function PlacementReadiness() {
  const { user } = useAuth()
  const isStudent = user.role === 'STUDENT'

  const [studentData, setStudentData] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [studentList, setStudentList] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      if (isStudent) {
        const res = await api.get('/placement/student/mine')
        setStudentData(res.data)
      } else {
        const [resAn, resSt] = await Promise.all([
          api.get('/placement/analytics'),
          api.get('/admin/students') // Get list to review readiness
        ])
        setAnalyticsData(resAn.data)
        const sList = resSt.data.content || resSt.data
        setStudentList(sList)
        // Auto select first student for detail view
        if (sList.length > 0) {
          const detailRes = await api.get(`/placement/student/${sList[0].id}`)
          setSelectedStudent(detailRes.data)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectStudentDetail = async (id) => {
    try {
      const res = await api.get(`/placement/student/${id}`)
      setSelectedStudent(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <Loading />

  // Report downloads
  const downloadReport = async (format) => {
    try {
      const response = await api.get(`/reports/placement/${format}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `placement-readiness-report.${format === 'excel' ? 'xlsx' : 'pdf'}`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } catch (e) {
      console.error(e)
    }
  }

  // Helper score parser
  const getRadarData = (pr) => {
    if (!pr) return []
    return [
      { subject: 'Aptitude', score: parseFloat(pr.aptitudeScore), fullMark: 100 },
      { subject: 'DSA', score: parseFloat(pr.dsaScore), fullMark: 100 },
      { subject: 'Coding', score: parseFloat(pr.codingScore), fullMark: 100 },
      { subject: 'Communication', score: parseFloat(pr.communicationScore), fullMark: 100 },
      { subject: 'Resume', score: parseFloat(pr.resumeScore), fullMark: 100 }
    ]
  }

  const getReadinessPct = (pr) => {
    if (!pr) return 0
    const sum = parseFloat(pr.aptitudeScore) +
                parseFloat(pr.dsaScore) +
                parseFloat(pr.codingScore) +
                parseFloat(pr.communicationScore) +
                parseFloat(pr.resumeScore)
    return Math.round(sum / 5.0)
  }

  // Student Workspace View
  if (isStudent && studentData) {
    const readinessPct = getReadinessPct(studentData)
    const radarData = getRadarData(studentData)

    return (
      <div className="space-y-6">
        <PageTitle 
          title="Placement Intelligence" 
          subtitle="Your campus placement readiness score, skill analysis, and interview forecasts"
          action={
            <div className="flex gap-2">
              <button onClick={() => downloadReport('pdf')} className="btn flex items-center gap-1.5 text-xs">
                <Download size={14} /> Download PDF
              </button>
              <button onClick={() => downloadReport('excel')} className="btn-secondary flex items-center gap-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                <FileSpreadsheet size={14} /> Export Excel
              </button>
            </div>
          }
        />

        <div className="grid gap-6 md:grid-cols-3">
          {/* Stats */}
          <div className="card flex flex-col justify-between dark:bg-slate-900 border dark:border-slate-800">
            <h3 className="font-bold text-slate-850 dark:text-slate-150">Overall Readiness</h3>
            <div className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle className="text-slate-100 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="50" cx="64" cy="64"/>
                  <circle 
                    className="text-brand-600 dark:text-brand-400" 
                    strokeWidth="8" 
                    strokeDasharray={314.15} 
                    strokeDashoffset={314.15 - (314.15 * readinessPct) / 100} 
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="50" 
                    cx="64" 
                    cy="64"
                  />
                </svg>
                <span className="absolute text-2xl font-black">{readinessPct}%</span>
              </div>
              <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400 text-center">
                Placement Qualified Threshold: 75%
              </p>
            </div>
          </div>

          <Stat label="Interview Success Probability" value={`${studentData.interviewProbability}%`} detail="Based on historical mock profiles" />
          
          <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col justify-between">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" /> AI Career Recommendation
            </h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-xs mt-3 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">Recommended Path:</span>
                <p className="mt-1.5 text-slate-500 dark:text-slate-400 leading-relaxed">{studentData.skillsGap}</p>
              </div>
              <div className="mt-4 border-t pt-2 dark:border-slate-800 text-[10px] text-slate-400 dark:text-slate-500">
                Next Mock Interview is scheduled for July 15.
              </div>
            </div>
          </div>
        </div>

        {/* Radar Skills Map */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="card md:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-4">Placement Skill Mapping</h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" r="80%" data={radarData}>
                  <PolarGrid className="stroke-slate-100 dark:stroke-slate-850" />
                  <PolarAngleAxis dataKey="subject" className="text-[10px] font-bold text-slate-400" />
                  <PolarRadiusAxis domain={[0, 100]} />
                  <Radar name="My Score" dataKey="score" stroke="#1687d9" fill="#1687d9" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card dark:bg-slate-900 border dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-850 dark:text-slate-150">Skill Proficiency Levels</h3>
            <div className="space-y-3.5 text-xs">
              {[
                { label: 'Aptitude Reasoning', val: studentData.aptitudeScore, color: 'bg-emerald-500' },
                { label: 'Data Structures & Algorithms', val: studentData.dsaScore, color: 'bg-indigo-500' },
                { label: 'System Programming / Coding', val: studentData.codingScore, color: 'bg-violet-500' },
                { label: 'Verbal / Written Communication', val: studentData.communicationScore, color: 'bg-amber-500' },
                { label: 'Resume Score', val: studentData.resumeScore, color: 'bg-pink-500' }
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium text-slate-500">{s.label}</span>
                    <span className="font-bold">{s.val}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className={`${s.color} h-full`} style={{ width: `${s.val}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Admin & Faculty Workspace View
  if (analyticsData) {
    const listRadarData = selectedStudent ? getRadarData(selectedStudent) : []
    const listReadinessPct = selectedStudent ? getReadinessPct(selectedStudent) : 0

    return (
      <div className="space-y-6">
        <PageTitle 
          title="Placement Intelligence" 
          subtitle="Enterprise overview of student hiring readiness, radar mappings, and skill analytics"
          action={
            <div className="flex gap-2">
              <button onClick={() => downloadReport('pdf')} className="btn flex items-center gap-1 text-xs">
                <Download size={14} /> Export PDF Report
              </button>
              <button onClick={() => downloadReport('excel')} className="btn-secondary flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700">
                <FileSpreadsheet size={14} /> Export Excel
              </button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total Monitored" value={analyticsData.totalStudents} />
          <Stat label="Placement Ready Students" value={analyticsData.totalReady} detail="Readiness score >= 75%" />
          <Stat label="Average Placement Score" value={`${analyticsData.avgReadiness}%`} />
          <Stat label="Average Hire Probability" value={`${analyticsData.avgInterviewProbability}%`} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Students list */}
          <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col h-[500px]">
            <h3 className="font-bold text-slate-850 dark:text-slate-150 mb-3">Hiring Readiness Roster</h3>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {studentList.map(s => (
                <button 
                  key={s.id}
                  onClick={() => selectStudentDetail(s.id)}
                  className={`w-full text-left p-3 rounded-xl border text-xs flex justify-between items-center transition duration-150 ${
                    selectedStudent?.student.id === s.id 
                      ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/25' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <span className="font-bold block">{s.name}</span>
                    <span className="text-[10px] text-slate-400">{s.usn}</span>
                  </div>
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    {s.department.code}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Student details radar */}
          <div className="card lg:col-span-2 dark:bg-slate-900 border dark:border-slate-800 flex flex-col h-[500px] justify-between">
            {selectedStudent ? (
              <>
                <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedStudent.student.name}</h3>
                    <p className="text-[10px] text-slate-400">USN: {selectedStudent.student.usn} · Semester {selectedStudent.student.semester}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Placement Readiness</span>
                    <span className="text-xl font-black text-brand-600 dark:text-brand-400">{listReadinessPct}%</span>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 items-center flex-1 py-4">
                  <div className="h-64 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" r="75%" data={listRadarData}>
                        <PolarGrid className="stroke-slate-100 dark:stroke-slate-850" />
                        <PolarAngleAxis dataKey="subject" className="text-[9px] font-semibold text-slate-400" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar name="Candidate" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850">
                      <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Interview Success Forecast</span>
                      <p className="text-lg font-black text-emerald-500">{selectedStudent.interviewProbability}%</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850">
                      <span className="font-bold text-slate-400 block mb-1 text-[10px] uppercase tracking-wider">Skill Gap & Recommendations</span>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">{selectedStudent.skillsGap}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select a candidate to review placement dashboard details
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <Loading />
}
