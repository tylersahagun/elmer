import type { Transition, Variants } from "framer-motion";

// Spring animation presets
export const springPresets = {
  // Snappy for interactions (buttons, toggles)
  snappy: { type: "spring", stiffness: 400, damping: 30 } as Transition,

  // Bouncy for card movements
  bouncy: { type: "spring", stiffness: 300, damping: 20 } as Transition,

  // Gentle for background elements
  gentle: { type: "spring", stiffness: 200, damping: 40 } as Transition,

  // Layout for drag-drop reordering
  layout: { type: "spring", stiffness: 500, damping: 35 } as Transition,

  // Quick for micro-interactions
  quick: { type: "spring", stiffness: 600, damping: 35 } as Transition,
};

// Card animation variants
export const cardVariants: Variants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 },
  hover: { y: -4, scale: 1.02 },
  tap: { scale: 0.98 },
  drag: { scale: 1.05, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", rotate: 2 },
};

// Stagger children animation
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Fade variants
export const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

// Slide variants
export const slideVariants: Variants = {
  initial: { x: -20, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 20, opacity: 0 },
};

// Scale variants
export const scaleVariants: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};

// Pop in effect for modals/dialogs
export const popInVariants: Variants = {
  initial: { scale: 0.95, opacity: 0, y: 10 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    y: 0,
    transition: springPresets.bouncy,
  },
  exit: { 
    scale: 0.95, 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.15 },
  },
};

// Kanban column variants
export const columnVariants: Variants = {
  initial: { opacity: 0, x: -20, y: 10 },
  animate: { 
    opacity: 1, 
    x: 0,
    y: 0,
    transition: springPresets.gentle,
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.2 },
  },
};

// Lane hover/drop state variants
export const laneVariants: Variants = {
  idle: {
    scale: 1,
    y: 0,
    transition: springPresets.gentle,
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: springPresets.quick,
  },
  dropTarget: {
    scale: 1.02,
    y: -4,
    transition: springPresets.bouncy,
  },
};

// Dragging state variants
export const dragVariants: Variants = {
  idle: { 
    scale: 1, 
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    rotate: 0,
  },
  dragging: { 
    scale: 1.05, 
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    rotate: 2,
    transition: springPresets.quick,
  },
  dropping: {
    scale: 1,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    rotate: 0,
    transition: springPresets.bouncy,
  },
};

// List reorder animation
export const reorderVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Skeleton loading pulse
export const pulseVariants: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Progress indicator
export const progressVariants: Variants = {
  initial: { scaleX: 0, originX: 0 },
  animate: (progress: number) => ({
    scaleX: progress,
    transition: springPresets.gentle,
  }),
};
