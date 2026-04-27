import { useEffect, useMemo, useRef, useState, type Dispatch, type ReactNode, type RefObject, type SetStateAction } from 'react'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import * as XLSX from 'xlsx'
import {
  BarChart3,
  CircleDollarSign,
  Database,
  Download,
  FileSpreadsheet,
  FolderOpen,
  Lock,
  Menu,
  PieChart,
  Plus,
  Search,
  Settings2,
  Trash2,
  Upload,
  WalletCards
} from 'lucide-react'
import { DEFAULT_CATEGORIES, DEFAULT_MEMBERS, DEFAULT_SOURCES } from '@shared/defaults'
import { analyzeImportRows, buildErrorSheetRows, IMPORT_HEADER, type ImportAnalysis } from '@shared/import'
import type { AppSettings, Entry, LedgerState } from '@shared/types'
import { isDuplicateEntry, normalizeAmount, validateEntryInput } from '@shared/validation'
import { summarizeByCategory, summarizeByMember, summarizeByMonth, summarizeByYear } from '@shared/statistics'

type PageKey = 'dashboard' | 'ledger' | 'reports' | 'settings' | 'data'

type Draft = {
  date: string
  amount: string
  category: string
  member: string
  note: string
  source: string
}

type FilterState = {
  from: string
  to: string
  category: string
  member: string
  source: string
  minAmount: string
  maxAmount: string
  keyword: string
}

type ReportMode = 'month' | 'year' | 'category' | 'member'
type ReportChart = 'bar' | 'pie'

const NAV_ITEMS: Array<{ key: PageKey; label: string; icon: typeof WalletCards }> = [
  { key: 'dashboard', label: '仪表盘', icon: WalletCards },
  { key: 'ledger', label: '记账明细', icon: FileSpreadsheet },
  { key: 'reports', label: '报表', icon: BarChart3 },
  { key: 'settings', label: '基础设置', icon: Settings2 },
  { key: 'data', label: '数据管理', icon: Database }
]

const EMPTY_FILTERS: FilterState = {
  from: '',
  to: '',
  category: '',
  member: '',
  source: '',
  minAmount: '',
  maxAmount: '',
  keyword: ''
}

function createDraft(settings: AppSettings): Draft {
  return {
    date: dayjs().format('YYYY-MM-DD'),
    amount: '',
    category: settings.categories[0] ?? '',
    member: settings.members[0] ?? '',
    note: '',
    source: settings.sources[0] ?? ''
  }
}

function entryToDraft(entry: Entry): Draft {
  return {
    date: entry.date,
    amount: String(entry.amount.toFixed(2)),
    category: entry.category,
    member: entry.member,
    note: entry.note,
    source: entry.source
  }
}

function draftToEntryInput(draft: Draft): Omit<Entry, 'id'> {
  return {
    date: draft.date.trim(),
    amount: Number(draft.amount),
    category: draft.category.trim(),
    member: draft.member.trim(),
    note: draft.note.trim(),
    source: draft.source.trim()
  }
}

function makeId() {
  return crypto.randomUUID()
}

function formatMoney(value: number) {
  return value.toFixed(2)
}

function formatText(value: string) {
  return value || '-'
}

function mergeDefaults(state: LedgerState): LedgerState {
  return {
    ...state,
    settings: {
      passwordHash: state.settings.passwordHash,
      categories: state.settings.categories.length ? state.settings.categories : [...DEFAULT_CATEGORIES],
      members: state.settings.members.length ? state.settings.members : [...DEFAULT_MEMBERS],
      sources: state.settings.sources.length ? state.settings.sources : [...DEFAULT_SOURCES]
    }
  }
}

function filterEntries(entries: Entry[], filters: FilterState) {
  const minAmount = filters.minAmount ? Number(filters.minAmount) : null
  const maxAmount = filters.maxAmount ? Number(filters.maxAmount) : null
  const keyword = filters.keyword.trim().toLowerCase()

  return entries.filter((entry) => {
    if (filters.from && entry.date < filters.from) return false
    if (filters.to && entry.date > filters.to) return false
    if (filters.category && entry.category !== filters.category) return false
    if (filters.member && entry.member !== filters.member) return false
    if (filters.source && entry.source !== filters.source) return false
    if (minAmount !== null && entry.amount < minAmount) return false
    if (maxAmount !== null && entry.amount > maxAmount) return false
    if (keyword && !entry.note.toLowerCase().includes(keyword)) return false
    return true
  })
}

function sumAmounts(entries: Entry[]) {
  return entries.reduce((total, item) => total + item.amount, 0)
}

function removeEntryById(entries: Entry[], id: string) {
  return entries.filter((entry) => entry.id !== id)
}

function updateEntryById(entries: Entry[], nextEntry: Entry) {
  return entries.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry))
}

