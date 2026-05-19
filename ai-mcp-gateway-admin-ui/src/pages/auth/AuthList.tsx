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
import { TableSkeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page-header'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Shield, Trash2 } from 'lucide-react'
import type { GatewayAuthDTO, GatewayAuthSaveRequest } from '@/types'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-aurora-3/40 blur-xl opacity-50" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md">
          <Shield className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
        </div>
      </div>
      <p className="text-sm font-semibold text-foreground">暂无认证配置数据</p>
      <p className="text-xs text-muted-foreground mt-1.5">点击右上角“新增认证”按钮创建首条记录</p>
    </div>
  )
}

export function AuthList() {
  const [data, setData] = useState<GatewayAuthDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<GatewayAuthSaveRequest>({
    gatewayId: '',
    rateLimit: 1000,
    expireTime: '',
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await authApi.queryGatewayAuthPage({
        gatewayId: searchGatewayId || undefined,
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
      toast.error('查询认证配置失败')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [page, rows, searchGatewayId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  const openCreate = () => {
    setForm({ gatewayId: '', rateLimit: 1000, expireTime: '' })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.gatewayId) {
      toast.error('网关ID为必填项')
      return
    }
    setSaving(true)
    try {
      const res = await authApi.saveGatewayAuth(form)
      if (res.data.code === '0000') {
        toast.success('保存成功')
        setDialogOpen(false)
        fetchData()
      } else {
        toast.error(res.data.info || '保存失败')
      }
    } catch {
      toast.error('保存认证配置失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (gatewayId: string) => {
    if (!confirm(`确定要删除网关 "${gatewayId}" 的认证配置吗？`)) return
    try {
      const res = await authApi.deleteGatewayAuth(gatewayId)
      if (res.data.code === '0000') {
        toast.success('删除成功')
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除认证配置失败')
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString('zh-CN')
    } catch {
      return dateStr
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Shield}
        title="认证配置"
        display="Auth"
        meta="04 / Access Keys"
        description="为每个网关签发 API Key，设置调用频率上限与过期时间，控制对外访问。"
        actions={
          <Button onClick={openCreate} className="cursor-pointer">
            <Plus className="h-4 w-4" />
            新增认证
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder="网关 ID"
                value={searchGatewayId}
                onChange={(e) => setSearchGatewayId(e.target.value)}
                className="pl-9"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="default" size="sm" onClick={handleSearch} className="cursor-pointer">搜索</Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setSearchGatewayId(''); setPage(1); }}
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
            <Shield className="h-4 w-4 text-primary" strokeWidth={2.5} />
            <CardTitle className="text-[15px]">认证列表</CardTitle>
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
            <TableSkeleton columns={5} />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background/30 backdrop-blur-sm">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-foreground/[0.025]">
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">网关 ID</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">API Key</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">速率上限 / 小时</th>
                      <th className="text-left py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">过期时间</th>
                      <th className="text-right py-3 px-4 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.gatewayId} className="border-b border-border/30 last:border-0 hover:bg-foreground/[0.025] transition-colors duration-150">
                        <td className="py-3.5 px-4 font-mono text-xs">{item.gatewayId || '—'}</td>
                        <td className="py-3.5 px-4 font-mono text-xs max-w-[320px] truncate text-muted-foreground" title={item.apiKey}>
                          {item.apiKey || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={item.rateLimit > 0 ? 'default' : 'secondary'}>
                            {item.rateLimit ? `${item.rateLimit}` : '无限制'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">{formatDate(item.expireTime)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.gatewayId)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                            aria-label={`删除 ${item.gatewayId} 的认证配置`}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onClose={() => setDialogOpen(false)}>
          <DialogHeader>
            <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-primary">Create</p>
            <DialogTitle>新增认证配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关 ID *</Label>
              <Input id="gatewayId" value={form.gatewayId} onChange={(e) => setForm({ ...form, gatewayId: e.target.value })} placeholder="gateway_001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">速率限制（次 / 小时）</Label>
              <Input id="rateLimit" type="number" value={String(form.rateLimit)} onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })} placeholder="1000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expireTime">过期时间</Label>
              <Input id="expireTime" type="datetime-local" value={form.expireTime} onChange={(e) => setForm({ ...form, expireTime: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="cursor-pointer">取消</Button>
            <Button onClick={handleSave} disabled={saving} className="cursor-pointer">
              {saving ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
