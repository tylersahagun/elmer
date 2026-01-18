"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { motion, AnimatePresence } from "framer-motion";
import { useKanbanStore, type ProjectCard as ProjectCardType, type KanbanColumn as KanbanColumnType } from "@/lib/store";
import type { ProjectStage } from "@/lib/db/schema";
import { KanbanColumn } from "./KanbanColumn";
import { ProjectCardOverlay } from "./ProjectCard";
import { TranscriptInputDialog } from "./TranscriptInputDialog";
import { IterationLoopOverlay } from "./IterationLoopOverlay";
import { IterationLoopLanes } from "./IterationLoopLanes";
import type { LoopViewMode } from "./IterationLoopControls";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useRealtimeJobs } from "@/hooks/useRealtimeJobs";

// Stages that should prompt for input before moving
const STAGES_REQUIRING_INPUT: ProjectStage[] = ["discovery"];

// Helper function to persist stage change and trigger auto-jobs
async function persistStageChange(
  projectId: string,
  newStage: ProjectStage,
  column: KanbanColumnType | undefined,
  workspaceId: string | undefined,
  inputData?: { transcript?: string },
  triggeredBy: "user" | "automation" = "user"
): Promise<boolean> {
  try {
    // 1. Persist stage change to database
    const stageRes = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage, triggeredBy }),
    });

    if (!stageRes.ok) {
      console.error("Failed to persist stage change");
      return false;
    }

    console.log(`✅ Stage change persisted: ${projectId} → ${newStage}`);

    // 2. Trigger auto-jobs if column has them configured
    if (column?.autoTriggerJobs && column.autoTriggerJobs.length > 0 && workspaceId) {
      console.log(`🚀 Triggering auto-jobs for ${newStage}:`, column.autoTriggerJobs);
      
      for (const jobType of column.autoTriggerJobs) {
        try {
          // Build job input based on job type and provided input data
          const jobInput: Record<string, unknown> = {};
          
          // Add transcript for analyze_transcript jobs
          if (jobType === "analyze_transcript" && inputData?.transcript) {
            jobInput.transcript = inputData.transcript;

            // Persist transcript as a research document
            await fetch("/api/documents", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                projectId,
                type: "research",
                title: "Transcript Intake",
                content: inputData.transcript,
                metadata: {
                  generatedBy: "user",
                  reviewStatus: "draft",
                },
              }),
            });
          }
          
          const jobRes = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId,
              projectId,
              type: jobType,
              input: Object.keys(jobInput).length > 0 ? jobInput : undefined,
            }),
          });

          if (jobRes.ok) {
            const job = await jobRes.json();
            console.log(`✅ Job queued: ${jobType} (${job.id})`);
          } else {
            console.error(`Failed to queue job: ${jobType}`);
          }
        } catch (error) {
          console.error(`Error queuing job ${jobType}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in persistStageChange:", error);
    return false;
  }
  return true;
}

export function KanbanBoard() {
  // Get raw data from store
  const allColumns = useKanbanStore((s) => s.columns);
  const projects = useKanbanStore((s) => s.projects);
  const workspace = useKanbanStore((s) => s.workspace);
  const moveProject = useKanbanStore((s) => s.moveProject);
  const updateProject = useKanbanStore((s) => s.updateProject);
  const setDraggedProject = useKanbanStore((s) => s.setDraggedProject);
  
  // Memoize filtered/sorted columns to avoid infinite loops
  const columns = useMemo(
    () => allColumns.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    [allColumns]
  );

  // Real-time job updates via SSE - automatically processes pending jobs and updates UI
  const { 
    summary: jobSummary, 
    isConnected,
    activeJobs,
    triggerProcessing,
  } = useRealtimeJobs({
    workspaceId: workspace?.id || "",
    enabled: !!workspace?.id,
    onJobComplete: (job) => {
      console.log(`✅ Job completed: ${job.type} for project ${job.projectId}`);
    },
    onJobFailed: (job) => {
      console.error(`❌ Job failed: ${job.type} - ${job.error}`);
    },
  });

  // Auto-trigger processing when there are pending jobs
  useEffect(() => {
    if (jobSummary.pending > 0 && activeJobs.length === 0) {
      console.log(`🚀 Auto-triggering processing for ${jobSummary.pending} pending jobs`);
      triggerProcessing();
    }
  }, [jobSummary.pending, activeJobs.length, triggerProcessing]);

  // Log connection status
  useEffect(() => {
    console.log(`🔌 SSE Connection: ${isConnected ? 'Connected' : 'Disconnected'}`);
  }, [isConnected]);

  // Log job status for debugging
  useEffect(() => {
    if (jobSummary.pending > 0 || jobSummary.running > 0) {
      console.log(`📊 Jobs: ${jobSummary.pending} pending, ${jobSummary.running} running`);
    }
  }, [jobSummary]);

  const [activeProject, setActiveProject] = useState<ProjectCardType | null>(null);
  const [loopViewMode] = useState<LoopViewMode>("off");
  const [scrollProgress, setScrollProgress] = useState(0);
  // Track the original stage when drag started (for cancellation)
  const originalStageRef = useRef<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const auroraRef = useRef<HTMLDivElement | null>(null);
  
  // Parallax effect on horizontal scroll + scroll progress tracking
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const auroraEl = auroraRef.current;
    
    if (!scrollContainer) return;
    
    const handleScroll = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      
      // Calculate scroll progress (0-1)
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
      
      // Move background at 0.3x speed for subtle parallax effect
      if (auroraEl) {
        const parallaxOffset = -scrollLeft * 0.3;
        auroraEl.style.setProperty('--parallax-offset', `${parallaxOffset}px`);
      }
    };
    
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);
  
  // State for transcript input dialog
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<{
    projectId: string;
    project: ProjectCardType;
    targetStage: ProjectStage;
    targetColumn: KanbanColumnType | undefined;
  } | null>(null);

  const runAutomationPipeline = useCallback(
    async ({
      projectId,
      startStage,
      inputData,
    }: {
      projectId: string;
      startStage: ProjectStage;
      inputData?: { transcript?: string };
    }) => {
      const automationMode = workspace?.settings?.automationMode || "manual";
      if (automationMode === "manual") return;

      const orderedColumns = columns.filter((c) => c.enabled).sort((a, b) => a.order - b.order);
      const startIndex = orderedColumns.findIndex((column) => column.id === startStage);
      if (startIndex === -1) return;

      const stopStage = workspace?.settings?.automationStopStage;

      for (let i = startIndex + 1; i < orderedColumns.length; i++) {
        const column = orderedColumns[i];
        const nextStage = column.id as ProjectStage;

        if (STAGES_REQUIRING_INPUT.includes(nextStage) && !inputData?.transcript) {
          break;
        }

        await persistStageChange(
          projectId,
          nextStage,
          column,
          workspace?.id,
          inputData,
          "automation"
        );
        moveProject(projectId, nextStage);

        if (column.autoTriggerJobs && column.autoTriggerJobs.length > 0) {
          updateProject(projectId, {
            activeJobType: column.autoTriggerJobs[0],
            activeJobProgress: 0,
            activeJobStatus: "pending",
            isLocked: true,
          });
          triggerProcessing();
        }

        if (automationMode === "auto_to_stage" && stopStage && nextStage === stopStage) {
          break;
        }

        if (column.humanInLoop) {
          break;
        }
      }
    },
    [columns, moveProject, updateProject, triggerProcessing, workspace]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to find which column a project or column ID belongs to
  const findColumnId = useCallback((id: string): string | null => {
    // Check if it's a column ID directly
    const column = columns.find((c) => c.id === id);
    if (column) return column.id;
    
    // Check if it's a project ID - find which column it's in
    const project = projects.find((p) => p.id === id);
    if (project) return project.stage;
    
    return null;
  }, [columns, projects]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const project = projects.find((p) => p.id === active.id);
    if (project) {
      setActiveProject(project);
      setDraggedProject(project.id);
      // Remember original stage for potential cancellation
      originalStageRef.current = project.stage;
    }
  }, [projects, setDraggedProject]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the column we're over (could be the column itself or a project in it)
    const overColumnId = findColumnId(overId);
    if (!overColumnId) return;

    // Get the active project's current stage
    const activeProject = projects.find((p) => p.id === activeId);
    if (!activeProject) return;

    // Only move if we're over a different column than the project is currently in
    if (activeProject.stage !== overColumnId) {
      moveProject(activeId, overColumnId as ProjectStage);
    }
  }, [findColumnId, projects, moveProject]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveProject(null);
    setDraggedProject(null);
    
    const activeId = active.id as string;

    if (!over) {
      // Dropped outside - revert to original position
      if (originalStageRef.current) {
        moveProject(activeId, originalStageRef.current as ProjectStage);
      }
      originalStageRef.current = null;
      return;
    }

    const overId = over.id as string;
    const overColumnId = findColumnId(overId);

    if (overColumnId && originalStageRef.current !== overColumnId) {
      // Ensure final state is correct in local store
      const project = projects.find((p) => p.id === activeId);
      if (project && project.stage !== overColumnId) {
        moveProject(activeId, overColumnId as ProjectStage);
      }
      
      // Get the target column for auto-trigger jobs
      const targetColumn = columns.find((c) => c.id === overColumnId);
      
      // Check if this stage requires input (e.g., Discovery needs transcript)
      if (STAGES_REQUIRING_INPUT.includes(overColumnId as ProjectStage) && project) {
        // Show dialog to collect input before persisting
        setPendingMove({
          projectId: activeId,
          project,
          targetStage: overColumnId as ProjectStage,
          targetColumn,
        });
        setTranscriptDialogOpen(true);
        originalStageRef.current = null;
        return;
      }
      
      // Persist to database and trigger auto-jobs (no input needed)
      persistStageChange(
        activeId,
        overColumnId as ProjectStage,
        targetColumn,
        workspace?.id
      ).then((ok) => {
        if (!ok && originalStageRef.current) {
          moveProject(activeId, originalStageRef.current as ProjectStage);
          return;
        }

        // Update the project with any active job info if auto-jobs were triggered
        if (targetColumn?.autoTriggerJobs && targetColumn.autoTriggerJobs.length > 0) {
          updateProject(activeId, {
            activeJobType: targetColumn.autoTriggerJobs[0],
            activeJobProgress: 0,
            activeJobStatus: "pending",
            isLocked: true,
          });
          
          // Trigger immediate processing of the new jobs
          setTimeout(() => {
            triggerProcessing();
          }, 500);
        }

        runAutomationPipeline({
          projectId: activeId,
          startStage: overColumnId as ProjectStage,
        });
      });
    }
    
    originalStageRef.current = null;
  }, [
    findColumnId,
    projects,
    columns,
    workspace,
    moveProject,
    updateProject,
    setDraggedProject,
    triggerProcessing,
    runAutomationPipeline,
  ]);

  // Handle transcript dialog confirm
  const handleTranscriptConfirm = useCallback(async (transcript: string) => {
    if (!pendingMove) return;
    
    const { projectId, targetStage, targetColumn } = pendingMove;
    
    // Persist to database with transcript input
    await persistStageChange(
      projectId,
      targetStage,
      targetColumn,
      workspace?.id,
      { transcript }
    );
    
    // Update the project with any active job info if auto-jobs were triggered
    if (targetColumn?.autoTriggerJobs && targetColumn.autoTriggerJobs.length > 0) {
      updateProject(projectId, {
        activeJobType: targetColumn.autoTriggerJobs[0],
        activeJobProgress: 0,
        activeJobStatus: "pending",
        isLocked: true,
      });
      
      // Trigger immediate processing of the new jobs
      setTimeout(() => {
        triggerProcessing();
      }, 500);
    }

    await runAutomationPipeline({
      projectId,
      startStage: targetStage,
      inputData: { transcript },
    });
    
    setTranscriptDialogOpen(false);
    setPendingMove(null);
  }, [pendingMove, workspace, updateProject, triggerProcessing, runAutomationPipeline]);

  // Handle transcript dialog skip (move without input)
  const handleTranscriptSkip = useCallback(async () => {
    if (!pendingMove) return;
    
    const { projectId, targetStage, targetColumn } = pendingMove;
    
    // Persist to database without transcript
    await persistStageChange(
      projectId,
      targetStage,
      targetColumn,
      workspace?.id
    );
    
    // Update the project with any active job info if auto-jobs were triggered
    if (targetColumn?.autoTriggerJobs && targetColumn.autoTriggerJobs.length > 0) {
      updateProject(projectId, {
        activeJobType: targetColumn.autoTriggerJobs[0],
        activeJobProgress: 0,
        activeJobStatus: "pending",
        isLocked: true,
      });
      
      // Trigger immediate processing of the new jobs
      setTimeout(() => {
        triggerProcessing();
      }, 500);
    }

    await runAutomationPipeline({
      projectId,
      startStage: targetStage,
    });
    
    setTranscriptDialogOpen(false);
    setPendingMove(null);
  }, [pendingMove, workspace, updateProject, triggerProcessing, runAutomationPipeline]);

  // Handle transcript dialog cancel (revert move)
  const handleTranscriptCancel = useCallback(() => {
    if (!pendingMove) return;
    
    // Revert the project to its original stage
    if (originalStageRef.current) {
      moveProject(pendingMove.projectId, originalStageRef.current as ProjectStage);
    }
    
    setTranscriptDialogOpen(false);
    setPendingMove(null);
    originalStageRef.current = null;
  }, [pendingMove, moveProject]);

  // Group projects by stage
  const projectsByStage = columns.reduce((acc, column) => {
    acc[column.id] = projects.filter((p) => p.stage === column.id);
    return acc;
  }, {} as Record<ProjectStage, ProjectCardType[]>);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        {/* Parallax Aurora Background */}
        <div ref={auroraRef} className="kanban-aurora-bg" />
        
        <div ref={boardRef} className="relative">
          {loopViewMode === "lanes" && <IterationLoopLanes columns={columns} className="px-4 sm:px-6" />}
          {loopViewMode === "overlay" && (
            <IterationLoopOverlay containerRef={boardRef} columns={columns} />
          )}
          <motion.div
            ref={scrollContainerRef}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex gap-3 sm:gap-4 p-4 sm:p-6 overflow-x-auto min-h-[60vh] sm:min-h-[calc(100vh-200px)] relative z-10 kanban-scroll-container"
          >
            <AnimatePresence mode="popLayout">
              {columns.map((column) => (
                <motion.div
                  key={column.id}
                  variants={staggerItem}
                  layout
                  className="group"
                >
                  <KanbanColumn
                    column={column}
                    projects={projectsByStage[column.id] || []}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          
          {/* Wave Scroll Indicator */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none z-20">
            <div className="relative w-48 h-1.5 bg-slate-200/30 dark:bg-slate-700/30 rounded-full overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full wave-scroll-indicator"
                style={{
                  width: '20%',
                  left: `${scrollProgress * 80}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}>
        {activeProject && <ProjectCardOverlay project={activeProject} />}
      </DragOverlay>
      
      {/* Transcript Input Dialog */}
      <TranscriptInputDialog
        open={transcriptDialogOpen}
        onOpenChange={(open) => {
          if (!open) handleTranscriptCancel();
        }}
        projectName={pendingMove?.project.name || ""}
        targetStage={pendingMove?.targetStage || "discovery"}
        onConfirm={handleTranscriptConfirm}
        onSkip={handleTranscriptSkip}
      />
    </DndContext>
  );
}
