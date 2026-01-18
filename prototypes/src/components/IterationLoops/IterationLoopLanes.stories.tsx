import type { Meta, StoryObj } from "@storybook/react";
import { IterationLoopLanes } from "./IterationLoopLanes";

const meta: Meta<typeof IterationLoopLanes> = {
  title: "Prototypes/IterationLoops/LaneView",
  component: IterationLoopLanes,
};

export default meta;
type Story = StoryObj<typeof IterationLoopLanes>;

export const Default: Story = {
  args: {
    columns: ["Discovery", "PRD", "Design", "Validate", "Prototype", "Tickets"],
    groups: [
      { id: "loop-1", start: 0, end: 2, label: "Discovery ↔ PRD ↔ Design" },
      { id: "loop-2", start: 2, end: 4, label: "Design ↔ Validate" },
    ],
  },
};
