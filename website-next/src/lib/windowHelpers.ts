import { useWindowManager } from "@/state/windowManager";
import { useSkillNav } from "@/state/skillNav";

/**
 * Clamp a window geometry to fit within the current viewport.
 * On tablet (640-1024px), centers the window and caps at 90% viewport.
 * On desktop, returns the geometry unchanged.
 * On mobile, the Zustand store forces fullscreen automatically.
 */
function clampGeometry(x: number, y: number, w: number, h: number) {
  if (typeof window === "undefined") return { x, y, width: w, height: h };

  const { layoutMode } = useWindowManager.getState();
  if (layoutMode === "tablet") {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const maxW = Math.min(w, Math.floor(vw * 0.9));
    const maxH = Math.min(h, Math.floor(vh * 0.9));
    const cx = Math.max(0, Math.floor((vw - maxW) / 2));
    const cy = Math.max(0, Math.floor((vh - maxH) / 2));
    return { x: cx, y: cy, width: maxW, height: maxH };
  }
  return { x, y, width: w, height: h };
}

/* ── SKILL_DETAILS multi-window program ──────────────────────────────────── */

/**
 * Open the SKILL_DETAILS program for a given skill.
 * Single split-panel window: left sidebar = file tree, right pane = content.
 */
export function openSkillDetails(skillId: string, title: string) {
  const store = useWindowManager.getState();
  const nav   = useSkillNav.getState();

  // Close any existing skill-details window
  if (store.windows.find((w) => w.id === "skill-details")) {
    store.closeWindow("skill-details");
  }

  // Navigate the shared skill nav store
  nav.navigateTo(skillId);

  const geo = clampGeometry(60, 25, 1020, 580);
  store.openWindow({
    id: "skill-details",
    title: `${title} — SKILL.MD`,
    ...geo,
    isMinimized: false, isMaximized: false,
    content: { type: "skill-details" },
  });
}

/* ── Program group openers ───────────────────────────────────────────────── */

export function openSkillsBrowserWindow() {
  const geo = clampGeometry(40, 15, 1060, 580);
  useWindowManager.getState().openWindow({
    id: "skills-browser",
    title: "Skill Explorer",
    ...geo,
    isMinimized: false, isMaximized: false,
    content: { type: "skills-browser" },
  });
}

export function openWinampWindow() {
  useWindowManager.getState().openWindow({
    id: "winamp",
    title: "Winamp",
    x: 60, y: 40,
    width: 580, height: 480,
    isMinimized: false, isMaximized: false,
    content: { type: "winamp" },
  });
}

export function openMSPaintWindow() {
  useWindowManager.getState().openWindow({
    id: "mspaint",
    title: "MSPaint",
    x: 80, y: 50,
    width: 660, height: 500,
    isMinimized: false, isMaximized: false,
    content: { type: "mspaint" },
  });
}

export function openMSPaintWisdomWindow() {
  const geo = clampGeometry(90, 40, 720, 600);
  useWindowManager.getState().openWindow({
    id: "mspaint-wisdom",
    title: "How MS Paint Learns — README",
    ...geo,
    isMinimized: false, isMaximized: false,
    content: { type: "mspaint-wisdom" },
  });
}

export function openMediaWindow() {
  useWindowManager.getState().openWindow({
    id: "media",
    title: "FUN STUFF — Program Group",
    x: 100, y: 80,
    width: 440, height: 260,
    isMinimized: false, isMaximized: false,
    content: { type: "media" },
  });
}

export function openTutorialsWindow() {
  const geo = clampGeometry(60, 30, 860, 600);
  useWindowManager.getState().openWindow({
    id: "tutorials",
    title: "TUTORIALS",
    ...geo,
    isMinimized: false, isMaximized: false,
    content: { type: "tutorials" },
  });
}

export function openArtifactsWindow() {
  const geo = clampGeometry(100, 60, 780, 540);
  useWindowManager.getState().openWindow({
    id: "artifacts",
    title: "ARTIFACTS — Showcase",
    ...geo,
    isMinimized: false, isMaximized: false,
    content: { type: "artifacts" },
  });
}

/* ── Legacy single-window skill viewer ───────────────────────────────────── */

