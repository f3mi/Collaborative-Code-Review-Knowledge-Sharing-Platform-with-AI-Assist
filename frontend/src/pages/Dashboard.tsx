import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { 
  FolderOpen, 
  Users, 
  Clock, 
  TrendingUp,
  Plus,
  ArrowRight
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

interface DashboardStats {
  totalProjects: number
  activeReviews: number
  avgReviewTime: number
  totalParticipants: number
}

interface RecentActivity {
  id: string
  type: 'review_started' | 'review_completed' | 'comment_added'
  projectName: string
  description: string
  timestamp: string
  user: {
    username: string
    avatar?: string
  }
}

export default function Dashboard() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data),
  })

  const { data: recentActivity } = useQuery<RecentActivity[]>({
    queryKey: ['dashboard', 'activity'],
    queryFn: () => api.get('/dashboard/activity').then(res => res.data),
  })

  const statCards = [
    {
      title: 'Total Projects',
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Active Reviews',
      value: stats?.activeReviews || 0,
      icon: Clock,
      color: 'text-warning-600',
      bgColor: 'bg-warning-50',
    },
    {
      title: 'Avg Review Time',
      value: `${stats?.avgReviewTime || 0}h`,
      icon: TrendingUp,
      color: 'text-success-600',
      bgColor: 'bg-success-50',
    },
    {
      title: 'Participants',
      value: stats?.totalParticipants || 0,
      icon: Users,
      color: 'text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Overview of your code review activity</p>
        </div>
        <Link
          to="/projects"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>New Project</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="card">
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-secondary-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Activity</h2>
          <p className="card-description">Latest code review activities</p>
        </div>
        <div className="card-content">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 rounded-lg bg-secondary-50">
                  <img
                    src={activity.user.avatar || `https://ui-avatars.com/api/?name=${activity.user.username}`}
                    alt={activity.user.username}
                    className="h-10 w-10 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-secondary-900">
                      {activity.user.username}
                    </p>
                    <p className="text-sm text-secondary-600">{activity.description}</p>
                    <p className="text-xs text-secondary-500">{formatDate(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-secondary-500">No recent activity</p>
            </div>
          )}
        </div>
        <div className="card-footer">
          <Link
            to="/projects"
            className="btn-ghost flex items-center space-x-2 text-sm"
          >
            <span>View all projects</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
} 