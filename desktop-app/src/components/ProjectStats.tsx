import { Card } from './ui/card';
import type { ProjectRecord } from '../types/global';

interface ProjectStatsProps {
  projects: ProjectRecord[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'ACTIVE' || p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED' || p.status === 'completed').length;
  const totalAIRoles = projects.length * 3; // 估算值

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="text-blue-100 mb-1">Total Projects</div>
        <div className="text-2xl font-semibold text-white">{totalProjects}</div>
      </Card>
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="text-emerald-100 mb-1">Active</div>
        <div className="text-2xl font-semibold text-white">{activeProjects}</div>
      </Card>
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
        <div className="text-purple-100 mb-1">Completed</div>
        <div className="text-2xl font-semibold text-white">{completedProjects}</div>
      </Card>
      <Card className="p-5 border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
        <div className="text-orange-100 mb-1">AI Roles Active</div>
        <div className="text-2xl font-semibold text-white">{totalAIRoles}</div>
      </Card>
    </div>
  );
}