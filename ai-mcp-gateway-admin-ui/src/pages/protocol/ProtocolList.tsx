import { useState, useEffect, useCallback, Fragment } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { TableSkeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page-header'
import { protocolApi } from '@/lib/api'
import { toast } from 'sonner'
import {
  Plus,
  Search,
  RefreshCw,
  Globe,
  Trash2,
  Upload,
  ChevronDown,
  ChevronRight,
  X,
} from 'lucide-react'
import type {
  GatewayProtocolDTO,
  HTTPProtocolSave,
  ProtocolMappingSave,
  ProtocolMappingDTO,
} from '@/types'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-aurora-3/40 blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md">
          <Globe className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">暂无协议配置数据</p>
      <p className="text-xs text-muted-foreground mt-1.5">通过“新增协议”手动创建，或“导入 OpenAPI”批量生成</p>
    </div>
  )
}

const methodVariant = (m: string) => {
  switch ((m || '').toUpperCase()) {
    case 'GET':
      return 'info'
    case 'POST':
      return 'success'
    case 'PUT':
      return 'warning'
    case 'DELETE':
      return 'destructive'
    default:
      return 'secondary'
  }
}

export function ProtocolList() {
  const [data, setData] = useState<GatewayProtocolDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows] = useState(10)
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

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

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

  const handleDelete = async (protocolId: number) => {
    if (!confirm(`确定要删除协议 ${protocolId} 吗？`)) return
    try {
      const res = await protocolApi.deleteGatewayProtocol(protocolId)
      if (res.data.code === '0000') {
        toast.success('删除成功')
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除协议配置失败')
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
        toast.success('导入成功')
        setImportDialogOpen(false)
        setImportJson('')
        setImportEndpoints('')
        setAnalyzedData([])
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

  const totalPages = Math.ceil(total / rows)

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Globe}
        title="协议配置"
        display="Protocols"
        meta="03 / Protocol Mapping"
        description="将后端 REST API 映射为 MCP 工具协议，支持手动配置与 OpenAPI 3.0 一键导入。"
        actions={
          <>
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
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px] max-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="协议 ID"
                value={searchProtocolId}
                onChange={(e) => setSearchProtocolId(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="请求地址"
                value={searchHttpUrl}
                onChange={(e) => setSearchHttpUrl(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="default" size="sm" onClick={handleSearch} className="cursor-pointer">搜索</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchProtocolId(''); setSearchHttpUrl(''); setPage(1); }}
              className="cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <CardTitle className="text-[15px]">协议列表</CardTitle>
            <span className="ml-1 inline-flex items-center justify-center min-w-[26px] h-[22px] rounded-full bg-foreground/[0.06] px-2 text-[11px] font-semibold font-mono text-foreground/70">
              {total}
            </span>
          </div>
          {loading && !initialLoad && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />刷新中
            </div>
          )}
        </CardHeader>
        <CardContent>
          {initialLoad && loading ? (
            <TableSkeleton columns={6} />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.025]">
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">协议 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">请求地址</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">方法</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">超时 (ms)</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">映射数</th>
                      <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <Fragment key={item.protocolId}>
                        <tr className="border-b border-border/30 hover:bg-foreground/[0.025] transition-colors duration-150">
                          <td className="py-3.5 px-4 font-mono text-xs">{item.protocolId}</td>
                          <td className="py-3.5 px-4 font-mono text-xs max-w-[340px] truncate" title={item.httpUrl}>
                            {item.httpUrl || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={methodVariant(item.httpMethod) as 'info' | 'success' | 'warning' | 'destructive' | 'secondary'}>
                              {item.httpMethod || '—'}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{item.timeout ?? '—'}</td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => toggleExpand(item.protocolId)}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              aria-expanded={expandedRows.has(item.protocolId)}
                              aria-controls={`mappings-${item.protocolId}`}
                            >
                              {expandedRows.has(item.protocolId) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {item.mappings?.length || 0} 条映射
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item.protocolId)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                              aria-label={`删除协议 ${item.protocolId}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                        {expandedRows.has(item.protocolId) && item.mappings && (
                          <tr id={`mappings-${item.protocolId}`}>
                            <td colSpan={6} className="p-0 bg-foreground/[0.02]">
                              <div className="px-6 py-4">
                                <div className="rounded-xl border border-border/50 overflow-hidden bg-background/40 backdrop-blur-sm">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="bg-foreground/[0.04]">
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">mcpPath</th>
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">fieldName</th>
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">mcpType</th>
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">mappingType</th>
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">必填</th>
                                        <th className="p-2.5 text-left font-semibold uppercase tracking-wider text-[10px] text-muted-foreground">描述</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {item.mappings.map((m: ProtocolMappingDTO, idx: number) => (
                                        <tr key={idx} className="border-t border-border/30">
                                          <td className="p-2.5 font-mono">{m.mcpPath || '—'}</td>
                                          <td className="p-2.5">{m.fieldName || '—'}</td>
                                          <td className="p-2.5"><Badge variant="info">{m.mcpType || '—'}</Badge></td>
                                          <td className="p-2.5">
                                            <Badge variant={m.mappingType === 'request' ? 'success' : 'secondary'}>
                                              {m.mappingType || '—'}
                                            </Badge>
                                          </td>
                                          <td className="p-2.5 font-mono text-muted-foreground">{m.isRequired === 1 ? '是' : '否'}</td>
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
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-5">
                  <span className="text-xs text-muted-foreground font-mono">页 {page} <span className="text-muted-foreground/50">/</span> {totalPages}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">上一页</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="cursor-pointer">下一页</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Manual Save Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Create</p>
            <DialogTitle>新增协议配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-6 max-h-[60vh] overflow-y-auto pr-1">
            <div className="space-y-2">
              <Label>请求地址 *</Label>
              <Input value={editingProtocol.httpUrl} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpUrl: e.target.value })} placeholder="https://api.example.com/data" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>请求方法</Label>
                <Select value={editingProtocol.httpMethod} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpMethod: e.target.value })}
                  options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({ value: m, label: m }))} />
              </div>
              <div className="space-y-2">
                <Label>超时 (ms)</Label>
                <Input type="number" value={String(editingProtocol.timeout)} onChange={(e) => setEditingProtocol({ ...editingProtocol, timeout: Number(e.target.value) })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>请求头 (JSON)</Label>
              <Input value={editingProtocol.httpHeaders} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpHeaders: e.target.value })} placeholder='{"Content-Type":"application/json"}' />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>字段映射</Label>
                <Button variant="outline" size="sm" onClick={addMapping} className="cursor-pointer">
                  <Plus className="h-3.5 w-3.5" />
                  添加映射
                </Button>
              </div>
              {editingProtocol.mappings.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 py-6 text-center text-xs text-muted-foreground">
                  尚未添加字段映射
                </div>
              ) : (
                editingProtocol.mappings.map((m, i) => (
                  <div key={i} className="relative rounded-xl border border-border/60 p-3 space-y-2 bg-background/30 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        映射 #{String(i + 1).padStart(2, '0')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMapping(i)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                        aria-label={`删除映射 #${i + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input placeholder="mcpPath" value={m.mcpPath} onChange={(e) => updateMapping(i, 'mcpPath', e.target.value)} className="text-xs h-8" />
                      <Input placeholder="fieldName" value={m.fieldName} onChange={(e) => updateMapping(i, 'fieldName', e.target.value)} className="text-xs h-8" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input placeholder="mcpType" value={m.mcpType} onChange={(e) => updateMapping(i, 'mcpType', e.target.value)} className="text-xs h-8" />
                      <Input placeholder="mcpDesc" value={m.mcpDesc} onChange={(e) => updateMapping(i, 'mcpDesc', e.target.value)} className="text-xs h-8" />
                      <Select value={m.mappingType} onChange={(e) => updateMapping(i, 'mappingType', e.target.value)} options={[{ value: 'request', label: 'request' }, { value: 'response', label: 'response' }]} className="text-xs h-8" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">取消</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">{saving ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent onClose={() => { setImportDialogOpen(false); setAnalyzedData([]); }}>
          <DialogHeader>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Import</p>
            <DialogTitle>导入 OpenAPI 协议</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label>OpenAPI JSON *</Label>
              <Textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder='粘贴 OpenAPI 3.0 规范的 JSON 内容...' rows={8} className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>端点过滤（可选，逗号分隔）</Label>
              <Input value={importEndpoints} onChange={(e) => setImportEndpoints(e.target.value)} placeholder="/api/users,/api/orders" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleAnalysis} disabled={analyzing} className="cursor-pointer">{analyzing ? '解析中...' : '解析预览'}</Button>
              <Button onClick={handleImport} disabled={importing} className="cursor-pointer">{importing ? '导入中...' : '确认导入'}</Button>
            </div>
            {analyzedData.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-background/30 backdrop-blur-sm p-3 max-h-[200px] overflow-y-auto">
                <p className="text-xs font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                  解析结果 · {analyzedData.length} 个端点
                </p>
                {analyzedData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0 text-xs">
                    <Badge variant={methodVariant(item.httpMethod) as 'info' | 'success' | 'warning' | 'destructive' | 'secondary'}>{item.httpMethod}</Badge>
                    <span className="font-mono truncate flex-1">{item.httpUrl}</span>
                    <span className="text-muted-foreground/70 font-mono shrink-0">{item.mappings?.length || 0} 映射</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
