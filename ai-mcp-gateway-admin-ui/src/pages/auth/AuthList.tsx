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
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Search, RefreshCw, Shield, Trash2 } from 'lucide-react'
import type { GatewayAuthDTO, GatewayAuthSaveRequest } from '@/types'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Shield className="h-8 w-8" />
      </div>
      <p className="text-sm font-medium">暂无认证配置数据</p>
      <p className="text-xs text-muted-foreground mt-1">点击"新增认证"按钮创建第一条记录</p>
    </div>
  )
}

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">认证配置</h2>
          <p className="text-sm text-muted-foreground mt-1">管理网关 API Key 认证与速率限制</p>
        </div>
        <Button onClick={openCreate} className="cursor-pointer">
          <Plus className="h-4 w-4 mr-2" />
          新增认证
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Input
              placeholder="网关ID"
              value={searchGatewayId}
              onChange={(e) => setSearchGatewayId(e.target.value)}
              className="max-w-[220px]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="outline" onClick={handleSearch} className="cursor-pointer">
              <Search className="h-4 w-4 mr-2" />搜索
            </Button>
            <Button
              variant="ghost"
              onClick={() => { setSearchGatewayId(''); setPage(1); }}
              className="cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 mr-2" />重置
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <Shield className="h-4 w-4 inline mr-2" />
            认证列表 ({total} 条记录)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialLoad && loading ? (
            <TableSkeleton columns={5} />
          ) : data.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">网关ID</th>
                      <th className="text-left py-3 px-4 font-medium">API Key</th>
                      <th className="text-left py-3 px-4 font-medium">速率限制(次/小时)</th>
                      <th className="text-left py-3 px-4 font-medium">过期时间</th>
                      <th className="text-right py-3 px-4 font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item.gatewayId} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs">{item.gatewayId || '—'}</td>
                        <td className="py-3 px-4 font-mono text-xs max-w-[300px] truncate" title={item.apiKey}>
                          {item.apiKey || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={item.rateLimit > 0 ? 'default' : 'secondary'}>
                            {item.rateLimit || '无限制'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(item.expireTime)}</td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.gatewayId)}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                            aria-label={`删除 ${item.gatewayId} 的认证配置`}
                          >
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
            <DialogTitle>新增认证配置</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="gatewayId">网关ID *</Label>
              <Input id="gatewayId" value={form.gatewayId} onChange={(e) => setForm({ ...form, gatewayId: e.target.value })} placeholder="gateway_001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rateLimit">速率限制（次/小时）</Label>
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
