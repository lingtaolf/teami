import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';

interface RoleSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: any) => void;
  roleId?: string;
}

const defaultPrompts = {
  'Product Manager': `You are an experienced Product Manager for a tech project. Your responsibilities include:
- Analyzing user requirements and translating them into actionable stories
- Prioritizing features based on business value and technical feasibility
- Creating clear documentation and specifications
- Collaborating with the team to ensure alignment

Respond with structured insights and clear recommendations.`,
  
  'Architect': `You are a Senior Software Architect. Your role includes:
- Designing scalable and maintainable system architectures
- Making technology stack decisions
- Creating technical specifications and diagrams
- Ensuring best practices and design patterns

Provide detailed architectural guidance and technical decisions.`,
  
  'Frontend Developer': `You are an expert Frontend Developer. Your tasks include:
- Building responsive and accessible user interfaces
- Writing clean, maintainable code
- Implementing designs with pixel-perfect accuracy
- Optimizing performance and user experience

Generate production-ready code and best practices.`,
  
  'UI Designer': `You are a creative UI/UX Designer. Your responsibilities include:
- Creating intuitive and beautiful user interfaces
- Ensuring consistent design systems
- Considering accessibility and usability
- Providing design specifications and assets

Share design recommendations and visual guidance.`,
  
  'QA Tester': `You are a meticulous QA Engineer. Your role includes:
- Creating comprehensive test plans and test cases
- Identifying bugs and edge cases
- Ensuring quality standards are met
- Documenting issues clearly

Provide thorough testing insights and quality recommendations.`
};

const availableModels = [
  { value: 'gpt-4', label: 'GPT-4', provider: 'OpenAI' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI' },
  { value: 'claude-3-opus', label: 'Claude-3 Opus', provider: 'Anthropic' },
  { value: 'claude-3-sonnet', label: 'Claude-3 Sonnet', provider: 'Anthropic' },
  { value: 'gemini-pro', label: 'Gemini Pro', provider: 'Google' },
  { value: 'figma-ai', label: 'Figma AI', provider: 'Figma' }
];

export function RoleSetupModal({ isOpen, onClose, onSave, roleId }: RoleSetupModalProps) {
  const [useDefaultTemplate, setUseDefaultTemplate] = useState(true);
  const [roleData, setRoleData] = useState({
    name: '',
    model: 'gpt-4',
    prompt: defaultPrompts['Product Manager']
  });

  const handleRoleNameChange = (name: string) => {
    const newData = { ...roleData, name };
    
    if (useDefaultTemplate && name in defaultPrompts) {
      newData.prompt = defaultPrompts[name as keyof typeof defaultPrompts];
    }
    
    setRoleData(newData);
  };

  const handleSave = () => {
    onSave(roleData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{roleId ? 'Edit AI Role' : 'Create New AI Role'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Role Name */}
          <div>
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              placeholder="e.g., Product Manager, Backend Developer"
              value={roleData.name}
              onChange={(e) => handleRoleNameChange(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* Model Selection */}
          <div>
            <Label htmlFor="model-select">AI Model / API</Label>
            <Select value={roleData.model} onValueChange={(value) => setRoleData({ ...roleData, model: value })}>
              <SelectTrigger id="model-select" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.label}</span>
                      <span className="text-slate-500 ml-4">{model.provider}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Template Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label>Use Default Template</Label>
              <p className="text-slate-600 mt-1">Start with a pre-configured prompt for common roles</p>
            </div>
            <Switch
              checked={useDefaultTemplate}
              onCheckedChange={(checked) => {
                setUseDefaultTemplate(checked);
                if (!checked) {
                  setRoleData({ ...roleData, prompt: '' });
                }
              }}
            />
          </div>

          {/* System Prompt */}
          <div>
            <Label htmlFor="system-prompt">System Prompt</Label>
            <Textarea
              id="system-prompt"
              placeholder={useDefaultTemplate 
                ? "Select a role name to load a default template, or toggle off to create a custom prompt..." 
                : "Enter a custom system prompt for this AI role..."}
              value={roleData.prompt}
              onChange={(e) => setRoleData({ ...roleData, prompt: e.target.value })}
              className="mt-2 min-h-64"
              disabled={useDefaultTemplate && !roleData.name}
            />
            <p className="text-slate-500 mt-2">
              The system prompt defines how this AI role will behave and respond to tasks
            </p>
          </div>

          {/* Advanced Settings Preview */}
          <div className="border-t pt-4">
            <details>
              <summary className="text-slate-900 cursor-pointer mb-4">Advanced Settings</summary>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <Label>Temperature</Label>
                  <Select defaultValue="0.7">
                    <SelectTrigger className="mt-2">
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
                  <Label>Max Tokens</Label>
                  <Select defaultValue="2048">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1024">1024</SelectItem>
                      <SelectItem value="2048">2048</SelectItem>
                      <SelectItem value="4096">4096</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </details>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!roleData.name || !roleData.prompt}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
          >
            {roleId ? 'Save Changes' : 'Create Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
