import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Settings, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { getRelativeTime, parseLabels, generateRandomAIRoles } from '../utils';
import type { ProjectRecord } from '../types/global';

interface ProjectCardProps {
  project: ProjectRecord;
  onOpenProject: (project: ProjectRecord) => void;
  onOpenSettings: (project: ProjectRecord) => void;
  onDeleteProject: (projectUuid: string) => void;
}

export function ProjectCard({ 
  project, 
  onOpenProject, 
  onOpenSettings, 
  onDeleteProject 
}: ProjectCardProps) {
  return (
    <Card 
      key={project.project_uuid}
      className="p-6 hover:shadow-2xl transition-all cursor-pointer border-0 shadow-lg bg-white hover:scale-[1.02] duration-300 group relative"
      onClick={() => onOpenProject(project)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">{project.project_name}</h3>
          <p className="text-sm text-slate-600">{project.description || '暂无描述'}</p>
        </div>
        <StatusBadge status={project.status} />
      </div>
      
      <div className="flex gap-2 mb-4">
        {parseLabels(project.labels).map((label) => (
          <Badge key={label} className="bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200">
            {label}
          </Badge>
        ))}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-slate-600 mb-2">
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

      <div className="flex justify-between items-end">
        <div className="text-sm text-slate-600">
          <div className="mb-2">{generateRandomAIRoles()} AI Roles</div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {getRelativeTime(project.last_open_time)}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8"
            onClick={(event) => {
              event.stopPropagation();
              onOpenSettings(project);
            }}
            aria-label="设置项目"
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
            onClick={(event) => {
              event.stopPropagation();
              onDeleteProject(project.project_uuid);
            }}
            aria-label="删除项目"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}