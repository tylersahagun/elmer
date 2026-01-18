'use client';

import * as React from 'react';
import { motion, AnimatePresence, type Transition } from 'motion/react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox, CheckboxIndicator } from '@/components/animate-ui/primitives/radix/checkbox';

export interface TodoItem {
  id: string;
  label: string;
  completed: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
  projectId?: string;
}

interface WorkspaceTodolistProps {
  todos: TodoItem[];
  onToggle: (id: string, completed: boolean) => void;
  onAdd: (label: string) => void;
  onDelete: (id: string) => void;
  onReorder?: (todos: TodoItem[]) => void;
  title?: string;
  className?: string;
  showAddForm?: boolean;
}

const getPathAnimate = (isChecked: boolean) => ({
  pathLength: isChecked ? 1 : 0,
  opacity: isChecked ? 1 : 0,
});

const getPathTransition = (isChecked: boolean): Transition => ({
  pathLength: { duration: 0.8, ease: 'easeInOut' },
  opacity: {
    duration: 0.01,
    delay: isChecked ? 0 : 0.8,
  },
});

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-amber-400',
  high: 'text-red-400',
};

const itemTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export function WorkspaceTodolist({
  todos,
  onToggle,
  onAdd,
  onDelete,
  title = 'Tasks',
  className,
  showAddForm = true,
}: WorkspaceTodolistProps) {
  const [newTodoLabel, setNewTodoLabel] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAdd = () => {
    if (newTodoLabel.trim()) {
      onAdd(newTodoLabel.trim());
      setNewTodoLabel('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTodoLabel('');
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className={cn(
      'bg-slate-100/90 dark:bg-slate-900/90 rounded-2xl p-4 space-y-4 backdrop-blur-xl border border-white/10',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-slate-900 dark:text-white">{title}</h3>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        {showAddForm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="h-7 px-2 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        )}
      </div>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / totalCount) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <Input
                value={newTodoLabel}
                onChange={(e) => setNewTodoLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What needs to be done?"
                className="h-8 text-sm"
                autoFocus
              />
              <Button size="sm" onClick={handleAdd} className="h-8 px-3">
                Add
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {todos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, scale: 0.9 }}
              transition={itemTransition}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-xl',
                'bg-white dark:bg-slate-800',
                'border border-slate-200/50 dark:border-slate-700/50',
                'hover:border-slate-300 dark:hover:border-slate-600',
                'transition-colors duration-200'
              )}
            >
              {/* Drag handle (for future reordering) */}
              <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
                <GripVertical className="w-3 h-3 text-muted-foreground" />
              </div>

              {/* Checkbox */}
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) => onToggle(todo.id, checked === true)}
                id={`todo-${todo.id}`}
                className="size-5 shrink-0 rounded-md border border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-primary-foreground data-[state=checked]:border-emerald-500"
              >
                <CheckboxIndicator className="size-full text-current" />
              </Checkbox>

              {/* Label with strikethrough animation */}
              <div className="flex-1 relative">
                <Label
                  htmlFor={`todo-${todo.id}`}
                  className={cn(
                    'text-sm cursor-pointer transition-colors duration-300',
                    todo.completed 
                      ? 'text-muted-foreground' 
                      : 'text-slate-900 dark:text-white',
                    todo.priority && priorityColors[todo.priority]
                  )}
                >
                  {todo.label}
                </Label>
                
                {/* Animated strikethrough */}
                <motion.svg
                  width="100%"
                  height="24"
                  viewBox="0 0 340 24"
                  preserveAspectRatio="none"
                  className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none z-20 w-full h-6"
                >
                  <motion.path
                    d="M 5 12 Q 85 6 170 12 Q 255 18 335 12"
                    vectorEffect="non-scaling-stroke"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeMiterlimit={10}
                    fill="none"
                    initial={false}
                    animate={getPathAnimate(todo.completed)}
                    transition={getPathTransition(todo.completed)}
                    className="stroke-emerald-500 dark:stroke-emerald-400"
                  />
                </motion.svg>
              </div>

              {/* Delete button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(todo.id)}
                className={cn(
                  'w-6 h-6 opacity-0 group-hover:opacity-100',
                  'transition-opacity text-red-500 hover:text-red-600',
                  'hover:bg-red-100 dark:hover:bg-red-900/30'
                )}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {todos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-muted-foreground"
          >
            <p className="text-sm">No tasks yet</p>
            <p className="text-xs mt-1">Add a task to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export { type WorkspaceTodolistProps };
