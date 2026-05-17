import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (apiCall: () => Promise<{ data: { code: string; info: string; data: T } }>) => {
    setState({ data: null, loading: true, error: null })
    try {
      const response = await apiCall()
      const result = response.data
      if (result.code === '0000') {
        setState({ data: result.data, loading: false, error: null })
        return result.data
      } else {
        const msg = result.info || '请求失败'
        setState({ data: null, loading: false, error: msg })
        toast.error(msg)
        return null
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '请求失败'
      setState({ data: null, loading: false, error: msg })
      toast.error(msg)
      return null
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return { ...state, execute, reset }
}

export function useApiWithToast<T>(successMsg?: string) {
  const { execute: rawExecute, ...rest } = useApi<T>()

  const execute = useCallback(
    async (apiCall: () => Promise<{ data: { code: string; info: string; data: T } }>) => {
      const result = await rawExecute(apiCall)
      if (result !== null && successMsg) {
        toast.success(successMsg)
      }
      return result
    },
    [rawExecute, successMsg]
  )

  return { ...rest, execute }
}
