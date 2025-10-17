import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkspaceManager } from './components/WorkspaceManager';

type ViewType = 'workspace' | 'teams' | 'members';

function PlaceholderPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 flex items-center justify-center">
      <div className="max-w-lg text-center space-y-3">
        <h1 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          {title}
        </h1>
        <p className="text-slate-600 text-sm">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('workspace');

  const renderView = () => {
    switch (currentView) {
      case 'workspace':
        return <WorkspaceManager />;
      case 'teams':
        return (
          <PlaceholderPanel
            title="Teams 管理即将到来"
            description="这里将集中展示跨职能团队的配置与协作上下文，敬请期待后续版本。"
          />
        );
      case 'members':
        return (
          <PlaceholderPanel
            title="Members 管理即将上线"
            description="未来你可以在此邀请成员、配置角色和权限，让团队协作更顺畅。"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar currentView={currentView} onNavigate={(view) => setCurrentView(view as ViewType)} />
      {renderView()}
    </div>
  );
}