function sortByDateDesc(entries: Entry[]) {
  return [...entries].sort((left, right) => right.date.localeCompare(left.date))
}

function App() {
  const [loaded, setLoaded] = useState(false)
  const [state, setState] = useState<LedgerState | null>(null)
  const [page, setPage] = useState<PageKey>('dashboard')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [createPassword, setCreatePassword] = useState('')
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState('')
  const [unlockPassword, setUnlockPassword] = useState('')
  const [restorePassword, setRestorePassword] = useState('')
  const [restorePasswordConfirm, setRestorePasswordConfirm] = useState('')
  const [backupRaw, setBackupRaw] = useState('')
  const [backupPreview, setBackupPreview] = useState<{
    createdAt: string
    updatedAt: string
    entriesCount: number
    categoriesCount: number
    membersCount: number
    sourcesCount: number
  } | null>(null)
  const [draft, setDraft] = useState<Draft>(() => createDraft({ categories: DEFAULT_CATEGORIES, members: DEFAULT_MEMBERS, sources: DEFAULT_SOURCES, passwordHash: null }))
  const [editDraft, setEditDraft] = useState<Draft>(() => createDraft({ categories: DEFAULT_CATEGORIES, members: DEFAULT_MEMBERS, sources: DEFAULT_SOURCES, passwordHash: null }))
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ledgerAddOpen, setLedgerAddOpen] = useState(false)
  const [ledgerImportOpen, setLedgerImportOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [ledgerFiltersOpen, setLedgerFiltersOpen] = useState(false)
  const [reportMode, setReportMode] = useState<ReportMode>('month')
  const [reportChart, setReportChart] = useState<ReportChart>('bar')
  const [importAnalysis, setImportAnalysis] = useState<ImportAnalysis | null>(null)
  const [reportFiltersOpen, setReportFiltersOpen] = useState(false)
  const [reportFilters, setReportFilters] = useState<{ from: string; to: string; category: string; member: string; source: string }>({
    from: '',
    to: '',
    category: '',
    member: '',
    source: ''
  })
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const ledger = window.ledger
    if (!ledger) {
      setMessage('启动失败：桥接未加载')
      setLoaded(true)
      return
    }

    ledger.getState().then((next) => {
      setState(next ? mergeDefaults(next) : null)
      if (next) {
        setDraft(createDraft(next.settings))
      }
      setLoaded(true)
    }).catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : '加载失败')
      setLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(() => setMessage(''), 3000)
    return () => window.clearTimeout(timer)
  }, [message])

  const entries = useMemo(() => sortByDateDesc(state?.entries ?? []), [state])

  const filteredEntries = useMemo(() => filterEntries(entries, filters), [entries, filters])

  const dashboardEntries = useMemo(() => {
    const now = dayjs()
    const currentMonth = now.format('YYYY-MM')
    const currentYear = now.format('YYYY')
    return {
      month: entries.filter((item) => item.date.startsWith(currentMonth)),
      year: entries.filter((item) => item.date.startsWith(currentYear)),
      recent: entries.slice(0, 5)
    }
  }, [entries])

  const dashboardStats = useMemo(() => {
    const monthTotal = sumAmounts(dashboardEntries.month)
    const yearTotal = sumAmounts(dashboardEntries.year)
    return {
      monthTotal,
      yearTotal,
      categorySummaries: summarizeByCategory(dashboardEntries.month),
      memberSummaries: summarizeByMember(dashboardEntries.month)
    }
  }, [dashboardEntries])

  const reportData = useMemo(() => {
    const reportFilterState: FilterState = {
      ...EMPTY_FILTERS,
      from: reportFilters.from,
      to: reportFilters.to,
      category: reportFilters.category,
      member: reportFilters.member,
      source: reportFilters.source
    }

    if (reportMode === 'month') {
      return summarizeByMonth(filterEntries(entries, reportFilterState))
    }
    if (reportMode === 'year') {
      return summarizeByYear(filterEntries(entries, reportFilterState))
    }
    if (reportMode === 'category') {
      return summarizeByCategory(filterEntries(entries, reportFilterState))
    }
    return summarizeByMember(filterEntries(entries, reportFilterState))
  }, [entries, reportFilters, reportMode]) as Array<any>

  const reportCategories = useMemo(() => {
    const used = new Set<string>()
    for (const item of entries) {
      if ((!reportFilters.from || item.date >= reportFilters.from) && (!reportFilters.to || item.date <= reportFilters.to)) {
        used.add(item.category)
      }
    }
    return [...used]
  }, [entries, reportFilters.from, reportFilters.to])

  const reportRows = useMemo(() => {
    if (reportMode === 'month' || reportMode === 'year') {
      return reportData.map((row) => ({
        period: row.period,
        total: row.total,
        categoryTotals: row.categoryTotals
      }))
    }
    return reportData
  }, [reportData, reportMode]) as Array<any>

  useEffect(() => {
    if (!chartRef.current) return
    const chart = echarts.init(chartRef.current)

    if (reportMode === 'month' || reportMode === 'year') {
      const periods = reportRows.map((row) => row.period)
      const totals = reportRows.map((row) => row.total)
      chart.setOption({
        title: {
          text: reportMode === 'month' ? '按月统计' : '按年统计',
          left: 'center'
        },
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 24, top: 60, bottom: 40 },
        xAxis: { type: 'category', data: periods },
        yAxis: { type: 'value' },
        series: [
          {
            type: reportChart,
            data: totals,
            itemStyle: { color: '#2f6b57' }
          }
        ]
      })
    } else {
      const data = reportRows as Array<{ name: string; amount: number }>
      chart.setOption({
        title: {
          text: reportMode === 'category' ? '按分类统计' : '按成员统计',
          left: 'center'
        },
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [
          {
            type: reportChart,
            radius: reportChart === 'pie' ? '60%' : undefined,
            data: data.map((item) => ({ name: item.name, value: item.amount })),
            itemStyle: { color: '#2f6b57' }
          }
        ]
      })
    }

    const resize = () => chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [reportChart, reportMode, reportRows])

  useEffect(() => {
    setDraft((current) => ({ ...current, category: state?.settings.categories.includes(current.category) ? current.category : state?.settings.categories[0] ?? '', member: state?.settings.members.includes(current.member) ? current.member : state?.settings.members[0] ?? '', source: state?.settings.sources.includes(current.source) ? current.source : state?.settings.sources[0] ?? '' }))
  }, [state])

  async function persist(nextState: LedgerState) {
    setState(nextState)
    await window.ledger.saveLedger(nextState)
  }

  async function handleCreateLedger() {
    if (createPassword.length !== 6 || createPassword !== createPasswordConfirm) {
      setMessage('密码需要 6 位且两次输入一致')
      return
    }

    setBusy(true)
    try {
      const next = await window.ledger.createLedger(createPassword)
      setState(next)
      setDraft(createDraft(next.settings))
      setPage('dashboard')
      setMessage('保存成功')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '新建失败')
    } finally {
      setBusy(false)
    }
  }

  async function handleUnlock() {
    if (unlockPassword.length !== 6) {
      setMessage('请输入 6 位数字密码')
      return
    }

    setBusy(true)
    try {
      const next = await window.ledger.unlockLedger(unlockPassword)
      if (!next) {
        setMessage('密码错误')
        return
      }
      setState(mergeDefaults(next))
      setDraft(createDraft(next.settings))
      setPage('dashboard')
      setMessage('')
    } finally {
      setBusy(false)
    }
  }

  async function handleRestoreBackup(file: File) {
    if (restorePassword.length !== 6 || restorePassword !== restorePasswordConfirm) {
      setMessage('密码需要 6 位且两次输入一致')
      return
    }

    const raw = await file.text()
    setBusy(true)
    try {
      await window.ledger.previewBackup(raw)
      const next = await window.ledger.restoreBackup(raw, restorePassword)
      setState(mergeDefaults(next))
      setPage('dashboard')
      setMessage('保存成功')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '恢复失败')
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveDraft() {
    if (!state) return
    const nextInput = draftToEntryInput(draft)
    const issues = validateEntryInput(nextInput, state.settings)
    if (issues.length > 0) {
      setMessage(issues[0]?.message ?? '校验失败')
      return
    }
    const candidate: Entry = {
      id: makeId(),
      ...nextInput,
      amount: normalizeAmount(nextInput.amount)
    }
    if (isDuplicateEntry(state.entries, candidate)) {
      setMessage('重复记录，已拦截')
      return
    }
    const nextState: LedgerState = {
      ...state,
      entries: [candidate, ...state.entries],
      updatedAt: new Date().toISOString()
    }
    await persist(nextState)
    setDraft(createDraft(nextState.settings))
    setMessage('保存成功')
    if (ledgerAddOpen) {
      setLedgerAddOpen(false)
    }
  }

  function startEdit(entry: Entry) {
    setEditingId(entry.id)
    setEditDraft(entryToDraft(entry))
  }

  function openLedgerAddModal() {
    if (!state) return
    setDraft(createDraft(state.settings))
    setLedgerAddOpen(true)
  }

  function openLedgerImportModal() {
    setImportAnalysis(null)
    setLedgerImportOpen(true)
  }

  async function handleSaveEdit() {
    if (!state || !editingId || !editDraft) return
    const nextInput = draftToEntryInput(editDraft)
    const issues = validateEntryInput(nextInput, state.settings)
    if (issues.length > 0) {
      setMessage(issues[0]?.message ?? '校验失败')
      return
    }
    const nextEntry: Entry = {
      id: editingId,
      ...nextInput,
      amount: normalizeAmount(nextInput.amount)
    }
    const otherEntries = state.entries.filter((item) => item.id !== editingId)
    if (isDuplicateEntry(otherEntries, nextEntry)) {
      setMessage('重复记录，已拦截')
      return
    }
    const nextState: LedgerState = {
      ...state,
      entries: updateEntryById(state.entries, nextEntry),
      updatedAt: new Date().toISOString()
    }
    await persist(nextState)
    setEditingId(null)
    setEditDraft(createDraft(state.settings))
    setMessage('保存成功')
  }

  async function handleDelete(id: string) {
    if (!state) return
    if (!window.confirm('确认删除这条记录？')) return
    const nextState: LedgerState = {
      ...state,
      entries: removeEntryById(state.entries, id),
      updatedAt: new Date().toISOString()
    }
    await persist(nextState)
    setMessage('删除成功')
  }

  async function handleExportBackup() {
    if (!state) return
    const result = await window.ledger.exportBackup(state)
    if (!result.canceled) {
      setMessage('保存成功')
    }
  }

  async function handleChangePassword(oldPassword: string, newPassword: string) {
    const next = await window.ledger.changePassword(oldPassword, newPassword)
    if (!next) {
      setMessage('旧密码错误')
      return
    }
    setState(next)
    setMessage('保存成功')
  }

  async function analyzeImportExcel(file: File) {
    if (!state) return
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '', blankrows: false })
    const analysis = analyzeImportRows(rows, state.settings, state.entries)
    setImportAnalysis(analysis)
    if (!analysis.headerValid) {
      setMessage('模板错误')
      return
    }
    setMessage(analysis.errorRows > 0 ? `校验完成，存在 ${analysis.errorRows} 行错误` : `校验完成，可导入 ${analysis.validRows} 条`)
  }

  function downloadTemplate() {
    const header: string[][] = [Array.from(IMPORT_HEADER)]
    const ws = XLSX.utils.aoa_to_sheet(header)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '妯℃澘')
    XLSX.writeFile(wb, '家庭记账导入模板.xlsx')
  }

  async function confirmImport() {
    if (!state || !importAnalysis || importAnalysis.errorRows > 0) return
    const nextState: LedgerState = {
      ...state,
      entries: [...importAnalysis.entries, ...state.entries],
      updatedAt: new Date().toISOString()
    }
    await persist(nextState)
    setImportAnalysis(null)
    setMessage(`保存成功，成功导入 ${importAnalysis.validRows} 条`)
  }

  function downloadImportErrors() {
    if (!importAnalysis || importAnalysis.errorRows === 0) return
    const rows = buildErrorSheetRows(importAnalysis)
    const ws = XLSX.utils.aoa_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, '错误明细')
    XLSX.writeFile(wb, `错误文件_${Date.now()}.xlsx`)
  }

  function renderMessage() {
    if (!message) return null
    return <div className="message">{message}</div>
  }

  if (!loaded) {
    return <div className="app-shell loading">正在加载...</div>
  }

  if (!state) {
    return (
      <div className="startup">
        <div className="startup-panel">
          <h1>家庭记账工具</h1>
          <p>新建账本或从备份恢复。</p>
          {renderMessage()}
          <div className="startup-grid">
            <section>
              <h2>新建账本</h2>
              <label>6 位数字密码</label>
              <input value={createPassword} onChange={(event) => setCreatePassword(event.target.value)} maxLength={6} inputMode="numeric" />
              <label>确认密码</label>
              <input value={createPasswordConfirm} onChange={(event) => setCreatePasswordConfirm(event.target.value)} maxLength={6} inputMode="numeric" />
              <button disabled={busy} onClick={handleCreateLedger}>新建账本</button>
            </section>
            <section>
              <h2>从备份恢复</h2>
              <label>选择备份文件</label>
              <input type="file" accept=".json" onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                file.text().then((raw) => {
                  setBackupRaw(raw)
                  window.ledger.previewBackup(raw).then(setBackupPreview).catch(() => setBackupPreview(null))
                })
              }} />
              {backupPreview && (
                <div className="hint">
                  备份时间: {dayjs(backupPreview.updatedAt).format('YYYY-MM-DD HH:mm')}，记录数: {backupPreview.entriesCount}
                </div>
              )}
              <label>新密码</label>
              <input value={restorePassword} onChange={(event) => setRestorePassword(event.target.value)} maxLength={6} inputMode="numeric" />
              <label>确认密码</label>
              <input value={restorePasswordConfirm} onChange={(event) => setRestorePasswordConfirm(event.target.value)} maxLength={6} inputMode="numeric" />
              <button disabled={busy || !backupRaw} onClick={async () => {
                if (!backupRaw) return
                const file = new File([backupRaw], 'backup.json', { type: 'application/json' })
                await handleRestoreBackup(file)
              }}>从备份恢复</button>
            </section>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><CircleDollarSign size={20} /></div>
          <div>
            <div className="brand-title">家庭记账</div>
            <div className="brand-subtitle">本地账本</div>
          </div>
        </div>
        <nav>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.key} className={page === item.key ? 'nav-item active' : 'nav-item'} onClick={() => setPage(item.key)}>
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <h1>{NAV_ITEMS.find((item) => item.key === page)?.label}</h1>
            <p>{dayjs().format('YYYY-MM-DD')}</p>
          </div>
          <div className="top-actions">
            {page === 'ledger' && (
              <>
                <button onClick={openLedgerImportModal}><Upload size={16} /> 导入</button>
                <button onClick={openLedgerAddModal}><Plus size={16} /> 新增</button>
              </>
            )}
            <button onClick={handleExportBackup}><Download size={16} /> 备份</button>
          </div>
        </header>
        {renderMessage()}
        {page === 'dashboard' && (
          <section className="page-grid">
            <Card title="本月总支出" value={formatMoney(dashboardStats.monthTotal)} />
            <Card title="本年累计支出" value={formatMoney(dashboardStats.yearTotal)} />
            <Card title="最近记录" value={`${dashboardEntries.recent.length} 条`} />
            <Card title="账本状态" value="正常" />
            <Panel title="本月支出趋势">
              <ChartBox
                height={280}
                option={{
                  title: { show: false },
                  tooltip: { trigger: 'axis' },
                  grid: { left: 32, right: 24, top: 24, bottom: 32 },
                  xAxis: {
                    type: 'category',
                    data: Object.entries(
                      dashboardEntries.month.reduce<Record<string, number>>((acc, entry) => {
                        const day = dayjs(entry.date).format('DD')
                        acc[day] = (acc[day] ?? 0) + entry.amount
                        return acc
                      }, {})
                    ).map(([day]) => day)
                  },
                  yAxis: { type: 'value' },
                  series: [
                    {
                      type: 'line',
                      data: Object.entries(
                        dashboardEntries.month.reduce<Record<string, number>>((acc, entry) => {
                          const day = dayjs(entry.date).format('DD')
                          acc[day] = (acc[day] ?? 0) + entry.amount
                          return acc
                        }, {})
                      ).map(([, amount]) => amount),
                      smooth: true,
                      itemStyle: { color: '#2f6b57' }
                    }
                  ]
                }}
              />
            </Panel>
            <Panel title="各分类占比">
              <ChartBox
                height={280}
                option={{
                  tooltip: { trigger: 'item' },
                  legend: { bottom: 0 },
                  series: [
                    {
                      type: 'pie',
                      radius: '62%',
                      data: dashboardStats.categorySummaries.map((item) => ({ name: item.name, value: item.amount })),
                      itemStyle: { color: '#2f6b57' }
                    }
                  ]
                }}
              />
            </Panel>
            <Panel title="最近 5 条">
              <table className="table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>金额</th>
                    <th>分类</th>
                    <th>成员</th>
                    <th>来源平台</th>
                    <th>备注</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardEntries.recent.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{formatMoney(entry.amount)}</td>
                      <td>{entry.category}</td>
                      <td>{entry.member}</td>
                      <td>{entry.source}</td>
                      <td>{formatText(entry.note)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
            <Panel title="成员支出">
              <table className="table compact">
                <thead><tr><th>成员</th><th>金额</th></tr></thead>
                <tbody>
                  {dashboardStats.memberSummaries.map((item) => (
                    <tr key={item.name}><td>{item.name}</td><td>{formatMoney(item.amount)}</td></tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </section>
        )}
        {page === 'ledger' && (
          <section className="page-stack">
            <CollapsiblePanel title="筛选" open={ledgerFiltersOpen} onToggle={() => setLedgerFiltersOpen((current) => !current)}>
              <div className="form-grid">
                <label><span>日期从</span><input type="date" value={filters.from} onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))} /></label>
                <label><span>日期到</span><input type="date" value={filters.to} onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))} /></label>
                <label><span>分类</span><select value={filters.category} onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}><option value="">全部</option>{state.settings.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>成员</span><select value={filters.member} onChange={(event) => setFilters((current) => ({ ...current, member: event.target.value }))}><option value="">全部</option>{state.settings.members.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>来源平台</span><select value={filters.source} onChange={(event) => setFilters((current) => ({ ...current, source: event.target.value }))}><option value="">全部</option>{state.settings.sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>金额下限</span><input value={filters.minAmount} onChange={(event) => setFilters((current) => ({ ...current, minAmount: event.target.value }))} /></label>
                <label><span>金额上限</span><input value={filters.maxAmount} onChange={(event) => setFilters((current) => ({ ...current, maxAmount: event.target.value }))} /></label>
                <label className="wide"><span>备注关键词</span><input value={filters.keyword} onChange={(event) => setFilters((current) => ({ ...current, keyword: event.target.value }))} /></label>
              </div>
            </CollapsiblePanel>
            <Panel title={`记账明细 (${filteredEntries.length})`}>
              <table className="table">
                <thead>
                  <tr>
                    <th>日期</th>
                    <th>金额</th>
                    <th>分类</th>
                    <th>成员</th>
                    <th>来源平台</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>{entry.date}</td>
                      <td>{formatMoney(entry.amount)}</td>
                      <td>{entry.category}</td>
                      <td>{entry.member}</td>
                      <td>{entry.source}</td>
                      <td>{entry.note}</td>
                      <td className="actions">
                        <button className="ghost" onClick={() => startEdit(entry)}><Settings2 size={14} /> 缂栬緫</button>
                        <button className="danger" onClick={() => handleDelete(entry.id)}><Trash2 size={14} /> 删除</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </section>
        )}
        {page === 'reports' && (
          <section className="page-stack">
            <CollapsiblePanel title="报表筛选" open={reportFiltersOpen} onToggle={() => setReportFiltersOpen((current) => !current)}>
              <div className="form-grid">
                <label><span>日期从</span><input type="date" value={reportFilters.from} onChange={(event) => setReportFilters((current) => ({ ...current, from: event.target.value }))} /></label>
                <label><span>日期到</span><input type="date" value={reportFilters.to} onChange={(event) => setReportFilters((current) => ({ ...current, to: event.target.value }))} /></label>
                <label><span>分类</span><select value={reportFilters.category} onChange={(event) => setReportFilters((current) => ({ ...current, category: event.target.value }))}><option value="">全部</option>{state.settings.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>成员</span><select value={reportFilters.member} onChange={(event) => setReportFilters((current) => ({ ...current, member: event.target.value }))}><option value="">全部</option>{state.settings.members.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>来源平台</span><select value={reportFilters.source} onChange={(event) => setReportFilters((current) => ({ ...current, source: event.target.value }))}><option value="">全部</option>{state.settings.sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
                <label><span>报表维度</span><select value={reportMode} onChange={(event) => setReportMode(event.target.value as ReportMode)}><option value="month">按月</option><option value="year">按年</option><option value="category">按分类</option><option value="member">按成员</option></select></label>
                <label><span>图表类型</span><select value={reportChart} onChange={(event) => setReportChart(event.target.value as ReportChart)}><option value="bar">柱状图</option><option value="pie">饼状图</option></select></label>
              </div>
            </CollapsiblePanel>
            <Panel title="图表">
              <ChartBox height={320} option={{}} chartRef={chartRef} />
            </Panel>
            <Panel title="统计表格">
              <table className="table">
                <thead>
                  {reportMode === 'month' || reportMode === 'year' ? (
                    <tr>
                      <th>统计周期</th>
                      {reportCategories.map((category) => <th key={category}>{category}</th>)}
                      <th>总支出金额</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>{reportMode === 'category' ? '分类' : '成员'}</th>
                      <th>支出金额</th>
                    </tr>
                  )}
                </thead>
                <tbody>
                  {(reportMode === 'month' || reportMode === 'year'
                    ? reportRows.map((row) => (
                      <tr key={row.period}>
                        <td>{row.period}</td>
                        {reportCategories.map((category) => <td key={category}>{formatMoney(row.categoryTotals[category] ?? 0)}</td>)}
                        <td>{formatMoney(row.total)}</td>
                      </tr>
                    ))
                    : (reportRows as Array<{ name: string; amount: number }>).map((row) => (
                      <tr key={row.name}><td>{row.name}</td><td>{formatMoney(row.amount)}</td></tr>
                    )))}
                </tbody>
              </table>
            </Panel>
            <Panel title="导出">
              <button onClick={() => {
                const rows = reportMode === 'month' || reportMode === 'year'
                  ? reportRows.map((row) => ({ 统计周期: row.period, 总支出金额: row.total, ...reportCategories.reduce<Record<string, number>>((acc, category) => ({ ...acc, [category]: row.categoryTotals[category] ?? 0 }), {}) }))
                  : (reportRows as Array<{ name: string; amount: number }>).map((row) => ({ 名称: row.name, 支出金额: row.amount }))
                const wb = XLSX.utils.book_new()
                const ws = XLSX.utils.json_to_sheet(rows)
                XLSX.utils.book_append_sheet(wb, ws, '报表')
                XLSX.writeFile(wb, '家庭记账报表.xlsx')
              }}><Download size={16} /> 导出报表</button>
            </Panel>
          </section>
        )}
        {page === 'settings' && (
          <section className="page-stack">
            <Panel title="分类维护">
              <ListEditor
                items={state.settings.categories}
                onChange={async (nextItems) => {
                  await persist({ ...state, settings: { ...state.settings, categories: nextItems }, updatedAt: new Date().toISOString() })
                }}
              />
            </Panel>
            <Panel title="成员维护">
              <ListEditor
                items={state.settings.members}
                onChange={async (nextItems) => {
                  await persist({ ...state, settings: { ...state.settings, members: nextItems }, updatedAt: new Date().toISOString() })
                }}
              />
            </Panel>
            <Panel title="来源平台维护">
              <ListEditor
                items={state.settings.sources}
                onChange={async (nextItems) => {
                  await persist({ ...state, settings: { ...state.settings, sources: nextItems }, updatedAt: new Date().toISOString() })
                }}
              />
            </Panel>
          </section>
        )}
        {page === 'data' && (
          <section className="page-stack">
            <Panel title="数据管理">
              <div className="toolbar">
                <button onClick={handleExportBackup}><Download size={16} /> 导出备份</button>
                <button onClick={() => window.ledger.openDataDir()}><FolderOpen size={16} /> 打开数据目录</button>
              </div>
              <div className="panel-inline">
                <h3>从备份恢复</h3>
                <div className="toolbar">
                  <label className="file-button"><Upload size={16} /> 选择备份文件<input type="file" accept=".json" onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    file.text().then((raw) => {
                      setBackupRaw(raw)
                      window.ledger.previewBackup(raw).then(setBackupPreview).catch(() => setBackupPreview(null))
                    })
                  }} /></label>
                  <button disabled={!backupRaw || restorePassword.length !== 6 || restorePassword !== restorePasswordConfirm} onClick={async () => {
                    if (!backupRaw) return
                    await handleRestoreBackup(new File([backupRaw], 'backup.json', { type: 'application/json' }))
                  }}><Upload size={16} /> 确认恢复</button>
                </div>
                {backupPreview && (
                  <div className="hint">
                    备份时间：{dayjs(backupPreview.updatedAt).format('YYYY-MM-DD HH:mm')}，记录数：{backupPreview.entriesCount}，分类数：{backupPreview.categoriesCount}
                  </div>
                )}
              </div>
              <div className="form-grid">
                <label><span>旧密码</span><input type="password" id="oldPassword" /></label>
                <label><span>新密码</span><input type="password" id="newPassword" /></label>
                <label><span>确认新密码</span><input type="password" id="confirmPassword" /></label>
              </div>
              <button onClick={async () => {
                const oldPassword = (document.getElementById('oldPassword') as HTMLInputElement | null)?.value ?? ''
                const newPassword = (document.getElementById('newPassword') as HTMLInputElement | null)?.value ?? ''
                const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement | null)?.value ?? ''
                if (newPassword.length !== 6 || newPassword !== confirmPassword) {
                  setMessage('密码需要 6 位且两次输入一致')
                  return
                }
                await handleChangePassword(oldPassword, newPassword)
              }}><Lock size={16} /> 修改密码</button>
            </Panel>
          </section>
        )}
      </main>
      {ledgerAddOpen && state && (
        <Modal title="手工新增" onClose={() => setLedgerAddOpen(false)}>
          <EntryEditor draft={draft} setDraft={setDraft} settings={state.settings} onSubmit={handleSaveDraft} submitLabel="保存" />
        </Modal>
      )}
      {ledgerImportOpen && state && (
        <Modal title="导入记账明细" onClose={() => setLedgerImportOpen(false)}>
          <div className="toolbar">
            <button onClick={downloadTemplate}><Download size={16} /> 下载模板</button>
            <label className="file-button"><Upload size={16} /> 选择 Excel<input type="file" accept=".xlsx,.xls" onChange={(event) => {
              const file = event.target.files?.[0]
              if (!file) return
              analyzeImportExcel(file).catch((error: unknown) => setMessage(error instanceof Error ? error.message : '导入失败'))
            }} /></label>
            <button disabled={!importAnalysis || importAnalysis.errorRows > 0} onClick={confirmImport}><Upload size={16} /> 确认导入</button>
            <button disabled={!importAnalysis || importAnalysis.errorRows === 0} className="ghost" onClick={downloadImportErrors}><Download size={16} /> 下载错误文件</button>
          </div>
          <p className="hint">模板列顺序：日期、金额、分类、成员、备注、来源平台</p>
          {importAnalysis && (
            <div className="panel-inline">
              <h3>导入预览</h3>
              <div className="hint">
                总行数：{importAnalysis.totalRows}，可导入行数：{importAnalysis.validRows}，错误行数：{importAnalysis.errorRows}，重复行数：{importAnalysis.duplicateRows}
              </div>
              {importAnalysis.errorRows > 0 && (
                <table className="table compact">
                  <thead>
                    <tr>
                      <th>行号</th>
                      <th>错误原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importAnalysis.errors.slice(0, 10).map((error) => (
                      <tr key={error.rowNumber}>
                        <td>{error.rowNumber}</td>
                        <td>{error.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </Modal>
      )}
      {editingId && state && (
        <Modal title="编辑记录" onClose={() => { setEditingId(null); setEditDraft(createDraft(state.settings)) }}>
          <EntryEditor draft={editDraft} setDraft={setEditDraft} settings={state.settings} onSubmit={handleSaveEdit} submitLabel="保存" />
        </Modal>
      )}
    </div>
  )
}

function Panel(props: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-title">{props.title}</div>
      {props.children}
    </section>
  )
}

function CollapsiblePanel(props: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div className="panel-title">{props.title}</div>
        <button className="ghost panel-toggle" onClick={props.onToggle}>
          {props.open ? '收起' : '展开'}
        </button>
      </div>
      {props.open && props.children}
    </section>
  )
}

function Card(props: { title: string; value: string }) {
  return (
    <section className="card">
      <div className="card-title">{props.title}</div>
      <div className="card-value">{props.value}</div>
    </section>
  )
}

function Modal(props: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h3>{props.title}</h3>
          <button className="ghost" onClick={props.onClose}>关闭</button>
        </div>
        {props.children}
      </div>
    </div>
  )
}

function ChartBox(props: { height: number; option: echarts.EChartsOption; chartRef?: RefObject<HTMLDivElement | null> }) {
  const localRef = useRef<HTMLDivElement | null>(null)
  const ref = props.chartRef ?? localRef

  useEffect(() => {
    if (!ref.current || Object.keys(props.option).length === 0) return
    const chart = echarts.init(ref.current)
    chart.setOption(props.option)
    const resize = () => chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [props.option, ref])

  return <div ref={ref} style={{ height: props.height, width: '100%' }} />
}

function EntryEditor(props: {
  draft: Draft
  setDraft: Dispatch<SetStateAction<Draft>>
  settings: AppSettings
  onSubmit: () => Promise<void>
  submitLabel: string
}) {
  const draft = props.draft

  return (
    <div className="entry-form">
      <div className="form-grid">
        <label><span>日期</span><input type="date" value={draft.date} onChange={(event) => props.setDraft((current) => ({ ...current, date: event.target.value }))} /></label>
        <label><span>金额</span><input inputMode="decimal" value={draft.amount} onChange={(event) => props.setDraft((current) => ({ ...current, amount: event.target.value }))} /></label>
        <label><span>分类</span><select value={draft.category} onChange={(event) => props.setDraft((current) => ({ ...current, category: event.target.value }))}>{props.settings.categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>成员</span><select value={draft.member} onChange={(event) => props.setDraft((current) => ({ ...current, member: event.target.value }))}>{props.settings.members.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label><span>来源平台</span><select value={draft.source} onChange={(event) => props.setDraft((current) => ({ ...current, source: event.target.value }))}>{props.settings.sources.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="wide"><span>备注</span><input value={draft.note} onChange={(event) => props.setDraft((current) => ({ ...current, note: event.target.value }))} /></label>
      </div>
      <button onClick={props.onSubmit}><Plus size={16} /> {props.submitLabel}</button>
    </div>
  )
}

function ListEditor(props: { items: string[]; onChange: (nextItems: string[]) => Promise<void> }) {
  const [draft, setDraft] = useState('')
  const [localItems, setLocalItems] = useState(props.items)

  useEffect(() => {
    setLocalItems(props.items)
  }, [props.items])

  async function commit(nextItems: string[]) {
    setLocalItems(nextItems)
    await props.onChange(nextItems)
  }

  return (
    <div className="list-editor">
      <div className="list-add">
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="输入新选项" />
        <button onClick={async () => {
          const value = draft.trim()
          if (!value || localItems.includes(value)) return
          setDraft('')
          await commit([...localItems, value])
        }}>添加</button>
      </div>
      <div className="tag-list">
        {localItems.map((item, index) => (
          <div key={item} className="tag-item">
            <input
              value={item}
              onChange={async (event) => {
                const nextItems = [...localItems]
                nextItems[index] = event.target.value
                setLocalItems(nextItems)
              }}
              onBlur={async (event) => {
                const value = event.target.value.trim()
                if (!value || localItems.filter((current, currentIndex) => currentIndex !== index).includes(value)) {
                  setLocalItems(props.items)
                  return
                }
                const nextItems = [...localItems]
                nextItems[index] = value
                await commit(nextItems)
              }}
            />
            <button className="ghost" onClick={async () => {
              const nextItems = localItems.filter((_, currentIndex) => currentIndex !== index)
              await commit(nextItems)
            }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App

