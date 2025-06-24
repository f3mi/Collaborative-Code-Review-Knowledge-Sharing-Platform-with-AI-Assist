import { useAuth } from '@/hooks/useAuth'
import { Github, Gitlab } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900">CodeReview</h1>
          <p className="mt-2 text-secondary-600">
            Collaborative code review platform with AI-powered suggestions
          </p>
        </div>
        
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sign in to your account</h2>
            <p className="card-description">
              Choose your preferred authentication provider
            </p>
          </div>
          
          <div className="card-content space-y-4">
            <button
              onClick={() => login('github')}
              className="w-full btn-primary flex items-center justify-center space-x-3"
            >
              <Github size={20} />
              <span>Continue with GitHub</span>
            </button>
            
            <button
              onClick={() => login('gitlab')}
              className="w-full btn-outline flex items-center justify-center space-x-3"
            >
              <Gitlab size={20} />
              <span>Continue with GitLab</span>
            </button>
          </div>
        </div>
        
        <div className="text-center text-sm text-secondary-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  )
} 