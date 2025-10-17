import { Plus, Clock, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface DashboardProps {
  onCreateProject: () => void;
  onOpenProject: (projectId: string) => void;
}

const mockProjects = [
  {
    id: '1',
    name: 'E-Commerce Platform Redesign',
    description: 'Building a modern shopping experience',
    type: 'Web App',
    status: 'active',
    progress: 65,
    aiRoles: 5,
    lastActivity: '2 hours ago',
    techStack: ['React', 'Node.js', 'PostgreSQL']
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Secure financial management on the go',
    type: 'Mobile App',
    status: 'active',
    progress: 42,
    aiRoles: 4,
    lastActivity: '5 hours ago',
    techStack: ['React Native', 'Firebase']
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Visualizing business intelligence metrics',
    type: 'Data Analysis',
    status: 'completed',
    progress: 100,
    aiRoles: 3,
    lastActivity: '1 day ago',
    techStack: ['Python', 'Tableau', 'SQL']
  },
  {
    id: '4',
    name: 'AI Content Generator',
    description: 'Automated marketing content creation',
    type: 'Web App',
    status: 'planning',
    progress: 15,
    aiRoles: 6,
    lastActivity: '3 hours ago',
    techStack: ['Next.js', 'OpenAI API']
  }
];

const recentActivity = [
  { project: 'E-Commerce Platform', action: 'Frontend Developer completed UI components', time: '2 hours ago' },
  { project: 'Mobile Banking App', action: 'QA Tester identified 3 issues', time: '5 hours ago' },
  { project: 'AI Content Generator', action: 'Product Manager updated requirements', time: '3 hours ago' },
];

export function Dashboard({ onCreateProject, onOpenProject }: DashboardProps) {
  const getStatusBadge = (status: string) => {
    const variants = {
      active: { variant: 'default' as const, icon: Activity, label: 'Active', className: 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-md' },
      completed: { variant: 'default' as const, icon: CheckCircle2, label: 'Completed', className: 'bg-gradient-to-r from-purple-500 to-pink-600 border-0 shadow-md' },
      planning: { variant: 'secondary' as const, icon: Clock, label: 'Planning', className: 'bg-gradient-to-r from-orange-400 to-amber-500 border-0 text-white shadow-md' },
      pending: { variant: 'secondary' as const, icon: Clock, label: 'Pending', className: 'bg-gradient-to-r from-sky-400 to-blue-500 border-0 text-white shadow-md' },
      draft: { variant: 'secondary' as const, icon: AlertCircle, label: 'Draft', className: 'bg-gradient-to-r from-slate-400 to-slate-600 border-0 text-white shadow-md' }
    };
    const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '-');
    const formatLabel = (value: string) =>
      value
        ? value
            .replace(/[-_]/g, ' ')
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ')
        : 'Unknown';
    const config = normalizedStatus
      ? variants[normalizedStatus as keyof typeof variants]
      : undefined;
    const fallbackConfig = {
      variant: 'secondary' as const,
      icon: AlertCircle,
      label: formatLabel(status || 'Unknown'),
      className: 'bg-gradient-to-r from-slate-500 via-slate-600 to-slate-700 border-0 text-white shadow-md'
    };
    const statusConfig = config ?? fallbackConfig;
    const Icon = statusConfig.icon;
    return (
      <Badge variant={statusConfig.variant} className={statusConfig.className}>
        <Icon className="mr-1 h-3 w-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">Projects</h1>
            <p className="text-slate-600">Manage your AI-powered projects and teams</p>
          </div>
          <Button onClick={onCreateProject} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200">
            <Plus className="mr-2 h-4 w-4" />
            Create New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="text-blue-100 mb-1">Total Projects</div>
            <div className="text-white">12</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="text-emerald-100 mb-1">Active</div>
            <div className="text-white">8</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <div className="text-purple-100 mb-1">Completed</div>
            <div className="text-white">4</div>
          </Card>
          <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <div className="text-orange-100 mb-1">AI Roles Active</div>
            <div className="text-white">24</div>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          <h2 className="text-slate-900 mb-4">Your Projects</h2>
          <div className="grid grid-cols-2 gap-6">
            {mockProjects.map((project) => (
              <Card 
                key={project.id} 
                className="p-6 hover:shadow-2xl transition-all cursor-pointer border-0 shadow-lg bg-white hover:scale-[1.02] duration-300"
                onClick={() => onOpenProject(project.id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-slate-900 mb-1">{project.name}</h3>
                    <p className="text-slate-600">{project.description}</p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
                
                <div className="flex gap-2 mb-4">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-slate-600">
                      {tech}
                    </Badge>
                  ))}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gradient-to-r from-slate-100 to-slate-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-2 rounded-full transition-all shadow-lg"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>{project.aiRoles} AI Roles</span>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    {project.lastActivity}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-slate-900 mb-4">Recent Activity</h2>
          <Card className="p-6 border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-indigo-100 last:border-0 last:pb-0">
                  <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mt-2 shadow-lg" />
                  <div className="flex-1">
                    <div className="text-slate-900">{activity.project}</div>
                    <div className="text-slate-600">{activity.action}</div>
                  </div>
                  <div className="text-slate-500">{activity.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
