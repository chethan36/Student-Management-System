import { useEffect, useState } from 'react'
import { FileText, Calendar, Plus, User, Award, CheckCircle, AlertCircle, Clock, Sparkles, Send, FileCode } from 'lucide-react'
import api from '../services/api'
import { Loading, PageTitle, Empty, Alert } from '../components/UI'
import { useAuth } from '../context/AuthContext'

export default function AssignmentManagement() {
  const { user } = useAuth()
  const isStudent = user.role === 'STUDENT'
  const isFaculty = user.role === 'FACULTY'

  // Common states
  const [courses, setCourses] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Faculty specific states
  const [submissions, setSubmissions] = useState([])
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  
  // Form states
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newMaxScore, setNewMaxScore] = useState('100')
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [gradeImprovement, setGradeImprovement] = useState('')

  // Student specific states
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitAssignmentId, setSubmitAssignmentId] = useState(null)
  const [submitFilePath, setSubmitFilePath] = useState('')

  // Fetch initial data
  const loadInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      if (isStudent) {
        // Load student assignments directly
        const res = await api.get('/assignments/student/mine')
        setAssignments(res.data)
      } else if (isFaculty) {
        // Load faculty courses
        const res = await api.get('/faculty/courses')
        setCourses(res.data)
        if (res.data.length > 0) {
          setSelectedCourseId(res.data[0].id)
          // Load assignments for first course
          const resAssign = await api.get(`/assignments/course/${res.data[0].id}`)
          setAssignments(resAssign.data)
        }
      }
    } catch (e) {
      console.error(e)
      setError('Failed to load assignments data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  // Handle course select change for faculty
  const handleCourseChange = async (courseId) => {
    setSelectedCourseId(courseId)
    setSelectedAssignment(null)
    setSubmissions([])
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/assignments/course/${courseId}`)
      setAssignments(res.data)
    } catch (e) {
      console.error(e)
      setError('Failed to fetch assignments for selected course.')
    } finally {
      setLoading(false)
    }
  }

  // Handle viewing submissions for faculty
  const viewSubmissions = async (assign) => {
    setSelectedAssignment(assign)
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/assignments/${assign.id}/submissions`)
      setSubmissions(res.data)
    } catch (e) {
      console.error(e)
      setError('Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }

  // Create Assignment (Faculty)
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!selectedCourseId || !newTitle || !newDueDate || !newMaxScore) {
      setError('Please fill in all required fields.')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/assignments', {
        courseId: parseInt(selectedCourseId),
        title: newTitle,
        description: newDesc,
        dueDate: newDueDate,
        maxScore: parseFloat(newMaxScore)
      })
      setAssignments([res.data, ...assignments])
      setSuccess('Assignment created successfully!')
      setShowCreateModal(false)
      // Reset form
      setNewTitle('')
      setNewDesc('')
      setNewDueDate('')
      setNewMaxScore('100')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to create assignment.')
    }
  }

  // Grade Submission (Faculty)
  const handleGradeSubmission = async (e) => {
    e.preventDefault()
    if (!selectedSubmission || !gradeScore) {
      setError('Please enter a grade score.')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await api.put(`/assignments/submissions/${selectedSubmission.id}/grade`, {
        score: parseFloat(gradeScore),
        feedback: gradeFeedback,
        improvementSuggestions: gradeImprovement
      })
      // Update submissions list
      setSubmissions(submissions.map(s => s.id === res.data.id ? res.data : s))
      setSuccess('Submission graded successfully!')
      setShowGradeModal(false)
      // Reset
      setSelectedSubmission(null)
      setGradeScore('')
      setGradeFeedback('')
      setGradeImprovement('')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to submit grade evaluation.')
    }
  }

  // Submit Assignment (Student)
  const handleSubmitAssignment = async (e) => {
    e.preventDefault()
    if (!submitFilePath) {
      setError('Please enter a submission file path or URL.')
      return
    }
    setError('')
    setSuccess('')
    try {
      const res = await api.post('/assignments/submit', {
        assignmentId: submitAssignmentId,
        filePath: submitFilePath
      })
      // Refresh mine assignments
      const resAssign = await api.get('/assignments/student/mine')
      setAssignments(resAssign.data)
      setSuccess('Assignment submitted successfully!')
      setShowSubmitModal(false)
      setSubmitFilePath('')
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to submit assignment.')
    }
  }

  if (loading && assignments.length === 0 && courses.length === 0) return <Loading />

  return (
    <div className="space-y-6">
      <PageTitle 
        title="Assignments Hub" 
        subtitle={isStudent ? "View curriculum assignments, check your evaluation feedback, and submit tasks" : "Manage course assignments, view student uploads, and run AI evaluations"}
        action={
          isFaculty && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn flex items-center gap-1.5 text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-4 rounded-xl"
            >
              <Plus size={16} /> Create Assignment
            </button>
          )
        }
      />

      <Alert message={error} />
      {success && <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">{success}</div>}

      {/* FACULTY INTERFACE */}
      {isFaculty && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Courses & Assignments List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card dark:bg-slate-900 border dark:border-slate-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Select Course</label>
              <select 
                value={selectedCourseId} 
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 text-xs font-semibold"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col max-h-[500px]">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5">
                <FileText size={16} className="text-brand-500" />
                Course Assignments
              </h3>
              {assignments.length === 0 ? (
                <Empty>No assignments created for this course yet.</Empty>
              ) : (
                <div className="overflow-y-auto flex-1 space-y-2 pr-1">
                  {assignments.map(a => (
                    <button
                      key={a.id}
                      onClick={() => viewSubmissions(a)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition duration-150 flex flex-col gap-1.5 ${
                        selectedAssignment?.id === a.id 
                          ? 'border-brand-500 bg-brand-50/20 dark:bg-brand-950/20' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{a.title}</span>
                        <span className="font-semibold text-slate-500">{a.maxScore} pts</span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-2">{a.description || 'No description provided.'}</p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Calendar size={12} /> Due: {a.dueDate}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submissions Panel */}
          <div className="lg:col-span-2">
            {selectedAssignment ? (
              <div className="card dark:bg-slate-900 border dark:border-slate-800 flex flex-col h-[588px]">
                <div className="border-b pb-3 dark:border-slate-800 mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedAssignment.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Due: {selectedAssignment.dueDate} · Max Score: {selectedAssignment.maxScore} points</p>
                  </div>
                  <div className="rounded bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-700 dark:bg-brand-950/50 dark:text-brand-300">
                    {submissions.length} Submission(s)
                  </div>
                </div>

                {submissions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm">
                    <Clock size={40} className="text-slate-300 dark:text-slate-700 mb-2" />
                    No students have submitted this assignment yet.
                  </div>
                ) : (
                  <div className="overflow-y-auto flex-1 space-y-3.5 pr-1">
                    {submissions.map(sub => (
                      <div key={sub.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-xs flex items-center gap-1 text-slate-800 dark:text-slate-200">
                              <User size={13} className="text-slate-400" />
                              {sub.student.name}
                            </span>
                            <span className="text-[10px] text-slate-400">USN: {sub.student.usn}</span>
                          </div>
                          <div>
                            {sub.status === 'EVALUATED' ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <CheckCircle size={10} /> Evaluated: {sub.score} / {selectedAssignment.maxScore}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 animate-pulse">
                                <Clock size={10} /> Awaiting Grading
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-xs bg-slate-100/50 dark:bg-slate-950 p-2.5 rounded-lg border dark:border-slate-850">
                          <span className="font-bold text-slate-400 text-[10px] uppercase block tracking-wider mb-1">Submitted Resource</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 text-[11px] overflow-hidden truncate">
                            <FileCode size={13} className="text-slate-400" />
                            {sub.filePath}
                          </span>
                        </div>

                        {/* Plagiarism Similarity Check */}
                        {sub.similarityScore && (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">Similarity Plagiarism Check:</span>
                            <span className={`font-bold flex items-center gap-1 ${
                              parseFloat(sub.similarityScore) > 20 ? 'text-rose-500' : 'text-emerald-500'
                            }`}>
                              <Sparkles size={12} /> {sub.similarityScore}% similarity
                            </span>
                          </div>
                        )}

                        {/* Evaluation Details */}
                        {sub.status === 'EVALUATED' && (
                          <div className="grid gap-3 sm:grid-cols-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                            <div>
                              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">Faculty Feedback</span>
                              <p className="mt-1 text-slate-600 dark:text-slate-400 italic">"{sub.feedback || 'None provided'}"</p>
                            </div>
                            <div>
                              <span className="font-bold text-slate-400 block text-[9px] uppercase tracking-wider">AI/Faculty Improvement Actions</span>
                              <p className="mt-1 text-slate-600 dark:text-slate-400 font-medium">{sub.improvementSuggestions || 'None'}</p>
                            </div>
                          </div>
                        )}

                        {/* Grading Action */}
                        {sub.status !== 'EVALUATED' && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub)
                                setGradeScore(selectedAssignment.maxScore.toString())
                                setShowGradeModal(true)
                              }}
                              className="btn text-[10px] py-1 px-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-lg"
                            >
                              Evaluate & Grade Submission
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="card dark:bg-slate-900 border dark:border-slate-800 h-[588px] flex items-center justify-center text-slate-400 text-sm">
                Select an assignment from the roster to view submission reports and apply grades.
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT INTERFACE */}
      {isStudent && (
        <div className="card dark:bg-slate-900 border dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-slate-880 dark:text-slate-100">My Curriculum Assignments</h3>
          {assignments.length === 0 ? (
            <Empty>You do not have any assignments assigned to your courses.</Empty>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map(item => {
                const a = item.assignment
                const sub = item.submission
                const submitted = item.submitted

                return (
                  <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50 flex flex-col justify-between h-[280px]">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                          {a.course.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Max: {a.maxScore} pts
                        </span>
                      </div>
                      <h4 className="mt-1.5 font-extrabold text-slate-900 dark:text-slate-100 line-clamp-1">{a.title}</h4>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500 line-clamp-3">{a.description || 'No description provided.'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t dark:border-slate-850 space-y-3">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400 flex items-center gap-1"><Calendar size={11} /> Due: {a.dueDate}</span>
                        <span>
                          {submitted ? (
                            sub.status === 'EVALUATED' ? (
                              <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Award size={10} /> Graded: {sub.score}
                              </span>
                            ) : (
                              <span className="text-amber-500 font-bold bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">
                                Pending Grade
                              </span>
                            )
                          ) : (
                            <span className="text-rose-500 font-bold bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                              Not Submitted
                            </span>
                          )}
                        </span>
                      </div>

                      {submitted ? (
                        <div className="text-[10px] bg-slate-100/50 dark:bg-slate-900 p-2 rounded border dark:border-slate-800 space-y-1">
                          <span className="text-slate-400 block font-semibold">Similarity: {sub.similarityScore}%</span>
                          {sub.status === 'EVALUATED' && (
                            <>
                              <p className="text-slate-600 dark:text-slate-400 italic">Feedback: "{sub.feedback}"</p>
                              <p className="text-slate-500 dark:text-slate-400">Tips: {sub.improvementSuggestions}</p>
                            </>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSubmitAssignmentId(a.id)
                            setShowSubmitModal(true)
                          }}
                          className="w-full text-center py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs rounded-lg transition"
                        >
                          Submit Assignment
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL (FACULTY) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Plus className="text-brand-500" /> Create Assignment
            </h3>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Select Course</label>
                <select 
                  value={selectedCourseId} 
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Title *</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. DSA Quiz 1: LinkedLists"
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Description</label>
                <textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Assignment guidelines, tasks, and reference links..."
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Due Date *</label>
                  <input 
                    type="date" 
                    value={newDueDate} 
                    onChange={(e) => setNewDueDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Max Score *</label>
                  <input 
                    type="number" 
                    value={newMaxScore} 
                    onChange={(e) => setNewMaxScore(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="btn-secondary py-2 px-4 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADE EVALUATION MODAL (FACULTY) */}
      {showGradeModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Award className="text-violet-500" /> Grade Evaluation
            </h3>
            <div className="mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border dark:border-slate-850">
              <span className="font-semibold text-slate-400 block text-[10px] uppercase">Candidate</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{selectedSubmission.student.name}</span>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Score * (Max {selectedAssignment.maxScore})</label>
                <input 
                  type="number" 
                  step="0.01"
                  max={selectedAssignment.maxScore}
                  value={gradeScore} 
                  onChange={(e) => setGradeScore(e.target.value)}
                  required
                  placeholder={`0 - ${selectedAssignment.maxScore}`}
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Feedback Comments</label>
                <textarea 
                  value={gradeFeedback} 
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  placeholder="Code review, positive aspects of logic..."
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 font-normal"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">AI-Powered / Faculty Action Steps for Improvement</label>
                <textarea 
                  value={gradeImprovement} 
                  onChange={(e) => setGradeImprovement(e.target.value)}
                  placeholder="Topics to study, syntax optimizations..."
                  rows="2"
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5 font-normal"
                />
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowGradeModal(false)}
                  className="btn-secondary py-2 px-4 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-750 text-white font-bold"
                >
                  Grade Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT ASSIGNMENT MODAL (STUDENT) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              <Send className="text-brand-500" /> Submit Assignment
            </h3>
            <form onSubmit={handleSubmitAssignment} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-400 mb-1">Submission File / Repository Path *</label>
                <input 
                  type="text" 
                  value={submitFilePath} 
                  onChange={(e) => setSubmitFilePath(e.target.value)}
                  required
                  placeholder="e.g. /submissions/dsa_linkedlist_usn.java or Github Repo URL"
                  className="w-full rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 p-2.5"
                />
                <p className="text-[10px] text-slate-450 dark:text-slate-500 font-medium mt-1">
                  Provide your source path or link. Our automated compiler will run checks and generate similarity reports.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setShowSubmitModal(false)}
                  className="btn-secondary py-2 px-4 rounded-xl text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="btn py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
