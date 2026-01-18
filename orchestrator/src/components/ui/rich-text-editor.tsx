"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link2,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  Highlighter,
  Minus,
  Undo,
  Redo,
  Pilcrow,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-black/40 rounded-lg p-4 font-mono text-sm overflow-x-auto my-4",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "border-l-4 border-purple-500/50 pl-4 my-4 italic text-white/70 bg-white/5 py-3 pr-4 rounded-r-lg",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc list-inside space-y-1 my-4",
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal list-inside space-y-1 my-4",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "text-white/80",
          },
        },
        horizontalRule: {
          HTMLAttributes: {
            class: "my-8 border-white/10",
          },
        },
        code: {
          HTMLAttributes: {
            class: "bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded text-sm font-mono",
          },
        },
      }),
      Typography,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-purple-400 hover:text-purple-300 underline underline-offset-2 cursor-pointer",
        },
      }),
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-yellow-500/30 text-yellow-200 px-1 rounded",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "space-y-2 my-4",
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
        nested: true,
      }),
    ],
    content: convertMarkdownToHtml(content),
    editable,
    onUpdate: ({ editor }) => {
      // Convert HTML back to markdown-like format for storage
      const html = editor.getHTML();
      onChange?.(convertHtmlToMarkdown(html));
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-invert prose-lg max-w-none focus:outline-none min-h-[400px]",
          // Heading styles
          "prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:pb-3 prose-h1:border-b prose-h1:border-white/10",
          "prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-purple-300",
          "prose-h3:text-xl prose-h3:font-medium prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-white/90",
          // Paragraph styles
          "prose-p:text-white/80 prose-p:leading-relaxed prose-p:mb-4",
          // Strong/em styles
          "prose-strong:font-semibold prose-strong:text-white",
          "prose-em:italic",
          className
        ),
      },
    },
  });

  // Update content when it changes externally
  React.useEffect(() => {
    if (editor && content !== convertHtmlToMarkdown(editor.getHTML())) {
      editor.commands.setContent(convertMarkdownToHtml(content));
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      {/* Fixed Toolbar */}
      {editable && (
        <div className="flex flex-wrap items-center gap-1 p-2 mb-4 rounded-lg bg-white/5 border border-white/10 sticky top-0 z-10 backdrop-blur-sm">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            icon={Heading1}
            title="Heading 1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            icon={Heading2}
            title="Heading 2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            icon={Heading3}
            title="Heading 3"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setParagraph().run()}
            isActive={editor.isActive("paragraph")}
            icon={Pilcrow}
            title="Paragraph"
          />
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            icon={Bold}
            title="Bold (⌘+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            icon={Italic}
            title="Italic (⌘+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            icon={Strikethrough}
            title="Strikethrough"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            icon={Code}
            title="Inline Code"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            icon={Highlighter}
            title="Highlight"
          />
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive("bulletList")}
            icon={List}
            title="Bullet List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive("orderedList")}
            icon={ListOrdered}
            title="Numbered List"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            isActive={editor.isActive("taskList")}
            icon={CheckSquare}
            title="Task List"
          />
          
          <div className="w-px h-5 bg-white/20 mx-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            icon={Quote}
            title="Quote"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            icon={Code}
            title="Code Block"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={Minus}
            title="Divider"
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("Enter URL");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            isActive={editor.isActive("link")}
            icon={Link2}
            title="Link"
          />
          
          <div className="flex-1" />
          
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={Undo}
            title="Undo (⌘+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={Redo}
            title="Redo (⌘+⇧+Z)"
          />
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {/* Styles for the editor */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          color: rgba(255, 255, 255, 0.3);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        
        .ProseMirror ul[data-type="taskList"] {
          list-style: none;
          padding: 0;
        }
        
        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label {
          flex: 0 0 auto;
          margin-top: 0.25rem;
        }
        
        .ProseMirror ul[data-type="taskList"] li > label input[type="checkbox"] {
          width: 1rem;
          height: 1rem;
          cursor: pointer;
          accent-color: rgb(168, 85, 247);
        }
        
        .ProseMirror ul[data-type="taskList"] li > div {
          flex: 1 1 auto;
        }
        
        .ProseMirror ul[data-type="taskList"] li[data-checked="true"] > div {
          text-decoration: line-through;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
}

// Toolbar button component
interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ElementType;
  title: string;
}

function ToolbarButton({ onClick, isActive, disabled, icon: Icon, title }: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "h-7 w-7 text-white/70 hover:text-white hover:bg-white/10",
        isActive && "bg-purple-500/30 text-purple-300",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  if (!markdown) return "";
  
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    // Bold
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.*?)__/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/_(.*?)_/g, "<em>$1</em>")
    // Strikethrough
    .replace(/~~(.*?)~~/g, "<s>$1</s>")
    // Inline code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Blockquotes
    .replace(/^> (.*$)/gm, "<blockquote><p>$1</p></blockquote>")
    // Unordered lists
    .replace(/^[\*\-] (.*$)/gm, "<li>$1</li>")
    // Ordered lists
    .replace(/^\d+\. (.*$)/gm, "<li>$1</li>")
    // Task lists
    .replace(/^- \[x\] (.*$)/gm, '<li data-type="taskItem" data-checked="true">$1</li>')
    .replace(/^- \[ \] (.*$)/gm, '<li data-type="taskItem" data-checked="false">$1</li>')
    // Horizontal rules
    .replace(/^---$/gm, "<hr>")
    // Code blocks
    .replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    // Paragraphs (double newlines)
    .replace(/\n\n/g, "</p><p>")
    // Single newlines within paragraphs
    .replace(/\n/g, "<br>");
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith("<h") && !html.startsWith("<p") && !html.startsWith("<ul") && !html.startsWith("<ol") && !html.startsWith("<blockquote") && !html.startsWith("<pre")) {
    html = `<p>${html}</p>`;
  }
  
  // Wrap consecutive li elements in ul
  html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => {
    if (match.includes('data-type="taskItem"')) {
      return `<ul data-type="taskList">${match}</ul>`;
    }
    return `<ul>${match}</ul>`;
  });
  
  return html;
}

