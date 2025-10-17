import { useState } from 'react';
import { Send, FileText, Code, Image, CheckCircle, Clock, ArrowLeft, Settings, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ProjectWorkspaceProps {
  onBack: () => void;
  onConfigureRoles: () => void;
}

const activeRoles = [
  { id: '1', name: 'Product Manager', status: 'active', model: 'GPT-4', lastActive: '2m ago' },
  { id: '2', name: 'Architect', status: 'active', model: 'Claude-3', lastActive: '5m ago' },
  { id: '3', name: 'Frontend Dev', status: 'idle', model: 'GPT-4', lastActive: '15m ago' },
  { id: '4', name: 'UI Designer', status: 'working', model: 'Figma AI', lastActive: '1m ago' },
  { id: '5', name: 'QA Tester', status: 'idle', model: 'Claude-3', lastActive: '10m ago' }
];

const chatMessages = [
  {
    id: '1',
    role: 'user',
    content: 'I need to create a user authentication flow for the e-commerce platform',
    timestamp: '10:30 AM'
  },
  {
    id: '2',
    role: 'Product Manager',
    content: 'I\'ve analyzed the requirements. Here\'s what we need:\n\n1. User Registration (email/password)\n2. Email verification\n3. Login with "Remember Me" option\n4. Password reset flow\n5. OAuth integration (Google, GitHub)\n\nShould we prioritize the OAuth integration for v1?',
    timestamp: '10:31 AM'
  },
  {
    id: '3',
    role: 'Architect',
    content: 'For the authentication architecture, I recommend:\n\n- JWT tokens with refresh token rotation\n- Redis for session management\n- Separate auth microservice\n- Rate limiting on login endpoints\n\nI\'ll create a detailed architecture diagram.',
    timestamp: '10:33 AM'
  },
  {
    id: '4',
    role: 'user',
    content: 'Yes, include OAuth. Can the UI Designer create mockups for the login page?',
    timestamp: '10:35 AM'
  },
  {
    id: '5',
    role: 'UI Designer',
    content: 'I\'ve created a modern login page design with:\n\n- Clean, minimal interface\n- Social login buttons prominently displayed\n- Password strength indicator\n- Mobile-responsive layout\n\nCheck the Files section for the Figma mockups.',
    timestamp: '10:37 AM'
  }
];

const generatedFiles = [
  { id: '1', name: 'auth-architecture.md', type: 'document', size: '12 KB', author: 'Architect', date: '10:33 AM' },
  { id: '2', name: 'user-stories.md', type: 'document', size: '8 KB', author: 'Product Manager', date: '10:31 AM' },
  { id: '3', name: 'login-page-mockup.fig', type: 'design', size: '245 KB', author: 'UI Designer', date: '10:37 AM' },
  { id: '4', name: 'auth.service.ts', type: 'code', size: '15 KB', author: 'Frontend Dev', date: '10:40 AM' },
  { id: '5', name: 'test-cases.md', type: 'document', size: '6 KB', author: 'QA Tester', date: '10:42 AM' }
];

const tasks = [
  { id: '1', title: 'Create authentication architecture', status: 'completed', assignee: 'Architect' },
  { id: '2', title: 'Design login page UI', status: 'completed', assignee: 'UI Designer' },
  { id: '3', title: 'Implement auth service', status: 'in-progress', assignee: 'Frontend Dev' },
  { id: '4', title: 'Write test cases', status: 'in-progress', assignee: 'QA Tester' },
  { id: '5', title: 'Setup OAuth providers', status: 'pending', assignee: 'Architect' }
];

export function ProjectWorkspace({ onBack, onConfigureRoles }: ProjectWorkspaceProps) {
  const [taskInput, setTaskInput] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md';
      case 'working':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0 shadow-md';
      case 'idle':
        return 'bg-slate-100 text-slate-700 border-0';
      default:
        return 'bg-slate-100 text-slate-700 border-0';
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'code':
        return <Code className="h-4 w-4 text-blue-600" />;
      case 'design':
        return <Image className="h-4 w-4 text-purple-600" />;
      default:
        return <FileText className="h-4 w-4 text-slate-600" />;
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 flex h-screen">
      {/* Left Sidebar - AI Roles */}
      <div className="w-72 border-r border-purple-200 flex flex-col bg-gradient-to-b from-white to-indigo-50/30">
        <div className="p-4 border-b border-purple-200">
          <Button variant="ghost" onClick={onBack} className="w-full justify-start mb-3">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h2 className="text-slate-900 mb-1">E-Commerce Platform</h2>
          <p className="text-slate-600">Active AI Team</p>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {activeRoles.map((role) => (
              <Card key={role.id} className="p-3 hover:shadow-lg cursor-pointer transition-all border-0 shadow-sm bg-white hover:scale-102 duration-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-slate-900">{role.name}</div>
                    <div className="text-slate-500">{role.model}</div>
                  </div>
                  <Badge className={`${getStatusColor(role.status)} border-0`}>
                    {role.status}
                  </Badge>
                </div>
                <div className="text-slate-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {role.lastActive}
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-slate-200">
          <Button variant="outline" className="w-full" onClick={onConfigureRoles}>
            <Settings className="mr-2 h-4 w-4" />
            Configure Roles
          </Button>
        </div>
      </div>

      {/* Center - Chat & Tasks */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b border-purple-200 flex justify-between items-center bg-gradient-to-r from-white to-indigo-50/30">
          <div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Project Workspace</h1>
            <p className="text-slate-600">Collaborate with your AI team</p>
          </div>
          <Button variant="outline" className="hover:border-purple-300">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 w-fit">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 flex flex-col mt-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-2xl ${message.role === 'user' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'bg-gradient-to-br from-white to-slate-50 text-slate-900 shadow-md border border-slate-100'} rounded-2xl p-4`}>
                      {message.role !== 'user' && (
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">{message.role}</div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-right mt-2 ${message.role === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {message.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Start a new task or ask your AI team..."
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="min-h-20"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // Handle send
                    }
                  }}
                />
                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 p-4">
            <div className="max-w-3xl space-y-2">
              {tasks.map((task) => (
                <Card key={task.id} className="p-4 hover:shadow-lg transition-all border-0 shadow-md bg-white hover:scale-102 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'completed' ? 'bg-green-600' :
                        task.status === 'in-progress' ? 'bg-blue-600' :
                        'bg-slate-300'
                      }`} />
                      <div className="flex-1">
                        <div className="text-slate-900">{task.title}</div>
                        <div className="text-slate-600">{task.assignee}</div>
                      </div>
                    </div>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'} className={
                      task.status === 'completed' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-0 shadow-md' :
                      task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 border-0 text-white shadow-md' : ''
                    }>
                      {task.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {task.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="files" className="flex-1 p-4">
            <div className="max-w-3xl space-y-2">
              {generatedFiles.map((file) => (
                <Card key={file.id} className="p-4 hover:shadow-lg transition-all cursor-pointer border-0 shadow-md bg-white hover:scale-102 duration-200">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center shadow-md">
                      {getFileIcon(file.type)}
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-900">{file.name}</div>
                      <div className="text-slate-600">{file.size} • by {file.author}</div>
                    </div>
                    <div className="text-slate-500">{file.date}</div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
