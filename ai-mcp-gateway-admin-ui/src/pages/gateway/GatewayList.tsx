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
import { gatewayApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Server } from 'lucide-react'
import type { GatewayConfigDTO, GatewayConfigSaveRequest } from '@/types'

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Server className="h-8 w-8" />
      </div>
      <p className="text-sm font-medium">暂无网关配置数据</p>
      <p className="text-xs text-muted-foreground mt-1">点击"新增网关"按钮创建第一条记录</p>
      <Button variant="link" onClick={onCreate} className="mt-2 cursor-pointer">创建第一个网关</Button>
    </div>
  )
}

export function GatewayList() {
  const [data, setData] = useState<GatewayConfigDTO[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState(10)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">网关配置</h2>
          <p className="text-sm text-muted-foreground mt-1">管理所有网关实例的配置信息</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          新增网关
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
              placeholder="网关名称"
              value={searchGatewayName}
              onChange={(e) => setSearchGatewayName(e.target.value)}
              className="max-w-[200px]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch} className="cursor-pointer">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setSearchGatewayId(''); setSearchGatewayName(''); setPage(1); }}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Server className="h-4 w-4 inline mr-2" />
            网关列表 ({total} 条记录)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoad && loading ? (
            <TableSkeleton columns={7} />
          ) : data.length === 0 ? (
            <EmptyState onCreate={openCreate} />
          ) : (
            <>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  刷新中...
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">网关ID</th>
                      <th className="text-left py-3 px-4 font-medium">网关名称</th>
                      <th className="text-left py-3 px-4 font-medium">描述</th>
                      <th className="text-left py-3 px-4 font-medium">版本</th>
                      <th className="text-left py-3 px-4 font-medium">认证状态</th>
                      <th className="text-left py-3 px-4 font-medium">校验状态</th>
                      <th className="text-right py-3 px-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.gatewayId} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{item.gatewayId || '—'}</td>
                        <td className="py-3 px-4 font-medium">{item.gatewayName || '—'}</td>
                        <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate" title={item.gatewayDesc}>
                          {item.gatewayDesc || '—'}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{item.version || '—'}</td>
                        <td className="py-3 px-4">
                          <Badge variant={item.auth === 1 ? 'success' : 'secondary'}>
                            {item.auth === 1 ? '启用' : '禁用'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.status === 1 ? 'default' : 'outline'}>
                            {item.status === 1 ? '强校验' : '不校验'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
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
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-muted-foreground">
                    第 {page} / {totalPages} 页
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
            <DialogTitle>{editItem ? '编辑网关配置' : '新增网关配置'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关ID *</Label>
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
