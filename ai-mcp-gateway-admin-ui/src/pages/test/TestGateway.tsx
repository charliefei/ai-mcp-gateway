import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader, FormField, GradientText } from '@/components/common'
import { gatewayApi, authApi, testApi } from '@/lib/api'
import { toast } from 'sonner'
import { Play, RefreshCw, Server, Key, Zap, Radio, FileText, Sparkles, Copy, Check, ChevronRight } from 'lucide-react'
import type { GatewayConfigDTO, GatewayAuthDTO } from '@/types'
import { cn } from '@/lib/utils'

type ResponseState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; data: string; durationMs: number }
  | { kind: 'error'; message: string; durationMs: number }

export function TestGateway() {
  const [gateways, setGateways] = useState<GatewayConfigDTO[]>([])
  const [authKeys, setAuthKeys] = useState<GatewayAuthDTO[]>([])
  const [selectedGatewayId, setSelectedGatewayId] = useState('')
  const [selectedAuthKey, setSelectedAuthKey] = useState('')
  const [transport, setTransport] = useState('sse')
  const [timeout, setTimeout_] = useState(30000)
  const [message, setMessage] = useState('')
  const [reload, setReload] = useState(false)
  const [response, setResponse] = useState<ResponseState>({ kind: 'idle' })
  const [loadingGateways, setLoadingGateways] = useState(false)
  const [copied, setCopied] = useState(false)
  const startTimeRef = useRef<number>(0)

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
    setResponse({ kind: 'loading' })
    startTimeRef.current = Date.now()
    try {
      const res = await testApi.testCallGateway({
        gatewayId: selectedGatewayId,
        authApiKey: selectedAuthKey,
        timeout,
        message: message.trim(),
        reload,
        transport,
      })
      const duration = Date.now() - startTimeRef.current
      if (res.data.code === '0000') {
        setResponse({
          kind: 'success',
          data: res.data.data?.content || '(空响应)',
          durationMs: duration,
        })
        toast.success('调用成功', { description: `${duration}ms` })
      } else {
        setResponse({
          kind: 'error',
          message: res.data.info || '未知错误',
          durationMs: duration,
        })
        toast.error(res.data.info || '调用失败')
      }
    } catch (err: unknown) {
      const duration = Date.now() - startTimeRef.current
      const msg = err instanceof Error ? err.message : '调用失败'
      setResponse({ kind: 'error', message: msg, durationMs: duration })
      toast.error(msg)
    }
  }

  const handleCopy = async () => {
    if (response.kind !== 'success' && response.kind !== 'error') return
    const text = response.kind === 'success' ? response.data : response.message
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignore */
    }
  }

  const gatewayOptions = gateways.map((g) => ({
    value: g.gatewayId,
    label: `${g.gatewayId} - ${g.gatewayName}`,
  }))

  const authKeyOptions = authKeys.map((a) => ({
    value: a.apiKey,
    label: `${a.apiKey.substring(0, 16)}… (${a.rateLimit}次/小时)`,
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="网关测试"
        description="通过 LLM 对话模型测试 MCP 网关的端到端调用能力。"
        icon={<Zap className="h-5 w-5" />}
        badge={
          <Badge variant="info" className="font-mono text-[10px]">
            Playground
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <Card>
          <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">测试配置</h3>
              <p className="text-xs text-muted-foreground">选择网关和参数</p>
            </div>
          </div>
          <CardContent className="p-5 space-y-4">
            <FormField label="选择网关" required>
              {loadingGateways ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedGatewayId}
                  onChange={(v) => setSelectedGatewayId(v)}
                  options={gatewayOptions}
                  placeholder="请选择网关"
                />
              )}
            </FormField>

            <FormField
              label={
                <span className="flex items-center gap-1.5">
                  <Key className="h-3 w-3" /> 认证 API Key
                </span>
              }
            >
              {authKeys.length === 0 && selectedGatewayId ? (
                <p className="text-xs text-muted-foreground px-3 py-2 rounded-md bg-muted/40 border border-dashed">
                  该网关暂无认证配置
                </p>
              ) : (
                <Select
                  value={selectedAuthKey}
                  onChange={(v) => setSelectedAuthKey(v)}
                  options={authKeyOptions}
                  placeholder="请选择认证密钥"
                />
              )}
            </FormField>

            <FormField
              label={
                <span className="flex items-center gap-1.5">
                  <Radio className="h-3 w-3" /> 传输协议
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-2">
                <ProtocolOption
                  active={transport === 'sse'}
                  onClick={() => setTransport('sse')}
                  label="SSE"
                  desc="Server-Sent Events"
                />
                <ProtocolOption
                  active={transport === 'streamable'}
                  onClick={() => setTransport('streamable')}
                  label="Streamable"
                  desc="HTTP 单端点"
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-mono leading-relaxed">
                <ChevronRight className="inline h-3 w-3" />
                {transport === 'streamable'
                  ? `${window.location.origin}/api-gateway/{gatewayId}/mcp`
                  : `${window.location.origin}/api-gateway/{gatewayId}/mcp/sse`}
              </p>
            </FormField>

            <FormField label="超时时间（毫秒）">
              <Input
                type="number"
                value={String(timeout)}
                onChange={(e) => setTimeout_(Number(e.target.value))}
              />
            </FormField>

            <label className="flex items-center gap-2.5 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={reload}
                  onChange={(e) => setReload(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="h-5 w-9 rounded-full bg-muted-foreground/20 peer-checked:bg-primary transition-colors duration-200" />
                <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-soft-sm transition-transform duration-200 peer-checked:translate-x-4" />
              </div>
              <span className="text-sm font-medium">重新加载 LLM 模型</span>
            </label>

            <FormField label="测试消息" required>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入测试消息，例如：获取公司员工列表"
                rows={5}
                className="resize-none"
              />
            </FormField>

            <Button
              onClick={handleTest}
              disabled={response.kind === 'loading'}
              variant="gradient"
              size="lg"
              className="w-full cursor-pointer"
            >
              {response.kind === 'loading' ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  调用中...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  发送测试请求
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Response */}
        <Card className="flex flex-col">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60 bg-gradient-to-b from-muted/30 to-transparent">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-purple-500/15 text-primary ring-1 ring-primary/20">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">响应结果</h3>
                <p className="text-xs text-muted-foreground">LLM 返回的内容</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {response.kind === 'success' && (
                <>
                  <Badge variant="success" className="font-mono">
                    {response.durationMs}ms
                  </Badge>
                  <Badge variant="success">成功</Badge>
                </>
              )}
              {response.kind === 'error' && (
                <>
                  <Badge variant="destructive" className="font-mono">
                    {response.durationMs}ms
                  </Badge>
                  <Badge variant="destructive">失败</Badge>
                </>
              )}
              {(response.kind === 'success' || response.kind === 'error') && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  className="cursor-pointer"
                  aria-label="复制响应"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
          <CardContent className="p-0 flex-1 min-h-[420px] relative">
            {response.kind === 'idle' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 animate-in fade-in-0">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-purple-500/15 text-primary ring-1 ring-primary/20">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div className="absolute inset-0 -z-10 blur-2xl opacity-30 bg-primary rounded-2xl" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">
                  准备就绪 —{' '}
                  <GradientText>点击发送开始测试</GradientText>
                </h4>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                  配置左侧参数后，点击发送测试请求，响应将显示在这里
                </p>
              </div>
            )}
            {response.kind === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-primary animate-pulse" />
                </div>
                <p className="text-sm font-medium text-foreground mt-4">正在调用网关</p>
                <p className="text-xs text-muted-foreground mt-1">通过 LLM 处理您的请求...</p>
              </div>
            )}
            {(response.kind === 'success' || response.kind === 'error') && (
              <div
                className={cn(
                  'absolute inset-0 overflow-auto p-5 font-mono text-sm leading-relaxed whitespace-pre-wrap break-words',
                  'animate-in fade-in-0 slide-in-from-bottom-2',
                  response.kind === 'error'
                    ? 'bg-rose-500/[0.04] text-rose-700 dark:text-rose-300'
                    : 'bg-slate-950 text-slate-50 dark:bg-slate-900 dark:text-slate-100'
                )}
              >
                {response.kind === 'success' ? response.data : response.message}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProtocolOption({
  active,
  onClick,
  label,
  desc,
}: {
  active: boolean
  onClick: () => void
  label: string
  desc: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg border p-3 text-left transition-all duration-200 cursor-pointer',
        active
          ? 'border-primary/50 bg-primary/5 shadow-soft-sm ring-1 ring-primary/20'
          : 'border-border bg-card/50 hover:border-primary/30 hover:bg-card'
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-sm font-semibold',
            active ? 'text-primary' : 'text-foreground'
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            'h-4 w-4 rounded-full border-2 transition-colors',
            active ? 'border-primary bg-primary' : 'border-muted-foreground/30'
          )}
        >
          {active && (
            <div className="h-full w-full flex items-center justify-center">
              <div className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-0.5">{desc}</p>
    </button>
  )
}