export function openSkillWindow(skillId: string, title: string) {
  useWindowManager.getState().openWindow({
    id: `skill-${skillId}`,
    title: `${title} - SKILL.MD`,
    x: 60,
    y: 40,
    width: 600,
    height: 450,
    isMinimized: false,
    isMaximized: false,
    content: { type: "skill", skillId },
  });
}

export function openChangelogWindow() {
  useWindowManager.getState().openWindow({
    id: "changelog",
    title: "WHATSNEW.TXT",
    x: 80,
    y: 60,
    width: 550,
    height: 400,
    isMinimized: false,
    isMaximized: false,
    content: { type: "changelog" },
  });
}

export function openSearchWindow() {
  useWindowManager.getState().openWindow({
    id: "search",
    title: "Find Skills",
    x: 100,
    y: 80,
    width: 450,
    height: 350,
    isMinimized: false,
    isMaximized: false,
    content: { type: "search" },
  });
}

export function openMcpWindow() {
  useWindowManager.getState().openWindow({
    id: "mcp",
    title: "MCP Gallery",
    x: 80,
    y: 50,
    width: 680,
    height: 500,
    isMinimized: false,
    isMaximized: false,
    content: { type: "mcp" },
  });
}

export function openAgentsWindow() {
  useWindowManager.getState().openWindow({
    id: "agents",
    title: "Founding Council — Agents",
    x: 90,
    y: 55,
    width: 680,
    height: 500,
    isMinimized: false,
    isMaximized: false,
    content: { type: "agents" },
  });
}

export function openBundlesWindow() {
  useWindowManager.getState().openWindow({
    id: "bundles",
    title: "Skill Bundles",
    x: 70,
    y: 45,
    width: 680,
    height: 500,
    isMinimized: false,
    isMaximized: false,
    content: { type: "bundles" },
  });
}

export function openAboutWindow() {
  useWindowManager.getState().openWindow({
    id: "about",
    title: "About — Some Claude Skills",
    x: 120,
    y: 80,
    width: 500,
    height: 400,
    isMinimized: false,
    isMaximized: false,
    content: { type: "about" },
  });
}

export function openFavoritesWindow() {
  useWindowManager.getState().openWindow({
    id: "favorites",
    title: "Starred Skills",
    x: 100,
    y: 70,
    width: 560,
    height: 420,
    isMinimized: false,
    isMaximized: false,
    content: { type: "favorites" },
  });
}

export function openBaitWindow() {
  useWindowManager.getState().openWindow({
    id: "bait",
    title: "Message — SomeClaudeSkills.com",
    x: 140,
    y: 100,
    width: 520,
    height: 300,
    isMinimized: false,
    isMaximized: false,
    content: { type: "bait" },
  });
}

export function openBrowserWindow(url = "https://classic.someclaudeskills.com") {
  useWindowManager.getState().openWindow({
    id: "browser",
    title: "Internet Explorer",
    x: 60,
    y: 50,
    width: 820,
    height: 560,
    isMinimized: false,
    isMaximized: false,
    content: { type: "browser", url },
  });
}

export function openSettingsWindow() {
  useWindowManager.getState().openWindow({
    id: "settings",
    title: "Settings",
    x: 180,
    y: 120,
    width: 460,
    height: 360,
    isMinimized: false,
    isMaximized: false,
    content: { type: "settings" },
  });
}

export function openWelcomeWindow() {
  // Position as right column — doesn't overlap Skills Browser
  const rightX = typeof window !== "undefined" ? Math.max(480, window.innerWidth - 520) : 700;
  const geo = clampGeometry(rightX, 20, 480, 560);
  useWindowManager.getState().openWindow({
    id: "welcome",
    title: "Welcome to SomeClaudeSkills!",
    ...geo,
    isMinimized: false,
    isMaximized: false,
    content: { type: "welcome" },
  });
}

export function openFeaturedWindow() {
  const geo = clampGeometry(15, 200, 480, 340);
  useWindowManager.getState().openWindow({
    id: "featured",
    title: "FEATURED — Skill of the Day",
    ...geo,
    isMinimized: false,
    isMaximized: false,
    content: { type: "featured" },
  });
}

export function openStartupWindow() {
  useWindowManager.getState().openWindow({
    id: "startup",
    title: "STARTUP — Program Group",
    x: 140,
    y: 100,
    width: 380,
    height: 240,
    isMinimized: false,
    isMaximized: false,
    content: { type: "startup" },
  });
}
