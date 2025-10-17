// 工具函数集合

/**
 * 格式化日期时间
 */
export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '尚未打开';
  }
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hour}:${minute}`;
  } catch {
    return value;
  }
}

/**
 * 获取相对时间
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDateTime(dateString);
}

/**
 * 解析JSON标签
 */
export function parseLabels(labelsJson: string): string[] {
  try {
    return JSON.parse(labelsJson);
  } catch {
    return [];
  }
}

/**
 * 生成随机的项目进度 (25-75%)
 */
export function generateRandomProgress(): number {
  return Math.floor(Math.random() * 50) + 25;
}

/**
 * 生成随机的AI角色数量 (2-6个)
 */
export function generateRandomAIRoles(): number {
  return Math.floor(Math.random() * 5) + 2;
}

/**
 * 获取随机工作区颜色
 */
export function getRandomWorkspaceColor(colors: readonly string[]): string {
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 限制字符串长度
 */
export function limitString(str: string, limit: number): string {
  return str.slice(0, limit);
}

/**
 * 确认对话框Promise化
 */
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    const result = window.confirm(message);
    resolve(result);
  });
}