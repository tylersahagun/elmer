import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { IterationLoopControls, type LoopViewMode } from "./IterationLoopControls";

const meta: Meta<typeof IterationLoopControls> = {
  title: "Prototypes/IterationLoops/LoopControls",
  component: IterationLoopControls,
};

export default meta;
type Story = StoryObj<typeof IterationLoopControls>;

export const Interactive: Story = {
  render: () => {
    const [mode, setMode] = useState<LoopViewMode>("overlay");
    return <IterationLoopControls mode={mode} onChange={setMode} />;
  },
};
