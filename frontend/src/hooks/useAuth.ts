import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { api } from '@/lib/api'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  provider: 'github' | 'gitlab'
}

export function useAuth() {
  const [loading, setLoading] = useState(true)

  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ['auth', 'me'],
    queryFn: () => api.get('/auth/me').then(res => res.data),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    if (!isLoading) {
      setLoading(false)
    }
  }, [isLoading])

  const login = async (provider: 'github' | 'gitlab') => {
    window.location.href = `/api/auth/${provider}`
  }

  const logout = async () => {
    await api.post('/auth/logout')
    window.location.reload()
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
  }
} 