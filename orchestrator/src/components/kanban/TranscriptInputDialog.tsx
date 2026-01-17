"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Sparkles, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranscriptInputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  targetStage: string;
  onConfirm: (transcript: string) => void;
  onSkip: () => void;
}

export function TranscriptInputDialog({
  open,
  onOpenChange,
  projectName,
  targetStage,
  onConfirm,
  onSkip,
}: TranscriptInputDialogProps) {
  const [transcript, setTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm(transcript);
    } finally {
      setIsSubmitting(false);
      setTranscript("");
    }
  };

  const handleSkip = () => {
    setTranscript("");
    onSkip();
  };

  const handleClose = () => {
    setTranscript("");
    onOpenChange(false);
  };

  const stageInfo: Record<string, { title: string; description: string; placeholder: string }> = {
    discovery: {
      title: "Add Research Context",
      description: "Paste a transcript, user interview notes, or research findings to analyze. This will help generate insights and inform the PRD.",
      placeholder: "Paste your transcript, meeting notes, or user interview here...\n\nExample:\n- User feedback from customer calls\n- Meeting notes from stakeholder discussions\n- Survey responses or research findings\n- Feature requests from support tickets",
    },
    prd: {
      title: "Add Context for PRD",
      description: "Optionally add additional context or requirements to help generate the PRD.",
      placeholder: "Add any additional context, requirements, or constraints...",
    },
    prototype: {
      title: "Add Prototype Requirements",
      description: "Optionally add specific requirements or constraints for the prototype.",
      placeholder: "Add any specific prototype requirements or constraints...",
    },
  };

  const info = stageInfo[targetStage] || {
    title: "Add Context",
    description: "Add any relevant context for this stage.",
    placeholder: "Add context here...",
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] glass-card border-white/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            {info.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Moving <span className="font-medium text-foreground">{projectName}</span> to{" "}
            <span className="font-medium text-purple-400 capitalize">{targetStage}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transcript" className="text-sm font-medium">
              {info.description}
            </Label>
            <Textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={info.placeholder}
              className={cn(
                "min-h-[200px] resize-none",
                "bg-white/5 border-white/10",
                "focus:border-purple-500/50 focus:ring-purple-500/20",
                "placeholder:text-muted-foreground/50"
              )}
            />
          </div>

          {/* Character count and tips */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{transcript.length} characters</span>
            {transcript.length > 0 && transcript.length < 100 && (
              <span className="flex items-center gap-1 text-amber-400">
                <AlertCircle className="w-3 h-3" />
                More context helps generate better insights
              </span>
            )}
          </div>

          {/* Info box */}
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-purple-400 mt-0.5" />
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-purple-400 mb-1">How this works</p>
                <p>
                  When you move to {targetStage}, Cursor AI will process any context you provide.
                  Jobs will appear as "Waiting for Agent" until you run{" "}
                  <code className="px-1 py-0.5 rounded bg-white/5 text-purple-300">process jobs</code>{" "}
                  in a Cursor chat.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSkip}
            className="gap-2"
          >
            Skip & Move
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Moving...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Move & Analyze
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
