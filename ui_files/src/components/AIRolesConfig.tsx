import { Plus, BarChart3, Building2, Code, Palette, CheckCircle, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AIRolesConfigProps {
  onBack: () => void;
  onAddRole: () => void;
  onEditRole: (roleId: string) => void;
}

const aiRoles = [
  {
    id: '1',
    name: 'Product Manager',
    icon: BarChart3,
    model: 'GPT-4',
    status: 'active',
    description: 'Manages requirements and priorities',
    gradient: 'from-blue-500 to-cyan-600'
  },
  {
    id: '2',
    name: 'Architect',
    icon: Building2,
    model: 'Claude-3 Opus',
    status: 'active',
    description: 'Designs system architecture',
    gradient: 'from-purple-500 to-indigo-600'
  },
  {
    id: '3',
    name: 'Frontend Developer',
    icon: Code,
    model: 'GPT-4',
    status: 'active',
    description: 'Builds user interfaces',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: '4',
    name: 'UI Designer',
    icon: Palette,
    model: 'Figma AI',
    status: 'active',
    description: 'Creates visual designs',
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    id: '5',
    name: 'QA Tester',
    icon: CheckCircle,
    model: 'Claude-3 Sonnet',
    status: 'active',
    description: 'Ensures quality and testing',
    gradient: 'from-orange-500 to-amber-600'
  }
];

const availableModels = [
  'GPT-4',
  'GPT-3.5 Turbo',
  'Claude-3 Opus',
  'Claude-3 Sonnet',
  'Gemini Pro',
  'Figma AI'
];

export function AIRolesConfig({ onBack, onAddRole, onEditRole }: AIRolesConfigProps) {
  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 overflow-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">AI Roles Configuration</h1>
            <p className="text-slate-600">Configure AI team members and assign models</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="hover:border-purple-300">
              Back to Project
            </Button>
            <Button onClick={onAddRole} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Role
            </Button>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-3 gap-6">
          {aiRoles.map((role) => {
            const Icon = role.icon;
            return (
              <Card key={role.id} className="p-6 hover:shadow-2xl transition-all border-0 shadow-lg bg-white hover:scale-105 duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${role.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-md">
                    {role.status}
                  </Badge>
                </div>

                <h3 className="text-slate-900 mb-2">{role.name}</h3>
                <p className="text-slate-600 mb-4">{role.description}</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-600 block mb-2">Assigned Model</label>
                    <Select defaultValue={role.model}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModels.map((model) => (
                          <SelectItem key={model} value={model}>
                            {model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => onEditRole(role.id)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Prompt
                  </Button>
                </div>
              </Card>
            );
          })}

          {/* Add Custom Role Card */}
          <Card 
            className="p-6 border-2 border-dashed border-purple-300 hover:border-purple-600 cursor-pointer transition-all flex flex-col items-center justify-center bg-gradient-to-br from-white to-purple-50/30 hover:shadow-xl hover:scale-105 duration-300"
            onClick={onAddRole}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mb-4 shadow-md">
              <Plus className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-slate-900 mb-2">Add Custom Role</h3>
            <p className="text-slate-600 text-center">Create a specialized AI role for your project</p>
          </Card>
        </div>

        {/* Quick Settings */}
        <Card className="mt-8 p-6 border-0 shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
          <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">Global Settings</h2>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label className="text-slate-600 block mb-2">Default Temperature</label>
              <Select defaultValue="0.7">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.3">0.3 (Focused)</SelectItem>
                  <SelectItem value="0.7">0.7 (Balanced)</SelectItem>
                  <SelectItem value="1.0">1.0 (Creative)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-600 block mb-2">Max Tokens</label>
              <Select defaultValue="2048">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024</SelectItem>
                  <SelectItem value="2048">2048</SelectItem>
                  <SelectItem value="4096">4096</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-slate-600 block mb-2">Response Format</label>
              <Select defaultValue="json">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="markdown">Markdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
