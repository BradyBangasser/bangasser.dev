import type { Metadata } from "next";
import { ResumeStudio } from "@/components/ResumeStudio";
import manifest from "@/public/manifest.json";

export const metadata: Metadata = {
  title: "Resume",
  description: "Download a resume tuned to the role — reliability, cloud, HPC, compilers, or general software. Compiled in your browser.",
};

export default function ResumePage() {
  return <ResumeStudio manifest={manifest as any} />;
}
