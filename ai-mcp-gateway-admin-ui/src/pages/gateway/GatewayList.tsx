import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { Select } from '@/components/ui/select'
import { TableSkeleton } from '@/components/ui/skeleton'
import {
  PageHeader,
  EmptyState,
  SearchBar,
  Pagination,
  Toolbar,
  FormField,
  ConfirmDialog,
  StatusDot,
} from '@/components/common'
import { gatewayApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Server, RefreshCw, Pencil, Trash2, RotateCcw, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { GatewayConfigDTO, GatewayConfigSaveRequest } from '@/types'

export function GatewayList() {
  // 全局搜索跳转过来时，URL 上会带 ?q=keyword；用它预填"网关名称"并自动触发一次查询
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<GatewayConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState('')
  const [searchGatewayName, setSearchGatewayName] = useState(() => searchParams.get('q') ?? '')

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

  const [deleteTarget, setDeleteTarget] = useState<GatewayConfigDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  // 如果 URL 上后续又带 ?q= 跳过来（例如从全局搜索再次点击），同步本地状态并重新查询
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== searchGatewayName) {
      setSearchGatewayName(q)
      setPage(1)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const handleSearch = () => {
    setPage(1)
    fetchData()
  }

  const resetSearch = () => {
    setSearchGatewayId('')
    setSearchGatewayName('')
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
        toast.success(editItem ? '更新成功' : '创建成功', {
          description: `网关 ${form.gatewayId} 已保存`,
        })
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

  // Note: backend may not expose a delete gateway endpoint, this is a placeholder UX.
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      toast.info('请通过后端接口删除网关配置')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-6">
      <PageHeader
        title="网关配置"
        description="管理所有 MCP 网关实例，每个网关拥有独立的协议版本、鉴权与状态。"
        icon={<Server className="h-5 w-5" />}
        badge={<Badge variant="outline">{total} 条</Badge>}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={openCreate} className="cursor-pointer">
              <Plus className="h-4 w-4" />
              新增网关
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
          title="网关列表"
          description="所有注册的 MCP 网关实例"
          count={total}
          icon={<Server className="h-4 w-4" />}
        />
        <CardContent className="p-0">
          {initialLoad && loading ? (
            <div className="p-5">
              <TableSkeleton columns={6} />
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<Server className="h-8 w-8" />}
              title="还没有网关配置"
              description="创建你的第一个 MCP 网关实例，开始管理工具与协议。"
              action={
                <Button onClick={openCreate} className="cursor-pointer">
                  <Plus className="h-4 w-4" />
                  新建网关
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
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">协议版本</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">状态</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">校验</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">描述</th>
                      <th className="text-right py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, idx) => (
                      <tr
                        key={item.gatewayId}
                        className={cn(
                          'group border-b border-border/40 last:border-0',
                          'transition-colors duration-150',
                          'hover:bg-primary/[0.03]'
                        )}
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                                'bg-gradient-to-br from-primary/15 to-primary/0',
                                'text-primary ring-1 ring-primary/20',
                                'transition-transform duration-200 group-hover:scale-110'
                              )}
                            >
                              <Server className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {item.gatewayName || '—'}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {item.gatewayId || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {item.version || '—'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant={item.auth === 1 ? 'info' : 'ghost'}>
                            {item.auth === 1 ? '强校验' : '不校验'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-muted-foreground max-w-[260px] truncate" title={item.gatewayDesc}>
                          {item.gatewayDesc || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(item)}
                              className="cursor-pointer text-muted-foreground hover:text-primary"
                              aria-label={`编辑 ${item.gatewayId}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(item)}
                              className="cursor-pointer text-muted-foreground hover:text-destructive"
                              aria-label={`删除 ${item.gatewayId}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
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

      {/* Edit / Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="lg">
        <DialogClose onClose={() => setDialogOpen(false)} />
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              {editItem ? <Pencil className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle>{editItem ? '编辑网关配置' : '新增网关配置'}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editItem ? `修改 ${editItem.gatewayId} 的配置信息` : '创建一个新的 MCP 网关实例'}
              </p>
            </div>
          </div>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="网关 ID" required htmlFor="gatewayId">
              <Input
                id="gatewayId"
                value={form.gatewayId}
                onChange={(e) => setForm({ ...form, gatewayId: e.target.value })}
                disabled={!!editItem}
                placeholder="gateway_001"
                className="font-mono"
              />
            </FormField>
            <FormField label="网关名称" required htmlFor="gatewayName">
              <Input
                id="gatewayName"
                value={form.gatewayName}
                onChange={(e) => setForm({ ...form, gatewayName: e.target.value })}
                placeholder="示例网关"
              />
            </FormField>
            <FormField label="协议版本" htmlFor="version" className="sm:col-span-2">
              <Input
                id="version"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="2024-11-05"
                className="font-mono"
              />
            </FormField>
            <FormField label="网关描述" htmlFor="gatewayDesc" className="sm:col-span-2">
              <Input
                id="gatewayDesc"
                value={form.gatewayDesc}
                onChange={(e) => setForm({ ...form, gatewayDesc: e.target.value })}
                placeholder="网关描述信息"
              />
            </FormField>
            <FormField label="运行状态" htmlFor="status">
              <Select
                id="status"
                value={String(form.status)}
                onChange={(v) => setForm({ ...form, status: Number(v) })}
                options={[
                  { value: '1', label: '🟢 启用' },
                  { value: '0', label: '⚪ 禁用' },
                ]}
              />
            </FormField>
            <FormField label="鉴权校验" htmlFor="auth">
              <Select
                id="auth"
                value={String(form.auth)}
                onChange={(v) => setForm({ ...form, auth: Number(v) })}
                options={[
                  { value: '1', label: '🔒 强校验' },
                  { value: '0', label: '🔓 不校验' },
                ]}
              />
            </FormField>
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
        title="删除网关配置？"
        description={`确认删除网关 "${deleteTarget?.gatewayId}" 吗？该操作不可恢复。`}
        variant="destructive"
        confirmText="确认删除"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: number }) {
  if (status === 1) {
    return (
      <Badge variant="success" className="gap-1.5">
        <StatusDot status="online" showLabel={false} />
        启用
      </Badge>
    )
  }
  return (
    <Badge variant="ghost" className="gap-1.5">
      <StatusDot status="offline" showLabel={false} />
      禁用
    </Badge>
  )
}
