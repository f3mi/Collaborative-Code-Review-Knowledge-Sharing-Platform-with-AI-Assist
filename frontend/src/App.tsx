import { Routes, Route } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Dashboard'
import Projects from '@/pages/Projects'
import ReviewSession from '@/pages/ReviewSession'
import Login from '@/pages/Login'
import LoadingSpinner from '@/components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<Projects />} />
        <Route path="/review/:sessionId" element={<ReviewSession />} />
      </Routes>
    </Layout>
  )
}

export default App 