import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from './Dialog';

const meta: Meta<typeof Dialog> = {
  title: 'Organisms/Dialog',
  component: Dialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Modal dialog component for focused interactions and confirmations.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-medium">
          Open Dialog
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
          <DialogDescription>
            This is a description of what this dialog is for.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-slate-600">
            This is the dialog content. You can put anything here.
          </p>
        </DialogBody>
        <DialogFooter>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
            Confirm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Small: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <button className="px-4 py-2 bg-slate-100 rounded-lg">Small Dialog</button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Small Dialog</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <p className="text-sm text-slate-600">A smaller dialog for simple confirmations.</p>
        </DialogBody>
        <DialogFooter>
          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium">
            Got it
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const Large: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <button className="px-4 py-2 bg-slate-100 rounded-lg">Large Dialog</button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Large Dialog</DialogTitle>
          <DialogDescription>More room for complex content.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Section 1</h4>
              <p className="text-sm text-slate-600">Content for section one.</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-2">Section 2</h4>
              <p className="text-sm text-slate-600">Content for section two.</p>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm">Cancel</button>
          <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
            Save
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const ConfirmDelete: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg">Delete Item</button>
      </DialogTrigger>
      <DialogContent size="sm">
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Delete Project?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project and all associated data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const FormDialog: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger>
        <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg font-medium">
          Create Project
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogClose />
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to your workspace.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Project Name
              </label>
              <input
                placeholder="Enter project name"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                placeholder="Describe your project"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status
              </label>
              <select className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm">
                <option>Research</option>
                <option>Design</option>
                <option>Development</option>
              </select>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <button className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium">
            Cancel
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-purple-500 text-white rounded-lg text-sm font-medium">
            Create Project
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

const ControlledTemplate = () => {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="space-y-4">
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-slate-100 rounded-lg"
      >
        Open Controlled Dialog
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogClose />
          <DialogHeader>
            <DialogTitle>Controlled Dialog</DialogTitle>
            <DialogDescription>This dialog is controlled externally.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-sm text-slate-600">
              Open state: <code className="px-1 bg-slate-100 rounded">{open.toString()}</code>
            </p>
          </DialogBody>
          <DialogFooter>
            <button
              onClick={() => setOpen(false)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const Controlled: Story = {
  render: () => <ControlledTemplate />,
};
