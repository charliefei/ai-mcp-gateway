import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, StatCard } from '@/components/ui/card'
import { PageHeader, StatusDot, GradientText } from '@/components/common'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Server, Wrench, Globe, Shield, Play, ArrowUpRight, Sparkles, Zap, Activity, Cpu } from 'lucide-react'
import { gatewayApi, toolApi, protocolApi, authApi } from '@/lib/api'
import { toast } from 'sonner'

interface Counts {
  gateways: number
  tools: number
  protocols: number
  auths: number
  activeGateways: number
}

export function Dashboard() {
  const [counts, setCounts] = useState<Counts>({
    gateways: 0,
    tools: 0,
    protocols: 0,
    auths: 0,
    activeGateways: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.allSettled([
      gatewayApi.queryGatewayConfigList(),
      toolApi.queryGatewayToolList(),
      protocolApi.queryGatewayProtocolList(),
      authApi.queryGatewayAuthList(),
    ])
      .then((results) => {
        if (!mounted) return
        const [gw, tl, pr, au] = results
        const gateways = gw.status === 'fulfilled' ? gw.value.data.data ?? [] : []
        const tools = tl.status === 'fulfilled' ? tl.value.data.data ?? [] : []
        const protocols = pr.status === 'fulfilled' ? pr.value.data.data ?? [] : []
        const auths = au.status === 'fulfilled' ? au.value.data.data ?? [] : []
        setCounts({
          gateways: gateways.length,
          tools: tools.length,
          protocols: protocols.length,
          auths: auths.length,
          activeGateways: gateways.filter((g) => g.status === 1).length,
        })
      })
      .catch(() => toast.error('加载统计数据失败'))
      .finally(() => mounted && setLoading(false))
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="MCP Gateway 概览"
        description="一站式管理所有 MCP 网关、工具、协议与认证配置。"
        icon={<Sparkles className="h-6 w-6" />}
        badge={
          <Badge variant="success" className="text-[10px]">
            <StatusDot status="online" showLabel={false} />
            系统运行中
          </Badge>
        }
        actions={
          <Button asChild className="cursor-pointer">
            <Link to="/test">
              <Play className="h-4 w-4" />
              快速测试
            </Link>
          </Button>
        }
      />

      {/* Hero / Welcome card */}
      <div className="relative overflow-hidden rounded-2xl border bg-card shadow-soft-sm gradient-border-animated">
        <div className="aurora-bg p-8 sm:p-10">
          <div className="flex flex-col gap-4 max-w-2xl">
            <Badge variant="default" className="w-fit">
              <Zap className="h-3 w-3" />
              v1.0 · Stable
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              让 <GradientText>任意 HTTP API</GradientText> 变成 MCP 工具
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
              通过 OpenAPI 导入自动生成工具映射，支持 SSE 与 Streamable HTTP 双传输协议，
              统一的鉴权与限流，开箱即用。
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button asChild variant="gradient" className="cursor-pointer">
                <Link to="/gateway">
                  <Server className="h-4 w-4" />
                  创建网关
                </Link>
              </Button>
              <Button asChild variant="outline" className="cursor-pointer">
                <Link to="/protocol">
                  <Globe className="h-4 w-4" />
                  导入 OpenAPI
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="网关实例"
          value={loading ? '—' : counts.gateways}
          delta={loading ? undefined : `${counts.activeGateways} 个启用`}
          trend={counts.activeGateways > 0 ? 'up' : 'flat'}
          icon={<Server className="h-5 w-5" />}
          accent="primary"
        />
        <StatCard
          label="MCP 工具"
          value={loading ? '—' : counts.tools}
          delta={loading ? undefined : '可调用'}
          trend="flat"
          icon={<Wrench className="h-5 w-5" />}
          accent="info"
        />
        <StatCard
          label="协议配置"
          value={loading ? '—' : counts.protocols}
          delta={loading ? undefined : '映射规则'}
          trend="flat"
          icon={<Globe className="h-5 w-5" />}
          accent="success"
        />
        <StatCard
          label="认证凭据"
          value={loading ? '—' : counts.auths}
          delta={loading ? undefined : 'API Key'}
          trend="flat"
          icon={<Shield className="h-5 w-5" />}
          accent="warning"
        />
      </div>

      {/* Quick links + system */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold tracking-tight">快速操作</h3>
                <p className="text-xs text-muted-foreground mt-0.5">最常用的管理工作流</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <QuickLink
                to="/gateway"
                icon={<Server className="h-4 w-4" />}
                title="网关配置"
                desc="管理 MCP 网关实例"
                accent="primary"
              />
              <QuickLink
                to="/tool"
                icon={<Wrench className="h-4 w-4" />}
                title="工具配置"
                desc="注册和管理工具"
                accent="info"
              />
              <QuickLink
                to="/protocol"
                icon={<Globe className="h-4 w-4" />}
                title="协议配置"
                desc="HTTP 映射与 OpenAPI 导入"
                accent="success"
              />
              <QuickLink
                to="/auth"
                icon={<Shield className="h-4 w-4" />}
                title="认证配置"
                desc="API Key 与限流策略"
                accent="warning"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold tracking-tight">系统信息</h3>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
            <SystemRow label="运行版本" value="v1.0.0" />
            <SystemRow label="协议版本" value="2024-11-05" />
            <SystemRow label="传输协议" value="SSE / Streamable" />
            <SystemRow
              label="服务状态"
              value={
                <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 pulse-dot" />
                  健康
                </span>
              }
            />
            <div className="pt-3 border-t border-border/60">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-3.5 w-3.5" />
                <span>实时活动将通过此处显示</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function QuickLink({
  to,
  icon,
  title,
  desc,
  accent,
}: {
  to: string
  icon: React.ReactNode
  title: string
  desc: string
  accent: 'primary' | 'info' | 'success' | 'warning'
}) {
  const map = {
    primary:
      'from-primary/15 to-primary/0 text-primary ring-primary/20 group-hover:from-primary/25',
    info: 'from-sky-500/15 to-sky-500/0 text-sky-600 dark:text-sky-400 ring-sky-500/20 group-hover:from-sky-500/25',
    success:
      'from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20 group-hover:from-emerald-500/25',
    warning:
      'from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400 ring-amber-500/20 group-hover:from-amber-500/25',
  }
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-soft hover:-translate-y-0.5"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ${map[accent]} transition-transform group-hover:scale-110`}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Link>
  )
}

function SystemRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  )
}
