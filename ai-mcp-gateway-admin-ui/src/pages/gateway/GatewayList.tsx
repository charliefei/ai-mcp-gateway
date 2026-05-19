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
import { gatewayApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Server, Sparkles } from 'lucide-react'
import type { GatewayConfigDTO, GatewayConfigSaveRequest } from '@/types'

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-aurora-3/40 blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md">
          <Server className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">暂无网关配置数据</p>
      <p className="text-xs text-muted-foreground mt-1.5">点击下方按钮创建第一条网关</p>
      <Button onClick={onCreate} variant="outline" className="mt-5 cursor-pointer">
        <Sparkles className="h-4 w-4 mr-1.5" />
        创建第一个网关
      </Button>
    </div>
  )
}

export function GatewayList() {
  const [data, setData] = useState<GatewayConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState('')
  const [searchGatewayName, setSearchGatewayName] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<GatewayConfigDTO | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<GatewayConfigSaveRequest>({
    gatewayId: '',
    gatewayName: '',
    gatewayDesc: '',
    version: '2024-11-05',
    auth: 1,
    status: 1,
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await gatewayApi.queryGatewayConfigPage({
        gatewayId: searchGatewayId || undefined,
        gatewayName: searchGatewayName || undefined,
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
      toast.error('查询网关配置失败')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [page, rows, searchGatewayId, searchGatewayName])

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
      gatewayName: '',
      gatewayDesc: '',
      version: '2024-11-05',
      auth: 1,
      status: 1,
    })
    setDialogOpen(true)
  }

  const openEdit = (item: GatewayConfigDTO) => {
    setEditItem(item)
    setForm({
      gatewayId: item.gatewayId,
      gatewayName: item.gatewayName,
      gatewayDesc: item.gatewayDesc,
      version: item.version,
      auth: item.auth,
      status: item.status,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.gatewayId || !form.gatewayName) {
      toast.error('网关ID和网关名称为必填项')
      return
    }
    setSaving(true)
    try {
      const res = await gatewayApi.saveGatewayConfig(form)
      if (res.data.code === '0000') {
        toast.success(editItem ? '更新成功' : '创建成功')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.data.info || '保存失败')
      }
    } catch {
      toast.error('保存网关配置失败')
    } finally {
      setSaving(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Server}
        title="网关配置"
        display="Gateway"
        meta="01 / Gateway Config"
        description="管理所有 MCP 网关实例的基础配置、协议版本与认证开关。"
        actions={
          <Button onClick={openCreate} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            新增网关
          </Button>
        }
      />

      {/* Search bar */}
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
                placeholder="网关名称"
                value={searchGatewayName}
                onChange={(e) => setSearchGatewayName(e.target.value)}
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
              onClick={() => {
                setSearchGatewayId('')
                setSearchGatewayName('')
                setPage(1)
              }}
              className="cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Server className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <CardTitle className="text-[15px]">网关列表</CardTitle>
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
            <TableSkeleton columns={7} />
          ) : data.length === 0 ? (
            <EmptyState onCreate={openCreate} />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.025]">
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">网关 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">网关名称</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">描述</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">版本</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">认证</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">校验</th>
                      <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr
                        key={item.gatewayId}
                        className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.025] transition-colors duration-150"
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <td className="py-3.5 px-4 font-mono text-xs">{item.gatewayId || '—'}</td>
                        <td className="py-3.5 px-4 font-semibold text-foreground">{item.gatewayName || '—'}</td>
                        <td className="py-3.5 px-4 text-muted-foreground max-w-[240px] truncate" title={item.gatewayDesc}>
                          {item.gatewayDesc || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-xs text-muted-foreground">{item.version || '—'}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={item.auth === 1 ? 'success' : 'secondary'}>
                            <span className="relative flex h-1.5 w-1.5">
                              <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${item.auth === 1 ? 'bg-success' : 'bg-muted-foreground/50'}`} />
                            </span>
                            {item.auth === 1 ? '启用' : '禁用'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={item.status === 1 ? 'default' : 'outline'}>
                            {item.status === 1 ? '强校验' : '不校验'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="cursor-pointer">
                            编辑
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
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)} className="cursor-pointer">
                      上一页
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="cursor-pointer">
                      下一页
                    </Button>
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
            <DialogTitle>{editItem ? '编辑网关配置' : '新增网关配置'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关 ID *</Label>
              <Input
                id="gatewayId"
                value={form.gatewayId}
                onChange={(e) => setForm({ ...form, gatewayId: e.target.value })}
                disabled={!!editItem}
                placeholder="gateway_001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gatewayName">网关名称 *</Label>
              <Input
                id="gatewayName"
                value={form.gatewayName}
                onChange={(e) => setForm({ ...form, gatewayName: e.target.value })}
                placeholder="示例网关"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gatewayDesc">网关描述</Label>
              <Input
                id="gatewayDesc"
                value={form.gatewayDesc}
                onChange={(e) => setForm({ ...form, gatewayDesc: e.target.value })}
                placeholder="网关描述信息"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">协议版本</Label>
              <Input
                id="version"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="2024-11-05"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auth">认证状态</Label>
                <Select
                  id="auth"
                  value={String(form.auth)}
                  onChange={(e) => setForm({ ...form, auth: Number(e.target.value) })}
                  options={[
                    { value: '1', label: '启用' },
                    { value: '0', label: '禁用' },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">校验状态</Label>
                <Select
                  id="status"
                  value={String(form.status)}
                  onChange={(e) => setForm({ ...form, status: Number(e.target.value) })}
                  options={[
                    { value: '1', label: '强校验' },
                    { value: '0', label: '不校验' },
                  ]}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
