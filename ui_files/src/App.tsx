import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProjectCreationFlow } from './components/ProjectCreationFlow';
import { AIRolesConfig } from './components/AIRolesConfig';
import { RoleSetupModal } from './components/RoleSetupModal';
import { ProjectWorkspace } from './components/ProjectWorkspace';

type ViewType = 'dashboard' | 'projects' | 'create-project' | 'ai-roles' | 'workspace' | 'team' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | undefined>();

  const handleNavigate = (view: string) => {
    setCurrentView(view as ViewType);
  };

  const handleCreateProject = () => {
    setCurrentView('create-project');
  };

  const handleProjectCreated = (projectData: any) => {
    console.log('Project created:', projectData);
    setCurrentView('ai-roles');
  };

  const handleOpenProject = (projectId: string) => {
    console.log('Opening project:', projectId);
    setCurrentView('workspace');
  };

  const handleAddRole = () => {
    setEditingRoleId(undefined);
    setIsRoleModalOpen(true);
  };

  const handleEditRole = (roleId: string) => {
    setEditingRoleId(roleId);
    setIsRoleModalOpen(true);
  };

  const handleSaveRole = (roleData: any) => {
    console.log('Role saved:', roleData);
    setIsRoleModalOpen(false);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleConfigureRoles = () => {
    setCurrentView('ai-roles');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
      case 'projects':
        return (
          <Dashboard 
            onCreateProject={handleCreateProject}
            onOpenProject={handleOpenProject}
          />
        );
      
      case 'create-project':
        return (
          <ProjectCreationFlow
            onBack={handleBackToDashboard}
            onComplete={handleProjectCreated}
          />
        );
      
      case 'ai-roles':
        return (
          <AIRolesConfig
            onBack={handleBackToDashboard}
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
          />
        );
      
      case 'workspace':
        return (
          <ProjectWorkspace
            onBack={handleBackToDashboard}
            onConfigureRoles={handleConfigureRoles}
          />
        );
      
      case 'team':
        return (
          <div className="flex-1 bg-white p-8">
            <h1 className="text-slate-900 mb-4">Team Management</h1>
            <p className="text-slate-600">Manage your team members and permissions</p>
          </div>
        );
      
      case 'settings':
        return (
          <div className="flex-1 bg-white p-8">
            <h1 className="text-slate-900 mb-4">Settings</h1>
            <p className="text-slate-600">Configure your account and preferences</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {currentView !== 'workspace' && (
        <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      )}
      {renderView()}
      
      <RoleSetupModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSave={handleSaveRole}
        roleId={editingRoleId}
      />
    </div>
  );
}
