import { Desktop } from "@/components/desktop/Desktop";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How MS Paint Learns | Some Claude Skills",
  description:
    "How the free MS Paint drawing agent gets smarter over time: a Cognitive Task Analysis loop (ACTA, Critical Decision Method, ShadowBox) where every drawing deposits a reusable lesson for the next agent.",
};

export default function HowMSPaintLearnsPage() {
  return <Desktop initialWindow={{ type: "mspaint-wisdom" }} />;
}
