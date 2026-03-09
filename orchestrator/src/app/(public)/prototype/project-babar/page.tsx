import type { Metadata } from "next";
import { ProjectBabarPrototype } from "@/components/prototypes/project-babar/ProjectBabarPrototype";

export const metadata: Metadata = {
  title: "Project Babar Prototype",
  description:
    "Interactive prototype for Project Babar's Meeting Summary and sharing experience.",
};

export default function ProjectBabarPrototypePage() {
  return <ProjectBabarPrototype />;
}
