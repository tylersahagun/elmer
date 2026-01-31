"use client";

import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  useLayoutEffect,
} from "react";
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
import { useShallow } from "zustand/react/shallow";
import {
  useKanbanStore,
  type ProjectCard as ProjectCardType,
  type KanbanColumn as KanbanColumnType,
} from "@/lib/store";
import type { ProjectStage } from "@/lib/db/schema";
import { KanbanColumn, type ColumnViewState } from "./KanbanColumn";
import { ProjectCardOverlay } from "./ProjectCard";
import { TranscriptInputDialog } from "./TranscriptInputDialog";
import { IterationLoopOverlay } from "./IterationLoopOverlay";
import { IterationLoopLanes } from "./IterationLoopLanes";
import { IterationLoopControls } from "./IterationLoopControls";
import { PinnedProjectsSection } from "./PinnedProjectsSection";
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
  triggeredBy: "user" | "automation" = "user",
): Promise<boolean> {
  try {
    // 1. Persist stage change to database
    const stageRes = await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage, triggeredBy }),
    });

    if (!stageRes.ok) {
      const errorBody = await stageRes.json().catch(() => ({}));
      console.error(
        "Failed to persist stage change:",
        errorBody.error || stageRes.statusText,
      );
      return false;
    }

    console.log(`✅ Stage change persisted: ${projectId} → ${newStage}`);

    // 2. Trigger auto-jobs if column has them configured
    if (
      column?.autoTriggerJobs &&
      column.autoTriggerJobs.length > 0 &&
      workspaceId
    ) {
      console.log(
        `🚀 Triggering auto-jobs for ${newStage}:`,
        column.autoTriggerJobs,
      );

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

    // 3. Trigger agent definitions if configured
    if (
      column?.agentTriggers &&
      column.agentTriggers.length > 0 &&
      workspaceId
    ) {
      const sortedTriggers = [...column.agentTriggers].sort(
        (a, b) => (a.priority ?? 0) - (b.priority ?? 0),
      );
      console.log(
        `🤖 Triggering agent definitions for ${newStage}:`,
        sortedTriggers.map((t) => t.agentDefinitionId),
      );

      for (const trigger of sortedTriggers) {
        try {
          const jobRes = await fetch("/api/jobs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              workspaceId,
              projectId,
              type: "execute_agent_definition",
              input: { agentDefinitionId: trigger.agentDefinitionId },
            }),
          });

          if (jobRes.ok) {
            const job = await jobRes.json();
            console.log(
              `✅ Agent job queued: ${trigger.agentDefinitionId} (${job.id})`,
            );
          } else {
            console.error(
              `Failed to queue agent job: ${trigger.agentDefinitionId}`,
            );
          }
        } catch (error) {
          console.error(
            `Error queuing agent job ${trigger.agentDefinitionId}:`,
            error,
          );
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
  // Get columns and workspace from store
  const allColumns = useKanbanStore((s) => s.columns);
  const workspace = useKanbanStore((s) => s.workspace);
  const moveProject = useKanbanStore((s) => s.moveProject);
  const updateProject = useKanbanStore((s) => s.updateProject);
  const setDraggedProject = useKanbanStore((s) => s.setDraggedProject);

  // For drag operations only - subscribe to project stage mapping (lightweight)
  // This only changes when projects move between columns, not on every project update
  const projectStageMap = useKanbanStore(
    useShallow((s) => {
      const map: Record<string, string> = {};
      for (const p of s.projects) {
        map[p.id] = p.stage;
      }
      return map;
    }),
  );

  // For drag overlay - get all projects and memoize the lookup function
  const projects = useKanbanStore((s) => s.projects);
  const getProjectById = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects],
  );

  // Memoize filtered/sorted columns to avoid infinite loops
  const columns = useMemo(
    () => allColumns.filter((c) => c.enabled).sort((a, b) => a.order - b.order),
    [allColumns],
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
      console.log(
        `🚀 Auto-triggering processing for ${jobSummary.pending} pending jobs`,
      );
      triggerProcessing();
    }
  }, [jobSummary.pending, activeJobs.length, triggerProcessing]);

  // Log connection status
  useEffect(() => {
    console.log(
      `🔌 SSE Connection: ${isConnected ? "Connected" : "Disconnected"}`,
    );
  }, [isConnected]);

  // Log job status for debugging
  useEffect(() => {
    if (jobSummary.pending > 0 || jobSummary.running > 0) {
      console.log(
        `📊 Jobs: ${jobSummary.pending} pending, ${jobSummary.running} running`,
      );
    }
  }, [jobSummary]);

  const [activeProject, setActiveProject] = useState<ProjectCardType | null>(
    null,
  );
  const [loopViewMode, setLoopViewMode] = useState<LoopViewMode>("off");
  const hasLoops = useMemo(
    () =>
      columns.some(
        (column) =>
          (column.loopTargets && column.loopTargets.length > 0) ||
          Boolean(column.loopGroupId),
      ),
    [columns],
  );

  useEffect(() => {
    if (hasLoops && loopViewMode === "off") {
      setLoopViewMode("overlay");
    }
  }, [hasLoops, loopViewMode]);

  // Column view state management (expanded/minimized/hidden)
  const [columnViewStates, setColumnViewStates] = useState<
    Record<string, ColumnViewState>
  >({});

  const getColumnViewState = useCallback(
    (columnId: string): ColumnViewState => {
      return columnViewStates[columnId] || "normal";
    },
    [columnViewStates],
  );

  const setColumnViewState = useCallback(
    (columnId: string, state: ColumnViewState) => {
      setColumnViewStates((prev) => ({
        ...prev,
        [columnId]: state,
      }));
    },
    [],
  );
  // Track the original stage when drag started (for cancellation)
  const originalStageRef = useRef<string | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement | null>(null);
  const scrollTrackRef = useRef<HTMLDivElement | null>(null);
  const isDraggingScrollRef = useRef(false);

  // Scroll progress tracking - uses direct DOM manipulation, no React re-renders
  // useLayoutEffect ensures refs are populated before we attach listeners
  useLayoutEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const indicator = scrollIndicatorRef.current;
    const track = scrollTrackRef.current;
    if (!scrollContainer || !indicator || !track) return;

    const updateIndicator = () => {
      const scrollLeft = scrollContainer.scrollLeft;
      const maxScroll =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;

      // Update indicator directly via DOM - no React state, no re-renders
      // translateX by (progress * 80%) because thumb is 20% width, so max travel is 80%
      indicator.style.transform = `translateX(${progress * 400}%)`;
    };

    const scrollToPosition = (clientX: number) => {
      const trackRect = track.getBoundingClientRect();
      const thumbWidth = track.clientWidth * 0.2; // 20% width
      const effectiveTrackWidth = trackRect.width - thumbWidth;

      // Calculate position relative to track, centering on click
      const relativeX = clientX - trackRect.left - thumbWidth / 2;
      const progress = Math.max(
        0,
        Math.min(1, relativeX / effectiveTrackWidth),
      );

      const maxScroll =
        scrollContainer.scrollWidth - scrollContainer.clientWidth;
      scrollContainer.scrollLeft = progress * maxScroll;
    };

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingScrollRef.current = true;
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      scrollToPosition(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingScrollRef.current) return;
      scrollToPosition(e.clientX);
    };

    const handleMouseUp = () => {
      if (isDraggingScrollRef.current) {
        isDraggingScrollRef.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      }
    };

    // Initial position update
    updateIndicator();

    // Scroll listener on container
    scrollContainer.addEventListener("scroll", updateIndicator, {
      passive: true,
    });

    // Drag listeners on track
    track.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      scrollContainer.removeEventListener("scroll", updateIndicator);
      track.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [columns.length]); // Re-attach when columns change (affects scrollWidth)

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

      const orderedColumns = columns
        .filter((c) => c.enabled)
        .sort((a, b) => a.order - b.order);
      const startIndex = orderedColumns.findIndex(
        (column) => column.id === startStage,
      );
      if (startIndex === -1) return;

      const stopStage = workspace?.settings?.automationStopStage;

      for (let i = startIndex + 1; i < orderedColumns.length; i++) {
        const column = orderedColumns[i];
        const nextStage = column.id as ProjectStage;

        if (
          STAGES_REQUIRING_INPUT.includes(nextStage) &&
          !inputData?.transcript
        ) {
          break;
        }

        await persistStageChange(
          projectId,
          nextStage,
          column,
          workspace?.id,
          inputData,
          "automation",
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

        if (
          automationMode === "auto_to_stage" &&
          stopStage &&
          nextStage === stopStage
        ) {
          break;
        }

        if (column.humanInLoop) {
          break;
        }
      }
    },
    [columns, moveProject, updateProject, triggerProcessing, workspace],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Helper to find which column a project or column ID belongs to
  const findColumnId = useCallback(
    (id: string): string | null => {
      // Check if it's a column ID directly
      const column = columns.find((c) => c.id === id);
      if (column) return column.id;

      // Check if it's a project ID - find which column it's in using the stage map
      const stage = projectStageMap[id];
      if (stage) return stage;

      return null;
    },
    [columns, projectStageMap],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const projectId = active.id as string;
      const project = getProjectById(projectId);
      if (project) {
        setActiveProject(project);
        setDraggedProject(project.id);
        // Remember original stage for potential cancellation
        originalStageRef.current = project.stage;
      }
    },
    [getProjectById, setDraggedProject],
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find the column we're over (could be the column itself or a project in it)
      const overColumnId = findColumnId(overId);
      if (!overColumnId) return;

      // Get the active project's current stage from the map (avoids full project lookup)
      const activeProjectStage = projectStageMap[activeId];
      if (!activeProjectStage) return;

      // Only move if we're over a different column than the project is currently in
      if (activeProjectStage !== overColumnId) {
        moveProject(activeId, overColumnId as ProjectStage);
      }
    },
    [findColumnId, projectStageMap, moveProject],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
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
        // Get the current project stage from the map
        const currentStage = projectStageMap[activeId];
        if (currentStage && currentStage !== overColumnId) {
          moveProject(activeId, overColumnId as ProjectStage);
        }

        // Get the target column for auto-trigger jobs
        const targetColumn = columns.find((c) => c.id === overColumnId);

        // Check if this stage requires input (e.g., Discovery needs transcript)
        if (STAGES_REQUIRING_INPUT.includes(overColumnId as ProjectStage)) {
          const project = getProjectById(activeId);
          if (project) {
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
        }

        // Persist to database and trigger auto-jobs (no input needed)
        persistStageChange(
          activeId,
          overColumnId as ProjectStage,
          targetColumn,
          workspace?.id,
        ).then((ok) => {
          if (!ok && originalStageRef.current) {
            moveProject(activeId, originalStageRef.current as ProjectStage);
            return;
          }

          // Update the project with any active job info if auto-jobs were triggered
          if (
            targetColumn?.autoTriggerJobs &&
            targetColumn.autoTriggerJobs.length > 0
          ) {
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
    },
    [
      findColumnId,
      getProjectById,
      projectStageMap,
      columns,
      workspace,
      moveProject,
      updateProject,
      setDraggedProject,
      triggerProcessing,
      runAutomationPipeline,
    ],
  );

  // Handle transcript dialog confirm
  const handleTranscriptConfirm = useCallback(
    async (transcript: string) => {
      if (!pendingMove) return;

      const { projectId, targetStage, targetColumn } = pendingMove;

      // Persist to database with transcript input
      await persistStageChange(
        projectId,
        targetStage,
        targetColumn,
        workspace?.id,
        { transcript },
      );

      // Update the project with any active job info if auto-jobs were triggered
      if (
        targetColumn?.autoTriggerJobs &&
        targetColumn.autoTriggerJobs.length > 0
      ) {
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
    },
    [
      pendingMove,
      workspace,
      updateProject,
      triggerProcessing,
      runAutomationPipeline,
    ],
  );

  // Handle transcript dialog skip (move without input)
  const handleTranscriptSkip = useCallback(async () => {
    if (!pendingMove) return;

    const { projectId, targetStage, targetColumn } = pendingMove;

    // Persist to database without transcript
    await persistStageChange(
      projectId,
      targetStage,
      targetColumn,
      workspace?.id,
    );

    // Update the project with any active job info if auto-jobs were triggered
    if (
      targetColumn?.autoTriggerJobs &&
      targetColumn.autoTriggerJobs.length > 0
    ) {
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
  }, [
    pendingMove,
    workspace,
    updateProject,
    triggerProcessing,
    runAutomationPipeline,
  ]);

  // Handle transcript dialog cancel (revert move)
  const handleTranscriptCancel = useCallback(() => {
    if (!pendingMove) return;

    // Revert the project to its original stage
    if (originalStageRef.current) {
      moveProject(
        pendingMove.projectId,
        originalStageRef.current as ProjectStage,
      );
    }

    setTranscriptDialogOpen(false);
    setPendingMove(null);
    originalStageRef.current = null;
  }, [pendingMove, moveProject]);

  // Handle pin toggle (local state only for now)
  const [pinnedProjectIds, setPinnedProjectIds] = useState<Set<string>>(
    new Set(),
  );

  const handleTogglePin = useCallback(
    (projectId: string, isPinned: boolean) => {
      setPinnedProjectIds((prev) => {
        const next = new Set(prev);
        if (isPinned) {
          next.add(projectId);
        } else {
          next.delete(projectId);
        }
        return next;
      });
    },
    [],
  );

  // Get pinned projects - only subscribe when we have pinned items
  const pinnedProjects = useKanbanStore(
    useShallow((s) =>
      pinnedProjectIds.size > 0
        ? s.projects.filter((p) => pinnedProjectIds.has(p.id))
        : [],
    ),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="relative">
        <div ref={boardRef} className="relative" data-tour="kanban-board">
          {/* Pinned Projects Section */}
          <div className="px-4 sm:px-6 pt-4">
            <PinnedProjectsSection
              projects={pinnedProjects}
              onTogglePin={handleTogglePin}
            />
          </div>
          {hasLoops && (
            <div className="px-4 sm:px-6 pt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-mono text-muted-foreground">
                Iteration loops
              </span>
              <IterationLoopControls
                mode={loopViewMode}
                onChange={setLoopViewMode}
              />
            </div>
          )}

          {loopViewMode === "lanes" && (
            <IterationLoopLanes columns={columns} className="px-4 sm:px-6" />
          )}
          {loopViewMode === "overlay" && (
            <IterationLoopOverlay containerRef={boardRef} columns={columns} />
          )}
          <motion.div
            ref={scrollContainerRef}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex gap-3 sm:gap-4 p-4 sm:p-6 overflow-x-auto min-h-[calc(100vh-120px)] relative z-10 kanban-scroll-container will-change-scroll"
          >
            <AnimatePresence mode="sync">
              {columns.map((column) => {
                const viewState = getColumnViewState(column.id);
                // Skip rendering hidden columns entirely for performance
                if (viewState === "hidden") {
                  return null;
                }
                return (
                  <motion.div
                    key={column.id}
                    variants={staggerItem}
                    // Removed 'layout' prop - it causes expensive recalculates on scroll
                    className="group shrink-0"
                    layout={viewState !== "normal"} // Only layout animate when changing view states
                  >
                    <KanbanColumn
                      column={column}
                      viewState={viewState}
                      onExpand={() =>
                        setColumnViewState(
                          column.id,
                          viewState === "expanded" ? "normal" : "expanded",
                        )
                      }
                      onMinimize={() =>
                        setColumnViewState(column.id, "minimized")
                      }
                      onClose={() => setColumnViewState(column.id, "hidden")}
                      onRestore={() => setColumnViewState(column.id, "normal")}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {/* Interactive Scroll Indicator - draggable and synced with scroll */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center z-20">
            <div
              ref={scrollTrackRef}
              className="relative w-48 h-2 bg-slate-200/30 dark:bg-slate-700/30 rounded-full overflow-hidden cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div
                ref={scrollIndicatorRef}
                className="absolute top-0 left-0 h-full w-[20%] bg-linear-to-r from-emerald-400 via-teal-400 to-emerald-400 rounded-full will-change-transform cursor-grab active:cursor-grabbing"
                style={{
                  transform: "translateX(0%)",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
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
