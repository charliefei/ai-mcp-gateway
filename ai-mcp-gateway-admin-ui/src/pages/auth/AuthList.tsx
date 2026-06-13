import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { TableSkeleton } from '@/components/ui/skeleton'
import {
  PageHeader,
  EmptyState,
  SearchBar,
  Pagination,
  Toolbar,
  FormField,
  ConfirmDialog,
  ApiKeyCell,
  StatusDot,
} from '@/components/common'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Shield, RefreshCw, Trash2, Sparkles, RotateCcw, Key, Gauge, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { GatewayAuthDTO, GatewayAuthSaveRequest } from '@/types'

export function AuthList() {
  const [data, setData] = useState<GatewayAuthDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<GatewayAuthSaveRequest>({
    gatewayId: '',
    rateLimit: 1000,
    expireTime: '',
  })

  const [deleteTarget, setDeleteTarget] = useState<GatewayAuthDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const resetSearch = () => {
    setSearchGatewayId('')
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
        toast.success('保存成功', { description: `网关 ${form.gatewayId} 的认证配置已创建` })
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await authApi.deleteGatewayAuth(deleteTarget.gatewayId)
      if (res.data.code === '0000') {
        toast.success('删除成功', { description: `${deleteTarget.gatewayId} 的认证配置已删除` })
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除认证配置失败')
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '永不过期'
    try {
      return new Date(dateStr).toLocaleString('zh-CN')
    } catch {
      return dateStr
    }
  }

  const isExpired = (dateStr: string) => {
    if (!dateStr) return false
    try {
      return new Date(dateStr).getTime() < Date.now()
    } catch {
      return false
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-6">
      <PageHeader
        title="认证配置"
        description="管理网关的 API Key 认证与速率限制，确保接口安全。"
        icon={<Shield className="h-5 w-5" />}
        badge={<Badge variant="outline">{total} 条</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchData} className="cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={openCreate} className="cursor-pointer">
              <Plus className="h-4 w-4" />
              新增认证
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="p-5">
          <SearchBar
            value={searchGatewayId}
            onChange={setSearchGatewayId}
            onSearch={handleSearch}
            onReset={resetSearch}
            placeholder="搜索网关 ID..."
          />
        </CardContent>
      </Card>

      <Card>
        <Toolbar
          title="认证列表"
          description="所有网关的 API Key 与限流配置"
          count={total}
          icon={<Shield className="h-4 w-4" />}
        />
        <CardContent className="p-0">
          {initialLoad && loading ? (
            <div className="p-5">
              <TableSkeleton columns={4} />
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<Shield className="h-8 w-8" />}
              title="还没有认证配置"
              description="为网关添加 API Key 与速率限制，确保接口访问安全。"
              action={
                <Button onClick={openCreate} className="cursor-pointer">
                  <Plus className="h-4 w-4" />
                  新建认证
                </Button>
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
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">网关</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">API Key</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">速率限制</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">过期时间</th>
                      <th className="text-right py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => {
                      const expired = isExpired(item.expireTime)
                      return (
                        <tr
                          key={item.gatewayId}
                          className="group border-b border-border/40 last:border-0 hover:bg-primary/[0.03] transition-colors"
                        >
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                                  'bg-gradient-to-br from-amber-500/15 to-amber-500/0',
                                  'text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20',
                                  'transition-transform duration-200 group-hover:scale-110'
                                )}
                              >
                                <Shield className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground font-mono">
                                  {item.gatewayId || '—'}
                                </p>
                                <p className="text-xs text-muted-foreground">认证网关</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <ApiKeyCell value={item.apiKey} />
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                              {item.rateLimit > 0 ? (
                                <Badge variant="info">{item.rateLimit} 次/小时</Badge>
                              ) : (
                                <Badge variant="ghost">无限制</Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-2 text-xs">
                              {item.expireTime ? (
                                <>
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                  <span className="text-muted-foreground tabular-nums">
                                    {formatDate(item.expireTime)}
                                  </span>
                                  {expired ? (
                                    <Badge variant="destructive">已过期</Badge>
                                  ) : (
                                    <Badge variant="success">
                                      <StatusDot status="online" showLabel={false} />
                                      有效
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-muted-foreground">永不过期</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(item)}
                              className="cursor-pointer text-muted-foreground hover:text-destructive"
                              aria-label={`删除 ${item.gatewayId} 的认证配置`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
        <DialogClose onClose={() => setDialogOpen(false)} />
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>新增认证配置</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                为网关创建 API Key 认证凭据
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <FormField label="网关 ID" required htmlFor="gatewayId">
              <Input
                id="gatewayId"
                value={form.gatewayId}
                onChange={(e) => setForm({ ...form, gatewayId: e.target.value })}
                placeholder="gateway_001"
                className="font-mono"
              />
            </FormField>
            <FormField
              label="速率限制（次/小时）"
              htmlFor="rateLimit"
              hint="设为 0 表示无限制"
            >
              <Input
                id="rateLimit"
                type="number"
                value={String(form.rateLimit)}
                onChange={(e) => setForm({ ...form, rateLimit: Number(e.target.value) })}
                placeholder="1000"
              />
            </FormField>
            <FormField
              label="过期时间"
              htmlFor="expireTime"
              hint="留空表示永不过期"
            >
              <Input
                id="expireTime"
                type="datetime-local"
                value={form.expireTime}
                onChange={(e) => setForm({ ...form, expireTime: e.target.value })}
              />
            </FormField>
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
              <Key className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>API Key 将在保存时由系统自动生成并返回。</p>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="删除认证配置？"
        description={`确认删除网关 "${deleteTarget?.gatewayId}" 的认证配置吗？该操作不可恢复。`}
        variant="destructive"
        confirmText="确认删除"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
