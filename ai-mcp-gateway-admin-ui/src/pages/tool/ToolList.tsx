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
import { TableSkeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page-header'
import { toolApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Wrench, Trash2, Sparkles } from 'lucide-react'
import type { GatewayToolConfigDTO, GatewayToolSaveRequest } from '@/types'

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-aurora-3/40 blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md">
          <Wrench className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">暂无工具配置数据</p>
      <p className="text-xs text-muted-foreground mt-1.5">点击下方按钮创建第一条工具</p>
      <Button onClick={onCreate} variant="outline" className="mt-5 cursor-pointer">
        <Sparkles className="h-4 w-4 mr-1.5" />
        创建第一个工具
      </Button>
    </div>
  )
}

export function ToolList() {
  const [data, setData] = useState<GatewayToolConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows] = useState(10)
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
      setInitialLoad(false)
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

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Wrench}
        title="工具配置"
        display="Tools"
        meta="02 / Tool Registry"
        description="管理网关下注册的 MCP 工具，绑定协议与版本，控制工具暴露范围。"
        actions={
          <Button onClick={openCreate} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            新增工具
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="网关 ID"
                value={searchGatewayId}
                onChange={(e) => setSearchGatewayId(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="工具 ID"
                value={searchToolId}
                onChange={(e) => setSearchToolId(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="default" size="sm" onClick={handleSearch} className="cursor-pointer">
              搜索
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchGatewayId(''); setSearchToolId(''); setPage(1); }}
              className="cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Wrench className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <CardTitle className="text-[15px]">工具列表</CardTitle>
            <span className="ml-1 inline-flex items-center justify-center min-w-[26px] h-[22px] rounded-full bg-foreground/[0.06] px-2 text-[11px] font-semibold font-mono text-foreground/70">
              {total}
            </span>
          </div>
          {loading && !initialLoad && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              刷新中
            </div>
          )}
        </CardHeader>
        <CardContent>
          {initialLoad && loading ? (
            <TableSkeleton columns={9} />
          ) : data.length === 0 ? (
            <EmptyState onCreate={openCreate} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.025]">
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">网关 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">工具 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">工具名称</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">类型</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">描述</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">版本</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">协议 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">协议类型</th>
                      <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={`${item.gatewayId}-${item.toolId}`} className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.025] transition-colors duration-150">
                        <td className="py-3.5 px-4 font-mono text-xs">{item.gatewayId || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-xs">{item.toolId || '—'}</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">{item.toolName || '—'}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="info">{item.toolType || '—'}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-[180px] truncate" title={item.toolDescription}>
                          {item.toolDescription || '—'}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{item.toolVersion || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-xs">{item.protocolId || '—'}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant="secondary">{item.protocolType || '—'}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="cursor-pointer">编辑</Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item)}
                            className="ml-1 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label={`删除工具 ${item.toolName}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-5">
                  <span className="text-xs text-muted-foreground font-mono">
                    页 {page} <span className="text-muted-foreground/50">/</span> {totalPages}
                  </span>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">
              {editItem ? 'Edit' : 'Create'}
            </p>
            <DialogTitle>{editItem ? '编辑工具配置' : '新增工具配置'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关 ID *</Label>
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
                <Label htmlFor="protocolId">协议 ID</Label>
                <Input id="protocolId" type="number" value={String(form.protocolId)} onChange={(e) => setForm({ ...form, protocolId: Number(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="protocolType">协议类型</Label>
                <Input id="protocolType" value={form.protocolType} onChange={(e) => setForm({ ...form, protocolType: e.target.value })} placeholder="http" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">取消</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">{saving ? '保存中...' : '保存'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
