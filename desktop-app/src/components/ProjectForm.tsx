import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { APP_CONSTANTS } from '../constants';
import { limitString } from '../utils';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: ProjectFormData;
  title: string;
  description: string;
  submitButtonText: string;
  workspaceName?: string;
}

export interface ProjectFormData {
  name: string;
  description: string;
  labels: string;
}

export function ProjectForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  description,
  submitButtonText,
  workspaceName
}: ProjectFormProps) {
  const [formValues, setFormValues] = useState<ProjectFormData>(
    initialData || { name: '', description: '', labels: '' }
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const name = formValues.name.trim();
    if (!name) {
      setFormError('项目名称不能为空');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await onSubmit(formValues);
      setFormValues({ name: '', description: '', labels: '' });
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNameInput = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      name: limitString(value, APP_CONSTANTS.PROJECT_NAME_LIMIT)
    }));
  };

  const handleDescriptionInput = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      description: limitString(value, APP_CONSTANTS.PROJECT_DESCRIPTION_LIMIT)
    }));
  };

  const handleLabelsInput = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      labels: value
    }));
  };

  const addDefaultLabel = (label: string) => {
    const currentLabels = formValues.labels.split(',').map(l => l.trim()).filter(Boolean);
    if (!currentLabels.includes(label)) {
      const newLabels = [...currentLabels, label].join(', ');
      setFormValues(prev => ({
        ...prev,
        labels: newLabels
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {workspaceName ? `在 "${workspaceName}" 工作区中${description}` : description}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="project-name" className="text-sm font-medium text-slate-700">
              项目名称
            </label>
            <div className="relative">
              <Input
                id="project-name"
                value={formValues.name}
                onChange={(event) => handleNameInput(event.target.value)}
                placeholder="例如：电商平台重构"
                maxLength={APP_CONSTANTS.PROJECT_NAME_LIMIT}
                className="pr-14"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                {formValues.name.length}/{APP_CONSTANTS.PROJECT_NAME_LIMIT}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="project-description" className="text-sm font-medium text-slate-700">
              项目描述
            </label>
            <div className="relative">
              <Textarea
                id="project-description"
                value={formValues.description}
                onChange={(event) => handleDescriptionInput(event.target.value)}
                placeholder="描述项目的目标和功能..."
                className="min-h-[96px] pr-16"
                maxLength={APP_CONSTANTS.PROJECT_DESCRIPTION_LIMIT}
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-slate-400">
                {formValues.description.length}/{APP_CONSTANTS.PROJECT_DESCRIPTION_LIMIT}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="project-labels" className="text-sm font-medium text-slate-700">
              项目标签
            </label>
            <div className="relative">
              <Input
                id="project-labels"
                value={formValues.labels}
                onChange={(event) => handleLabelsInput(event.target.value)}
                placeholder="用逗号分隔，例如：java, backend, web"
                className="mb-2"
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs text-slate-500">快速添加常用标签：</p>
              <div className="flex flex-wrap gap-2">
                {APP_CONSTANTS.DEFAULT_LABELS.map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-3 text-xs"
                    onClick={() => addDefaultLabel(label)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
              disabled={submitting}
            >
              {submitting ? '处理中...' : submitButtonText}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}