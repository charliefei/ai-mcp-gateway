import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/ui/page-header'
import { gatewayApi, authApi, testApi } from '@/lib/api'
import { toast } from 'sonner'
import { Play, RefreshCw, Server, Key, Terminal, Sparkles } from 'lucide-react'
import type { GatewayConfigDTO, GatewayAuthDTO } from '@/types'

export function TestGateway() {
  const [gateways, setGateways] = useState<GatewayConfigDTO[]>([])
  const [authKeys, setAuthKeys] = useState<GatewayAuthDTO[]>([])
  const [selectedGatewayId, setSelectedGatewayId] = useState('')
  const [selectedAuthKey, setSelectedAuthKey] = useState('')
  const [timeout, setTimeout_] = useState(30000)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<string | null>(null)
  const [loadingGateways, setLoadingGateways] = useState(false)

  useEffect(() => {
    setLoadingGateways(true)
    gatewayApi
      .queryGatewayConfigList()
      .then((res) => {
        if (res.data.code === '0000') {
          setGateways(res.data.data || [])
        }
      })
      .catch(() => toast.error('获取网关列表失败'))
      .finally(() => setLoadingGateways(false))
  }, [])

  useEffect(() => {
    if (!selectedGatewayId) {
      setAuthKeys([])
      setSelectedAuthKey('')
      return
    }
    authApi
      .queryGatewayAuthListByGatewayId(selectedGatewayId)
      .then((res) => {
        if (res.data.code === '0000') {
          const keys = res.data.data || []
          setAuthKeys(keys)
          if (keys.length > 0 && !selectedAuthKey) {
            setSelectedAuthKey(keys[0].apiKey)
          }
        }
      })
      .catch(() => toast.error('获取认证密钥失败'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGatewayId])

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

  const isError = response !== null && (response.startsWith('错误') || response.startsWith('异常'))

  return (
    <div className="space-y-7">
      <PageHeader
        icon={Play}
        title="网关测试"
        display="Playground"
        meta="05 / Live Console"
        description="通过 LLM 对话验证网关端到端连通性，实时调用工具并查看响应内容。"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Server className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div>
              <CardTitle className="text-[15px]">测试配置</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5 normal-case tracking-normal">配置网关、认证密钥与请求参数</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>选择网关 *</Label>
              {loadingGateways ? (
                <Skeleton className="h-10 w-full" />
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
              <Label className="flex items-center gap-1.5">
                <Key className="h-3 w-3" />
                认证 API Key
              </Label>
              {authKeys.length === 0 && selectedGatewayId ? (
                <div className="rounded-xl border border-dashed border-border/60 px-4 py-3 text-xs text-muted-foreground">
                  该网关暂无认证配置
                </div>
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
              <Label>超时时间 (毫秒)</Label>
              <Input type="number" value={String(timeout)} onChange={(e) => setTimeout_(Number(e.target.value))} />
            </div>

            <label
              htmlFor="reload"
              className="group flex items-center gap-3 rounded-xl border border-border/60 bg-background/30 backdrop-blur-sm px-3.5 py-2.5 cursor-pointer hover:border-primary/40 hover:bg-background/50 transition-all"
            >
              <input
                type="checkbox"
                id="reload"
                checked={reload}
                onChange={(e) => setReload(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus-visible:ring-2 focus-visible:ring-primary/30 cursor-pointer accent-primary"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground leading-tight">重新加载 LLM 模型</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 normal-case">每次调用前强制刷新模型上下文</p>
              </div>
            </label>

            <div className="space-y-2">
              <Label>测试消息 *</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入测试消息，例如：获取公司员工列表"
                rows={5}
              />
            </div>

            <Button onClick={handleTest} disabled={loading} size="lg" className="w-full cursor-pointer">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  调用中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  发送测试请求
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-aurora-3/10 text-aurora-3">
                <Terminal className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <div>
                <CardTitle className="text-[15px]">响应结果</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5 normal-case tracking-normal">实时返回的 LLM 响应内容</p>
              </div>
            </div>
            {response !== null && (
              <Badge variant={isError ? 'destructive' : 'success'}>
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${isError ? 'bg-destructive' : 'bg-success'}`} />
                {isError ? '失败' : '成功'}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            {response === null ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div className="relative mb-5">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/40 to-aurora-3/40 blur-xl opacity-50" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-border/60 bg-background/60 backdrop-blur-md">
                    <Play className="h-9 w-9 text-primary/70" strokeWidth={1.5} />
                  </div>
                </div>
                <p className="text-sm font-medium text-foreground">等待调用</p>
                <p className="text-xs text-muted-foreground mt-1.5">点击发送按钮查看响应结果</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-3 right-3 top-2 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">response.txt</span>
                </div>
                <pre className="bg-background-deep dark:bg-[hsl(230_40%_3%)] text-foreground/90 rounded-2xl border border-border/60 px-4 pt-9 pb-4 font-mono text-xs whitespace-pre-wrap min-h-[280px] max-h-[520px] overflow-y-auto leading-relaxed">
{response}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
