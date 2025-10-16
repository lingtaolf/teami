// 统一的状态样式管理
export type RoleStatus = 'active' | 'working' | 'idle';
export type TaskStatus = 'completed' | 'in-progress' | 'pending';

// 角色状态样式枚举
export const roleStatusStyles: Record<RoleStatus, string> = {
  active: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md',
  working: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md',
  idle: 'bg-slate-100 text-slate-700 border-0'
};

// 任务状态样式枚举
export const taskStatusStyles: Record<TaskStatus, string> = {
  completed: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md',
  'in-progress': 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md',
  pending: 'bg-slate-100 text-slate-700 border-0'
};

// 任务状态点样式枚举
export const taskStatusDotStyles: Record<TaskStatus, string> = {
  completed: 'bg-green-600',
  'in-progress': 'bg-blue-600',
  pending: 'bg-slate-300'
};

// 获取角色状态样式的工具函数
export const getRoleStatusStyle = (status: RoleStatus): string => {
  return roleStatusStyles[status] || roleStatusStyles.idle;
};

// 获取任务状态样式的工具函数
export const getTaskStatusStyle = (status: TaskStatus): string => {
  return taskStatusStyles[status] || taskStatusStyles.pending;
};

// 获取任务状态点样式的工具函数
export const getTaskStatusDotStyle = (status: TaskStatus): string => {
  return taskStatusDotStyles[status] || taskStatusDotStyles.pending;
};