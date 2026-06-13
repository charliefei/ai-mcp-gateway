import { useEffect, useState } from 'react'

/**
 * 简单防抖 hook：value 变化后延迟 delayMs 才更新 debouncedValue。
 * 用于搜索框输入：避免每个键击都触发后端查询。
 */
export function useDebounce<T>(value: T, delayMs = 200): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedValue(value), delayMs)
    return () => clearTimeout(id)
  }, [value, delayMs])

  return debouncedValue
}
