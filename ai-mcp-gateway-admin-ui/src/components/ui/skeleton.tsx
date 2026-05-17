import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

function TableSkeleton({ columns, rows = 8 }: { columns: number; rows?: number }) {
  return (
    <div className="w-full">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 border-b py-3 px-4"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 rounded"
              style={{ width: `${70 + (colIdx * 17) % 60}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton, TableSkeleton }
