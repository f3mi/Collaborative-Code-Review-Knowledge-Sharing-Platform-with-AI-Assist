import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  GitBranch,
  Users,
  Calendar,
  MoreVertical
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string
  repository: string
  members: Array<{
    id: string
    username: string
    avatar?: string
  }>
  lastActivity: string
  activeReviews: number
}

export default function Projects() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const queryClient = useQueryClient()

  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects').then(res => res.data),
  })

  const createProjectMutation = useMutation({
    mutationFn: (data: { name: string; description: string; repository: string }) =>
      api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['projects'])
      setShowCreateModal(false)
    },
  })

  const filteredProjects = projects?.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    createProjectMutation.mutate({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      repository: formData.get('repository') as string,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
          <p className="text-secondary-600">Manage your code review projects</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" size={20} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
        <button className="btn-outline flex items-center space-x-2">
          <Filter size={16} />
          <span>Filter</span>
        </button>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="card-content">
                <div className="h-4 bg-secondary-200 rounded mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded mb-4"></div>
                <div className="h-3 bg-secondary-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects?.map((project) => (
            <div key={project.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-1">
                      {project.name}
                    </h3>
                    <p className="text-sm text-secondary-600 mb-3">
                      {project.description}
                    </p>
                  </div>
                  <button className="text-secondary-400 hover:text-secondary-600">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm text-secondary-600">
                    <GitBranch size={16} className="mr-2" />
                    <span className="truncate">{project.repository}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-secondary-600">
                      <Users size={16} className="mr-2" />
                      <span>{project.members.length} members</span>
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                      <Calendar size={16} className="mr-2" />
                      <span>{formatDate(project.lastActivity)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-secondary-200">
                    <span className="text-sm font-medium text-primary-600">
                      {project.activeReviews} active reviews
                    </span>
                    <Link
                      to={`/projects/${project.id}`}
                      className="btn-ghost text-sm"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  className="input resize-none"
                  placeholder="Enter project description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Repository URL
                </label>
                <input
                  type="url"
                  name="repository"
                  required
                  className="input"
                  placeholder="https://github.com/user/repo"
                />
              </div>
              <div className="flex items-center justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createProjectMutation.isLoading}
                  className="btn-primary"
                >
                  {createProjectMutation.isLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 