import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { gatewayApi, authApi, testApi } from '@/lib/api'
import { toast } from 'sonner'
import { Play, RefreshCw, Server, Key } from 'lucide-react'
import type { GatewayConfigDTO, GatewayAuthDTO } from '@/types'

export function TestGateway() {
  const [gateways, setGateways] = useState<GatewayConfigDTO[]>([])
  const [authKeys, setAuthKeys] = useState<GatewayAuthDTO[]>([])
  const [selectedGatewayId, setSelectedGatewayId] = useState('')
  const [selectedAuthKey, setSelectedAuthKey] = useState('')
  const [transport, setTransport] = useState('sse')
  const [timeout, setTimeout_] = useState(30000)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [loadingGateways, setLoadingGateways] = useState(false)

  // Load gateway list
  useEffect(() => {
    setLoadingGateways(true)
    gatewayApi.queryGatewayConfigList()
      .then((res) => {
        if (res.data.code === '0000') {
          setGateways(res.data.data || [])
        }
      })
      .catch(() => toast.error('获取网关列表失败'))
      .finally(() => setLoadingGateways(false))
  }, [])

  // Load auth keys when gateway changes
  useEffect(() => {
    if (!selectedGatewayId) {
      setAuthKeys([])
      setSelectedAuthKey('')
      return
    }
    authApi.queryGatewayAuthListByGatewayId(selectedGatewayId)
      .then((res) => {
        if (res.data.code === '0000') {
          const keys = res.data.data || []
          setAuthKeys(keys)
          // Auto-select first key
          if (keys.length > 0 && !selectedAuthKey) {
            setSelectedAuthKey(keys[0].apiKey)
          }
        }
      })
      .catch(() => toast.error('获取认证密钥失败'))
  }, [selectedGatewayId, selectedAuthKey])

  const handleTest = async () => {
    if (!selectedGatewayId) {
      toast.error('请选择网关')
      return
    }
    if (!message.trim()) {
      toast.error('请输入测试消息')
      return
    }
    setLoading(true)
    setResponse(null)
    try {
      const res = await testApi.testCallGateway({
        gatewayId: selectedGatewayId,
        authApiKey: selectedAuthKey,
        timeout,
        message: message.trim(),
        reload,
        transport,
      })
      if (res.data.code === '0000') {
        setResponse(res.data.data?.content || '(空响应)')
        toast.success('调用成功')
      } else {
        toast.error(res.data.info || '调用失败')
        setResponse(`错误: ${res.data.info || '未知错误'}`)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '调用失败'
      toast.error(msg)
      setResponse(`异常: ${msg}`)
    } finally {
      setLoading(false)
    }
  }

  const gatewayOptions = gateways.map((g) => ({
    value: g.gatewayId,
    label: `${g.gatewayId} - ${g.gatewayName}`,
  }))

  const authKeyOptions = authKeys.map((a) => ({
    value: a.apiKey,
    label: `${a.apiKey.substring(0, 20)}... (${a.rateLimit}次/小时)`,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">网关测试</h2>
        <p className="text-sm text-muted-foreground mt-1">通过 LLM 对话模型测试网关功能</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Server className="h-4 w-4" />
              测试配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>选择网关 *</Label>
              {loadingGateways ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedGatewayId}
                  onChange={(e) => setSelectedGatewayId(e.target.value)}
                  options={gatewayOptions}
                  placeholder="请选择网关"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Key className="h-3 w-3" />认证 API Key</Label>
              {authKeys.length === 0 && selectedGatewayId ? (
                <p className="text-xs text-muted-foreground">该网关暂无认证配置</p>
              ) : (
                <Select
                  value={selectedAuthKey}
                  onChange={(e) => setSelectedAuthKey(e.target.value)}
                  options={authKeyOptions}
                  placeholder="请选择认证密钥"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>传输协议</Label>
              <Select
                value={transport}
                onChange={(e) => setTransport(e.target.value)}
                options={[
                  { value: 'sse', label: 'SSE（默认）' },
                  { value: 'streamable', label: 'Streamable HTTP' },
                ]}
              />
              <p className="text-xs text-muted-foreground">
                {transport === 'streamable'
                  ? `将调用 ${window.location.origin}/api-gateway/{gatewayId}/mcp (Streamable HTTP)`
                  : `将调用 /api-gateway/{gatewayId}/mcp/sse (SSE)`}
              </p>
            </div>

            <div className="space-y-2">
              <Label>超时时间 (毫秒)</Label>
              <Input type="number" value={String(timeout)} onChange={(e) => setTimeout_(Number(e.target.value))} />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reload"
                checked={reload}
                onChange={(e) => setReload(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              />
              <Label htmlFor="reload">重新加载 LLM 模型</Label>
            </div>

            <div className="space-y-2">
              <Label>测试消息 *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入测试消息，例如：获取公司员工列表"
                rows={4}
              />
            </div>

            <Button onClick={handleTest} disabled={loading} className="w-full cursor-pointer">
              {loading ? (
                <><RefreshCw className="h-4 w-4 animate-spin mr-2" />调用中...</>
              ) : (
                <><Play className="h-4 w-4 mr-2" />发送测试请求</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>响应结果</span>
              {response !== null && (
                <Badge variant={response.startsWith('错误') || response.startsWith('异常') ? 'destructive' : 'success'}>
                  {response.startsWith('错误') || response.startsWith('异常') ? '失败' : '成功'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {response === null ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Play className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">点击发送按钮查看响应结果</p>
              </div>
            ) : (
              <div className="bg-slate-950 text-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-border rounded-lg p-4 font-mono text-sm whitespace-pre-wrap min-h-[200px] max-h-[500px] overflow-y-auto">
                {response}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
