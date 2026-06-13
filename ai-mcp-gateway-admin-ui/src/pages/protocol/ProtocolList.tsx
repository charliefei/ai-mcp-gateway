import { useState, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { TableSkeleton } from '@/components/ui/skeleton'
import {
  PageHeader,
  EmptyState,
  SearchBar,
  Pagination,
  Toolbar,
  FormField,
  ConfirmDialog,
  MethodPill,
} from '@/components/common'
import { protocolApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Globe, RefreshCw, Upload, Trash2, X, ChevronDown, ChevronRight, Sparkles, RotateCcw, FileJson, FileUp, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { GatewayProtocolDTO, HTTPProtocolSave, ProtocolMappingSave } from '@/types'

export function ProtocolList() {
  const [data, setData] = useState<GatewayProtocolDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchProtocolId, setSearchProtocolId] = useState('')
  const [searchHttpUrl, setSearchHttpUrl] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<HTTPProtocolSave>({
    httpUrl: '',
    httpMethod: 'GET',
    httpHeaders: '',
    timeout: 30000,
    mappings: [],
  })

  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importEndpoints, setImportEndpoints] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzedData, setAnalyzedData] = useState<GatewayProtocolDTO[]>([])
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importFileError, setImportFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const toggleExpand = (protocolId: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(protocolId)) next.delete(protocolId)
      else next.add(protocolId)
      return next
    })
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await protocolApi.queryGatewayProtocolPage({
        protocolId: searchProtocolId ? Number(searchProtocolId) : undefined,
        httpUrl: searchHttpUrl || undefined,
        page,
        rows,
      })
      if (res.data.code === '0000') {
        setData(res.data.data || [])
        setTotal(res.data.total || 0)
      } else {
        toast.error(res.data.info || '查询失败')
      }
    } catch {
      toast.error('查询协议配置失败')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [page, rows, searchProtocolId, searchHttpUrl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  const resetSearch = () => {
    setSearchProtocolId('')
    setSearchHttpUrl('')
    setPage(1)
    fetchData()
  }

  const openCreate = () => {
    setEditingProtocol({
      httpUrl: '',
      httpMethod: 'GET',
      httpHeaders: '',
      timeout: 30000,
      mappings: [],
    })
    setDialogOpen(true)
  }

  const addMapping = () => {
    setEditingProtocol((prev) => ({
      ...prev,
      mappings: [
        ...prev.mappings,
        {
          mappingType: 'request',
          parentPath: '',
          fieldName: '',
          mcpPath: '',
          mcpType: 'string',
          mcpDesc: '',
          isRequired: 0,
          sortOrder: prev.mappings.length + 1,
        },
      ],
    }))
  }

  const updateMapping = (index: number, field: keyof ProtocolMappingSave, value: string | number) => {
    setEditingProtocol((prev) => ({
      ...prev,
      mappings: prev.mappings.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }))
  }

  const removeMapping = (index: number) => {
    setEditingProtocol((prev) => ({
      ...prev,
      mappings: prev.mappings.filter((_, i) => i !== index),
    }))
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

  const handleFileSelected = useCallback(async (file: File) => {
    setImportFileError(null)
    const name = file.name.toLowerCase()
    if (!name.endsWith('.json') && file.type !== 'application/json' && file.type !== 'text/json') {
      setImportFileError('仅支持 .json 文件')
      setImportFile(null)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setImportFileError(`文件超过 5MB 上限 (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      setImportFile(null)
      return
    }
    try {
      const text = await file.text()
      // Basic JSON validation
      JSON.parse(text)
      setImportJson(text)
      setImportFile(file)
    } catch {
      setImportFileError('JSON 解析失败，请检查文件内容')
      setImportFile(null)
    }
  }, [])

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
    // Reset so the same file can be re-selected later
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelected(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDragging) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const clearFile = () => {
    setImportFile(null)
    setImportJson('')
    setImportFileError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!editingProtocol.httpUrl) {
      toast.error('请求地址为必填项')
      return
    }
    setSaving(true)
    try {
      const res = await protocolApi.saveGatewayProtocol({
        httpProtocols: [editingProtocol],
      })
      if (res.data.code === '0000') {
        toast.success('保存成功')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.data.info || '保存失败')
      }
    } catch {
      toast.error('保存协议配置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (deleteTarget == null) return
    setDeleting(true)
    try {
      const res = await protocolApi.deleteGatewayProtocol(deleteTarget)
      if (res.data.code === '0000') {
        toast.success('删除成功', { description: `协议 ${deleteTarget} 已删除` })
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除协议配置失败')
    } finally {
      setDeleting(false)
    }
  }

  const handleAnalysis = async () => {
    if (!importJson) {
      toast.error('请输入 OpenAPI JSON')
      return
    }
    setAnalyzing(true)
    try {
      const endpoints = importEndpoints
        ? importEndpoints.split(',').map((e) => e.trim()).filter(Boolean)
        : []
      const res = await protocolApi.analysisProtocol({
        openApiJson: importJson,
        endpoints,
      })
      if (res.data.code === '0000') {
        setAnalyzedData(res.data.data || [])
        toast.success(`解析成功，共 ${res.data.data?.length || 0} 个端点`)
      } else {
        toast.error(res.data.info || '解析失败')
      }
    } catch {
      toast.error('解析协议失败')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleImport = async () => {
    setImporting(true)
    try {
      const endpoints = importEndpoints
        ? importEndpoints.split(',').map((e) => e.trim()).filter(Boolean)
        : []
      const res = await protocolApi.importGatewayProtocol({
        openApiJson: importJson,
        endpoints,
      })
      if (res.data.code === '0000') {
        toast.success('导入成功', { description: 'OpenAPI 协议已添加到系统' })
        setImportDialogOpen(false)
        setImportJson('')
        setImportEndpoints('')
        setAnalyzedData([])
        setImportFile(null)
        setImportFileError(null)
        fetchData()
      } else {
        toast.error(res.data.info || '导入失败')
      }
    } catch {
      toast.error('导入协议失败')
    } finally {
      setImporting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-6">
      <PageHeader
        title="协议配置"
        description="管理 HTTP 协议映射，支持手动配置与 OpenAPI 3.0 一键导入。"
        icon={<Globe className="h-5 w-5" />}
        badge={<Badge variant="outline">{total} 条</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchData} className="cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="cursor-pointer">
              <Upload className="h-4 w-4" />
              导入 OpenAPI
            </Button>
            <Button onClick={openCreate} className="cursor-pointer">
              <Plus className="h-4 w-4" />
              新增协议
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <SearchBar
            value={searchHttpUrl}
            onChange={setSearchHttpUrl}
            onSearch={handleSearch}
            onReset={resetSearch}
            placeholder="搜索请求地址..."
          />
        </CardContent>
      </Card>

      <Card>
        <Toolbar
          title="协议列表"
          description="所有 HTTP 协议映射规则"
          count={total}
          icon={<Globe className="h-4 w-4" />}
        />
        <CardContent className="p-0">
          {initialLoad && loading ? (
            <div className="p-5">
              <TableSkeleton columns={5} />
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<Globe className="h-8 w-8" />}
              title="还没有协议配置"
              description="手动添加 HTTP 协议，或导入 OpenAPI JSON 自动生成映射。"
              action={
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setImportDialogOpen(true)} className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    导入 OpenAPI
                  </Button>
                  <Button onClick={openCreate} className="cursor-pointer">
                    <Plus className="h-4 w-4" />
                    新建协议
                  </Button>
                </div>
              }
            />
          ) : (
            <>
              {loading && !initialLoad && (
                <div className="flex items-center gap-2 px-5 py-2 text-xs text-muted-foreground border-b border-border/60 bg-primary/5">
                  <RefreshCw className="h-3 w-3 animate-spin text-primary" />
                  刷新中...
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/20">
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground w-12"></th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">协议</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">请求地址</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">方法</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">超时</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">映射数</th>
                      <th className="text-right py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <>
                        <tr
                          key={item.protocolId}
                          className="group border-b border-border/40 last:border-0 hover:bg-primary/[0.03] transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => toggleExpand(item.protocolId)}
                              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              aria-expanded={expandedRows.has(item.protocolId)}
                              aria-label="展开映射"
                            >
                              {expandedRows.has(item.protocolId) ? (
                                <ChevronDown className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                                  'bg-gradient-to-br from-emerald-500/15 to-emerald-500/0',
                                  'text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20',
                                  'transition-transform duration-200 group-hover:scale-110'
                                )}
                              >
                                <Globe className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground font-mono">
                                  #{item.protocolId}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.mappings?.length || 0} 条映射
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <code className="font-mono text-xs px-2 py-1 rounded-md bg-muted/40 border border-border/60 max-w-[300px] inline-block truncate align-middle">
                              {item.httpUrl || '—'}
                            </code>
                          </td>
                          <td className="py-3.5 px-5">
                            <MethodPill method={item.httpMethod} />
                          </td>
                          <td className="py-3.5 px-5 text-muted-foreground tabular-nums">
                            {item.timeout ? `${item.timeout}ms` : '—'}
                          </td>
                          <td className="py-3.5 px-5">
                            <Badge variant="secondary">{item.mappings?.length || 0}</Badge>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(item.protocolId)}
                              className="cursor-pointer text-muted-foreground hover:text-destructive"
                              aria-label={`删除协议 ${item.protocolId}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.has(item.protocolId) && item.mappings && (
                          <tr key={`${item.protocolId}-mappings`} className="bg-muted/20">
                            <td colSpan={7} className="p-0">
                              <div className="px-12 py-4 border-b border-border/40">
                                <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                                  <FileJson className="h-3.5 w-3.5" />
                                  字段映射 ({item.mappings.length})
                                </p>
                                <div className="rounded-lg border border-border/60 overflow-hidden">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-muted/40">
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">mcpPath</th>
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">fieldName</th>
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">类型</th>
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">方向</th>
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">必填</th>
                                        <th className="p-2.5 text-left font-medium text-muted-foreground">描述</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.mappings.map((m, idx) => (
                                        <tr key={idx} className="border-t border-border/40 hover:bg-background/40 transition-colors">
                                          <td className="p-2.5 font-mono">{m.mcpPath || '—'}</td>
                                          <td className="p-2.5 font-mono">{m.fieldName || '—'}</td>
                                          <td className="p-2.5">
                                            <Badge variant="secondary">{m.mcpType || '—'}</Badge>
                                          </td>
                                          <td className="p-2.5">
                                            <Badge variant={m.mappingType === 'request' ? 'info' : 'warning'}>
                                              {m.mappingType || '—'}
                                            </Badge>
                                          </td>
                                          <td className="p-2.5">
                                            {m.isRequired === 1 ? (
                                              <Badge variant="destructive">是</Badge>
                                            ) : (
                                              <span className="text-muted-foreground">否</span>
                                            )}
                                          </td>
                                          <td className="p-2.5 text-muted-foreground">{m.mcpDesc || '—'}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 pb-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={rows}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Save Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="xl">
        <DialogClose onClose={() => setDialogOpen(false)} />
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>新增协议配置</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                配置 HTTP 请求和 MCP 字段映射
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="请求地址" required htmlFor="httpUrl" className="sm:col-span-2">
                <Input
                  id="httpUrl"
                  value={editingProtocol.httpUrl}
                  onChange={(e) =>
                    setEditingProtocol({ ...editingProtocol, httpUrl: e.target.value })
                  }
                  placeholder="https://api.example.com/data"
                  className="font-mono"
                />
              </FormField>
              <FormField label="请求方法" htmlFor="httpMethod">
                <Select
                  id="httpMethod"
                  value={editingProtocol.httpMethod}
                  onChange={(v) =>
                    setEditingProtocol({ ...editingProtocol, httpMethod: v })
                  }
                  options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({
                    value: m,
                    label: m,
                  }))}
                />
              </FormField>
              <FormField label="超时（毫秒）" htmlFor="timeout">
                <Input
                  id="timeout"
                  type="number"
                  value={String(editingProtocol.timeout)}
                  onChange={(e) =>
                    setEditingProtocol({ ...editingProtocol, timeout: Number(e.target.value) })
                  }
                />
              </FormField>
              <FormField
                label="请求头 (JSON)"
                htmlFor="httpHeaders"
                className="sm:col-span-2"
                hint='例如 {"Content-Type":"application/json"}'
              >
                <Input
                  id="httpHeaders"
                  value={editingProtocol.httpHeaders}
                  onChange={(e) =>
                    setEditingProtocol({ ...editingProtocol, httpHeaders: e.target.value })
                  }
                  placeholder='{"Content-Type":"application/json"}'
                  className="font-mono"
                />
              </FormField>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold">字段映射</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addMapping}
                  className="cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  添加映射
                </Button>
              </div>
              <div className="space-y-2">
                {editingProtocol.mappings.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center text-xs text-muted-foreground">
                    还没有字段映射，点击「添加映射」开始配置
                  </div>
                )}
                {editingProtocol.mappings.map((m, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/60 bg-card p-3 space-y-2.5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground">
                        映射 #{i + 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeMapping(i)}
                        className="cursor-pointer text-muted-foreground hover:text-destructive h-6 w-6"
                        aria-label={`删除映射 #${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="mcpPath"
                        value={m.mcpPath}
                        onChange={(e) => updateMapping(i, 'mcpPath', e.target.value)}
                        className="text-xs font-mono"
                      />
                      <Input
                        placeholder="fieldName"
                        value={m.fieldName}
                        onChange={(e) => updateMapping(i, 'fieldName', e.target.value)}
                        className="text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="mcpType"
                        value={m.mcpType}
                        onChange={(e) => updateMapping(i, 'mcpType', e.target.value)}
                        className="text-xs font-mono"
                      />
                      <Input
                        placeholder="mcpDesc"
                        value={m.mcpDesc}
                        onChange={(e) => updateMapping(i, 'mcpDesc', e.target.value)}
                        className="text-xs"
                      />
                      <Select
                        value={m.mappingType}
                        onChange={(v) => updateMapping(i, 'mappingType', v)}
                        options={[
                          { value: 'request', label: 'request' },
                          { value: 'response', label: 'response' },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setDialogOpen(false)} className="cursor-pointer">
            取消
          </Button>
          <Button onClick={handleSave} disabled={saving} className="cursor-pointer min-w-[100px]">
            {saving ? (
              <>
                <RotateCcw className="h-4 w-4 animate-spin" />
                保存中
              </>
            ) : (
              '保存'
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen} size="xl">
        <DialogClose
          onClose={() => {
            setImportDialogOpen(false)
            setAnalyzedData([])
            setImportFile(null)
            setImportFileError(null)
            setIsDragging(false)
          }}
        />
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-purple-500/15 text-primary ring-1 ring-primary/20">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>导入 OpenAPI 协议</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                粘贴 OpenAPI 3.0 JSON 自动生成协议映射
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <FormField
              label="OpenAPI JSON"
              required
              error={importFileError ?? undefined}
            >
              {/* Tabs: 上传文件 | 粘贴文本 */}
              <div className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5 text-muted-foreground mb-2">
                <button
                  type="button"
                  onClick={() => {
                    /* upload mode active by default */
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                    'bg-card text-foreground shadow-soft-sm'
                  )}
                >
                  <FileUp className="h-3 w-3" />
                  上传文件
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all hover:bg-background/60 hover:text-foreground cursor-pointer"
                >
                  <FileJson className="h-3 w-3" />
                  粘贴
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json,text/json"
                onChange={handleFileInput}
                className="sr-only"
              />

              {!importFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    'group flex flex-col items-center justify-center gap-2',
                    'rounded-xl border-2 border-dashed bg-card/40 px-6 py-8',
                    'cursor-pointer transition-all duration-200',
                    isDragging
                      ? 'border-primary bg-primary/10 scale-[1.01]'
                      : 'border-border hover:border-primary/50 hover:bg-card hover:shadow-soft-sm'
                  )}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      fileInputRef.current?.click()
                    }
                  }}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl transition-all',
                      isDragging
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'bg-primary/10 text-primary group-hover:scale-110'
                    )}
                  >
                    <Upload
                      className={cn(
                        'h-5 w-5 transition-transform',
                        isDragging && 'animate-bounce'
                      )}
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">
                      {isDragging ? '松开以上传文件' : '点击或拖拽上传'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      支持 .json 文件 · 最大 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 animate-in fade-in-0 slide-in-from-top-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <FileJson className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {importFile.name}
                      </p>
                      <Badge variant="success" className="shrink-0">
                        <Check className="h-2.5 w-2.5" />
                        已加载
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 tabular-nums">
                      {(importFile.size / 1024).toFixed(1)} KB ·{' '}
                      {importJson.length.toLocaleString()} 字符
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearFile}
                    className="cursor-pointer text-muted-foreground hover:text-destructive shrink-0"
                    aria-label="清除文件"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Hidden textarea as fallback for paste mode — toggled by "粘贴" tab */}
              <details className="mt-2 group/paste">
                <summary className="text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none flex items-center gap-1.5">
                  <ChevronRight className="h-3 w-3 transition-transform group-open/paste:rotate-90" />
                  或直接粘贴 JSON 内容
                </summary>
                <Textarea
                  value={importJson}
                  onChange={(e) => {
                    setImportJson(e.target.value)
                    if (importFile) setImportFile(null)
                  }}
                  placeholder="粘贴 OpenAPI 3.0 规范的 JSON 内容..."
                  rows={8}
                  className="font-mono text-xs mt-2"
                />
              </details>
            </FormField>
            <FormField
              label="端点过滤"
              hint="可选，逗号分隔，例如 /api/users,/api/orders"
            >
              <Input
                value={importEndpoints}
                onChange={(e) => setImportEndpoints(e.target.value)}
                placeholder="/api/users,/api/orders"
                className="font-mono"
              />
            </FormField>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAnalysis}
                disabled={analyzing}
                className="cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    解析中
                  </>
                ) : (
                  <>
                    <FileJson className="h-4 w-4" />
                    解析预览
                  </>
                )}
              </Button>
              <Button onClick={handleImport} disabled={importing} className="cursor-pointer">
                {importing ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    导入中
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    确认导入
                  </>
                )}
              </Button>
            </div>
            {analyzedData.length > 0 && (
              <div className="rounded-lg border border-border/60 overflow-hidden animate-in fade-in-0 slide-in-from-top-2">
                <div className="bg-muted/30 px-4 py-2.5 border-b border-border/60 flex items-center justify-between">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-primary" />
                    解析结果
                  </p>
                  <Badge variant="default">{analyzedData.length} 个端点</Badge>
                </div>
                <div className="max-h-[200px] overflow-y-auto divide-y divide-border/40">
                  {analyzedData.map((item, i) => (
                    <div
                      key={i}
                      className="px-4 py-2.5 flex items-center gap-3 text-xs hover:bg-muted/20 transition-colors"
                    >
                      <MethodPill method={item.httpMethod} />
                      <code className="font-mono text-foreground/90 truncate flex-1">
                        {item.httpUrl}
                      </code>
                      <Badge variant="ghost" className="text-[10px]">
                        {item.mappings?.length || 0} 映射
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogBody>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="删除协议配置？"
        description={`确认删除协议 ${deleteTarget} 吗？该操作不可恢复。`}
        variant="destructive"
        confirmText="确认删除"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
