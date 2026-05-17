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
import { toolApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Wrench, Trash2 } from 'lucide-react'
import type { GatewayToolConfigDTO, GatewayToolSaveRequest } from '@/types'

export function ToolList() {
  const [data, setData] = useState<GatewayToolConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState('')
  const [searchToolId, setSearchToolId] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<GatewayToolConfigDTO | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<GatewayToolSaveRequest>({
    gatewayId: '',
    toolName: '',
    toolType: 'function',
    toolDescription: '',
    toolVersion: '1.0.0',
    protocolId: 0,
    protocolType: 'http',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await toolApi.queryGatewayToolPage({
        gatewayId: searchGatewayId || undefined,
        toolId: searchToolId || undefined,
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
      toast.error('查询工具配置失败')
    } finally {
      setLoading(false)
    }
  }, [page, rows, searchGatewayId, searchToolId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  const openCreate = () => {
    setEditItem(null)
    setForm({
      gatewayId: '',
      toolName: '',
      toolType: 'function',
      toolDescription: '',
      toolVersion: '1.0.0',
      protocolId: 0,
      protocolType: 'http',
    })
    setDialogOpen(true)
  }

  const openEdit = (item: GatewayToolConfigDTO) => {
    setEditItem(item)
    setForm({
      gatewayId: item.gatewayId,
      toolId: item.toolId,
      toolName: item.toolName,
      toolType: item.toolType,
      toolDescription: item.toolDescription,
      toolVersion: item.toolVersion,
      protocolId: item.protocolId,
      protocolType: item.protocolType,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.gatewayId || !form.toolName) {
      toast.error('网关ID和工具名称为必填项')
      return
    }
    setSaving(true)
    try {
      const res = await toolApi.saveGatewayToolConfig(form)
      if (res.data.code === '0000') {
        toast.success(editItem ? '更新成功' : '创建成功')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.data.info || '保存失败')
      }
    } catch {
      toast.error('保存工具配置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item: GatewayToolConfigDTO) => {
    if (!confirm(`确定要删除工具 "${item.toolName}" 吗？`)) return
    try {
      const res = await toolApi.deleteGatewayToolConfig(item.gatewayId, item.toolId)
      if (res.data.code === '0000') {
        toast.success('删除成功')
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除工具配置失败')
    }
  }

  const totalPages = Math.ceil(total / rows)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">工具配置</h2>
          <p className="text-sm text-muted-foreground mt-1">管理网关下的 MCP 工具配置</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          新增工具
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Input
              placeholder="网关ID"
              value={searchGatewayId}
              onChange={(e) => setSearchGatewayId(e.target.value)}
              className="max-w-[200px]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Input
              placeholder="工具ID"
              value={searchToolId}
              onChange={(e) => setSearchToolId(e.target.value)}
              className="max-w-[200px]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button variant="ghost" onClick={() => { setSearchGatewayId(''); setSearchToolId(''); setPage(1); }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Wrench className="h-4 w-4 inline mr-2" />
            工具列表 ({total} 条记录)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              加载中...
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Wrench className="h-10 w-10 mb-3 opacity-30" />
              <p>暂无工具配置数据</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">网关ID</th>
                      <th className="text-left py-3 px-4 font-medium">工具ID</th>
                      <th className="text-left py-3 px-4 font-medium">工具名称</th>
                      <th className="text-left py-3 px-4 font-medium">工具类型</th>
                      <th className="text-left py-3 px-4 font-medium">描述</th>
                      <th className="text-left py-3 px-4 font-medium">版本</th>
                      <th className="text-left py-3 px-4 font-medium">协议ID</th>
                      <th className="text-left py-3 px-4 font-medium">协议类型</th>
                      <th className="text-right py-3 px-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={`${item.gatewayId}-${item.toolId}`} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{item.gatewayId}</td>
                        <td className="py-3 px-4">{item.toolId}</td>
                        <td className="py-3 px-4 font-medium">{item.toolName}</td>
                        <td className="py-3 px-4">
                          <Badge>{item.toolType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[150px] truncate">{item.toolDescription}</td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{item.toolVersion}</td>
                        <td className="py-3 px-4">{item.protocolId}</td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary">{item.protocolType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>编辑</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(item)} className="text-red-500 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editItem ? '编辑工具配置' : '新增工具配置'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关ID *</Label>
              <Input id="gatewayId" value={form.gatewayId} onChange={(e) => setForm({ ...form, gatewayId: e.target.value })} disabled={!!editItem} placeholder="gateway_001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="toolName">工具名称 *</Label>
              <Input id="toolName" value={form.toolName} onChange={(e) => setForm({ ...form, toolName: e.target.value })} placeholder="JavaSDKMCPClient_getData" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="toolType">工具类型</Label>
                <Select id="toolType" value={form.toolType} onChange={(e) => setForm({ ...form, toolType: e.target.value })}
                  options={[{ value: 'function', label: 'function' }, { value: 'resource', label: 'resource' }]} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="toolVersion">工具版本</Label>
                <Input id="toolVersion" value={form.toolVersion} onChange={(e) => setForm({ ...form, toolVersion: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="toolDescription">工具描述</Label>
              <Input id="toolDescription" value={form.toolDescription} onChange={(e) => setForm({ ...form, toolDescription: e.target.value })} placeholder="工具描述信息" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protocolId">协议ID</Label>
                <Input id="protocolId" type="number" value={String(form.protocolId)} onChange={(e) => setForm({ ...form, protocolId: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protocolType">协议类型</Label>
                <Input id="protocolType" value={form.protocolType} onChange={(e) => setForm({ ...form, protocolType: e.target.value })} placeholder="http" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
