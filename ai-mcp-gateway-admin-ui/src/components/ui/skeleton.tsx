import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('shimmer rounded-md', className)} {...props} />
}

function TableSkeleton({
  columns,
  rows = 8,
}: {
  columns: number
  rows?: number
}) {
  return (
    <div className="w-full space-y-2.5 py-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 rounded-lg border border-border/40 bg-card/40 px-4 py-3.5"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-3.5 rounded"
              style={{
                width: `${50 + ((rowIdx * 7 + colIdx * 13) % 90)}px`,
                animationDelay: `${(rowIdx * 60 + colIdx * 30) % 400}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-soft-sm space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

export { Skeleton, TableSkeleton, CardSkeleton }
