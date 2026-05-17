import { useState, useEffect, useCallback } from 'react'
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { protocolApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Globe, Trash2, Upload, ChevronDown, ChevronRight } from 'lucide-react'
import type { GatewayProtocolDTO, HTTPProtocolSave, ProtocolMappingSave, ProtocolMappingDTO } from '@/types'

export function ProtocolList() {
  const [data, setData] = useState<GatewayProtocolDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchProtocolId, setSearchProtocolId] = useState('')
  const [searchHttpUrl, setSearchHttpUrl] = useState('')

  // Manual save dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingProtocol, setEditingProtocol] = useState<HTTPProtocolSave>({
    httpUrl: '',
    httpMethod: 'GET',
    httpHeaders: '',
    timeout: 30000,
    mappings: [],
  })

  // Import dialog
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importEndpoints, setImportEndpoints] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzedData, setAnalyzedData] = useState<GatewayProtocolDTO[]>([])
  const [importing, setImporting] = useState(false)

  // Expanded rows for mappings
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
        { mappingType: 'request', parentPath: '', fieldName: '', mcpPath: '', mcpType: 'string', mcpDesc: '', isRequired: 0, sortOrder: prev.mappings.length + 1 },
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">协议配置</h2>
          <p className="text-sm text-muted-foreground mt-1">管理网关协议映射配置，支持手动编辑和 OpenAPI 导入</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            导入 OpenAPI
          </Button>
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4 mr-2" />
            新增协议
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Input placeholder="协议ID" value={searchProtocolId} onChange={(e) => setSearchProtocolId(e.target.value)} className="max-w-[180px]" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Input placeholder="请求地址" value={searchHttpUrl} onChange={(e) => setSearchHttpUrl(e.target.value)} className="max-w-[250px]" onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            <Button variant="outline" onClick={handleSearch}><Search className="h-4 w-4 mr-2" />搜索</Button>
            <Button variant="ghost" onClick={() => { setSearchProtocolId(''); setSearchHttpUrl(''); setPage(1); }}><RefreshCw className="h-4 w-4 mr-2" />重置</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base"><Globe className="h-4 w-4 inline mr-2" />协议列表 ({total} 条记录)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin mr-2" />加载中...</div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Globe className="h-10 w-10 mb-3 opacity-30" /><p>暂无协议配置数据</p></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">协议ID</th>
                      <th className="text-left py-3 px-4 font-medium">请求地址</th>
                      <th className="text-left py-3 px-4 font-medium">请求方法</th>
                      <th className="text-left py-3 px-4 font-medium">超时(ms)</th>
                      <th className="text-left py-3 px-4 font-medium">映射数</th>
                      <th className="text-right py-3 px-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <>
                        <tr key={item.protocolId} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">{item.protocolId}</td>
                          <td className="py-3 px-4 font-mono text-xs max-w-[300px] truncate">{item.httpUrl}</td>
                          <td className="py-3 px-4"><Badge>{item.httpMethod}</Badge></td>
                          <td className="py-3 px-4">{item.timeout}</td>
                          <td className="py-3 px-4">
                            <button onClick={() => toggleExpand(item.protocolId)} className="flex items-center gap-1 text-blue-600 hover:underline">
                              {expandedRows.has(item.protocolId) ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                              {item.mappings?.length || 0} 条映射
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.protocolId)} className="text-red-500 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
                          </td>
                        </tr>
                        {expandedRows.has(item.protocolId) && item.mappings && (
                          <tr key={`${item.protocolId}-mappings`}>
                            <td colSpan={6} className="py-3 px-4 bg-slate-50">
                              <table className="w-full text-xs border">
                                <thead>
                                  <tr className="bg-slate-100">
                                    <th className="p-2 text-left">mcpPath</th>
                                    <th className="p-2 text-left">fieldName</th>
                                    <th className="p-2 text-left">mcpType</th>
                                    <th className="p-2 text-left">mappingType</th>
                                    <th className="p-2 text-left">必填</th>
                                    <th className="p-2 text-left">描述</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {item.mappings.map((m: ProtocolMappingDTO, idx: number) => (
                                    <tr key={idx} className="border-t">
                                      <td className="p-2 font-mono">{m.mcpPath}</td>
                                      <td className="p-2">{m.fieldName}</td>
                                      <td className="p-2"><Badge variant="secondary">{m.mcpType}</Badge></td>
                                      <td className="p-2">{m.mappingType}</td>
                                      <td className="p-2">{m.isRequired === 1 ? '是' : '否'}</td>
                                      <td className="p-2 text-muted-foreground">{m.mcpDesc}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">第 {page} / {totalPages} 页</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>上一页</Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>下一页</Button>
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
          <DialogHeader><DialogTitle>新增协议配置</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2"><Label>请求地址 *</Label><Input value={editingProtocol.httpUrl} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpUrl: e.target.value })} placeholder="https://api.example.com/data" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>请求方法</Label>
                <Select value={editingProtocol.httpMethod} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpMethod: e.target.value })}
                  options={['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map((m) => ({ value: m, label: m }))} />
              </div>
              <div className="space-y-2"><Label>超时(ms)</Label><Input type="number" value={String(editingProtocol.timeout)} onChange={(e) => setEditingProtocol({ ...editingProtocol, timeout: Number(e.target.value) })} /></div>
            </div>
            <div className="space-y-2"><Label>请求头(JSON)</Label><Input value={editingProtocol.httpHeaders} onChange={(e) => setEditingProtocol({ ...editingProtocol, httpHeaders: e.target.value })} placeholder='{"Content-Type":"application/json"}' /></div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label>字段映射</Label><Button variant="outline" size="sm" onClick={addMapping}>+ 添加映射</Button></div>
              {editingProtocol.mappings.map((m, i) => (
                <div key={i} className="border rounded-lg p-3 space-y-2 bg-slate-50">
                  <div className="flex justify-between items-center"><span className="text-xs font-medium">映射 #{i + 1}</span><Button variant="ghost" size="sm" onClick={() => removeMapping(i)} className="text-red-500 h-6 w-6 p-0">x</Button></div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="mcpPath" value={m.mcpPath} onChange={(e) => updateMapping(i, 'mcpPath', e.target.value)} className="text-xs" />
                    <Input placeholder="fieldName" value={m.fieldName} onChange={(e) => updateMapping(i, 'fieldName', e.target.value)} className="text-xs" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="mcpType" value={m.mcpType} onChange={(e) => updateMapping(i, 'mcpType', e.target.value)} className="text-xs" />
                    <Input placeholder="mcpDesc" value={m.mcpDesc} onChange={(e) => updateMapping(i, 'mcpDesc', e.target.value)} className="text-xs" />
                    <Select value={m.mappingType} onChange={(e) => updateMapping(i, 'mappingType', e.target.value)} options={[{ value: 'request', label: 'request' }, { value: 'response', label: 'response' }]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent onClose={() => { setImportDialogOpen(false); setAnalyzedData([]); }}>
          <DialogHeader><DialogTitle>导入 OpenAPI 协议</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>OpenAPI JSON *</Label>
              <Textarea value={importJson} onChange={(e) => setImportJson(e.target.value)} placeholder='粘贴 OpenAPI 3.0 规范的 JSON 内容...' rows={8} className="font-mono text-xs" />
            </div>
            <div className="space-y-2">
              <Label>端点过滤（可选，逗号分隔）</Label>
              <Input value={importEndpoints} onChange={(e) => setImportEndpoints(e.target.value)} placeholder="/api/users,/api/orders" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAnalysis} disabled={analyzing}>{analyzing ? '解析中...' : '解析预览'}</Button>
              <Button onClick={handleImport} disabled={importing}>{importing ? '导入中...' : '确认导入'}</Button>
            </div>
            {analyzedData.length > 0 && (
              <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <p className="text-sm font-medium mb-2">解析结果 ({analyzedData.length} 个端点):</p>
                {analyzedData.map((item, i) => (
                  <div key={i} className="text-xs py-1 border-b last:border-0">
                    <Badge variant="secondary">{item.httpMethod}</Badge>
                    <span className="ml-2 font-mono">{item.httpUrl}</span>
                    <span className="ml-2 text-muted-foreground">({item.mappings?.length || 0} 条映射)</span>
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
