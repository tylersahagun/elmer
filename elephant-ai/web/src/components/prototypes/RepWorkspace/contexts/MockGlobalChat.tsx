/**
 * Mock Global Chat Panel
 *
 * Simulates the AskElephant global chat panel for context prototype views.
 * Shows how chat would appear alongside the Rep Workspace.
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { XIcon, SparklesIcon, SendIcon, PaperclipIcon } from 'lucide-react';

interface MockGlobalChatProps {
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export function MockGlobalChat({ open = true, onClose, className }: MockGlobalChatProps) {
  if (!open) return null;

  const mockMessages = [
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm here to help you with your deals and customers. What would you like to know?",
    },
    {
      id: '2',
      role: 'user',
      content: "What's the status of the Acme Corp deal?",
    },
    {
      id: '3',
      role: 'assistant',
      content:
        "**Acme Corp** is currently in the **Negotiation** stage with a deal value of **$85,000**.\n\n**Recent activity:**\n- Discovery call completed today\n- Budget confirmed for Q1\n- Decision expected by end of month\n\n**Next steps:**\n- Send pricing proposal to Sarah Chen\n\nWould you like me to help draft that proposal?",
    },
  ];

  return (
    <div
      className={cn(
        'flex flex-col h-full w-80 bg-white border-l border-slate-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <SparklesIcon className="size-4 text-white" />
          </div>
          <span className="font-semibold text-slate-800">AskElephant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon className="size-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {mockMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                message.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              )}
            >
              {message.role === 'assistant' ? (
                <div
                  className="prose prose-sm prose-slate"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />'),
                  }}
                />
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100">
          <Button variant="ghost" size="icon" className="size-8 text-slate-400 hover:text-slate-600">
            <PaperclipIcon className="size-4" />
          </Button>
          <input
            type="text"
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <Button size="icon" className="size-8 bg-indigo-600 hover:bg-indigo-700">
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
