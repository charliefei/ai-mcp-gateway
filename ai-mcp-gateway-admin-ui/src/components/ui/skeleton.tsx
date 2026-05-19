import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-foreground/[0.05]',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:bg-gradient-to-r before:from-transparent before:via-foreground/[0.08] before:to-transparent',
        'before:animate-[shimmer_1.8s_infinite]',
        className
      )}
      {...props}
    />
  )
}

function TableSkeleton({ columns, rows = 8 }: { columns: number; rows?: number }) {
  return (
    <div className="w-full divide-y divide-border/40">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className="flex items-center gap-4 py-4 px-4"
        >
          {Array.from({ length: columns }).map((_, colIdx) => (
            <Skeleton
              key={colIdx}
              className="h-4 rounded-md"
              style={{
                width: `${70 + (colIdx * 17) % 60}px`,
                animationDelay: `${rowIdx * 60 + colIdx * 40}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export { Skeleton, TableSkeleton }
