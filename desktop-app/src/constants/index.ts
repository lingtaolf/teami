// 应用常量
export const APP_CONSTANTS = {
  // 工作区限制
  MAX_WORKSPACES: 5,
  
  // 分页设置
  WORKSPACE_PAGE_SIZE: 6,
  PROJECT_PAGE_SIZE: 4,
  
  // 表单验证限制
  WORKSPACE_NAME_LIMIT: 10,
  WORKSPACE_DESCRIPTION_LIMIT: 100,
  PROJECT_NAME_LIMIT: 30,
  PROJECT_DESCRIPTION_LIMIT: 100,
  
  // 数据库设置
  DATABASE_NAME: 'teami.sqlite',
  
  // 默认值
  DEFAULT_PROJECT_STATUS: 'READY' as const,
  DEFAULT_LABELS: [
    'java',
    'backend', 
    'web',
    'mobile',
    'data',
    'ai',
    'api',
    'frontend'
  ] as const,
  
  // UI配置
  WORKSPACE_COLORS: [
    'bg-gradient-to-br from-indigo-50 via-white to-indigo-50/30 ring-1 ring-indigo-100/50 shadow-indigo-100/40',
    'bg-gradient-to-br from-purple-50 via-white to-purple-50/30 ring-1 ring-purple-100/50 shadow-purple-100/40',
    'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 ring-1 ring-emerald-100/50 shadow-emerald-100/40',
    'bg-gradient-to-br from-amber-50 via-white to-amber-50/30 ring-1 ring-amber-100/50 shadow-amber-100/40',
    'bg-gradient-to-br from-rose-50 via-white to-rose-50/30 ring-1 ring-rose-100/50 shadow-rose-100/40',
    'bg-gradient-to-br from-blue-50 via-white to-blue-50/30 ring-1 ring-blue-100/50 shadow-blue-100/40'
  ] as const
} as const;

// 项目状态类型
export type ProjectStatus = 'READY' | 'ACTIVE' | 'COMPLETED' | 'PLANNING';

// 视图类型
export type ViewType = 'workspace' | 'teams' | 'members' | 'dashboard';