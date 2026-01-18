import type { Meta, StoryObj } from "@storybook/react";
import { IterationLoopOverlay } from "./IterationLoopOverlay";

const meta: Meta<typeof IterationLoopOverlay> = {
  title: "Prototypes/IterationLoops/WaveOverlay",
  component: IterationLoopOverlay,
};

export default meta;
type Story = StoryObj<typeof IterationLoopOverlay>;

const columns = ["Discovery", "PRD", "Design", "Validate", "Prototype"];
const edges = [
  { from: 1, to: 0 },
  { from: 2, to: 1 },
  { from: 3, to: 0 },
];

export const Variant_Original: Story = {
  args: { columns, edges, variant: "original" },
};

export const Variant_Refined: Story = {
  args: { columns, edges, variant: "refined" },
};

export const Variant_Dramatic: Story = {
  args: { columns, edges, variant: "dramatic" },
};

export const Variant_Glow: Story = {
  args: { columns, edges, variant: "glow" },
};

export const Variant_Layered: Story = {
  args: { columns, edges, variant: "layered" },
};
