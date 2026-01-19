import { create } from "zustand";
import type { ProjectStage as ProjectStageType } from "./db/schema";

// ============================================
// TYPES
// ============================================

export interface ProjectCard {
  id: string;
  name: string;
  description?: string;
  stage: ProjectStageType;
  status: "active" | "paused" | "completed" | "archived";
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  // Computed/joined data
  documentCount?: number;
  prototypeCount?: number;
  metadata?: {
    gitBranch?: string;
    baseBranch?: string;
    stageConfidence?: Record<
      string,
      {
        score: number;
        summary?: string;
        strengths?: string[];
        gaps?: string[];
        updatedAt: string;
      }
    >;
  };
  // Job state
  activeJobType?: string;
  activeJobProgress?: number;
  activeJobStatus?: "pending" | "running" | "completed" | "failed" | "cancelled";
  lastJobError?: string;
  isLocked?: boolean; // True when jobs are running - prevents dragging
}

export interface KanbanColumn {
  id: ProjectStageType;
  configId?: string;
  displayName: string;
  color: string;
  order: number;
  enabled: boolean;
  autoTriggerJobs?: string[];
  humanInLoop?: boolean;
  requiredDocuments?: string[];
  requiredApprovals?: number;
  contextPaths?: string[];
  contextNotes?: string;
  loopGroupId?: string;
  loopTargets?: string[];
  dependencyNotes?: string;
}

export interface WorkspaceState {
  id: string;
  name: string;
  description?: string;
  githubRepo?: string;
  contextPath?: string;
  settings?: {
    prototypesPath?: string;
    storybookPort?: number;
    contextPaths?: string[];
    baseBranch?: string;
    autoCreateFeatureBranch?: boolean;
    autoCommitJobs?: boolean;
    cursorDeepLinkTemplate?: string;
    aiExecutionMode?: "cursor" | "server" | "hybrid";
    aiValidationMode?: "none" | "light" | "schema";
    aiFallbackAfterMinutes?: number;
    knowledgebaseMapping?: Record<string, string>;
    automationMode?: "manual" | "auto_to_stage" | "auto_all";
    automationStopStage?: string;
    automationNotifyStage?: string;
    // Background Worker Settings
    workerEnabled?: boolean;
    workerMaxConcurrency?: number;
    workerPollIntervalMs?: number;
    // Browser Notification Settings
    browserNotificationsEnabled?: boolean;
    notifyOnJobComplete?: boolean;
    notifyOnJobFailed?: boolean;
    notifyOnApprovalRequired?: boolean;
    // UI Personalization
    background?: {
      type: "stars" | "bubble" | "gradient" | "gravity-stars" | "hole" | "aurora" | "none";
      primaryColor?: string;
      secondaryColor?: string;
      speed?: number;
      interactive?: boolean;
    };
    columnGradients?: boolean;
    compactMode?: boolean;
    // Display Mode: "immersive" for glassmorphism/animations, "focus" for solid/clean UI
    displayMode?: "immersive" | "focus";
  };
}

// ============================================
// KANBAN STORE
// ============================================

interface KanbanState {
  // Data
  workspace: WorkspaceState | null;
  columns: KanbanColumn[];
  projects: ProjectCard[];
  
  // UI State
  activeProjectId: string | null;
  draggedProjectId: string | null;
  isLoading: boolean;
  
  // Actions
  setWorkspace: (workspace: WorkspaceState) => void;
  updateWorkspace: (updates: Partial<WorkspaceState>) => void;
  setColumns: (columns: KanbanColumn[]) => void;
  setProjects: (projects: ProjectCard[]) => void;
  addProject: (project: ProjectCard) => void;
  updateProject: (id: string, updates: Partial<ProjectCard>) => void;
  moveProject: (projectId: string, toStage: ProjectStageType) => void;
  setActiveProject: (id: string | null) => void;
  setDraggedProject: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useKanbanStore = create<KanbanState>((set) => ({
  // Initial state
  workspace: null,
  columns: [],
  projects: [],
  activeProjectId: null,
  draggedProjectId: null,
  isLoading: false,

  // Actions
  setWorkspace: (workspace) => set({ workspace }),

  updateWorkspace: (updates) => set((state) => ({
    workspace: state.workspace ? { ...state.workspace, ...updates } : state.workspace,
  })),
  
  setColumns: (columns) => set({ columns }),
  
  setProjects: (projects) => set({ projects }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
  
  updateProject: (id, updates) => set((state) => {
    if (updates.status === "archived") {
      return {
        projects: state.projects.filter((p) => p.id !== id),
        activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
      };
    }
    return {
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    };
  }),
  
  moveProject: (projectId, toStage) => set((state) => ({
    projects: state.projects.map((p) =>
      p.id === projectId ? { ...p, stage: toStage, updatedAt: new Date() } : p
    ),
  })),
  
  setActiveProject: (id) => set({ activeProjectId: id }),
  
  setDraggedProject: (id) => set({ draggedProjectId: id }),
  
  setLoading: (loading) => set({ isLoading: loading }),
}));

// ============================================
// UI STORE
// ============================================

interface UIState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarTab: "chat" | "details" | "jobs";
  
  // Modals
  newProjectModalOpen: boolean;
  projectDetailModalOpen: boolean;
  settingsModalOpen: boolean;
  archivedProjectsModalOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarTab: (tab: "chat" | "details" | "jobs") => void;
  openNewProjectModal: () => void;
  closeNewProjectModal: () => void;
  openProjectDetailModal: () => void;
  closeProjectDetailModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openArchivedProjectsModal: () => void;
  closeArchivedProjectsModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  sidebarOpen: false,
  sidebarTab: "chat",
  newProjectModalOpen: false,
  projectDetailModalOpen: false,
  settingsModalOpen: false,
  archivedProjectsModalOpen: false,

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  openNewProjectModal: () => set({ newProjectModalOpen: true }),
  closeNewProjectModal: () => set({ newProjectModalOpen: false }),
  openProjectDetailModal: () => set({ projectDetailModalOpen: true }),
  closeProjectDetailModal: () => set({ projectDetailModalOpen: false }),
  openSettingsModal: () => set({ settingsModalOpen: true }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),
  openArchivedProjectsModal: () => set({ archivedProjectsModalOpen: true }),
  closeArchivedProjectsModal: () => set({ archivedProjectsModalOpen: false }),
}));

// ============================================
// SELECTORS
// ============================================

export const selectProjectsByStage = (stage: ProjectStageType) => (state: KanbanState) =>
  state.projects.filter((p) => p.stage === stage);

export const selectActiveProject = (state: KanbanState) =>
  state.projects.find((p) => p.id === state.activeProjectId);

export const selectEnabledColumns = (state: KanbanState) =>
  state.columns.filter((c) => c.enabled).sort((a, b) => a.order - b.order);

// Stable selector for project IDs only (for drag operations) - avoids re-renders on project updates
export const selectProjectStageMap = (state: KanbanState): Record<string, ProjectStageType> => {
  const map: Record<string, ProjectStageType> = {};
  for (const p of state.projects) {
    map[p.id] = p.stage;
  }
  return map;
};