// Simple HTML to markdown converter
function convertHtmlToMarkdown(html: string): string {
  if (!html) return "";
  
  let markdown = html
    // Remove extra whitespace
    .replace(/>\s+</g, "><")
    // Headers
    .replace(/<h1>(.*?)<\/h1>/g, "# $1\n\n")
    .replace(/<h2>(.*?)<\/h2>/g, "## $1\n\n")
    .replace(/<h3>(.*?)<\/h3>/g, "### $1\n\n")
    // Bold
    .replace(/<strong>(.*?)<\/strong>/g, "**$1**")
    .replace(/<b>(.*?)<\/b>/g, "**$1**")
    // Italic
    .replace(/<em>(.*?)<\/em>/g, "*$1*")
    .replace(/<i>(.*?)<\/i>/g, "*$1*")
    // Strikethrough
    .replace(/<s>(.*?)<\/s>/g, "~~$1~~")
    .replace(/<del>(.*?)<\/del>/g, "~~$1~~")
    // Inline code
    .replace(/<code>([^<]*)<\/code>/g, "`$1`")
    // Links
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
    // Blockquotes
    .replace(/<blockquote><p>(.*?)<\/p><\/blockquote>/g, "> $1\n\n")
    .replace(/<blockquote>(.*?)<\/blockquote>/g, "> $1\n\n")
    // Task lists
    .replace(/<li data-type="taskItem" data-checked="true">(.*?)<\/li>/g, "- [x] $1\n")
    .replace(/<li data-type="taskItem" data-checked="false">(.*?)<\/li>/g, "- [ ] $1\n")
    // Lists
    .replace(/<li>(.*?)<\/li>/g, "- $1\n")
    .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, "$1\n")
    .replace(/<ol>([\s\S]*?)<\/ol>/g, "$1\n")
    // Horizontal rules
    .replace(/<hr\s*\/?>/g, "\n---\n\n")
    // Code blocks
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, "```\n$1\n```\n\n")
    // Paragraphs
    .replace(/<p>(.*?)<\/p>/g, "$1\n\n")
    // Line breaks
    .replace(/<br\s*\/?>/g, "\n")
    // Clean up tags
    .replace(/<\/?[^>]+(>|$)/g, "")
    // Clean up multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  
  return markdown;
}
