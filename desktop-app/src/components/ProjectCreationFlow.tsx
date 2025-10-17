import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Progress } from './ui/progress';

interface ProjectCreationFlowProps {
  onBack: () => void;
  onComplete: (data: any) => void;
}

const projectTemplates = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Build modern web applications with responsive design',
    techStack: ['React', 'Node.js', 'PostgreSQL', 'Tailwind CSS']
  },
  {
    id: 'mobile-app',
    name: 'Mobile Application',
    description: 'Create cross-platform mobile apps',
    techStack: ['React Native', 'Firebase', 'Redux']
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis',
    description: 'Analyze and visualize complex datasets',
    techStack: ['Python', 'Pandas', 'Tableau', 'SQL']
  },
  {
    id: 'api',
    name: 'API Development',
    description: 'Design and build scalable REST APIs',
    techStack: ['Node.js', 'Express', 'MongoDB', 'Swagger']
  }
];

export function ProjectCreationFlow({ onBack, onComplete }: ProjectCreationFlowProps) {
  const [step, setStep] = useState(1);
  const [projectData, setProjectData] = useState({
    name: '',
    description: '',
    type: '',
    techStack: [] as string[]
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(projectData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  const selectTemplate = (template: typeof projectTemplates[0]) => {
    setProjectData({
      ...projectData,
      type: template.name,
      techStack: template.techStack
    });
  };

  const toggleTech = (tech: string) => {
    setProjectData({
      ...projectData,
      techStack: projectData.techStack.includes(tech)
        ? projectData.techStack.filter(t => t !== tech)
        : [...projectData.techStack, tech]
    });
  };

  const canProceed = () => {
    if (step === 1) return projectData.name.length > 0;
    if (step === 2) return projectData.type.length > 0;
    if (step === 3) return projectData.techStack.length > 0;
    return true;
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-auto">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={handleBack} className="mb-4 hover:bg-white/60">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">Create New Project</h1>
          <p className="text-slate-600">Set up your AI team collaboration project</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${step >= 1 ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > 1 ? <Check className="h-5 w-5" /> : '1'}
              </div>
              <span className={`${step >= 1 ? 'text-slate-900' : 'text-slate-500'}`}>Project Details</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${step >= 2 ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > 2 ? <Check className="h-5 w-5" /> : '2'}
              </div>
              <span className={`${step >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>Project Type</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${step >= 3 ? 'bg-gradient-to-br from-pink-500 to-orange-600 text-white' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > 3 ? <Check className="h-5 w-5" /> : '3'}
              </div>
              <span className={`${step >= 3 ? 'text-slate-900' : 'text-slate-500'}`}>Tech Stack</span>
            </div>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6 border-0 shadow-2xl bg-white">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="project-description">Project Description</Label>
                <Textarea
                  id="project-description"
                  placeholder="Describe what you want to build..."
                  value={projectData.description}
                  onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                  className="mt-2 min-h-32"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-slate-900 mb-2">Select Project Type</h2>
                <p className="text-slate-600">Choose a template to get started quickly</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {projectTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-6 cursor-pointer transition-all border-0 shadow-lg ${
                      projectData.type === template.name
                        ? 'ring-2 ring-purple-500 bg-gradient-to-br from-indigo-50 to-purple-50 scale-105'
                        : 'hover:shadow-xl bg-white hover:scale-105'
                    }`}
                    onClick={() => selectTemplate(template)}
                  >
                    <h3 className="text-slate-900 mb-2">{template.name}</h3>
                    <p className="text-slate-600 mb-4">{template.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {template.techStack.slice(0, 3).map((tech) => (
                        <span key={tech} className="text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-6">
                <h2 className="text-slate-900 mb-2">Select Tech Stack</h2>
                <p className="text-slate-600">Choose the technologies for your project</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Frontend</Label>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Vue.js', 'Angular', 'Next.js', 'Tailwind CSS', 'TypeScript'].map((tech) => (
                      <Button
                        key={tech}
                        variant={projectData.techStack.includes(tech) ? 'default' : 'outline'}
                        onClick={() => toggleTech(tech)}
                        className={projectData.techStack.includes(tech) ? 'bg-blue-600' : ''}
                      >
                        {projectData.techStack.includes(tech) && <Check className="mr-2 h-4 w-4" />}
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Backend</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Node.js', 'Python', 'Express', 'Django', 'FastAPI', 'GraphQL'].map((tech) => (
                      <Button
                        key={tech}
                        variant={projectData.techStack.includes(tech) ? 'default' : 'outline'}
                        onClick={() => toggleTech(tech)}
                        className={projectData.techStack.includes(tech) ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:border-purple-300'}
                      >
                        {projectData.techStack.includes(tech) && <Check className="mr-2 h-4 w-4" />}
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="mb-3 block">Database & Tools</Label>
                  <div className="flex flex-wrap gap-2">
                    {['PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Docker', 'AWS'].map((tech) => (
                      <Button
                        key={tech}
                        variant={projectData.techStack.includes(tech) ? 'default' : 'outline'}
                        onClick={() => toggleTech(tech)}
                        className={projectData.techStack.includes(tech) ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg' : 'hover:border-purple-300'}
                      >
                        {projectData.techStack.includes(tech) && <Check className="mr-2 h-4 w-4" />}
                        {tech}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
            {step === totalSteps ? 'Create Project' : 'Next'}
            {step !== totalSteps && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
