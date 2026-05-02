import { useEffect, useState } from 'react'
import { facultyApi, leaveApi, odApi, outpassApi, menteeRequestsApi } from '../../api'
import { Spinner, PageWrapper, StatCard } from '../../components/common'
import { downloadCsv, downloadReportSections } from '../../utils/csvDownload'

const safeData = async (promiseFactory, fallback = []) => {
  try {
    const res = await promiseFactory()
    return Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : fallback
  } catch {
    return fallback
  }
}

function CompactTable({ columns, rows, emptyText }) {
  if (!rows.length) {
    return <p className="text-xs text-gray-400 py-3">{emptyText}</p>
  }
  return (
    <div className="overflow-x-auto max-h-72 overflow-y-auto border border-gray-100 rounded-lg">
      <table className="w-full text-xs">
        <thead className="sticky top-0 bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="table-th whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className="hover:bg-gray-50 border-t border-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="table-td">
                  {typeof c.render === 'function' ? c.render(r) : r[c.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function FacultyReports() {
  const [mentees, setMentees] = useState([])
  const [classStudents, setClassStudents] = useState([])
  const [mentorLeaves, setMentorLeaves] = useState([])
  const [mentorOds, setMentorOds] = useState([])
  const [mentorOutpasses, setMentorOutpasses] = useState([])
  const [allMenteeLeaves, setAllMenteeLeaves] = useState([])
  const [allMenteeOds, setAllMenteeOds] = useState([])
  const [allMenteeOutpasses, setAllMenteeOutpasses] = useState([])
  const [advLeaves, setAdvLeaves] = useState([])
  const [advOds, setAdvOds] = useState([])
  const [advOutpasses, setAdvOutpasses] = useState([])
  const [classLeaves, setClassLeaves] = useState([])
  const [classOds, setClassOds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [
        m,
        ml,
        mo,
        mop,
        al,
        ao,
        aop,
        advL,
        advO,
        advOp,
        c,
        cl,
        co,
      ] = await Promise.all([
        safeData(() => facultyApi.mentees()),
        safeData(() => leaveApi.pendingMentor()),
        safeData(() => odApi.pendingMentor()),
        safeData(() => outpassApi.pendingMentor()),
        safeData(() => menteeRequestsApi.allLeaves()),
        safeData(() => menteeRequestsApi.allOds()),
        safeData(() => menteeRequestsApi.allOutpasses()),
        safeData(() => leaveApi.pendingAdvisor()),
        safeData(() => odApi.pendingAdvisor()),
        safeData(() => outpassApi.pendingAdvisor()),
        safeData(() => facultyApi.classStudents()),
        safeData(() => menteeRequestsApi.classLeaves()),
        safeData(() => menteeRequestsApi.classOds()),
      ])
      if (cancelled) return
      setMentees(m)
      setMentorLeaves(ml)
      setMentorOds(mo)
      setMentorOutpasses(mop)
      setAllMenteeLeaves(al)
      setAllMenteeOds(ao)
      setAllMenteeOutpasses(aop)
      setAdvLeaves(advL)
      setAdvOds(advO)
      setAdvOutpasses(advOp)
      setClassStudents(c)
      setClassLeaves(cl)
      setClassOds(co)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <PageWrapper title="Reports"><Spinner /></PageWrapper>

  const lowBalance = mentees.filter((s) => (s.leaveBalance ?? 20) < 5)
  const hostelers = mentees.filter((s) => s.isHosteler)
  const classHostelers = classStudents.filter((s) => s.isHosteler)
  const advisorPending = advLeaves.length + advOds.length + advOutpasses.length
  const mentorPending = mentorLeaves.length + mentorOds.length + mentorOutpasses.length
  const hasClassScope =
    classStudents.length > 0 ||
    classLeaves.length > 0 ||
    classOds.length > 0 ||
    advisorPending > 0

  const stamp = () => new Date().toISOString().slice(0, 10)

  const leaveRow = (l) => [
    l.studentName,
    l.registerNumber,
    l.status,
    (l.category || '').replace(/_/g, ' '),
    l.fromDate,
    l.toDate,
    l.totalDays,
    (l.reason || '').slice(0, 200),
    l.mentorStatus || '',
    l.advisorStatus || '',
    l.hodStatus || '',
  ]

  const odRow = (o) => [
    o.studentName,
    o.registerNumber,
    o.status,
    (o.eventType || '').replace(/_/g, ' '),
    o.eventName,
    o.fromDate,
    o.toDate,
    o.totalDays,
    o.mentorStatus || '',
    o.coordinatorStatus || '',
    o.advisorStatus || '',
    o.hodStatus || '',
  ]

  const outpassRow = (o) => [
    o.studentName,
    o.registerNumber,
    o.status,
    o.destination || '',
    o.outDatetime ? new Date(o.outDatetime).toLocaleString('en-IN') : '',
    o.returnDatetime ? new Date(o.returnDatetime).toLocaleString('en-IN') : '',
    o.durationHours ?? '',
    (o.reason || '').slice(0, 200),
    o.mentorStatus || '',
    o.parentStatus || '',
    o.advisorStatus || '',
    o.wardenStatus || '',
  ]

  const downloadCompleteMentorReport = () => {
    const sections = [
      {
        title: 'Mentor — Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Total Mentees', mentees.length],
          ['Hostelers', hostelers.length],
          ['Low leave balance (<5 days)', lowBalance.length],
          ['Pending leave (mentor)', mentorLeaves.length],
          ['Pending OD (mentor)', mentorOds.length],
          ['Pending outpass (mentor)', mentorOutpasses.length],
          ['Total pending (mentor)', mentorPending],
        ],
      },
      {
        title: 'Mentor — All mentees (leave balance)',
        headers: ['Name', 'Register No', 'Year', 'Leave used', 'Leave balance', 'Type'],
        rows: mentees.map((s) => [
          s.name,
          s.registerNumber,
          s.year,
          s.usedLeaves ?? 0,
          s.leaveBalance ?? '',
          s.isHosteler ? 'Hosteler' : 'Day Scholar',
        ]),
      },
      {
        title: 'Mentor — Students with low leave balance',
        headers: ['Name', 'Register No', 'Leave balance', 'Max days'],
        rows: lowBalance.map((s) => [s.name, s.registerNumber, s.leaveBalance ?? '', 20]),
      },
      {
        title: 'Mentor — Pending leave approvals',
        headers: ['Student', 'Reg No', 'Status', 'Category', 'From', 'To', 'Days', 'Reason', 'Mentor', 'Advisor', 'HOD'],
        rows: mentorLeaves.map(leaveRow),
      },
      {
        title: 'Mentor — Pending OD approvals',
        headers: ['Student', 'Reg No', 'Status', 'Event type', 'Event name', 'From', 'To', 'Days', 'Mentor', 'Coord', 'Advisor', 'HOD'],
        rows: mentorOds.map(odRow),
      },
      {
        title: 'Mentor — Pending outpass approvals',
        headers: ['Student', 'Reg No', 'Status', 'Destination', 'Out', 'Return', 'Hrs', 'Reason', 'Mentor', 'Parent', 'Advisor', 'Warden'],
        rows: mentorOutpasses.map(outpassRow),
      },
      {
        title: 'Mentor — All mentee leave requests (history)',
        headers: ['Student', 'Reg No', 'Status', 'Category', 'From', 'To', 'Days', 'Reason', 'Mentor', 'Advisor', 'HOD'],
        rows: allMenteeLeaves.map(leaveRow),
      },
      {
        title: 'Mentor — All mentee OD requests (history)',
        headers: ['Student', 'Reg No', 'Status', 'Event type', 'Event name', 'From', 'To', 'Days', 'Mentor', 'Coord', 'Advisor', 'HOD'],
        rows: allMenteeOds.map(odRow),
      },
      {
        title: 'Mentor — All mentee outpass requests (history)',
        headers: ['Student', 'Reg No', 'Status', 'Destination', 'Out', 'Return', 'Hrs', 'Reason', 'Mentor', 'Parent', 'Advisor', 'Warden'],
        rows: allMenteeOutpasses.map(outpassRow),
      },
    ]
    downloadReportSections(`faculty-mentor-complete-report-${stamp()}.csv`, sections)
  }

  const downloadCompleteAdvisorReport = () => {
    const sections = [
      {
        title: 'Class advisor — Summary',
        headers: ['Metric', 'Value'],
        rows: [
          ['Class students', classStudents.length],
          ['Hostelers', classHostelers.length],
          ['Pending leave (advisor)', advLeaves.length],
          ['Pending OD (advisor)', advOds.length],
          ['Pending outpass (advisor)', advOutpasses.length],
          ['Total pending (advisor)', advisorPending],
        ],
      },
      {
        title: 'Class advisor — Roster',
        headers: ['Name', 'Register No', 'Roll No', 'Email', 'Type', 'Blood group', 'Parent phone'],
        rows: classStudents.map((s) => [
          s.name,
          s.registerNumber,
          s.rollNumber || '',
          s.email || '',
          s.isHosteler ? 'Hosteler' : 'Day',
          s.bloodGroup || '',
          s.parentPhone || '',
        ]),
      },
      {
        title: 'Class advisor — Pending leave',
        headers: ['Student', 'Reg No', 'Status', 'Category', 'From', 'To', 'Days', 'Reason', 'Mentor', 'Advisor', 'HOD'],
        rows: advLeaves.map(leaveRow),
      },
      {
        title: 'Class advisor — Pending OD',
        headers: ['Student', 'Reg No', 'Status', 'Event type', 'Event name', 'From', 'To', 'Days', 'Mentor', 'Coord', 'Advisor', 'HOD'],
        rows: advOds.map(odRow),
      },
      {
        title: 'Class advisor — Pending outpass',
        headers: ['Student', 'Reg No', 'Status', 'Destination', 'Out', 'Return', 'Hrs', 'Reason', 'Mentor', 'Parent', 'Advisor', 'Warden'],
        rows: advOutpasses.map(outpassRow),
      },
      {
        title: 'Class advisor — All class leave requests',
        headers: ['Student', 'Reg No', 'Status', 'Category', 'From', 'To', 'Days', 'Reason', 'Mentor', 'Advisor', 'HOD'],
        rows: classLeaves.map(leaveRow),
      },
      {
        title: 'Class advisor — All class OD requests',
        headers: ['Student', 'Reg No', 'Status', 'Event type', 'Event name', 'From', 'To', 'Days', 'Mentor', 'Coord', 'Advisor', 'HOD'],
        rows: classOds.map(odRow),
      },
    ]
    downloadReportSections(`faculty-class-advisor-complete-report-${stamp()}.csv`, sections)
  }

  const downloadMentorSummaryOnly = () => {
    downloadCsv(`mentor-report-summary-${stamp()}.csv`, ['Metric', 'Value'], [
      ['Total Mentees', mentees.length],
      ['Hostelers', hostelers.length],
      ['Low Leave Balance (under 5 days)', lowBalance.length],
      ['Pending Leave (Mentor)', mentorLeaves.length],
      ['Pending OD (Mentor)', mentorOds.length],
      ['Pending Outpass (Mentor)', mentorOutpasses.length],
      ['Pending Total (Mentor)', mentorPending],
    ])
  }

  const DownloadBtn = ({ onClick, disabled, label = 'Download' }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {label}
    </button>
  )

  const leaveCols = [
    { key: 'studentName', label: 'Student' },
    { key: 'registerNumber', label: 'Reg No' },
    { key: 'status', label: 'Status' },
    {
      key: 'cat',
      label: 'Category',
      render: (l) => (l.category || '').replace(/_/g, ' '),
    },
    { key: 'fromDate', label: 'From' },
    { key: 'toDate', label: 'To' },
    { key: 'totalDays', label: 'Days' },
  ]

  const odCols = [
    { key: 'studentName', label: 'Student' },
    { key: 'registerNumber', label: 'Reg No' },
    { key: 'status', label: 'Status' },
    { key: 'eventName', label: 'Event' },
    { key: 'fromDate', label: 'From' },
    { key: 'toDate', label: 'To' },
  ]

  const outCols = [
    { key: 'studentName', label: 'Student' },
    { key: 'registerNumber', label: 'Reg No' },
    { key: 'status', label: 'Status' },
    { key: 'destination', label: 'Destination' },
    {
      key: 'out',
      label: 'Out',
      render: (o) => (o.outDatetime ? new Date(o.outDatetime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—'),
    },
  ]

  return (
    <PageWrapper title="Reports" subtitle="Summary of mentees, class, leave, OD, and outpass activity">
      {/* ── Mentor (always shown) ───────────────────────────── */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-sm font-semibold text-gray-800">Mentor reports</h2>
        <div className="flex flex-wrap gap-2">
          <DownloadBtn onClick={downloadCompleteMentorReport} label="Download complete report" disabled={false} />
          <DownloadBtn onClick={downloadMentorSummaryOnly} label="Download summary only" disabled={false} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <StatCard label="Total Mentees" value={mentees.length} />
        <StatCard label="Hostelers" value={hostelers.length} />
        <StatCard label="Low Leave Balance" value={lowBalance.length} color="red" sub="Under 5 days" />
        <StatCard label="Pending Leave" value={mentorLeaves.length} color="warn" />
        <StatCard label="Pending OD" value={mentorOds.length} color="warn" />
        <StatCard label="Pending Outpass" value={mentorOutpasses.length} color="warn" />
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-medium text-gray-900">Students with low leave balance</div>
          <DownloadBtn
            onClick={() =>
              downloadCsv(`mentor-low-leave-balance-${stamp()}.csv`, ['Name', 'Register Number', 'Leave Balance', 'Max Days'], [
                ...lowBalance.map((s) => [s.name, s.registerNumber, s.leaveBalance ?? '', 20]),
              ])
            }
            disabled={lowBalance.length === 0}
          />
        </div>
        {lowBalance.length === 0 ? (
          <p className="text-xs text-gray-400">No mentees with leave balance under 5 days.</p>
        ) : (
          <div className="space-y-2">
            {lowBalance.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-xs py-1.5 border-t border-gray-50">
                <div>
                  <span className="font-medium text-gray-800">{s.name}</span>
                  <span className="text-gray-500 ml-2">{s.registerNumber}</span>
                </div>
                <span className="font-medium text-red-600">{s.leaveBalance} / 20</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="text-sm font-medium text-gray-900">All mentees summary</div>
          <DownloadBtn
            onClick={() =>
              downloadCsv(`mentor-all-mentees-${stamp()}.csv`, ['Name', 'Register No.', 'Year', 'Leave Used', 'Balance', 'Type'], [
                ...mentees.map((s) => [
                  s.name,
                  s.registerNumber,
                  s.year,
                  s.usedLeaves ?? 0,
                  s.leaveBalance ?? '',
                  s.isHosteler ? 'Hosteler' : 'Day Scholar',
                ]),
              ])
            }
            disabled={mentees.length === 0}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-th">Name</th>
                <th className="table-th">Reg No.</th>
                <th className="table-th">Year</th>
                <th className="table-th">Leave Used</th>
                <th className="table-th">Balance</th>
                <th className="table-th">Type</th>
              </tr>
            </thead>
            <tbody>
              {mentees.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="table-td font-medium">{s.name}</td>
                  <td className="table-td text-gray-500">{s.registerNumber}</td>
                  <td className="table-td">{s.year}</td>
                  <td className="table-td">{s.usedLeaves ?? 0}</td>
                  <td className="table-td">
                    <span className={`font-medium ${(s.leaveBalance ?? 20) < 5 ? 'text-red-600' : 'text-gray-800'}`}>
                      {s.leaveBalance ?? '—'}
                    </span>
                  </td>
                  <td className="table-td">{s.isHosteler ? 'Hosteler' : 'Day Scholar'}</td>
                </tr>
              ))}
              {mentees.length === 0 && (
                <tr>
                  <td colSpan={6} className="table-td text-center text-gray-400 py-8">
                    No mentees assigned
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="text-sm font-medium text-gray-900 mb-2">Pending leave (mentor)</div>
          <CompactTable columns={leaveCols} rows={mentorLeaves} emptyText="No pending leave requests." />
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-900 mb-2">Pending OD (mentor)</div>
          <CompactTable columns={odCols} rows={mentorOds} emptyText="No pending OD requests." />
        </div>
        <div className="card">
          <div className="text-sm font-medium text-gray-900 mb-2">Pending outpass (mentor)</div>
          <CompactTable columns={outCols} rows={mentorOutpasses} emptyText="No pending outpass requests." />
        </div>
      </div>

      <div className="card mb-8">
        <div className="text-sm font-medium text-gray-900 mb-3">All mentee activity (leave, OD, outpass)</div>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Leave requests ({allMenteeLeaves.length})</p>
            <CompactTable columns={leaveCols} rows={allMenteeLeaves} emptyText="No leave records for mentees." />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">OD requests ({allMenteeOds.length})</p>
            <CompactTable columns={odCols} rows={allMenteeOds} emptyText="No OD records for mentees." />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-1">Outpass requests ({allMenteeOutpasses.length})</p>
            <CompactTable columns={outCols} rows={allMenteeOutpasses} emptyText="No outpass records for mentees." />
          </div>
        </div>
      </div>

      {/* ── Class advisor ───────────────────────────────────── */}
      <div className="border-t border-gray-200 pt-8 mt-2">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 className="text-sm font-semibold text-gray-800">Class advisor reports</h2>
          {hasClassScope ? (
            <DownloadBtn onClick={downloadCompleteAdvisorReport} label="Download complete report" disabled={false} />
          ) : (
            <span className="text-xs text-gray-400">Complete download available when you have a class assignment</span>
          )}
        </div>

        {!hasClassScope ? (
          <div className="card text-sm text-gray-500">
            No class advisor data yet (no class roster and no pending advisor approvals). If you are a class advisor, check your assignment with the HOD. Mentor data above still applies if you mentor students.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              <StatCard label="Class students" value={classStudents.length} />
              <StatCard label="Hostelers" value={classHostelers.length} />
              <StatCard label="Pending (advisor)" value={advisorPending} color="warn" />
              <StatCard label="Pending leave" value={advLeaves.length} />
              <StatCard label="Pending OD" value={advOds.length} />
              <StatCard label="Pending outpass" value={advOutpasses.length} />
            </div>

            <div className="card mb-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="text-sm font-medium text-gray-900">Class roster</div>
                <DownloadBtn
                  onClick={() =>
                    downloadCsv(
                      `class-advisor-roster-${stamp()}.csv`,
                      ['Name', 'Register No.', 'Roll No.', 'Email', 'Type', 'Blood Group', 'Parent Phone'],
                      classStudents.map((s) => [
                        s.name,
                        s.registerNumber,
                        s.rollNumber || '',
                        s.email || '',
                        s.isHosteler ? 'Hosteler' : 'Day Scholar',
                        s.bloodGroup || '',
                        s.parentPhone || '',
                      ]),
                    )
                  }
                  disabled={classStudents.length === 0}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="table-th">Name</th>
                      <th className="table-th">Reg No.</th>
                      <th className="table-th">Roll No.</th>
                      <th className="table-th">Email</th>
                      <th className="table-th">Type</th>
                      <th className="table-th">Blood Grp</th>
                      <th className="table-th">Parent Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="table-td font-medium">{s.name}</td>
                        <td className="table-td text-gray-500">{s.registerNumber}</td>
                        <td className="table-td">{s.rollNumber || '—'}</td>
                        <td className="table-td text-gray-500">{s.email || '—'}</td>
                        <td className="table-td">{s.isHosteler ? 'Hosteler' : 'Day'}</td>
                        <td className="table-td">{s.bloodGroup || '—'}</td>
                        <td className="table-td">{s.parentPhone || '—'}</td>
                      </tr>
                    ))}
                    {classStudents.length === 0 && (
                      <tr>
                        <td colSpan={7} className="table-td text-center text-gray-400 py-8">
                          No students in class roster
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="card">
                <div className="text-sm font-medium text-gray-900 mb-2">Pending leave (advisor)</div>
                <CompactTable columns={leaveCols} rows={advLeaves} emptyText="No pending leave." />
              </div>
              <div className="card">
                <div className="text-sm font-medium text-gray-900 mb-2">Pending OD (advisor)</div>
                <CompactTable columns={odCols} rows={advOds} emptyText="No pending OD." />
              </div>
              <div className="card">
                <div className="text-sm font-medium text-gray-900 mb-2">Pending outpass (advisor)</div>
                <CompactTable columns={outCols} rows={advOutpasses} emptyText="No pending outpass." />
              </div>
            </div>

            <div className="card">
              <div className="text-sm font-medium text-gray-900 mb-3">All class activity (leave & OD)</div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Leave requests ({classLeaves.length})</p>
                  <CompactTable columns={leaveCols} rows={classLeaves} emptyText="No class leave records." />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">OD requests ({classOds.length})</p>
                  <CompactTable columns={odCols} rows={classOds} emptyText="No class OD records." />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  )
}
