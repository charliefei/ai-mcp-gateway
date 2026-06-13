import * as React from 'react'
import { cn } from '@/lib/utils'
import { Badge, badgeVariants } from '@/components/ui/badge'

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string

const methodVariantMap: Record<string, 'get' | 'post' | 'put' | 'delete' | 'patch'> = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  DELETE: 'delete',
  PATCH: 'patch',
}

interface MethodPillProps {
  method: Method
  className?: string
}

/**
 * HTTP method pill — colored badge suitable for protocol / API listings.
 */
export function MethodPill({ method, className }: MethodPillProps) {
  const variant = methodVariantMap[method.toUpperCase()] ?? 'secondary'
  return (
    <Badge variant={variant} className={cn('font-mono font-bold tracking-wide', className)}>
      {method.toUpperCase()}
    </Badge>
  )
}
