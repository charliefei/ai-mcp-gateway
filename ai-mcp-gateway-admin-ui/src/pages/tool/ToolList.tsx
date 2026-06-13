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
} from '@/components/common'
import { toolApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Wrench, RefreshCw, Pencil, Trash2, RotateCcw, Sparkles } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { GatewayToolConfigDTO, GatewayToolSaveRequest } from '@/types'

export function ToolList() {
  // 全局搜索跳转过来时，URL 上会带 ?q=keyword；用它预填"网关 ID"并自动触发一次查询
  const [searchParams] = useSearchParams()
  const [data, setData] = useState<GatewayToolConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
  const [searchGatewayId, setSearchGatewayId] = useState(() => searchParams.get('q') ?? '')
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

  const [deleteTarget, setDeleteTarget] = useState<GatewayToolConfigDTO | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  // 如果 URL 上后续又带 ?q= 跳过来（例如从全局搜索再次点击），同步本地状态并重新查询
  useEffect(() => {
    const q = searchParams.get('q')
    if (q && q !== searchGatewayId) {
      setSearchGatewayId(q)
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
    setSearchToolId('')
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
        toast.success(editItem ? '更新成功' : '创建成功', {
          description: `工具 ${form.toolName} 已保存`,
        })
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await toolApi.deleteGatewayToolConfig(deleteTarget.gatewayId, deleteTarget.toolId)
      if (res.data.code === '0000') {
        toast.success('删除成功', { description: `工具 ${deleteTarget.toolName} 已删除` })
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error(res.data.info || '删除失败')
      }
    } catch {
      toast.error('删除工具配置失败')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / rows))

  return (
    <div className="space-y-6">
      <PageHeader
        title="工具配置"
        description="管理 MCP 工具，将后端 HTTP 接口暴露给 LLM 客户端调用。"
        icon={<Wrench className="h-5 w-5" />}
        badge={<Badge variant="outline">{total} 条</Badge>}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={fetchData} className="cursor-pointer">
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
            <Button onClick={openCreate} className="cursor-pointer">
              <Plus className="h-4 w-4" />
              新增工具
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
          title="工具列表"
          description="所有已注册的 MCP 工具"
          count={total}
          icon={<Wrench className="h-4 w-4" />}
        />
        <CardContent className="p-0">
          {initialLoad && loading ? (
            <div className="p-5">
              <TableSkeleton columns={6} />
            </div>
          ) : data.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-8 w-8" />}
              title="还没有工具配置"
              description="创建一个工具来暴露后端 HTTP 接口给 LLM 客户端。"
              action={
                <Button onClick={openCreate} className="cursor-pointer">
                  <Plus className="h-4 w-4" />
                  新建工具
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
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">工具</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">所属网关</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">类型 / 版本</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">协议</th>
                      <th className="text-left py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">描述</th>
                      <th className="text-right py-3 px-5 font-medium text-xs uppercase tracking-wider text-muted-foreground">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr
                        key={`${item.gatewayId}-${item.toolId}`}
                        className="group border-b border-border/40 last:border-0 hover:bg-primary/[0.03] transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                'flex h-9 w-9 items-center justify-center rounded-lg shrink-0',
                                'bg-gradient-to-br from-sky-500/15 to-sky-500/0',
                                'text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20',
                                'transition-transform duration-200 group-hover:scale-110'
                              )}
                            >
                              <Wrench className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground truncate">
                                {item.toolName || '—'}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                ID: {item.toolId}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {item.gatewayId || '—'}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col gap-1 items-start">
                            <Badge variant={item.toolType === 'function' ? 'info' : 'secondary'}>
                              {item.toolType || '—'}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-mono">
                              v{item.toolVersion || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-5">
                          <Badge variant="ghost" className="font-mono">
                            {item.protocolType || '—'} #{item.protocolId}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-5 text-muted-foreground max-w-[240px] truncate" title={item.toolDescription}>
                          {item.toolDescription || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="inline-flex items-center gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openEdit(item)}
                              className="cursor-pointer text-muted-foreground hover:text-primary"
                              aria-label={`编辑 ${item.toolName}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteTarget(item)}
                              className="cursor-pointer text-muted-foreground hover:text-destructive"
                              aria-label={`删除 ${item.toolName}`}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="lg">
        <DialogClose onClose={() => setDialogOpen(false)} />
        <DialogHeader>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-1 ring-sky-500/20">
              {editItem ? <Pencil className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>
            <div>
              <DialogTitle>{editItem ? '编辑工具配置' : '新增工具配置'}</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editItem ? `修改工具 ${editItem.toolName}` : '创建一个新的 MCP 工具'}
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
            <FormField label="工具名称" required htmlFor="toolName">
              <Input
                id="toolName"
                value={form.toolName}
                onChange={(e) => setForm({ ...form, toolName: e.target.value })}
                placeholder="JavaSDKMCPClient_getData"
                className="font-mono"
              />
            </FormField>
            <FormField label="工具类型" htmlFor="toolType">
              <Select
                id="toolType"
                value={form.toolType}
                onChange={(v) => setForm({ ...form, toolType: v })}
                options={[
                  { value: 'function', label: 'function' },
                  { value: 'resource', label: 'resource' },
                ]}
              />
            </FormField>
            <FormField label="工具版本" htmlFor="toolVersion">
              <Input
                id="toolVersion"
                value={form.toolVersion}
                onChange={(e) => setForm({ ...form, toolVersion: e.target.value })}
                className="font-mono"
              />
            </FormField>
            <FormField label="协议 ID" htmlFor="protocolId">
              <Input
                id="protocolId"
                type="number"
                value={String(form.protocolId)}
                onChange={(e) => setForm({ ...form, protocolId: Number(e.target.value) })}
                className="font-mono"
              />
            </FormField>
            <FormField label="协议类型" htmlFor="protocolType">
              <Input
                id="protocolType"
                value={form.protocolType}
                onChange={(e) => setForm({ ...form, protocolType: e.target.value })}
                placeholder="http"
                className="font-mono"
              />
            </FormField>
            <FormField label="工具描述" htmlFor="toolDescription" className="sm:col-span-2">
              <Input
                id="toolDescription"
                value={form.toolDescription}
                onChange={(e) => setForm({ ...form, toolDescription: e.target.value })}
                placeholder="工具的功能描述"
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
        title="删除工具配置？"
        description={`确认删除工具 "${deleteTarget?.toolName}" 吗？该操作不可恢复。`}
        variant="destructive"
        confirmText="确认删除"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}
