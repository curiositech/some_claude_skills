/*
 * ═══════════════════════════════════════════════════════════════════════════
 * SKILL DATA - AUTO-GENERATED FROM DOCUSAURUS
 * Generated: 2026-02-07T01:37:44.637Z
 * Total Skills: 165
 * 
 * DO NOT EDIT - Run 'npm run import:skills' to regenerate
 * ═══════════════════════════════════════════════════════════════════════════
 */

export interface Skill {
  id: string;
  title: string;
  description: string;
  category: SkillCategory;
  icon: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  installCommand: string;
  references?: SkillReference[];
  heroImage?: string;
}

export interface SkillReference {
  title: string;
  type: 'guide' | 'example' | 'related-skill' | 'external';
  url: string;
  description?: string;
}

export type SkillCategory =
  | 'development'
  | 'architecture'
  | 'devops'
  | 'design'
  | 'data'
  | 'testing'
  | 'documentation'
  | 'security';

export const categoryMeta: Record<SkillCategory, { label: string; icon: string }> = {
  development: { label: 'Development', icon: '💻' },
  architecture: { label: 'Architecture', icon: '🏗️' },
  devops: { label: 'DevOps', icon: '🔧' },
  design: { label: 'Design', icon: '🎨' },
  data: { label: 'Data', icon: '📊' },
  testing: { label: 'Testing', icon: '🧪' },
  documentation: { label: 'Documentation', icon: '📝' },
  security: { label: 'Security', icon: '🔒' },
};

export const skills: Skill[] = [
  {
    id: 'ai-engineer',
    title: 'Ai Engineer',
    description: "Build production-ready LLM applications, advanced RAG systems, and intelligent agents. Implements vector search, multimodal AI, agent orchestration, and enterprise AI integrations. Use PROACTIVELY for LLM features, chatbots, AI agents, or AI-powered applications.",
    category: 'development',
    icon: '🤖',
    tags: ["llm","rag","agents","ai","production","embeddings"],
    difficulty: 'intermediate',
    content: `# Ai Engineer

Build production-ready LLM applications, advanced RAG systems, and intelligent agents. Implements vector search, multimodal AI, agent orchestration, and enterprise AI integrations. Use PROACTIVELY for LLM features, chatbots, AI agents, or AI-powered applications.

## Installation

\`\`\`bash
claude skill add ai-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- llm
- rag
- agents
- ai
- production
- embeddings`,
    installCommand: 'claude skill add ai-engineer',
  },
  {
    id: 'ai-video-production-master',
    title: 'Ai Video Production Master',
    description: "Expert in script-to-video production pipelines for Apple Silicon Macs. Specializes in hybrid local/cloud workflows, LoRA training for character consistency, motion graphics generation, and artist commissioning. Activate on 'AI video production', 'script to video', 'video generation pipeline', 'character consistency', 'LoRA training', 'cloud GPU', 'motion graphics', 'Wan I2V', 'InVideo alternative'. NOT for real-time video editing, video compositing (use DaVinci/Premiere), audio production, or 3D modeling (use Blender/Maya).",
    category: 'development',
    icon: '🤖',
    tags: ["video","ai-generation","lora","cloud-gpu","motion-graphics","comfyui"],
    difficulty: 'intermediate',
    content: `# Ai Video Production Master

Expert in script-to-video production pipelines for Apple Silicon Macs. Specializes in hybrid local/cloud workflows, LoRA training for character consistency, motion graphics generation, and artist commissioning. Activate on 'AI video production', 'script to video', 'video generation pipeline', 'character consistency', 'LoRA training', 'cloud GPU', 'motion graphics', 'Wan I2V', 'InVideo alternative'. NOT for real-time video editing, video compositing (use DaVinci/Premiere), audio production, or 3D modeling (use Blender/Maya).

## Installation

\`\`\`bash
claude skill add ai-video-production-master
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- video
- ai-generation
- lora
- cloud-gpu
- motion-graphics
- comfyui`,
    installCommand: 'claude skill add ai-video-production-master',
  },
  {
    id: 'automatic-stateful-prompt-improver',
    title: 'Automatic Stateful Prompt Improver',
    description: "Automatically intercepts and optimizes prompts using the prompt-learning MCP server. Learns from performance over time via embedding-indexed history. Uses APE, OPRO, DSPy patterns. Activate on \"optimize prompt\", \"improve this prompt\", \"prompt engineering\", or ANY complex task request. Requires prompt-learning MCP server. NOT for simple questions (just answer them), NOT for direct commands (just execute them), NOT for conversational responses (no optimization needed).",
    category: 'development',
    icon: '🤖',
    tags: ["prompts","optimization","learning","embeddings","dspy"],
    difficulty: 'intermediate',
    content: `# Automatic Stateful Prompt Improver

Automatically intercepts and optimizes prompts using the prompt-learning MCP server. Learns from performance over time via embedding-indexed history. Uses APE, OPRO, DSPy patterns. Activate on "optimize prompt", "improve this prompt", "prompt engineering", or ANY complex task request. Requires prompt-learning MCP server. NOT for simple questions (just answer them), NOT for direct commands (just execute them), NOT for conversational responses (no optimization needed).

## Installation

\`\`\`bash
claude skill add automatic-stateful-prompt-improver
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- prompts
- optimization
- learning
- embeddings
- dspy`,
    installCommand: 'claude skill add automatic-stateful-prompt-improver',
  },
  {
    id: 'background-job-orchestrator',
    title: 'Background Job Orchestrator',
    description: "Expert in background job processing with Bull/BullMQ (Redis), Celery, and cloud queues. Implements retries, scheduling, priority queues, and worker management. Use for async task processing, email campaigns, report generation, batch operations. Activate on \"background job\", \"async task\", \"queue\", \"worker\", \"BullMQ\", \"Celery\". NOT for real-time WebSocket communication, synchronous API calls, or simple setTimeout operations.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Background Job Orchestrator

Expert in background job processing with Bull/BullMQ (Redis), Celery, and cloud queues. Implements retries, scheduling, priority queues, and worker management. Use for async task processing, email campaigns, report generation, batch operations. Activate on "background job", "async task", "queue", "worker", "BullMQ", "Celery". NOT for real-time WebSocket communication, synchronous API calls, or simple setTimeout operations.

## Installation

\`\`\`bash
claude skill add background-job-orchestrator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add background-job-orchestrator',
  },
  {
    id: 'bot-developer',
    title: 'Bot Developer',
    description: "Expert bot developer specializing in Discord, Telegram, Slack automation with deep knowledge of rate limiting, state machines, event sourcing, moderation systems, and conversational AI integration. Activate on 'Discord bot', 'Telegram bot', 'Slack bot', 'chat automation', 'moderation system'. NOT for web APIs (use backend-architect), general automation scripts (use python-pro), or frontend chat widgets (use frontend-developer).",
    category: 'development',
    icon: '🤖',
    tags: ["discord","telegram","slack","bots","automation"],
    difficulty: 'intermediate',
    content: `# Bot Developer

Expert bot developer specializing in Discord, Telegram, Slack automation with deep knowledge of rate limiting, state machines, event sourcing, moderation systems, and conversational AI integration. Activate on 'Discord bot', 'Telegram bot', 'Slack bot', 'chat automation', 'moderation system'. NOT for web APIs (use backend-architect), general automation scripts (use python-pro), or frontend chat widgets (use frontend-developer).

## Installation

\`\`\`bash
claude skill add bot-developer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- discord
- telegram
- slack
- bots
- automation`,
    installCommand: 'claude skill add bot-developer',
  },
  {
    id: 'clip-aware-embeddings',
    title: 'Clip Aware Embeddings',
    description: "Semantic image-text matching with CLIP and alternatives. Use for image search, zero-shot classification, similarity matching. NOT for counting objects, fine-grained classification (celebrities, car models), spatial reasoning, or compositional queries. Activate on \"CLIP\", \"embeddings\", \"image similarity\", \"semantic search\", \"zero-shot classification\", \"image-text matching\".",
    category: 'development',
    icon: '🤖',
    tags: ["clip","embeddings","vision","similarity","zero-shot"],
    difficulty: 'intermediate',
    content: `# Clip Aware Embeddings

Semantic image-text matching with CLIP and alternatives. Use for image search, zero-shot classification, similarity matching. NOT for counting objects, fine-grained classification (celebrities, car models), spatial reasoning, or compositional queries. Activate on "CLIP", "embeddings", "image similarity", "semantic search", "zero-shot classification", "image-text matching".

## Installation

\`\`\`bash
claude skill add clip-aware-embeddings
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- clip
- embeddings
- vision
- similarity
- zero-shot`,
    installCommand: 'claude skill add clip-aware-embeddings',
  },
  {
    id: 'cost-accrual-tracker',
    title: 'Cost Accrual Tracker',
    description: "Track real-time API cost accrual during LLM execution. Activate on 'cost tracking', 'token usage', 'API costs', 'budget monitoring', 'usage metrics'. NOT for cost estimation, pricing tiers, or billing systems.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Cost Accrual Tracker

Track real-time API cost accrual during LLM execution. Activate on 'cost tracking', 'token usage', 'API costs', 'budget monitoring', 'usage metrics'. NOT for cost estimation, pricing tiers, or billing systems.

## Installation

\`\`\`bash
claude skill add cost-accrual-tracker
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add cost-accrual-tracker',
  },
  {
    id: 'cost-verification-auditor',
    title: 'Cost Verification Auditor',
    description: "Audit LLM token cost estimates against actual API usage. Activate on 'cost verification', 'token estimate accuracy', 'API cost audit', 'estimation variance'. NOT for pricing lookups, budget planning, or cost optimization strategies.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Cost Verification Auditor

Audit LLM token cost estimates against actual API usage. Activate on 'cost verification', 'token estimate accuracy', 'API cost audit', 'estimation variance'. NOT for pricing lookups, budget planning, or cost optimization strategies.

## Installation

\`\`\`bash
claude skill add cost-verification-auditor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add cost-verification-auditor',
  },
  {
    id: 'crisis-detection-intervention-ai',
    title: 'Crisis Detection Intervention Ai',
    description: "Detect crisis signals in user content using NLP, mental health sentiment analysis, and safe intervention protocols. Implements suicide ideation detection, automated escalation, and crisis resource integration. Use for mental health apps, recovery platforms, support communities. Activate on \"crisis detection\", \"suicide prevention\", \"mental health NLP\", \"intervention protocol\". NOT for general sentiment analysis, medical diagnosis, or replacing professional help.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Crisis Detection Intervention Ai

Detect crisis signals in user content using NLP, mental health sentiment analysis, and safe intervention protocols. Implements suicide ideation detection, automated escalation, and crisis resource integration. Use for mental health apps, recovery platforms, support communities. Activate on "crisis detection", "suicide prevention", "mental health NLP", "intervention protocol". NOT for general sentiment analysis, medical diagnosis, or replacing professional help.

## Installation

\`\`\`bash
claude skill add crisis-detection-intervention-ai
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add crisis-detection-intervention-ai',
  },
  {
    id: 'data-viz-2025',
    title: 'Data Viz 2025',
    description: "State-of-the-art data visualization for React/Next.js/TypeScript with Tailwind CSS. Creates compelling, tested, and accessible visualizations following Tufte principles and NYT Graphics standards. Activate on \"data viz\", \"chart\", \"graph\", \"visualization\", \"dashboard\", \"plot\", \"Recharts\", \"Nivo\", \"D3\". NOT for static images, print graphics, or basic HTML tables.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Data Viz 2025

State-of-the-art data visualization for React/Next.js/TypeScript with Tailwind CSS. Creates compelling, tested, and accessible visualizations following Tufte principles and NYT Graphics standards. Activate on "data viz", "chart", "graph", "visualization", "dashboard", "plot", "Recharts", "Nivo", "D3". NOT for static images, print graphics, or basic HTML tables.

## Installation

\`\`\`bash
claude skill add data-viz-2025
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add data-viz-2025',
  },
  {
    id: 'drone-cv-expert',
    title: 'Drone Cv Expert',
    description: "Expert in drone systems, computer vision, and autonomous navigation. Specializes in flight control, SLAM, object detection, sensor fusion, and path planning. Activate on \"drone\", \"UAV\", \"SLAM\", \"visual odometry\", \"PID control\", \"MAVLink\", \"Pixhawk\", \"path planning\", \"A*\", \"RRT\", \"EKF\", \"sensor fusion\", \"optical flow\", \"ByteTrack\". NOT for domain-specific inspection tasks like fire detection, roof damage assessment, or thermal analysis (use drone-inspection-specialist), GPU shader optimization (use metal-shader-expert), or general image classification without drone context (use clip-aware-embeddings).",
    category: 'development',
    icon: '🤖',
    tags: ["drone","slam","navigation","sensor-fusion","path-planning"],
    difficulty: 'intermediate',
    content: `# Drone Cv Expert

Expert in drone systems, computer vision, and autonomous navigation. Specializes in flight control, SLAM, object detection, sensor fusion, and path planning. Activate on "drone", "UAV", "SLAM", "visual odometry", "PID control", "MAVLink", "Pixhawk", "path planning", "A*", "RRT", "EKF", "sensor fusion", "optical flow", "ByteTrack". NOT for domain-specific inspection tasks like fire detection, roof damage assessment, or thermal analysis (use drone-inspection-specialist), GPU shader optimization (use metal-shader-expert), or general image classification without drone context (use clip-aware-embeddings).

## Installation

\`\`\`bash
claude skill add drone-cv-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- drone
- slam
- navigation
- sensor-fusion
- path-planning`,
    installCommand: 'claude skill add drone-cv-expert',
  },
  {
    id: 'drone-inspection-specialist',
    title: 'Drone Inspection Specialist',
    description: "Advanced CV for infrastructure inspection including forest fire detection, wildfire precondition assessment, roof inspection, hail damage analysis, thermal imaging, and 3D Gaussian Splatting reconstruction. Expert in multi-modal detection, insurance risk modeling, and reinsurance data pipelines. Activate on \"fire detection\", \"wildfire risk\", \"roof inspection\", \"hail damage\", \"thermal analysis\", \"Gaussian Splatting\", \"3DGS\", \"insurance inspection\", \"defensible space\", \"property assessment\", \"catastrophe modeling\", \"NDVI\", \"fuel load\". NOT for general drone flight control, SLAM, path planning, or sensor fusion (use drone-cv-expert), GPU shader development (use metal-shader-expert), or generic object detection without inspection context (use clip-aware-embeddings).",
    category: 'development',
    icon: '🤖',
    tags: ["inspection","fire-detection","thermal","gaussian-splatting","insurance"],
    difficulty: 'intermediate',
    content: `# Drone Inspection Specialist

Advanced CV for infrastructure inspection including forest fire detection, wildfire precondition assessment, roof inspection, hail damage analysis, thermal imaging, and 3D Gaussian Splatting reconstruction. Expert in multi-modal detection, insurance risk modeling, and reinsurance data pipelines. Activate on "fire detection", "wildfire risk", "roof inspection", "hail damage", "thermal analysis", "Gaussian Splatting", "3DGS", "insurance inspection", "defensible space", "property assessment", "catastrophe modeling", "NDVI", "fuel load". NOT for general drone flight control, SLAM, path planning, or sensor fusion (use drone-cv-expert), GPU shader development (use metal-shader-expert), or generic object detection without inspection context (use clip-aware-embeddings).

## Installation

\`\`\`bash
claude skill add drone-inspection-specialist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- inspection
- fire-detection
- thermal
- gaussian-splatting
- insurance`,
    installCommand: 'claude skill add drone-inspection-specialist',
  },
  {
    id: 'event-detection-temporal-intelligence-expert',
    title: 'Event Detection Temporal Intelligence Expert',
    description: "Expert in temporal event detection, spatio-temporal clustering (ST-DBSCAN), and photo context understanding. Use for detecting photo events, clustering by time/location, shareability prediction, place recognition, event significance scoring, and life event detection. Activate on 'event detection', 'temporal clustering', 'ST-DBSCAN', 'spatio-temporal', 'shareability prediction', 'place recognition', 'life events', 'photo events', 'temporal diversity'. NOT for individual photo aesthetic quality (use photo-composition-critic), color palette analysis (use color-theory-palette-harmony-expert), face recognition implementation (use photo-content-recognition-curation-expert), or basic EXIF timestamp extraction.",
    category: 'development',
    icon: '🤖',
    tags: ["temporal","clustering","events","spatio-temporal","photo-context"],
    difficulty: 'intermediate',
    content: `# Event Detection Temporal Intelligence Expert

Expert in temporal event detection, spatio-temporal clustering (ST-DBSCAN), and photo context understanding. Use for detecting photo events, clustering by time/location, shareability prediction, place recognition, event significance scoring, and life event detection. Activate on 'event detection', 'temporal clustering', 'ST-DBSCAN', 'spatio-temporal', 'shareability prediction', 'place recognition', 'life events', 'photo events', 'temporal diversity'. NOT for individual photo aesthetic quality (use photo-composition-critic), color palette analysis (use color-theory-palette-harmony-expert), face recognition implementation (use photo-content-recognition-curation-expert), or basic EXIF timestamp extraction.

## Installation

\`\`\`bash
claude skill add event-detection-temporal-intelligence-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- temporal
- clustering
- events
- spatio-temporal
- photo-context`,
    installCommand: 'claude skill add event-detection-temporal-intelligence-expert',
  },
  {
    id: 'form-validation-architect',
    title: 'Form Validation Architect',
    description: "End-to-end form handling with react-hook-form, Zod schemas, validation patterns, error messaging, field arrays, and multi-step wizards. Use for complex forms, validation architecture, autosave, field dependencies. Activate on \"form validation\", \"react-hook-form\", \"Zod\", \"form error\", \"multi-step form\", \"wizard\". NOT for simple HTML forms, backend validation only, or non-React frameworks.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Form Validation Architect

End-to-end form handling with react-hook-form, Zod schemas, validation patterns, error messaging, field arrays, and multi-step wizards. Use for complex forms, validation architecture, autosave, field dependencies. Activate on "form validation", "react-hook-form", "Zod", "form error", "multi-step form", "wizard". NOT for simple HTML forms, backend validation only, or non-React frameworks.

## Installation

\`\`\`bash
claude skill add form-validation-architect
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add form-validation-architect',
  },
  {
    id: 'llm-streaming-response-handler',
    title: 'Llm Streaming Response Handler',
    description: "Build production LLM streaming UIs with Server-Sent Events, real-time token display, cancellation, error recovery. Handles OpenAI/Anthropic/Claude streaming APIs. Use for chatbots, AI assistants, real-time text generation. Activate on \"LLM streaming\", \"SSE\", \"token stream\", \"chat UI\", \"real-time AI\". NOT for batch processing, non-streaming APIs, or WebSocket bidirectional chat.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Llm Streaming Response Handler

Build production LLM streaming UIs with Server-Sent Events, real-time token display, cancellation, error recovery. Handles OpenAI/Anthropic/Claude streaming APIs. Use for chatbots, AI assistants, real-time text generation. Activate on "LLM streaming", "SSE", "token stream", "chat UI", "real-time AI". NOT for batch processing, non-streaming APIs, or WebSocket bidirectional chat.

## Installation

\`\`\`bash
claude skill add llm-streaming-response-handler
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add llm-streaming-response-handler',
  },
  {
    id: 'metal-shader-expert',
    title: 'Metal Shader Expert',
    description: "20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects. Expert in MSL shaders, PBR rendering, tile-based deferred rendering (TBDR), and GPU debugging. Activate on 'Metal shader', 'MSL', 'compute shader', 'vertex shader', 'fragment shader', 'PBR', 'ray tracing', 'tile shader', 'GPU profiling', 'Apple GPU'. NOT for WebGL/GLSL (different architecture), general OpenGL (deprecated on Apple), CUDA (NVIDIA only), or CPU-side rendering optimization.",
    category: 'development',
    icon: '🤖',
    tags: ["metal","shaders","gpu","pbr","apple"],
    difficulty: 'intermediate',
    content: `# Metal Shader Expert

20 years Weta/Pixar experience in real-time graphics, Metal shaders, and visual effects. Expert in MSL shaders, PBR rendering, tile-based deferred rendering (TBDR), and GPU debugging. Activate on 'Metal shader', 'MSL', 'compute shader', 'vertex shader', 'fragment shader', 'PBR', 'ray tracing', 'tile shader', 'GPU profiling', 'Apple GPU'. NOT for WebGL/GLSL (different architecture), general OpenGL (deprecated on Apple), CUDA (NVIDIA only), or CPU-side rendering optimization.

## Installation

\`\`\`bash
claude skill add metal-shader-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- metal
- shaders
- gpu
- pbr
- apple`,
    installCommand: 'claude skill add metal-shader-expert',
  },
  {
    id: 'photo-content-recognition-curation-expert',
    title: 'Photo Content Recognition Curation Expert',
    description: "Expert in photo content recognition, intelligent curation, and quality filtering. Specializes in face/animal/place recognition, perceptual hashing for de-duplication, screenshot/meme detection, burst photo selection, and quick indexing strategies. Activate on 'face recognition', 'face clustering', 'perceptual hash', 'near-duplicate', 'burst photo', 'screenshot detection', 'photo curation', 'photo indexing', 'NSFW detection', 'pet recognition', 'DINOHash', 'HDBSCAN faces'. NOT for GPS-based location clustering (use event-detection-temporal-intelligence-expert), color palette extraction (use color-theory-palette-harmony-expert), semantic image-text matching (use clip-aware-embeddings), or video analysis/frame extraction.",
    category: 'development',
    icon: '🤖',
    tags: ["face-recognition","deduplication","curation","indexing","nsfw"],
    difficulty: 'intermediate',
    content: `# Photo Content Recognition Curation Expert

Expert in photo content recognition, intelligent curation, and quality filtering. Specializes in face/animal/place recognition, perceptual hashing for de-duplication, screenshot/meme detection, burst photo selection, and quick indexing strategies. Activate on 'face recognition', 'face clustering', 'perceptual hash', 'near-duplicate', 'burst photo', 'screenshot detection', 'photo curation', 'photo indexing', 'NSFW detection', 'pet recognition', 'DINOHash', 'HDBSCAN faces'. NOT for GPS-based location clustering (use event-detection-temporal-intelligence-expert), color palette extraction (use color-theory-palette-harmony-expert), semantic image-text matching (use clip-aware-embeddings), or video analysis/frame extraction.

## Installation

\`\`\`bash
claude skill add photo-content-recognition-curation-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- face-recognition
- deduplication
- curation
- indexing
- nsfw`,
    installCommand: 'claude skill add photo-content-recognition-curation-expert',
  },
  {
    id: 'physics-rendering-expert',
    title: 'Physics Rendering Expert',
    description: "Real-time rope/cable physics using Position-Based Dynamics (PBD), Verlet integration, and constraint solvers. Expert in quaternion math, Gauss-Seidel/Jacobi solvers, and tangling detection. Activate on 'rope simulation', 'PBD', 'Position-Based Dynamics', 'Verlet', 'constraint solver', 'quaternion', 'cable dynamics', 'cloth simulation', 'leash physics'. NOT for fluid dynamics (SPH/MPM), fracture simulation (FEM), offline cinematic physics, molecular dynamics, or general game physics engines (use Unity/Unreal built-ins).",
    category: 'development',
    icon: '🤖',
    tags: ["physics","pbd","verlet","simulation","constraints"],
    difficulty: 'intermediate',
    content: `# Physics Rendering Expert

Real-time rope/cable physics using Position-Based Dynamics (PBD), Verlet integration, and constraint solvers. Expert in quaternion math, Gauss-Seidel/Jacobi solvers, and tangling detection. Activate on 'rope simulation', 'PBD', 'Position-Based Dynamics', 'Verlet', 'constraint solver', 'quaternion', 'cable dynamics', 'cloth simulation', 'leash physics'. NOT for fluid dynamics (SPH/MPM), fracture simulation (FEM), offline cinematic physics, molecular dynamics, or general game physics engines (use Unity/Unreal built-ins).

## Installation

\`\`\`bash
claude skill add physics-rendering-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- physics
- pbd
- verlet
- simulation
- constraints`,
    installCommand: 'claude skill add physics-rendering-expert',
  },
  {
    id: 'prompt-engineer',
    title: 'Prompt Engineer',
    description: "Expert prompt optimization for LLMs and AI systems. Use PROACTIVELY when building AI features, improving agent performance, or crafting system prompts. Masters prompt patterns and techniques.",
    category: 'development',
    icon: '🤖',
    tags: ["prompts","llm","optimization","ai","system-design"],
    difficulty: 'intermediate',
    content: `# Prompt Engineer

Expert prompt optimization for LLMs and AI systems. Use PROACTIVELY when building AI features, improving agent performance, or crafting system prompts. Masters prompt patterns and techniques.

## Installation

\`\`\`bash
claude skill add prompt-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- prompts
- llm
- optimization
- ai
- system-design`,
    installCommand: 'claude skill add prompt-engineer',
  },
  {
    id: 'speech-pathology-ai',
    title: 'Speech Pathology Ai',
    description: "Expert speech-language pathologist specializing in AI-powered speech therapy, phoneme analysis, articulation visualization, voice disorders, fluency intervention, and assistive communication technology. Activate on 'speech therapy', 'articulation', 'phoneme analysis', 'voice disorder', 'fluency', 'stuttering', 'AAC', 'pronunciation', 'speech recognition', 'mellifluo.us'. NOT for general audio processing, music production, or voice acting coaching without clinical context.",
    category: 'development',
    icon: '🤖',
    tags: ["speech-therapy","phonemes","articulation","voice","aac"],
    difficulty: 'intermediate',
    content: `# Speech Pathology Ai

Expert speech-language pathologist specializing in AI-powered speech therapy, phoneme analysis, articulation visualization, voice disorders, fluency intervention, and assistive communication technology. Activate on 'speech therapy', 'articulation', 'phoneme analysis', 'voice disorder', 'fluency', 'stuttering', 'AAC', 'pronunciation', 'speech recognition', 'mellifluo.us'. NOT for general audio processing, music production, or voice acting coaching without clinical context.

## Installation

\`\`\`bash
claude skill add speech-pathology-ai
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- speech-therapy
- phonemes
- articulation
- voice
- aac`,
    installCommand: 'claude skill add speech-pathology-ai',
  },
  {
    id: 'vr-avatar-engineer',
    title: 'Vr Avatar Engineer',
    description: "Expert in photorealistic and stylized VR avatar systems for Apple Vision Pro, Meta Quest, and cross-platform metaverse. Specializes in facial tracking (52+ blend shapes), subsurface scattering, Persona-style generation, Photon networking, and real-time LOD. Activate on 'VR avatar', 'Vision Pro Persona', 'Meta avatar', 'facial tracking', 'blend shapes', 'avatar networking', 'photorealistic avatar'. NOT for 2D profile pictures (use image generation), non-VR game characters (use game engine tools), static 3D models (use modeling tools), or motion capture hardware setup.",
    category: 'development',
    icon: '🤖',
    tags: ["vr","avatar","facial-tracking","vision-pro","metaverse"],
    difficulty: 'intermediate',
    content: `# Vr Avatar Engineer

Expert in photorealistic and stylized VR avatar systems for Apple Vision Pro, Meta Quest, and cross-platform metaverse. Specializes in facial tracking (52+ blend shapes), subsurface scattering, Persona-style generation, Photon networking, and real-time LOD. Activate on 'VR avatar', 'Vision Pro Persona', 'Meta avatar', 'facial tracking', 'blend shapes', 'avatar networking', 'photorealistic avatar'. NOT for 2D profile pictures (use image generation), non-VR game characters (use game engine tools), static 3D models (use modeling tools), or motion capture hardware setup.

## Installation

\`\`\`bash
claude skill add vr-avatar-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- vr
- avatar
- facial-tracking
- vision-pro
- metaverse`,
    installCommand: 'claude skill add vr-avatar-engineer',
  },
  {
    id: 'wedding-immortalist',
    title: 'Wedding Immortalist',
    description: "Transform thousands of wedding photos and hours of footage into an immersive 3D Gaussian Splatting experience with theatre mode replay, face-clustered guest roster, and AI-curated best photos per person. Expert in 3DGS pipelines, face clustering, aesthetic scoring, and adaptive design matching the couple's wedding theme (disco, rustic, modern, LGBTQ+ celebrations). Activate on \"wedding photos\", \"wedding video\", \"3D wedding\", \"Gaussian Splatting wedding\", \"wedding memory\", \"wedding immortalize\", \"face clustering wedding\", \"best wedding photos\". NOT for general photo editing (use native-app-designer), non-wedding 3DGS (use drone-inspection-specialist), or event planning (not a wedding planner).",
    category: 'development',
    icon: '🤖',
    tags: ["wedding","3dgs","gaussian-splatting","face-clustering","memories"],
    difficulty: 'intermediate',
    content: `# Wedding Immortalist

Transform thousands of wedding photos and hours of footage into an immersive 3D Gaussian Splatting experience with theatre mode replay, face-clustered guest roster, and AI-curated best photos per person. Expert in 3DGS pipelines, face clustering, aesthetic scoring, and adaptive design matching the couple's wedding theme (disco, rustic, modern, LGBTQ+ celebrations). Activate on "wedding photos", "wedding video", "3D wedding", "Gaussian Splatting wedding", "wedding memory", "wedding immortalize", "face clustering wedding", "best wedding photos". NOT for general photo editing (use native-app-designer), non-wedding 3DGS (use drone-inspection-specialist), or event planning (not a wedding planner).

## Installation

\`\`\`bash
claude skill add wedding-immortalist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- wedding
- 3dgs
- gaussian-splatting
- face-clustering
- memories`,
    installCommand: 'claude skill add wedding-immortalist',
  },
  {
    id: 'windows-3-1-web-designer',
    title: 'Windows 3 1 Web Designer',
    description: "Modern web applications with authentic Windows 3.1 aesthetic. Solid navy title bars, Program Manager navigation, beveled borders, single window controls. Extrapolates Win31 to AI chatbots (Cue Card paradigm), mobile UIs (pocket computing). Activate on 'windows 3.1', 'win31', 'program manager', 'retro desktop', '90s aesthetic', 'beveled'. NOT for Windows 95 (use windows-95-web-designer - has gradients, Start menu), vaporwave/synthwave, macOS, flat design.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Windows 3 1 Web Designer

Modern web applications with authentic Windows 3.1 aesthetic. Solid navy title bars, Program Manager navigation, beveled borders, single window controls. Extrapolates Win31 to AI chatbots (Cue Card paradigm), mobile UIs (pocket computing). Activate on 'windows 3.1', 'win31', 'program manager', 'retro desktop', '90s aesthetic', 'beveled'. NOT for Windows 95 (use windows-95-web-designer - has gradients, Start menu), vaporwave/synthwave, macOS, flat design.

## Installation

\`\`\`bash
claude skill add windows-3-1-web-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add windows-3-1-web-designer',
  },
  {
    id: 'windows-95-web-designer',
    title: 'Windows 95 Web Designer',
    description: "Modern web applications with authentic Windows 95 aesthetic. Gradient title bars, Start menu paradigm, taskbar patterns, 3D beveled chrome. Extrapolates Win95 to AI chatbots, mobile UIs, responsive layouts. Activate on 'windows 95', 'win95', 'start menu', 'taskbar', 'retro desktop', '95 aesthetic', 'clippy'. NOT for Windows 3.1 (use windows-3-1-web-designer), vaporwave/synthwave, macOS, flat design.",
    category: 'development',
    icon: '🤖',
    tags: [],
    difficulty: 'intermediate',
    content: `# Windows 95 Web Designer

Modern web applications with authentic Windows 95 aesthetic. Gradient title bars, Start menu paradigm, taskbar patterns, 3D beveled chrome. Extrapolates Win95 to AI chatbots, mobile UIs, responsive layouts. Activate on 'windows 95', 'win95', 'start menu', 'taskbar', 'retro desktop', '95 aesthetic', 'clippy'. NOT for Windows 3.1 (use windows-3-1-web-designer), vaporwave/synthwave, macOS, flat design.

## Installation

\`\`\`bash
claude skill add windows-95-web-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add windows-95-web-designer',
  },
  {
    id: 'api-architect',
    title: 'Api Architect',
    description: "Expert API designer for REST, GraphQL, gRPC architectures. Activate on: API design, REST API, GraphQL schema, gRPC service, OpenAPI, Swagger, API versioning, endpoint design, rate limiting, OAuth flow. NOT for: database schema (use data-pipeline-engineer), frontend consumption (use web-design-expert), deployment (use devops-automator).",
    category: 'testing',
    icon: '🧪',
    tags: ["api","rest","graphql","grpc","architecture"],
    difficulty: 'intermediate',
    content: `# Api Architect

Expert API designer for REST, GraphQL, gRPC architectures. Activate on: API design, REST API, GraphQL schema, gRPC service, OpenAPI, Swagger, API versioning, endpoint design, rate limiting, OAuth flow. NOT for: database schema (use data-pipeline-engineer), frontend consumption (use web-design-expert), deployment (use devops-automator).

## Installation

\`\`\`bash
claude skill add api-architect
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- api
- rest
- graphql
- grpc
- architecture`,
    installCommand: 'claude skill add api-architect',
  },
  {
    id: 'code-necromancer',
    title: 'Code Necromancer',
    description: "Systematic framework for resurrecting and modernizing legacy codebases through archaeology, resurrection, and rejuvenation phases. Activate on \"legacy code\", \"inherited codebase\", \"no documentation\", \"technical debt\", \"resurrect\", \"modernize\". NOT for greenfield projects or well-documented active codebases.",
    category: 'testing',
    icon: '🧪',
    tags: ["legacy","modernization","technical-debt","archaeology","refactoring"],
    difficulty: 'intermediate',
    content: `# Code Necromancer

Systematic framework for resurrecting and modernizing legacy codebases through archaeology, resurrection, and rejuvenation phases. Activate on "legacy code", "inherited codebase", "no documentation", "technical debt", "resurrect", "modernize". NOT for greenfield projects or well-documented active codebases.

## Installation

\`\`\`bash
claude skill add code-necromancer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- legacy
- modernization
- technical-debt
- archaeology
- refactoring`,
    installCommand: 'claude skill add code-necromancer',
  },
  {
    id: 'code-review-checklist',
    title: 'Code Review Checklist',
    description: "Generates comprehensive, context-aware code review checklists tailored to the specific codebase, programming language, and team standards. Analyzes PR diffs and suggests what reviewers should focus on.",
    category: 'testing',
    icon: '🧪',
    tags: ["code-review","quality","checklist","pr-review","best-practices"],
    difficulty: 'intermediate',
    content: `# Code Review Checklist

Generates comprehensive, context-aware code review checklists tailored to the specific codebase, programming language, and team standards. Analyzes PR diffs and suggests what reviewers should focus on.

## Installation

\`\`\`bash
claude skill add code-review-checklist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- code-review
- quality
- checklist
- pr-review
- best-practices`,
    installCommand: 'claude skill add code-review-checklist',
  },
  {
    id: 'design-critic',
    title: 'Design Critic',
    description: "Aesthetic assessment and design scoring across 6 dimensions. Use for UI critique, design review, visual quality assessment, remix suggestions. Activate on \"design critique\", \"aesthetic review\", \"UI assessment\", \"visual quality\", \"design score\", \"remix this design\". NOT for implementation (use frontend-developer), accessibility-only audits (use color-contrast-auditor), or brand identity creation.",
    category: 'testing',
    icon: '🧪',
    tags: [],
    difficulty: 'intermediate',
    content: `# Design Critic

Aesthetic assessment and design scoring across 6 dimensions. Use for UI critique, design review, visual quality assessment, remix suggestions. Activate on "design critique", "aesthetic review", "UI assessment", "visual quality", "design score", "remix this design". NOT for implementation (use frontend-developer), accessibility-only audits (use color-contrast-auditor), or brand identity creation.

## Installation

\`\`\`bash
claude skill add design-critic
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add design-critic',
  },
  {
    id: 'fullstack-debugger',
    title: 'Fullstack Debugger',
    description: "Expert debugger for Next.js + Cloudflare Workers + Supabase stacks. Systematic troubleshooting for auth, caching, workers, RLS, CORS, and build issues. Activate on: 'debug', 'not working', 'error', 'broken', '500', '401', '403', 'cache issue', 'RLS', 'CORS'. NOT for: feature development (use language skills), architecture design (use system-architect).",
    category: 'testing',
    icon: '🧪',
    tags: ["debugging","nextjs","cloudflare-workers","supabase","troubleshooting"],
    difficulty: 'intermediate',
    content: `# Fullstack Debugger

Expert debugger for Next.js + Cloudflare Workers + Supabase stacks. Systematic troubleshooting for auth, caching, workers, RLS, CORS, and build issues. Activate on: 'debug', 'not working', 'error', 'broken', '500', '401', '403', 'cache issue', 'RLS', 'CORS'. NOT for: feature development (use language skills), architecture design (use system-architect).

## Installation

\`\`\`bash
claude skill add fullstack-debugger
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- debugging
- nextjs
- cloudflare-workers
- supabase
- troubleshooting`,
    installCommand: 'claude skill add fullstack-debugger',
  },
  {
    id: 'github-actions-pipeline-builder',
    title: 'Github Actions Pipeline Builder',
    description: "Build production CI/CD pipelines with GitHub Actions. Implements matrix builds, caching, deployments, testing, security scanning. Use for automated testing, deployments, release workflows. Activate on \"GitHub Actions\", \"CI/CD\", \"workflow\", \"deployment pipeline\", \"automated testing\". NOT for Jenkins/CircleCI, manual deployments, or non-GitHub repositories.",
    category: 'testing',
    icon: '🧪',
    tags: [],
    difficulty: 'intermediate',
    content: `# Github Actions Pipeline Builder

Build production CI/CD pipelines with GitHub Actions. Implements matrix builds, caching, deployments, testing, security scanning. Use for automated testing, deployments, release workflows. Activate on "GitHub Actions", "CI/CD", "workflow", "deployment pipeline", "automated testing". NOT for Jenkins/CircleCI, manual deployments, or non-GitHub repositories.

## Installation

\`\`\`bash
claude skill add github-actions-pipeline-builder
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add github-actions-pipeline-builder',
  },
  {
    id: 'hipaa-compliance',
    title: 'Hipaa Compliance',
    description: "Ensure HIPAA compliance when handling PHI (Protected Health Information). Use when writing code that accesses user health data, check-ins, journal entries, or any sensitive information. Activates for audit logging, data access, security events, and compliance questions.",
    category: 'testing',
    icon: '🧪',
    tags: ["hipaa","compliance","security"],
    difficulty: 'intermediate',
    content: `# Hipaa Compliance

Ensure HIPAA compliance when handling PHI (Protected Health Information). Use when writing code that accesses user health data, check-ins, journal entries, or any sensitive information. Activates for audit logging, data access, security events, and compliance questions.

## Installation

\`\`\`bash
claude skill add hipaa-compliance
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- hipaa
- compliance
- security`,
    installCommand: 'claude skill add hipaa-compliance',
  },
  {
    id: 'playwright-e2e-tester',
    title: 'Playwright E2e Tester',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'testing',
    icon: '🧪',
    tags: ["e2e","playwright","testing","automation","ci-cd","cross-browser"],
    difficulty: 'intermediate',
    content: `# Playwright E2e Tester

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add playwright-e2e-tester
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- e2e
- playwright
- testing
- automation
- ci-cd
- cross-browser`,
    installCommand: 'claude skill add playwright-e2e-tester',
  },
  {
    id: 'refactoring-surgeon',
    title: 'Refactoring Surgeon',
    description: "Expert code refactoring specialist for improving code quality without changing behavior. Activate on: refactor, code smell, technical debt, legacy code, cleanup, simplify, extract method, extract class, DRY, SOLID principles. NOT for: new feature development (use feature skills), bug fixing (use debugging skills), performance optimization (use performance skills).",
    category: 'testing',
    icon: '🧪',
    tags: ["refactoring","code-smells","solid","dry","cleanup"],
    difficulty: 'intermediate',
    content: `# Refactoring Surgeon

Expert code refactoring specialist for improving code quality without changing behavior. Activate on: refactor, code smell, technical debt, legacy code, cleanup, simplify, extract method, extract class, DRY, SOLID principles. NOT for: new feature development (use feature skills), bug fixing (use debugging skills), performance optimization (use performance skills).

## Installation

\`\`\`bash
claude skill add refactoring-surgeon
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- refactoring
- code-smells
- solid
- dry
- cleanup`,
    installCommand: 'claude skill add refactoring-surgeon',
  },
  {
    id: 'rest-api-design',
    title: 'Rest Api Design',
    description: "Design REST API endpoints with Zod validation and OpenAPI documentation. Use when creating new API routes, validating request/response schemas, or updating API documentation. Activates for endpoint design, schema validation, error handling, and API docs.",
    category: 'testing',
    icon: '🧪',
    tags: ["api","code","validation","documentation"],
    difficulty: 'intermediate',
    content: `# Rest Api Design

Design REST API endpoints with Zod validation and OpenAPI documentation. Use when creating new API routes, validating request/response schemas, or updating API documentation. Activates for endpoint design, schema validation, error handling, and API docs.

## Installation

\`\`\`bash
claude skill add rest-api-design
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- api
- code
- validation
- documentation`,
    installCommand: 'claude skill add rest-api-design',
  },
  {
    id: 'security-auditor',
    title: 'Security Auditor',
    description: "Security vulnerability scanner and OWASP compliance auditor for codebases. Dependency scanning (npm audit, pip-audit), secret detection (high-entropy strings, API keys), SAST for injection/XSS vulnerabilities, and security posture reports. Activate on 'security audit', 'vulnerability scan', 'OWASP', 'secret detection', 'dependency check', 'CVE', 'security review', 'penetration testing prep'. NOT for runtime WAF configuration (use infrastructure tools), network security/firewalls, or compliance certifications like SOC2/HIPAA (legal/organizational).",
    category: 'testing',
    icon: '🧪',
    tags: ["security","owasp","vulnerabilities","sast","dependencies"],
    difficulty: 'intermediate',
    content: `# Security Auditor

Security vulnerability scanner and OWASP compliance auditor for codebases. Dependency scanning (npm audit, pip-audit), secret detection (high-entropy strings, API keys), SAST for injection/XSS vulnerabilities, and security posture reports. Activate on 'security audit', 'vulnerability scan', 'OWASP', 'secret detection', 'dependency check', 'CVE', 'security review', 'penetration testing prep'. NOT for runtime WAF configuration (use infrastructure tools), network security/firewalls, or compliance certifications like SOC2/HIPAA (legal/organizational).

## Installation

\`\`\`bash
claude skill add security-auditor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- security
- owasp
- vulnerabilities
- sast
- dependencies`,
    installCommand: 'claude skill add security-auditor',
  },
  {
    id: 'skill-architect',
    title: 'Skill Architect',
    description: "Authoritative meta-skill for creating, auditing, and improving Agent Skills. Combines skill-coach expertise with skill-creator workflows. Use for skill creation, validation, improvement, activation debugging, and progressive disclosure design. NOT for general Claude Code features, runtime debugging, or non-skill coding.",
    category: 'testing',
    icon: '🧪',
    tags: [],
    difficulty: 'intermediate',
    content: `# Skill Architect

Authoritative meta-skill for creating, auditing, and improving Agent Skills. Combines skill-coach expertise with skill-creator workflows. Use for skill creation, validation, improvement, activation debugging, and progressive disclosure design. NOT for general Claude Code features, runtime debugging, or non-skill coding.

## Installation

\`\`\`bash
claude skill add skill-architect
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add skill-architect',
  },
  {
    id: 'test-automation-expert',
    title: 'Test Automation Expert',
    description: "Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks. Guides test pyramid design, coverage optimization, flaky test detection, and CI/CD integration. Activate on 'test strategy', 'unit tests', 'integration tests', 'E2E testing', 'test coverage', 'flaky tests', 'mocking', 'test fixtures', 'TDD', 'BDD', 'test automation'. NOT for manual QA processes, load/performance testing (use performance-engineer), or security testing (use security-auditor).",
    category: 'testing',
    icon: '🧪',
    tags: ["testing","jest","playwright","tdd","coverage"],
    difficulty: 'intermediate',
    content: `# Test Automation Expert

Comprehensive test automation specialist covering unit, integration, and E2E testing strategies. Expert in Jest, Vitest, Playwright, Cypress, pytest, and modern testing frameworks. Guides test pyramid design, coverage optimization, flaky test detection, and CI/CD integration. Activate on 'test strategy', 'unit tests', 'integration tests', 'E2E testing', 'test coverage', 'flaky tests', 'mocking', 'test fixtures', 'TDD', 'BDD', 'test automation'. NOT for manual QA processes, load/performance testing (use performance-engineer), or security testing (use security-auditor).

## Installation

\`\`\`bash
claude skill add test-automation-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- testing
- jest
- playwright
- tdd
- coverage`,
    installCommand: 'claude skill add test-automation-expert',
  },
  {
    id: 'vitest-testing-patterns',
    title: 'Vitest Testing Patterns',
    description: "Write tests using Vitest and React Testing Library. Use when creating unit tests, component tests, integration tests, or mocking dependencies. Activates for test file creation, mock patterns, coverage, and testing best practices.",
    category: 'testing',
    icon: '🧪',
    tags: ["testing","code","automation","jest","react"],
    difficulty: 'intermediate',
    content: `# Vitest Testing Patterns

Write tests using Vitest and React Testing Library. Use when creating unit tests, component tests, integration tests, or mocking dependencies. Activates for test file creation, mock patterns, coverage, and testing best practices.

## Installation

\`\`\`bash
claude skill add vitest-testing-patterns
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- testing
- code
- automation
- jest
- react`,
    installCommand: 'claude skill add vitest-testing-patterns',
  },
  {
    id: 'webapp-testing',
    title: 'Webapp Testing',
    description: "Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. Activate on: Playwright, webapp testing, browser automation, E2E testing, UI testing. NOT for API-only testing without browser, unit tests, or mobile app testing.",
    category: 'testing',
    icon: '🧪',
    tags: ["playwright","e2e","browser","automation","ui-testing"],
    difficulty: 'intermediate',
    content: `# Webapp Testing

Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs. Activate on: Playwright, webapp testing, browser automation, E2E testing, UI testing. NOT for API-only testing without browser, unit tests, or mobile app testing.

## Installation

\`\`\`bash
claude skill add webapp-testing
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- playwright
- e2e
- browser
- automation
- ui-testing`,
    installCommand: 'claude skill add webapp-testing',
  },
  {
    id: 'diagramming-expert',
    title: 'Diagramming Expert',
    description: "Master of text-based visual communication using ASCII art, Unicode box-drawing, and structured diagram notation. Creates clear, maintainable diagrams for systems, processes, hierarchies, relationships, and psychological structures. Proactively generates diagrams to enhance understanding. Activate on visualization needs, system architecture, process flows, psychological mapping, or when complex concepts would benefit from visual representation. NOT for photo editing, vector graphics, or GUI-based design tools.",
    category: 'documentation',
    icon: '✍️',
    tags: ["diagrams","ascii","visualization","architecture","documentation"],
    difficulty: 'intermediate',
    content: `# Diagramming Expert

Master of text-based visual communication using ASCII art, Unicode box-drawing, and structured diagram notation. Creates clear, maintainable diagrams for systems, processes, hierarchies, relationships, and psychological structures. Proactively generates diagrams to enhance understanding. Activate on visualization needs, system architecture, process flows, psychological mapping, or when complex concepts would benefit from visual representation. NOT for photo editing, vector graphics, or GUI-based design tools.

## Installation

\`\`\`bash
claude skill add diagramming-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- diagrams
- ascii
- visualization
- architecture
- documentation`,
    installCommand: 'claude skill add diagramming-expert',
  },
  {
    id: 'document-generation-pdf',
    title: 'Document Generation Pdf',
    description: "Generate, fill, and assemble PDF documents at scale. Handles legal forms, contracts, invoices, certificates. Supports form filling (pdf-lib), template rendering (Puppeteer, LaTeX), digital signatures (DocuSign), and document assembly. Use for legal tech, HR automation, invoice generation. Activate on \"PDF generation\", \"form filling\", \"document automation\", \"digital signatures\". NOT for simple PDF viewing, basic file conversion, or OCR text extraction.",
    category: 'documentation',
    icon: '✍️',
    tags: [],
    difficulty: 'intermediate',
    content: `# Document Generation Pdf

Generate, fill, and assemble PDF documents at scale. Handles legal forms, contracts, invoices, certificates. Supports form filling (pdf-lib), template rendering (Puppeteer, LaTeX), digital signatures (DocuSign), and document assembly. Use for legal tech, HR automation, invoice generation. Activate on "PDF generation", "form filling", "document automation", "digital signatures". NOT for simple PDF viewing, basic file conversion, or OCR text extraction.

## Installation

\`\`\`bash
claude skill add document-generation-pdf
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add document-generation-pdf',
  },
  {
    id: 'email-composer',
    title: 'Email Composer',
    description: "Draft professional emails for various contexts including business, technical, and customer communication. Use when the user needs help writing emails or composing professional messages.",
    category: 'documentation',
    icon: '✍️',
    tags: ["email","communication","professional-writing"],
    difficulty: 'intermediate',
    content: `# Email Composer

Draft professional emails for various contexts including business, technical, and customer communication. Use when the user needs help writing emails or composing professional messages.

## Installation

\`\`\`bash
claude skill add email-composer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- email
- communication
- professional-writing`,
    installCommand: 'claude skill add email-composer',
  },
  {
    id: 'knot-theory-educator',
    title: 'Knot Theory Educator',
    description: "Expert in visualizing and explaining braid theory, knot mathematics, and topological concepts for educational purposes. Use for creating interactive visualizations, explainer cards, step-wise animations, and translating abstract algebra into intuitive understanding. Activate on keywords: braid theory, knot visualization, σ notation, crossing diagrams, Yang-Baxter, topological education. NOT for general math tutoring, pure knot invariant computation, or non-educational knot theory research.",
    category: 'documentation',
    icon: '✍️',
    tags: ["knots","topology","braid-theory","visualization","education"],
    difficulty: 'intermediate',
    content: `# Knot Theory Educator

Expert in visualizing and explaining braid theory, knot mathematics, and topological concepts for educational purposes. Use for creating interactive visualizations, explainer cards, step-wise animations, and translating abstract algebra into intuitive understanding. Activate on keywords: braid theory, knot visualization, σ notation, crossing diagrams, Yang-Baxter, topological education. NOT for general math tutoring, pure knot invariant computation, or non-educational knot theory research.

## Installation

\`\`\`bash
claude skill add knot-theory-educator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- knots
- topology
- braid-theory
- visualization
- education`,
    installCommand: 'claude skill add knot-theory-educator',
  },
  {
    id: 'skill-documentarian',
    title: 'Skill Documentarian',
    description: "Documentation expert for Claude Skills showcase website. Maintains skill-to-website sync, manages tag taxonomy and badges, creates blog-style artifacts, and preserves multi-skill collaborations for posterity. Activate on 'document', 'sync skills', 'create artifact', 'validate skills', 'add tags', 'tag management', 'badge', 'metadata'. NOT for code implementation (use domain skills), design creation (use web-design-expert), testing (use test-automator), or project planning (use orchestrator).",
    category: 'documentation',
    icon: '✍️',
    tags: ["documentation","skills","sync","artifacts","metadata"],
    difficulty: 'intermediate',
    content: `# Skill Documentarian

Documentation expert for Claude Skills showcase website. Maintains skill-to-website sync, manages tag taxonomy and badges, creates blog-style artifacts, and preserves multi-skill collaborations for posterity. Activate on 'document', 'sync skills', 'create artifact', 'validate skills', 'add tags', 'tag management', 'badge', 'metadata'. NOT for code implementation (use domain skills), design creation (use web-design-expert), testing (use test-automator), or project planning (use orchestrator).

## Installation

\`\`\`bash
claude skill add skill-documentarian
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- documentation
- skills
- sync
- artifacts
- metadata`,
    installCommand: 'claude skill add skill-documentarian',
  },
  {
    id: 'technical-writer',
    title: 'Technical Writer',
    description: "Expert technical documentation specialist for developer docs, API references, and runbooks. Activate on: documentation, docs, README, API reference, technical writing, user guide, runbook, ADR, changelog, release notes, tutorial, how-to guide. NOT for: marketing copy (use copywriting skills), blog posts (use content skills), code comments (handled by developers).",
    category: 'documentation',
    icon: '✍️',
    tags: ["documentation","readme","api-docs","tutorials","runbooks"],
    difficulty: 'intermediate',
    content: `# Technical Writer

Expert technical documentation specialist for developer docs, API references, and runbooks. Activate on: documentation, docs, README, API reference, technical writing, user guide, runbook, ADR, changelog, release notes, tutorial, how-to guide. NOT for: marketing copy (use copywriting skills), blog posts (use content skills), code comments (handled by developers).

## Installation

\`\`\`bash
claude skill add technical-writer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- documentation
- readme
- api-docs
- tutorials
- runbooks`,
    installCommand: 'claude skill add technical-writer',
  },
  {
    id: 'video-processing-editing',
    title: 'Video Processing Editing',
    description: "FFmpeg automation for cutting, trimming, concatenating videos. Audio mixing, timeline editing, transitions, effects. Export optimization for YouTube, social media. Subtitle handling, color grading, batch processing. Use for videogen projects, content creation, automated video production. Activate on \"video editing\", \"FFmpeg\", \"trim video\", \"concatenate\", \"transitions\", \"export optimization\". NOT for real-time video editing UI, 3D compositing, or motion graphics.",
    category: 'documentation',
    icon: '✍️',
    tags: [],
    difficulty: 'intermediate',
    content: `# Video Processing Editing

FFmpeg automation for cutting, trimming, concatenating videos. Audio mixing, timeline editing, transitions, effects. Export optimization for YouTube, social media. Subtitle handling, color grading, batch processing. Use for videogen projects, content creation, automated video production. Activate on "video editing", "FFmpeg", "trim video", "concatenate", "transitions", "export optimization". NOT for real-time video editing UI, 3D compositing, or motion graphics.

## Installation

\`\`\`bash
claude skill add video-processing-editing
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add video-processing-editing',
  },
  {
    id: 'chatbot-analytics',
    title: 'Chatbot Analytics',
    description: "Implement AI chatbot analytics and conversation monitoring. Use when adding conversation metrics, tracking AI usage, measuring user engagement with chat, or building conversation dashboards. Activates for AI analytics, token tracking, conversation categorization, and chat performance.",
    category: 'data',
    icon: '📊',
    tags: ["analytics","chatbot","ai-metrics"],
    difficulty: 'intermediate',
    content: `# Chatbot Analytics

Implement AI chatbot analytics and conversation monitoring. Use when adding conversation metrics, tracking AI usage, measuring user engagement with chat, or building conversation dashboards. Activates for AI analytics, token tracking, conversation categorization, and chat performance.

## Installation

\`\`\`bash
claude skill add chatbot-analytics
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- analytics
- chatbot
- ai-metrics`,
    installCommand: 'claude skill add chatbot-analytics',
  },
  {
    id: 'computer-vision-pipeline',
    title: 'Computer Vision Pipeline',
    description: "Build production computer vision pipelines for object detection, tracking, and video analysis. Handles drone footage, wildlife monitoring, and real-time detection. Supports YOLO, Detectron2, TensorFlow, PyTorch. Use for archaeological surveys, conservation, security. Activate on \"object detection\", \"video analysis\", \"YOLO\", \"tracking\", \"drone footage\". NOT for simple image filters, photo editing, or face recognition APIs.",
    category: 'data',
    icon: '📊',
    tags: [],
    difficulty: 'intermediate',
    content: `# Computer Vision Pipeline

Build production computer vision pipelines for object detection, tracking, and video analysis. Handles drone footage, wildlife monitoring, and real-time detection. Supports YOLO, Detectron2, TensorFlow, PyTorch. Use for archaeological surveys, conservation, security. Activate on "object detection", "video analysis", "YOLO", "tracking", "drone footage". NOT for simple image filters, photo editing, or face recognition APIs.

## Installation

\`\`\`bash
claude skill add computer-vision-pipeline
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add computer-vision-pipeline',
  },
  {
    id: 'data-pipeline-engineer',
    title: 'Data Pipeline Engineer',
    description: "Expert data engineer for ETL/ELT pipelines, streaming, data warehousing. Activate on: data pipeline, ETL, ELT, data warehouse, Spark, Kafka, Airflow, dbt, data modeling, star schema, streaming data, batch processing, data quality. NOT for: API design (use api-architect), ML training (use ML skills), dashboards (use design skills).",
    category: 'data',
    icon: '📊',
    tags: ["etl","spark","kafka","airflow","data-warehouse"],
    difficulty: 'intermediate',
    content: `# Data Pipeline Engineer

Expert data engineer for ETL/ELT pipelines, streaming, data warehousing. Activate on: data pipeline, ETL, ELT, data warehouse, Spark, Kafka, Airflow, dbt, data modeling, star schema, streaming data, batch processing, data quality. NOT for: API design (use api-architect), ML training (use ML skills), dashboards (use design skills).

## Installation

\`\`\`bash
claude skill add data-pipeline-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- etl
- spark
- kafka
- airflow
- data-warehouse`,
    installCommand: 'claude skill add data-pipeline-engineer',
  },
  {
    id: 'drizzle-migrations',
    title: 'Drizzle Migrations',
    description: "Manage database schema with Drizzle ORM and SQLite migrations. Use when adding tables, modifying columns, creating indexes, or running migrations. Activates for database schema changes, migration generation, and Drizzle query patterns.",
    category: 'data',
    icon: '📊',
    tags: ["database","drizzle","migrations"],
    difficulty: 'intermediate',
    content: `# Drizzle Migrations

Manage database schema with Drizzle ORM and SQLite migrations. Use when adding tables, modifying columns, creating indexes, or running migrations. Activates for database schema changes, migration generation, and Drizzle query patterns.

## Installation

\`\`\`bash
claude skill add drizzle-migrations
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- database
- drizzle
- migrations`,
    installCommand: 'claude skill add drizzle-migrations',
  },
  {
    id: 'geospatial-data-pipeline',
    title: 'Geospatial Data Pipeline',
    description: "Process, analyze, and visualize geospatial data at scale. Handles drone imagery, GPS tracks, GeoJSON optimization, coordinate transformations, and tile generation. Use for mapping apps, drone data processing, location-based services. Activate on \"geospatial\", \"GIS\", \"PostGIS\", \"GeoJSON\", \"map tiles\", \"coordinate systems\". NOT for simple address validation, basic distance calculations, or static map embeds.",
    category: 'data',
    icon: '📊',
    tags: [],
    difficulty: 'intermediate',
    content: `# Geospatial Data Pipeline

Process, analyze, and visualize geospatial data at scale. Handles drone imagery, GPS tracks, GeoJSON optimization, coordinate transformations, and tile generation. Use for mapping apps, drone data processing, location-based services. Activate on "geospatial", "GIS", "PostGIS", "GeoJSON", "map tiles", "coordinate systems". NOT for simple address validation, basic distance calculations, or static map embeds.

## Installation

\`\`\`bash
claude skill add geospatial-data-pipeline
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add geospatial-data-pipeline',
  },
  {
    id: 'large-scale-map-visualization',
    title: 'Large Scale Map Visualization',
    description: "Master of high-performance web map implementations handling 5,000-100,000+ geographic data points. Specializes in Leaflet.js optimization, Supercluster algorithms, viewport-based loading, canvas rendering, and progressive disclosure UX patterns.",
    category: 'data',
    icon: '📊',
    tags: ["maps","leaflet","geospatial","clustering","performance","visualization","supercluster","react"],
    difficulty: 'intermediate',
    content: `# Large Scale Map Visualization

Master of high-performance web map implementations handling 5,000-100,000+ geographic data points. Specializes in Leaflet.js optimization, Supercluster algorithms, viewport-based loading, canvas rendering, and progressive disclosure UX patterns.

## Installation

\`\`\`bash
claude skill add large-scale-map-visualization
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- maps
- leaflet
- geospatial
- clustering
- performance
- visualization
- supercluster
- react`,
    installCommand: 'claude skill add large-scale-map-visualization',
  },
  {
    id: '2000s-visualization-expert',
    title: '2000s Visualization Expert',
    description: "Expert in 2000s-era music visualization (Milkdrop, AVS, Geiss) and modern WebGL implementations. Specializes in Butterchurn integration, Web Audio API AnalyserNode FFT data, GLSL shaders for audio-reactive visuals, and psychedelic generative art. Activate on \"Milkdrop\", \"music visualization\", \"WebGL visualizer\", \"Butterchurn\", \"audio reactive\", \"FFT visualization\", \"spectrum analyzer\". NOT for simple bar charts/waveforms (use basic canvas), video editing, or non-audio visuals.",
    category: 'design',
    icon: '🎨',
    tags: ["audio","webgl","visualization","shaders","music"],
    difficulty: 'intermediate',
    content: `# 2000s Visualization Expert

Expert in 2000s-era music visualization (Milkdrop, AVS, Geiss) and modern WebGL implementations. Specializes in Butterchurn integration, Web Audio API AnalyserNode FFT data, GLSL shaders for audio-reactive visuals, and psychedelic generative art. Activate on "Milkdrop", "music visualization", "WebGL visualizer", "Butterchurn", "audio reactive", "FFT visualization", "spectrum analyzer". NOT for simple bar charts/waveforms (use basic canvas), video editing, or non-audio visuals.

## Installation

\`\`\`bash
claude skill add 2000s-visualization-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- audio
- webgl
- visualization
- shaders
- music`,
    installCommand: 'claude skill add 2000s-visualization-expert',
  },
  {
    id: 'adhd-design-expert',
    title: 'Adhd Design Expert',
    description: "Designs digital experiences for ADHD brains using neuroscience research and UX principles. Expert in reducing cognitive load, time blindness solutions, dopamine-driven engagement, and compassionate design patterns. Activate on 'ADHD design', 'cognitive load', 'accessibility', 'neurodivergent UX', 'time blindness', 'dopamine-driven', 'executive function'. NOT for general accessibility (WCAG only), neurotypical UX design, or simple UI styling without ADHD context.",
    category: 'design',
    icon: '🎨',
    tags: ["adhd","ux","accessibility","neurodivergent","cognitive-load"],
    difficulty: 'intermediate',
    content: `# Adhd Design Expert

Designs digital experiences for ADHD brains using neuroscience research and UX principles. Expert in reducing cognitive load, time blindness solutions, dopamine-driven engagement, and compassionate design patterns. Activate on 'ADHD design', 'cognitive load', 'accessibility', 'neurodivergent UX', 'time blindness', 'dopamine-driven', 'executive function'. NOT for general accessibility (WCAG only), neurotypical UX design, or simple UI styling without ADHD context.

## Installation

\`\`\`bash
claude skill add adhd-design-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- adhd
- ux
- accessibility
- neurodivergent
- cognitive-load`,
    installCommand: 'claude skill add adhd-design-expert',
  },
  {
    id: 'collage-layout-expert',
    title: 'Collage Layout Expert',
    description: "Expert in ALL computational collage composition: photo mosaics, grid layouts, scrapbook/journal styles, magazine editorial, vision boards, mood boards, social media collages, memory walls, abstract/generative arrangements, and art-historical techniques (Hockney joiners, Dadaist photomontage, Surrealist assemblage, Rauschenberg combines). Masters edge-based assembly, Poisson blending, optimal transport color harmonization, and aesthetic optimization. Activate on 'collage', 'photo mosaic', 'grid layout', 'scrapbook', 'vision board', 'mood board', 'photo wall', 'magazine layout', 'Hockney', 'joiner', 'photomontage'. NOT for simple image editing (use native-app-designer), generating new images (use Stability AI), single photo enhancement (use photo-composition-critic), or basic image similarity search (use clip-aware-embeddings).",
    category: 'design',
    icon: '🎨',
    tags: ["collage","layout","photo-mosaic","composition","blending"],
    difficulty: 'intermediate',
    content: `# Collage Layout Expert

Expert in ALL computational collage composition: photo mosaics, grid layouts, scrapbook/journal styles, magazine editorial, vision boards, mood boards, social media collages, memory walls, abstract/generative arrangements, and art-historical techniques (Hockney joiners, Dadaist photomontage, Surrealist assemblage, Rauschenberg combines). Masters edge-based assembly, Poisson blending, optimal transport color harmonization, and aesthetic optimization. Activate on 'collage', 'photo mosaic', 'grid layout', 'scrapbook', 'vision board', 'mood board', 'photo wall', 'magazine layout', 'Hockney', 'joiner', 'photomontage'. NOT for simple image editing (use native-app-designer), generating new images (use Stability AI), single photo enhancement (use photo-composition-critic), or basic image similarity search (use clip-aware-embeddings).

## Installation

\`\`\`bash
claude skill add collage-layout-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- collage
- layout
- photo-mosaic
- composition
- blending`,
    installCommand: 'claude skill add collage-layout-expert',
  },
  {
    id: 'color-contrast-auditor',
    title: 'Color Contrast Auditor',
    description: "Detects and fixes color contrast violations using WCAG 2.1 guidelines and perceptual analysis. Expert in contrast ratio calculation, color blindness simulation, and providing accessible alternatives. Activate on \"check contrast\", \"color accessibility\", \"WCAG audit\", \"readability check\", \"contrast ratio\", \"hard to read\", \"can't see text\". NOT for general color theory (use color-theory-palette-harmony-expert), brand color selection (use web-design-expert), or non-visual accessibility (use ux-friction-analyzer).",
    category: 'design',
    icon: '🎨',
    tags: ["accessibility","wcag","contrast","color","a11y","visual-design"],
    difficulty: 'intermediate',
    content: `# Color Contrast Auditor

Detects and fixes color contrast violations using WCAG 2.1 guidelines and perceptual analysis. Expert in contrast ratio calculation, color blindness simulation, and providing accessible alternatives. Activate on "check contrast", "color accessibility", "WCAG audit", "readability check", "contrast ratio", "hard to read", "can't see text". NOT for general color theory (use color-theory-palette-harmony-expert), brand color selection (use web-design-expert), or non-visual accessibility (use ux-friction-analyzer).

## Installation

\`\`\`bash
claude skill add color-contrast-auditor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- accessibility
- wcag
- contrast
- color
- a11y
- visual-design`,
    installCommand: 'claude skill add color-contrast-auditor',
  },
  {
    id: 'color-theory-palette-harmony-expert',
    title: 'Color Theory Palette Harmony Expert',
    description: "Expert in color theory, palette harmony, and perceptual color science for computational photo composition. Specializes in earth-mover distance optimization, warm/cool alternation, diversity-aware palette selection, and hue-based photo sequencing. Activate on \"color palette\", \"color harmony\", \"warm cool\", \"earth mover distance\", \"Wasserstein\", \"LAB space\", \"hue sorted\", \"palette matching\". NOT for basic RGB manipulation (use standard image processing), single-photo color grading (use native-app-designer), UI color schemes (use vaporwave-glassomorphic-ui-designer), or color blindness simulation (accessibility specialists).",
    category: 'design',
    icon: '🎨',
    tags: ["color","palette","harmony","lab-space","perceptual"],
    difficulty: 'intermediate',
    content: `# Color Theory Palette Harmony Expert

Expert in color theory, palette harmony, and perceptual color science for computational photo composition. Specializes in earth-mover distance optimization, warm/cool alternation, diversity-aware palette selection, and hue-based photo sequencing. Activate on "color palette", "color harmony", "warm cool", "earth mover distance", "Wasserstein", "LAB space", "hue sorted", "palette matching". NOT for basic RGB manipulation (use standard image processing), single-photo color grading (use native-app-designer), UI color schemes (use vaporwave-glassomorphic-ui-designer), or color blindness simulation (accessibility specialists).

## Installation

\`\`\`bash
claude skill add color-theory-palette-harmony-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- color
- palette
- harmony
- lab-space
- perceptual`,
    installCommand: 'claude skill add color-theory-palette-harmony-expert',
  },
  {
    id: 'dag-visual-editor-design',
    title: 'Dag Visual Editor Design',
    description: "Design modern, intuitive DAG/workflow visual editors that feel like LEGO, not LabView",
    category: 'design',
    icon: '🎨',
    tags: ["dag","workflow","visual-programming","node-editor","react-flow","ux-design"],
    difficulty: 'intermediate',
    content: `# Dag Visual Editor Design

Design modern, intuitive DAG/workflow visual editors that feel like LEGO, not LabView

## Installation

\`\`\`bash
claude skill add dag-visual-editor-design
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- workflow
- visual-programming
- node-editor
- react-flow
- ux-design`,
    installCommand: 'claude skill add dag-visual-editor-design',
  },
  {
    id: 'design-system-creator',
    title: 'Design System Creator',
    description: "Builds comprehensive design systems and design bibles with production-ready CSS. Expert in design tokens, component libraries, CSS architecture. Use for design system creation, token architecture, component documentation, style guide generation. Activate on \"design system\", \"design tokens\", \"CSS architecture\", \"component library\", \"style guide\", \"design bible\". NOT for typography deep-dives (use typography-expert), color theory mathematics (use color-theory-palette-harmony-expert), brand identity strategy (use web-design-expert), or actual UI implementation (use web-design-expert or native-app-designer).",
    category: 'design',
    icon: '🎨',
    tags: ["design-system","tokens","components","css","style-guide"],
    difficulty: 'intermediate',
    content: `# Design System Creator

Builds comprehensive design systems and design bibles with production-ready CSS. Expert in design tokens, component libraries, CSS architecture. Use for design system creation, token architecture, component documentation, style guide generation. Activate on "design system", "design tokens", "CSS architecture", "component library", "style guide", "design bible". NOT for typography deep-dives (use typography-expert), color theory mathematics (use color-theory-palette-harmony-expert), brand identity strategy (use web-design-expert), or actual UI implementation (use web-design-expert or native-app-designer).

## Installation

\`\`\`bash
claude skill add design-system-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- design-system
- tokens
- components
- css
- style-guide`,
    installCommand: 'claude skill add design-system-creator',
  },
  {
    id: 'execution-lifecycle-manager',
    title: 'Execution Lifecycle Manager',
    description: "Manage DAG execution lifecycles including start, stop, pause, resume, and cleanup. Activate on 'execution lifecycle', 'stop execution', 'abort DAG', 'graceful shutdown', 'kill process'. NOT for cost estimation, DAG building, or skill selection.",
    category: 'design',
    icon: '🎨',
    tags: [],
    difficulty: 'intermediate',
    content: `# Execution Lifecycle Manager

Manage DAG execution lifecycles including start, stop, pause, resume, and cleanup. Activate on 'execution lifecycle', 'stop execution', 'abort DAG', 'graceful shutdown', 'kill process'. NOT for cost estimation, DAG building, or skill selection.

## Installation

\`\`\`bash
claude skill add execution-lifecycle-manager
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add execution-lifecycle-manager',
  },
  {
    id: 'frontend-architect',
    title: 'Frontend Architect',
    description: "Frontend stack decisions, Cloudflare deployment patterns, component systems, and internal tools architecture. Use for framework selection, deployment strategy, design system bridging, shadcn setup. Activate on \"frontend architecture\", \"tech stack\", \"Cloudflare Pages\", \"component library\", \"internal tools\", \"shadcn setup\". NOT for writing CSS (use frontend-developer), design critique (use design-critic), or backend APIs.",
    category: 'design',
    icon: '🎨',
    tags: [],
    difficulty: 'intermediate',
    content: `# Frontend Architect

Frontend stack decisions, Cloudflare deployment patterns, component systems, and internal tools architecture. Use for framework selection, deployment strategy, design system bridging, shadcn setup. Activate on "frontend architecture", "tech stack", "Cloudflare Pages", "component library", "internal tools", "shadcn setup". NOT for writing CSS (use frontend-developer), design critique (use design-critic), or backend APIs.

## Installation

\`\`\`bash
claude skill add frontend-architect
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add frontend-architect',
  },
  {
    id: 'hand-drawn-infographic-creator',
    title: 'Hand Drawn Infographic Creator',
    description: "Generate hand-drawn style diagrams and infographics for recovery education articles. Creates anatomist's notebook aesthetic visuals - brain diagrams, timelines, social comparisons, and process flows using continuous line art, semantic color coding, and margin annotations.",
    category: 'design',
    icon: '🎨',
    tags: ["infographics","hand-drawn","diagrams","education","recovery","neuroscience","AI-image-generation","accessibility"],
    difficulty: 'intermediate',
    content: `# Hand Drawn Infographic Creator

Generate hand-drawn style diagrams and infographics for recovery education articles. Creates anatomist's notebook aesthetic visuals - brain diagrams, timelines, social comparisons, and process flows using continuous line art, semantic color coding, and margin annotations.

## Installation

\`\`\`bash
claude skill add hand-drawn-infographic-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- infographics
- hand-drawn
- diagrams
- education
- recovery
- neuroscience
- AI-image-generation
- accessibility`,
    installCommand: 'claude skill add hand-drawn-infographic-creator',
  },
  {
    id: 'interior-design-expert',
    title: 'Interior Design Expert',
    description: "Expert interior designer with deep knowledge of space planning, color theory (Munsell, NCS), lighting design (IES standards), furniture proportions, and AI-assisted visualization. Use for room layout optimization, lighting calculations, color palette selection for interiors, furniture placement, style consultation. Activate on \"interior design\", \"room layout\", \"lighting design\", \"furniture placement\", \"space planning\", \"Munsell color\". NOT for exterior/landscape design, architectural structure, web/UI design (use web-design-expert), brand color theory (use color-theory-palette-harmony-expert), or building codes/permits.",
    category: 'design',
    icon: '🎨',
    tags: ["interior","lighting","furniture","space-planning","color"],
    difficulty: 'intermediate',
    content: `# Interior Design Expert

Expert interior designer with deep knowledge of space planning, color theory (Munsell, NCS), lighting design (IES standards), furniture proportions, and AI-assisted visualization. Use for room layout optimization, lighting calculations, color palette selection for interiors, furniture placement, style consultation. Activate on "interior design", "room layout", "lighting design", "furniture placement", "space planning", "Munsell color". NOT for exterior/landscape design, architectural structure, web/UI design (use web-design-expert), brand color theory (use color-theory-palette-harmony-expert), or building codes/permits.

## Installation

\`\`\`bash
claude skill add interior-design-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- interior
- lighting
- furniture
- space-planning
- color`,
    installCommand: 'claude skill add interior-design-expert',
  },
  {
    id: 'maximalist-wall-decorator',
    title: 'Maximalist Wall Decorator',
    description: "Expert in maximalist interior wall decoration including bold color choices, freehand paintings, statement wallpapers, eclectic lamp arrangements, gallery walls, and curated chaos. Embraces \"more is more\" philosophy with sophisticated color theory and composition. Activate on \"wall decor\", \"maximalist design\", \"bold colors\", \"gallery wall\", \"statement wallpaper\", \"freehand painting\", \"eclectic style\", \"accent wall\", \"lamp collection\", \"more is more\", \"silly decor\". NOT for minimalist design (different aesthetic), exterior design (use fancy-yard-landscaper), or professional murals (consult mural artists).",
    category: 'design',
    icon: '🎨',
    tags: ["maximalist","wall-decor","bold","gallery-wall","eclectic"],
    difficulty: 'intermediate',
    content: `# Maximalist Wall Decorator

Expert in maximalist interior wall decoration including bold color choices, freehand paintings, statement wallpapers, eclectic lamp arrangements, gallery walls, and curated chaos. Embraces "more is more" philosophy with sophisticated color theory and composition. Activate on "wall decor", "maximalist design", "bold colors", "gallery wall", "statement wallpaper", "freehand painting", "eclectic style", "accent wall", "lamp collection", "more is more", "silly decor". NOT for minimalist design (different aesthetic), exterior design (use fancy-yard-landscaper), or professional murals (consult mural artists).

## Installation

\`\`\`bash
claude skill add maximalist-wall-decorator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- maximalist
- wall-decor
- bold
- gallery-wall
- eclectic`,
    installCommand: 'claude skill add maximalist-wall-decorator',
  },
  {
    id: 'mobile-ux-optimizer',
    title: 'Mobile Ux Optimizer',
    description: "Mobile-first UX optimization for touch interfaces, responsive layouts, and performance. Use for viewport handling, touch targets, gestures, mobile navigation. Activate on mobile, touch, responsive, dvh, viewport, safe area, hamburger menu. NOT for native app development (use React Native skills), desktop-only features, or general CSS (use Tailwind docs).",
    category: 'design',
    icon: '🎨',
    tags: ["mobile","ux","touch","responsive","viewport","safe-area","navigation"],
    difficulty: 'intermediate',
    content: `# Mobile Ux Optimizer

Mobile-first UX optimization for touch interfaces, responsive layouts, and performance. Use for viewport handling, touch targets, gestures, mobile navigation. Activate on mobile, touch, responsive, dvh, viewport, safe area, hamburger menu. NOT for native app development (use React Native skills), desktop-only features, or general CSS (use Tailwind docs).

## Installation

\`\`\`bash
claude skill add mobile-ux-optimizer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- mobile
- ux
- touch
- responsive
- viewport
- safe-area
- navigation`,
    installCommand: 'claude skill add mobile-ux-optimizer',
  },
  {
    id: 'native-app-designer',
    title: 'Native App Designer',
    description: "Creates breathtaking iOS/Mac and web apps with organic, non-AI aesthetic. Expert in SwiftUI, React animations, physics-based motion, and human-crafted design. Use for iOS/Mac app UI, React/Vue animations, native-feel web apps, physics-based motion design. Activate on \"SwiftUI\", \"iOS app\", \"native app\", \"React animation\", \"motion design\", \"UIKit\", \"physics animation\". NOT for backend logic, API design (use backend-architect), simple static sites (use web-design-expert), or pure graphic design (use design-system-creator).",
    category: 'design',
    icon: '🎨',
    tags: ["ios","swiftui","react","animations","motion"],
    difficulty: 'intermediate',
    content: `# Native App Designer

Creates breathtaking iOS/Mac and web apps with organic, non-AI aesthetic. Expert in SwiftUI, React animations, physics-based motion, and human-crafted design. Use for iOS/Mac app UI, React/Vue animations, native-feel web apps, physics-based motion design. Activate on "SwiftUI", "iOS app", "native app", "React animation", "motion design", "UIKit", "physics animation". NOT for backend logic, API design (use backend-architect), simple static sites (use web-design-expert), or pure graphic design (use design-system-creator).

## Installation

\`\`\`bash
claude skill add native-app-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- ios
- swiftui
- react
- animations
- motion`,
    installCommand: 'claude skill add native-app-designer',
  },
  {
    id: 'neobrutalist-web-designer',
    title: 'Neobrutalist Web Designer',
    description: "Modern web applications with authentic neobrutalist aesthetic. Bold typography, hard shadows (no blur), thick black borders, high-contrast primary colors, raw visual tension. Extrapolates neobrutalism to SaaS dashboards, e-commerce, landing pages, startup MVPs. Activate on 'neobrutalism', 'neubrutalism', 'brutalist', 'bold borders', 'hard shadows', 'raw aesthetic', 'anti-minimalism', 'gumroad style', 'figma style'. NOT for glassmorphism (use vaporwave-glassomorphic-ui-designer), Windows retro (use windows-3-1-web-designer or windows-95-web-designer), soft shadows, gradients, neumorphism.",
    category: 'design',
    icon: '🎨',
    tags: [],
    difficulty: 'intermediate',
    content: `# Neobrutalist Web Designer

Modern web applications with authentic neobrutalist aesthetic. Bold typography, hard shadows (no blur), thick black borders, high-contrast primary colors, raw visual tension. Extrapolates neobrutalism to SaaS dashboards, e-commerce, landing pages, startup MVPs. Activate on 'neobrutalism', 'neubrutalism', 'brutalist', 'bold borders', 'hard shadows', 'raw aesthetic', 'anti-minimalism', 'gumroad style', 'figma style'. NOT for glassmorphism (use vaporwave-glassomorphic-ui-designer), Windows retro (use windows-3-1-web-designer or windows-95-web-designer), soft shadows, gradients, neumorphism.

## Installation

\`\`\`bash
claude skill add neobrutalist-web-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add neobrutalist-web-designer',
  },
  {
    id: 'photo-composition-critic',
    title: 'Photo Composition Critic',
    description: "Expert photography composition critic grounded in graduate-level visual aesthetics education, computational aesthetics research (AVA, NIMA, LAION-Aesthetics, VisualQuality-R1), and professional image analysis with custom tooling. Use for image quality assessment, composition analysis, aesthetic scoring, photo critique. Activate on \"photo critique\", \"composition analysis\", \"image aesthetics\", \"NIMA\", \"AVA dataset\", \"visual quality\". NOT for photo editing/retouching (use native-app-designer), generating images (use Stability AI directly), or basic image processing (use clip-aware-embeddings).",
    category: 'design',
    icon: '🎨',
    tags: ["photography","composition","aesthetics","nima","critique"],
    difficulty: 'intermediate',
    content: `# Photo Composition Critic

Expert photography composition critic grounded in graduate-level visual aesthetics education, computational aesthetics research (AVA, NIMA, LAION-Aesthetics, VisualQuality-R1), and professional image analysis with custom tooling. Use for image quality assessment, composition analysis, aesthetic scoring, photo critique. Activate on "photo critique", "composition analysis", "image aesthetics", "NIMA", "AVA dataset", "visual quality". NOT for photo editing/retouching (use native-app-designer), generating images (use Stability AI directly), or basic image processing (use clip-aware-embeddings).

## Installation

\`\`\`bash
claude skill add photo-composition-critic
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- photography
- composition
- aesthetics
- nima
- critique`,
    installCommand: 'claude skill add photo-composition-critic',
  },
  {
    id: 'pwa-expert',
    title: 'Pwa Expert',
    description: "Progressive Web App development with Service Workers, offline support, and app-like behavior. Use for caching strategies, install prompts, push notifications, background sync. Activate on \"PWA\", \"Service Worker\", \"offline\", \"install prompt\", \"beforeinstallprompt\", \"manifest.json\", \"workbox\", \"cache-first\". NOT for native app development (use React Native), general web performance (use performance docs), or server-side rendering.",
    category: 'design',
    icon: '🎨',
    tags: ["pwa","service-worker","offline","caching","installable","workbox","manifest"],
    difficulty: 'intermediate',
    content: `# Pwa Expert

Progressive Web App development with Service Workers, offline support, and app-like behavior. Use for caching strategies, install prompts, push notifications, background sync. Activate on "PWA", "Service Worker", "offline", "install prompt", "beforeinstallprompt", "manifest.json", "workbox", "cache-first". NOT for native app development (use React Native), general web performance (use performance docs), or server-side rendering.

## Installation

\`\`\`bash
claude skill add pwa-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- pwa
- service-worker
- offline
- caching
- installable
- workbox
- manifest`,
    installCommand: 'claude skill add pwa-expert',
  },
  {
    id: 'real-time-collaboration-engine',
    title: 'Real Time Collaboration Engine',
    description: "Build real-time collaborative editing with WebSockets, OT/CRDT conflict resolution, and presence awareness. Implements cursor tracking, optimistic updates, and offline sync. Use for collaborative editors, whiteboards, video editing. Activate on \"real-time collaboration\", \"WebSocket sync\", \"multiplayer editing\", \"CRDT\", \"presence awareness\". NOT for simple chat, request-response APIs, or single-user apps.",
    category: 'design',
    icon: '🎨',
    tags: [],
    difficulty: 'intermediate',
    content: `# Real Time Collaboration Engine

Build real-time collaborative editing with WebSockets, OT/CRDT conflict resolution, and presence awareness. Implements cursor tracking, optimistic updates, and offline sync. Use for collaborative editors, whiteboards, video editing. Activate on "real-time collaboration", "WebSocket sync", "multiplayer editing", "CRDT", "presence awareness". NOT for simple chat, request-response APIs, or single-user apps.

## Installation

\`\`\`bash
claude skill add real-time-collaboration-engine
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add real-time-collaboration-engine',
  },
  {
    id: 'recovery-app-onboarding',
    title: 'Recovery App Onboarding',
    description: "Expert guidance for designing and implementing onboarding flows in recovery, wellness, and mental health applications. This skill should be used when building onboarding experiences, first-time user flows, feature discovery, or tutorial systems for apps serving vulnerable populations (addiction recovery, mental health, wellness). Activate on \"onboarding\", \"first-time user\", \"tutorial\", \"feature tour\", \"welcome flow\", \"new user experience\", \"app introduction\", \"recovery app UX\". NOT for general mobile UX (use mobile-ux-optimizer), marketing landing pages (use web-design-expert), or native app development (use iOS/Android skills).",
    category: 'design',
    icon: '🎨',
    tags: ["onboarding","recovery","wellness","mental-health","mobile-ux","tutorial","progressive-disclosure"],
    difficulty: 'intermediate',
    content: `# Recovery App Onboarding

Expert guidance for designing and implementing onboarding flows in recovery, wellness, and mental health applications. This skill should be used when building onboarding experiences, first-time user flows, feature discovery, or tutorial systems for apps serving vulnerable populations (addiction recovery, mental health, wellness). Activate on "onboarding", "first-time user", "tutorial", "feature tour", "welcome flow", "new user experience", "app introduction", "recovery app UX". NOT for general mobile UX (use mobile-ux-optimizer), marketing landing pages (use web-design-expert), or native app development (use iOS/Android skills).

## Installation

\`\`\`bash
claude skill add recovery-app-onboarding
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- onboarding
- recovery
- wellness
- mental-health
- mobile-ux
- tutorial
- progressive-disclosure`,
    installCommand: 'claude skill add recovery-app-onboarding',
  },
  {
    id: 'sound-engineer',
    title: 'Sound Engineer',
    description: "Expert in spatial audio, procedural sound design, game audio middleware, and app UX sound design. Specializes in HRTF/Ambisonics, Wwise/FMOD integration, UI sound design, and adaptive music systems. Activate on 'spatial audio', 'HRTF', 'binaural', 'Wwise', 'FMOD', 'procedural sound', 'footstep system', 'adaptive music', 'UI sounds', 'notification audio', 'sonic branding'. NOT for music composition/production (use DAW), audio post-production for film (linear media), voice cloning/TTS (use voice-audio-engineer), podcast editing (use standard audio editors), or hardware design.",
    category: 'design',
    icon: '🎨',
    tags: ["audio","spatial","wwise","fmod","game-audio"],
    difficulty: 'intermediate',
    content: `# Sound Engineer

Expert in spatial audio, procedural sound design, game audio middleware, and app UX sound design. Specializes in HRTF/Ambisonics, Wwise/FMOD integration, UI sound design, and adaptive music systems. Activate on 'spatial audio', 'HRTF', 'binaural', 'Wwise', 'FMOD', 'procedural sound', 'footstep system', 'adaptive music', 'UI sounds', 'notification audio', 'sonic branding'. NOT for music composition/production (use DAW), audio post-production for film (linear media), voice cloning/TTS (use voice-audio-engineer), podcast editing (use standard audio editors), or hardware design.

## Installation

\`\`\`bash
claude skill add sound-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- audio
- spatial
- wwise
- fmod
- game-audio`,
    installCommand: 'claude skill add sound-engineer',
  },
  {
    id: 'typography-expert',
    title: 'Typography Expert',
    description: "Master typographer specializing in font pairing, typographic hierarchy, OpenType features, variable fonts, and performance-optimized web typography. Use for font selection, type scales, web font optimization, and typographic systems. Activate on \"typography\", \"font pairing\", \"type scale\", \"variable fonts\", \"web fonts\", \"OpenType\", \"font loading\". NOT for logo design, icon fonts, general CSS styling, or image-based typography.",
    category: 'design',
    icon: '🎨',
    tags: ["typography","fonts","type-scale","variable-fonts","opentype"],
    difficulty: 'intermediate',
    content: `# Typography Expert

Master typographer specializing in font pairing, typographic hierarchy, OpenType features, variable fonts, and performance-optimized web typography. Use for font selection, type scales, web font optimization, and typographic systems. Activate on "typography", "font pairing", "type scale", "variable fonts", "web fonts", "OpenType", "font loading". NOT for logo design, icon fonts, general CSS styling, or image-based typography.

## Installation

\`\`\`bash
claude skill add typography-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- typography
- fonts
- type-scale
- variable-fonts
- opentype`,
    installCommand: 'claude skill add typography-expert',
  },
  {
    id: 'ux-friction-analyzer',
    title: 'Ux Friction Analyzer',
    description: "Comprehensive UX analysis using cognitive psychology, ADHD-friendly design, Gestalt principles, and flow state engineering. Specializes in friction audits, user journey simulation, cognitive load optimization, and Fitts' Law application. Activate on \"analyze UX\", \"friction audit\", \"user journey\", \"ADHD-friendly\", \"optimize flow\", \"reduce cognitive load\", \"UX audit\", \"conversion optimization\". NOT for visual design execution (use web-design-expert), A/B testing implementation (use frontend-developer), or accessibility compliance auditing (use accessibility-auditor).",
    category: 'design',
    icon: '🎨',
    tags: ["ux","accessibility","cognitive-load","adhd-friendly","user-research"],
    difficulty: 'intermediate',
    content: `# Ux Friction Analyzer

Comprehensive UX analysis using cognitive psychology, ADHD-friendly design, Gestalt principles, and flow state engineering. Specializes in friction audits, user journey simulation, cognitive load optimization, and Fitts' Law application. Activate on "analyze UX", "friction audit", "user journey", "ADHD-friendly", "optimize flow", "reduce cognitive load", "UX audit", "conversion optimization". NOT for visual design execution (use web-design-expert), A/B testing implementation (use frontend-developer), or accessibility compliance auditing (use accessibility-auditor).

## Installation

\`\`\`bash
claude skill add ux-friction-analyzer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- ux
- accessibility
- cognitive-load
- adhd-friendly
- user-research`,
    installCommand: 'claude skill add ux-friction-analyzer',
  },
  {
    id: 'vaporwave-glassomorphic-ui-designer',
    title: 'Vaporwave Glassomorphic Ui Designer',
    description: "Vaporwave + glassomorphic UI designer for photo/memory apps. Masters SwiftUI Material effects, neon pastels, frosted glass blur, retro-futuristic design. Expert in 2025 UI trends (glassmorphism, neubrutalism, Y2K), iOS HIG, dark mode, accessibility, Metal shaders. Activate on 'vaporwave', 'glassmorphism', 'SwiftUI design', 'frosted glass', 'neon aesthetic', 'retro-futuristic', 'Y2K design'. NOT for backend/API (use backend-architect), Windows 3.1 retro (use windows-3-1-web-designer), generic web (use web-design-expert), non-photo apps (use native-app-designer).",
    category: 'design',
    icon: '🎨',
    tags: ["vaporwave","glassmorphism","swiftui","retro-futuristic","neon"],
    difficulty: 'intermediate',
    content: `# Vaporwave Glassomorphic Ui Designer

Vaporwave + glassomorphic UI designer for photo/memory apps. Masters SwiftUI Material effects, neon pastels, frosted glass blur, retro-futuristic design. Expert in 2025 UI trends (glassmorphism, neubrutalism, Y2K), iOS HIG, dark mode, accessibility, Metal shaders. Activate on 'vaporwave', 'glassmorphism', 'SwiftUI design', 'frosted glass', 'neon aesthetic', 'retro-futuristic', 'Y2K design'. NOT for backend/API (use backend-architect), Windows 3.1 retro (use windows-3-1-web-designer), generic web (use web-design-expert), non-photo apps (use native-app-designer).

## Installation

\`\`\`bash
claude skill add vaporwave-glassomorphic-ui-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- vaporwave
- glassmorphism
- swiftui
- retro-futuristic
- neon`,
    installCommand: 'claude skill add vaporwave-glassomorphic-ui-designer',
  },
  {
    id: 'vibe-matcher',
    title: 'Vibe Matcher',
    description: "Synesthete designer that translates emotional vibes and brand keywords into concrete visual DNA (colors, typography, layouts, interactions). Use when users describe desired \"feel\" (edgy, trustworthy, premium, playful, minimal) and need specific design specifications. NOT for technical implementation or coding.",
    category: 'design',
    icon: '🎨',
    tags: ["vibes","brand","aesthetic","synesthesia","mood"],
    difficulty: 'intermediate',
    content: `# Vibe Matcher

Synesthete designer that translates emotional vibes and brand keywords into concrete visual DNA (colors, typography, layouts, interactions). Use when users describe desired "feel" (edgy, trustworthy, premium, playful, minimal) and need specific design specifications. NOT for technical implementation or coding.

## Installation

\`\`\`bash
claude skill add vibe-matcher
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- vibes
- brand
- aesthetic
- synesthesia
- mood`,
    installCommand: 'claude skill add vibe-matcher',
  },
  {
    id: 'voice-audio-engineer',
    title: 'Voice Audio Engineer',
    description: "Expert in voice synthesis, TTS, voice cloning, podcast production, speech processing, and voice UI design via ElevenLabs integration. Specializes in vocal clarity, loudness standards (LUFS), de-essing, dialogue mixing, and voice transformation. Activate on 'TTS', 'text-to-speech', 'voice clone', 'voice synthesis', 'ElevenLabs', 'podcast', 'voice recording', 'speech-to-speech', 'voice UI', 'audiobook', 'dialogue'. NOT for spatial audio (use sound-engineer), music production (use DAW tools), game audio middleware (use sound-engineer), sound effects generation (use sound-engineer with ElevenLabs SFX), or live concert audio.",
    category: 'design',
    icon: '🎨',
    tags: ["voice","tts","elevenlabs","podcast","synthesis"],
    difficulty: 'intermediate',
    content: `# Voice Audio Engineer

Expert in voice synthesis, TTS, voice cloning, podcast production, speech processing, and voice UI design via ElevenLabs integration. Specializes in vocal clarity, loudness standards (LUFS), de-essing, dialogue mixing, and voice transformation. Activate on 'TTS', 'text-to-speech', 'voice clone', 'voice synthesis', 'ElevenLabs', 'podcast', 'voice recording', 'speech-to-speech', 'voice UI', 'audiobook', 'dialogue'. NOT for spatial audio (use sound-engineer), music production (use DAW tools), game audio middleware (use sound-engineer), sound effects generation (use sound-engineer with ElevenLabs SFX), or live concert audio.

## Installation

\`\`\`bash
claude skill add voice-audio-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- voice
- tts
- elevenlabs
- podcast
- synthesis`,
    installCommand: 'claude skill add voice-audio-engineer',
  },
  {
    id: 'web-cloud-designer',
    title: 'Web Cloud Designer',
    description: "Creates realistic cloud effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for atmospheric backgrounds, weather effects, skyboxes, parallax scenes, and decorative cloud elements. Activate on \"cloud effect\", \"SVG clouds\", \"realistic clouds\", \"atmospheric background\", \"sky animation\", \"feTurbulence\", \"weather effects\", \"parallax clouds\". NOT for 3D rendering (use WebGL/Three.js skills), photo manipulation (use image editing tools), weather data APIs (use data integration skills), or simple CSS gradients without volumetric effects.",
    category: 'design',
    icon: '🎨',
    tags: ["svg","css","animation","atmospheric","visual-effects","web"],
    difficulty: 'intermediate',
    content: `# Web Cloud Designer

Creates realistic cloud effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for atmospheric backgrounds, weather effects, skyboxes, parallax scenes, and decorative cloud elements. Activate on "cloud effect", "SVG clouds", "realistic clouds", "atmospheric background", "sky animation", "feTurbulence", "weather effects", "parallax clouds". NOT for 3D rendering (use WebGL/Three.js skills), photo manipulation (use image editing tools), weather data APIs (use data integration skills), or simple CSS gradients without volumetric effects.

## Installation

\`\`\`bash
claude skill add web-cloud-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- svg
- css
- animation
- atmospheric
- visual-effects
- web`,
    installCommand: 'claude skill add web-cloud-designer',
  },
  {
    id: 'web-design-expert',
    title: 'Web Design Expert',
    description: "Creates unique web designs with brand identity, color palettes, typography, and modern UI/UX patterns. Use for brand identity development, visual design systems, layout composition, and responsive web design. Activate on \"web design\", \"brand identity\", \"color palette\", \"UI design\", \"visual design\", \"layout\". NOT for typography details (use typography-expert), color theory deep-dives (use color-theory-expert), design system tokens (use design-system-creator), or code implementation without design direction.",
    category: 'design',
    icon: '🎨',
    tags: ["web","brand","ui-ux","layout","visual-design"],
    difficulty: 'intermediate',
    content: `# Web Design Expert

Creates unique web designs with brand identity, color palettes, typography, and modern UI/UX patterns. Use for brand identity development, visual design systems, layout composition, and responsive web design. Activate on "web design", "brand identity", "color palette", "UI design", "visual design", "layout". NOT for typography details (use typography-expert), color theory deep-dives (use color-theory-expert), design system tokens (use design-system-creator), or code implementation without design direction.

## Installation

\`\`\`bash
claude skill add web-design-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- web
- brand
- ui-ux
- layout
- visual-design`,
    installCommand: 'claude skill add web-design-expert',
  },
  {
    id: 'web-wave-designer',
    title: 'Web Wave Designer',
    description: "Creates realistic ocean and water wave effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for ocean backgrounds, underwater distortion, beach scenes, ripple effects, liquid glass, and water-themed UI. Activate on \"ocean wave\", \"water effect\", \"SVG water\", \"ripple animation\", \"underwater distortion\", \"liquid glass\", \"wave animation\", \"feTurbulence water\", \"beach waves\", \"sea foam\". NOT for 3D ocean simulation (use WebGL/Three.js), video water effects (use video editing), physics-based fluid simulation (use canvas/WebGL), or simple gradient backgrounds without wave motion.",
    category: 'design',
    icon: '🎨',
    tags: ["svg","css","animation","water","ocean","visual-effects","web"],
    difficulty: 'intermediate',
    content: `# Web Wave Designer

Creates realistic ocean and water wave effects for web using SVG filters (feTurbulence, feDisplacementMap), CSS animations, and layering techniques. Use for ocean backgrounds, underwater distortion, beach scenes, ripple effects, liquid glass, and water-themed UI. Activate on "ocean wave", "water effect", "SVG water", "ripple animation", "underwater distortion", "liquid glass", "wave animation", "feTurbulence water", "beach waves", "sea foam". NOT for 3D ocean simulation (use WebGL/Three.js), video water effects (use video editing), physics-based fluid simulation (use canvas/WebGL), or simple gradient backgrounds without wave motion.

## Installation

\`\`\`bash
claude skill add web-wave-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- svg
- css
- animation
- water
- ocean
- visual-effects
- web`,
    installCommand: 'claude skill add web-wave-designer',
  },
  {
    id: 'win31-audio-design',
    title: 'Win31 Audio Design',
    description: "Expert in Windows 3.1 era sound vocabulary for modern web/mobile apps. Creates satisfying retro UI sounds using CC-licensed 8-bit audio, Web Audio API, and haptic coordination. Activate on 'win31 sounds', 'retro audio', '90s sound effects', 'chimes', 'tada', 'ding', 'satisfying UI sounds'. NOT for modern flat UI sounds, voice synthesis, or music composition.",
    category: 'design',
    icon: '🎨',
    tags: ["audio","retro","windows","90s","ui-sounds"],
    difficulty: 'intermediate',
    content: `# Win31 Audio Design

Expert in Windows 3.1 era sound vocabulary for modern web/mobile apps. Creates satisfying retro UI sounds using CC-licensed 8-bit audio, Web Audio API, and haptic coordination. Activate on 'win31 sounds', 'retro audio', '90s sound effects', 'chimes', 'tada', 'ding', 'satisfying UI sounds'. NOT for modern flat UI sounds, voice synthesis, or music composition.

## Installation

\`\`\`bash
claude skill add win31-audio-design
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- audio
- retro
- windows
- 90s
- ui-sounds`,
    installCommand: 'claude skill add win31-audio-design',
  },
  {
    id: 'win31-pixel-art-designer',
    title: 'Win31 Pixel Art Designer',
    description: "Expert in Windows 3.1 era pixel art and graphics. Creates icons, banners, splash screens, and UI assets with authentic 16/256-color palettes, dithering patterns, and Program Manager styling. Activate on 'win31 icons', 'pixel art 90s', 'retro icons', '16-color', 'dithering', 'program manager icons', 'VGA palette'. NOT for modern flat icons, vaporwave art, or high-res illustrations.",
    category: 'design',
    icon: '🎨',
    tags: ["pixel-art","icons","retro","windows","90s","dithering"],
    difficulty: 'intermediate',
    content: `# Win31 Pixel Art Designer

Expert in Windows 3.1 era pixel art and graphics. Creates icons, banners, splash screens, and UI assets with authentic 16/256-color palettes, dithering patterns, and Program Manager styling. Activate on 'win31 icons', 'pixel art 90s', 'retro icons', '16-color', 'dithering', 'program manager icons', 'VGA palette'. NOT for modern flat icons, vaporwave art, or high-res illustrations.

## Installation

\`\`\`bash
claude skill add win31-pixel-art-designer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- pixel-art
- icons
- retro
- windows
- 90s
- dithering`,
    installCommand: 'claude skill add win31-pixel-art-designer',
  },
  {
    id: 'cloudflare-worker-dev',
    title: 'Cloudflare Worker Dev',
    description: "Cloudflare Workers, KV, Durable Objects, and edge computing development. Use for serverless APIs, caching, rate limiting, real-time features. Activate on \"Workers\", \"KV\", \"Durable Objects\", \"wrangler\", \"edge function\", \"Cloudflare\". NOT for Cloudflare Pages configuration (use deployment docs), DNS management, or general CDN settings.",
    category: 'devops',
    icon: '🔧',
    tags: ["cloudflare","workers","edge-computing","serverless","kv","caching","rate-limiting"],
    difficulty: 'intermediate',
    content: `# Cloudflare Worker Dev

Cloudflare Workers, KV, Durable Objects, and edge computing development. Use for serverless APIs, caching, rate limiting, real-time features. Activate on "Workers", "KV", "Durable Objects", "wrangler", "edge function", "Cloudflare". NOT for Cloudflare Pages configuration (use deployment docs), DNS management, or general CDN settings.

## Installation

\`\`\`bash
claude skill add cloudflare-worker-dev
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- cloudflare
- workers
- edge-computing
- serverless
- kv
- caching
- rate-limiting`,
    installCommand: 'claude skill add cloudflare-worker-dev',
  },
  {
    id: 'devops-automator',
    title: 'Devops Automator',
    description: "Expert DevOps engineer for CI/CD, IaC, Kubernetes, and deployment automation. Activate on: CI/CD, GitHub Actions, Terraform, Docker, Kubernetes, Helm, ArgoCD, GitOps, deployment pipeline, infrastructure as code, container orchestration. NOT for: application code (use language skills), database schema (use data-pipeline-engineer), API design (use api-architect).",
    category: 'devops',
    icon: '🔧',
    tags: ["ci-cd","terraform","docker","kubernetes","gitops"],
    difficulty: 'intermediate',
    content: `# Devops Automator

Expert DevOps engineer for CI/CD, IaC, Kubernetes, and deployment automation. Activate on: CI/CD, GitHub Actions, Terraform, Docker, Kubernetes, Helm, ArgoCD, GitOps, deployment pipeline, infrastructure as code, container orchestration. NOT for: application code (use language skills), database schema (use data-pipeline-engineer), API design (use api-architect).

## Installation

\`\`\`bash
claude skill add devops-automator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- ci-cd
- terraform
- docker
- kubernetes
- gitops`,
    installCommand: 'claude skill add devops-automator',
  },
  {
    id: 'modern-auth-2026',
    title: 'Modern Auth 2026',
    description: "Modern authentication implementation for 2026 - passkeys (WebAuthn), OAuth (Google, Apple), magic links, and cross-device sync. Use for passwordless-first authentication, social login setup, Supabase Auth, Next.js auth flows, and multi-factor authentication. Activate on \"passkeys\", \"WebAuthn\", \"Google Sign-In\", \"Apple Sign-In\", \"magic link\", \"passwordless\", \"authentication\", \"login\", \"OAuth\", \"social login\". NOT for session management without auth (use standard JWT docs), authorization/RBAC (use security-auditor), or API key management (use api-architect).",
    category: 'devops',
    icon: '🔧',
    tags: ["authentication","passkeys","webauthn","oauth","passwordless","supabase","mfa","social-login"],
    difficulty: 'intermediate',
    content: `# Modern Auth 2026

Modern authentication implementation for 2026 - passkeys (WebAuthn), OAuth (Google, Apple), magic links, and cross-device sync. Use for passwordless-first authentication, social login setup, Supabase Auth, Next.js auth flows, and multi-factor authentication. Activate on "passkeys", "WebAuthn", "Google Sign-In", "Apple Sign-In", "magic link", "passwordless", "authentication", "login", "OAuth", "social login". NOT for session management without auth (use standard JWT docs), authorization/RBAC (use security-auditor), or API key management (use api-architect).

## Installation

\`\`\`bash
claude skill add modern-auth-2026
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- authentication
- passkeys
- webauthn
- oauth
- passwordless
- supabase
- mfa
- social-login`,
    installCommand: 'claude skill add modern-auth-2026',
  },
  {
    id: 'site-reliability-engineer',
    title: 'Site Reliability Engineer',
    description: "Docusaurus build health validation and deployment safety for Claude Skills showcase. Pre-commit MDX validation (Liquid syntax, angle brackets, prop mismatches), pre-build link checking, post-build health reports. Activate on 'build errors', 'commit hooks', 'deployment safety', 'site health', 'MDX validation'. NOT for general DevOps (use deployment-engineer), Kubernetes/cloud infrastructure (use kubernetes-architect), runtime monitoring (use observability-engineer), or non-Docusaurus projects.",
    category: 'devops',
    icon: '🔧',
    tags: ["docusaurus","build-health","mdx","validation","deployment"],
    difficulty: 'intermediate',
    content: `# Site Reliability Engineer

Docusaurus build health validation and deployment safety for Claude Skills showcase. Pre-commit MDX validation (Liquid syntax, angle brackets, prop mismatches), pre-build link checking, post-build health reports. Activate on 'build errors', 'commit hooks', 'deployment safety', 'site health', 'MDX validation'. NOT for general DevOps (use deployment-engineer), Kubernetes/cloud infrastructure (use kubernetes-architect), runtime monitoring (use observability-engineer), or non-Docusaurus projects.

## Installation

\`\`\`bash
claude skill add site-reliability-engineer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- docusaurus
- build-health
- mdx
- validation
- deployment`,
    installCommand: 'claude skill add site-reliability-engineer',
  },
  {
    id: 'supabase-admin',
    title: 'Supabase Admin',
    description: "Supabase administration, RLS policies, migrations, and schema design. Use for database architecture, Row Level Security, performance tuning, auth integration. Activate on \"Supabase\", \"RLS\", \"migration\", \"policy\", \"schema\", \"auth.uid()\". NOT for Supabase Auth UI configuration (use dashboard), edge functions (use cloudflare-worker-dev), or general SQL without Supabase context.",
    category: 'devops',
    icon: '🔧',
    tags: ["supabase","rls","database","postgres","migration","schema","security"],
    difficulty: 'intermediate',
    content: `# Supabase Admin

Supabase administration, RLS policies, migrations, and schema design. Use for database architecture, Row Level Security, performance tuning, auth integration. Activate on "Supabase", "RLS", "migration", "policy", "schema", "auth.uid()". NOT for Supabase Auth UI configuration (use dashboard), edge functions (use cloudflare-worker-dev), or general SQL without Supabase context.

## Installation

\`\`\`bash
claude skill add supabase-admin
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- supabase
- rls
- database
- postgres
- migration
- schema
- security`,
    installCommand: 'claude skill add supabase-admin',
  },
  {
    id: 'terraform-iac-expert',
    title: 'Terraform Iac Expert',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'devops',
    icon: '🔧',
    tags: ["terraform","iac","infrastructure","aws","gcp","azure","opentofu"],
    difficulty: 'intermediate',
    content: `# Terraform Iac Expert

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add terraform-iac-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- terraform
- iac
- infrastructure
- aws
- gcp
- azure
- opentofu`,
    installCommand: 'claude skill add terraform-iac-expert',
  },
  {
    id: 'vercel-deployment',
    title: 'Vercel Deployment',
    description: "Deploy Next.js applications to Vercel with proper configuration. Use when setting up deployment, configuring environment variables, edge functions, or troubleshooting builds. Activates for deployment issues, environment setup, and Vercel configuration.",
    category: 'devops',
    icon: '🔧',
    tags: ["devops","automation","web","react"],
    difficulty: 'intermediate',
    content: `# Vercel Deployment

Deploy Next.js applications to Vercel with proper configuration. Use when setting up deployment, configuring environment variables, edge functions, or troubleshooting builds. Activates for deployment issues, environment setup, and Vercel configuration.

## Installation

\`\`\`bash
claude skill add vercel-deployment
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- devops
- automation
- web
- react`,
    installCommand: 'claude skill add vercel-deployment',
  },
  {
    id: 'career-biographer',
    title: 'Career Biographer',
    description: "AI-powered career biographer that conducts empathetic interviews, extracts structured career narratives, and transforms professional stories into portfolios, CVs, and personal brand assets. This skill should be used when users want to document their career journey, create professional portfolios, generate CVs, or craft compelling career narratives.",
    category: 'architecture',
    icon: '💼',
    tags: ["career","narrative","portfolio","interviews","storytelling"],
    difficulty: 'intermediate',
    content: `# Career Biographer

AI-powered career biographer that conducts empathetic interviews, extracts structured career narratives, and transforms professional stories into portfolios, CVs, and personal brand assets. This skill should be used when users want to document their career journey, create professional portfolios, generate CVs, or craft compelling career narratives.

## Installation

\`\`\`bash
claude skill add career-biographer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- career
- narrative
- portfolio
- interviews
- storytelling`,
    installCommand: 'claude skill add career-biographer',
  },
  {
    id: 'claude-ecosystem-promoter',
    title: 'Claude Ecosystem Promoter',
    description: "Marketing and promotion specialist for Claude ecosystem technology - MCP servers, skills, plugins, and agents. Expert in community engagement, registry submissions, content marketing, and developer relations. Activate on 'promote MCP', 'share skill', 'market plugin', 'launch agent', 'developer marketing', 'MCP registry'. NOT for creating MCPs/skills (use agent-creator), general marketing (use content-marketer), or SEO optimization (use seo-visibility-expert).",
    category: 'architecture',
    icon: '💼',
    tags: ["marketing","community","mcp","developer-relations","promotion"],
    difficulty: 'intermediate',
    content: `# Claude Ecosystem Promoter

Marketing and promotion specialist for Claude ecosystem technology - MCP servers, skills, plugins, and agents. Expert in community engagement, registry submissions, content marketing, and developer relations. Activate on 'promote MCP', 'share skill', 'market plugin', 'launch agent', 'developer marketing', 'MCP registry'. NOT for creating MCPs/skills (use agent-creator), general marketing (use content-marketer), or SEO optimization (use seo-visibility-expert).

## Installation

\`\`\`bash
claude skill add claude-ecosystem-promoter
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- marketing
- community
- mcp
- developer-relations
- promotion`,
    installCommand: 'claude skill add claude-ecosystem-promoter',
  },
  {
    id: 'cv-creator',
    title: 'Cv Creator',
    description: "Professional CV and resume builder transforming career narratives into ATS-optimized, multi-format resumes. Integrates with career-biographer for data and competitive-cartographer for positioning. Generates PDF, DOCX, LaTeX, JSON Resume, HTML, and Markdown. Activate on 'resume', 'CV', 'ATS optimization', 'job application'. NOT for cover letters, portfolio websites (use web-design-expert), LinkedIn optimization, or interview preparation.",
    category: 'architecture',
    icon: '💼',
    tags: ["resume","ats","career","pdf","latex"],
    difficulty: 'intermediate',
    content: `# Cv Creator

Professional CV and resume builder transforming career narratives into ATS-optimized, multi-format resumes. Integrates with career-biographer for data and competitive-cartographer for positioning. Generates PDF, DOCX, LaTeX, JSON Resume, HTML, and Markdown. Activate on 'resume', 'CV', 'ATS optimization', 'job application'. NOT for cover letters, portfolio websites (use web-design-expert), LinkedIn optimization, or interview preparation.

## Installation

\`\`\`bash
claude skill add cv-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- resume
- ats
- career
- pdf
- latex`,
    installCommand: 'claude skill add cv-creator',
  },
  {
    id: 'indie-monetization-strategist',
    title: 'Indie Monetization Strategist',
    description: "Monetization strategies for indie developers, solopreneurs, and small teams. Covers freemium models, SaaS pricing, sponsorships, donations, email list building, and passive income for developer tools, content sites, and educational apps. Activate on 'monetization', 'make money', 'pricing', 'freemium', 'SaaS', 'sponsorship', 'donations', 'passive income', 'indie hacker'. NOT for enterprise sales, B2B outbound, VC fundraising, or large-scale advertising (use enterprise/marketing skills).",
    category: 'architecture',
    icon: '💼',
    tags: ["monetization","pricing","saas","indie","passive-income"],
    difficulty: 'intermediate',
    content: `# Indie Monetization Strategist

Monetization strategies for indie developers, solopreneurs, and small teams. Covers freemium models, SaaS pricing, sponsorships, donations, email list building, and passive income for developer tools, content sites, and educational apps. Activate on 'monetization', 'make money', 'pricing', 'freemium', 'SaaS', 'sponsorship', 'donations', 'passive income', 'indie hacker'. NOT for enterprise sales, B2B outbound, VC fundraising, or large-scale advertising (use enterprise/marketing skills).

## Installation

\`\`\`bash
claude skill add indie-monetization-strategist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- monetization
- pricing
- saas
- indie
- passive-income`,
    installCommand: 'claude skill add indie-monetization-strategist',
  },
  {
    id: 'job-application-optimizer',
    title: 'Job Application Optimizer',
    description: "Strategic job application planning and Resume SEO optimization. Approaches applications like marketing campaigns with market research, opportunity qualification, and content optimization. Activate on 'optimize resume', 'tailor resume', 'ATS optimization', 'job fit score', 'should I apply'. NOT for initial career narratives (career-biographer), portfolio design (cv-creator), or market positioning (competitive-cartographer).",
    category: 'architecture',
    icon: '💼',
    tags: ["job-search","ats","resume-seo","application","optimization"],
    difficulty: 'intermediate',
    content: `# Job Application Optimizer

Strategic job application planning and Resume SEO optimization. Approaches applications like marketing campaigns with market research, opportunity qualification, and content optimization. Activate on 'optimize resume', 'tailor resume', 'ATS optimization', 'job fit score', 'should I apply'. NOT for initial career narratives (career-biographer), portfolio design (cv-creator), or market positioning (competitive-cartographer).

## Installation

\`\`\`bash
claude skill add job-application-optimizer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- job-search
- ats
- resume-seo
- application
- optimization`,
    installCommand: 'claude skill add job-application-optimizer',
  },
  {
    id: 'personal-finance-coach',
    title: 'Personal Finance Coach',
    description: "Expert personal finance coach with deep knowledge of tax optimization, investment theory (MPT, factor investing), retirement mathematics (Trinity Study, SWR research), and wealth-building strategies grounded in academic research. Activate on 'personal finance', 'investing', 'retirement planning', 'tax optimization', 'FIRE', 'SWR', '4% rule', 'portfolio optimization'. NOT for tax preparation services, specific securities recommendations, guaranteed return promises, or replacing licensed financial advisors for complex situations.",
    category: 'architecture',
    icon: '💼',
    tags: ["finance","investing","fire","tax","retirement"],
    difficulty: 'intermediate',
    content: `# Personal Finance Coach

Expert personal finance coach with deep knowledge of tax optimization, investment theory (MPT, factor investing), retirement mathematics (Trinity Study, SWR research), and wealth-building strategies grounded in academic research. Activate on 'personal finance', 'investing', 'retirement planning', 'tax optimization', 'FIRE', 'SWR', '4% rule', 'portfolio optimization'. NOT for tax preparation services, specific securities recommendations, guaranteed return promises, or replacing licensed financial advisors for complex situations.

## Installation

\`\`\`bash
claude skill add personal-finance-coach
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- finance
- investing
- fire
- tax
- retirement`,
    installCommand: 'claude skill add personal-finance-coach',
  },
  {
    id: 'recovery-app-legal-terms',
    title: 'Recovery App Legal Terms',
    description: "Generate legally-sound terms of service, privacy policies, and medical disclaimers for recovery and wellness applications. Expert in HIPAA, GDPR, CCPA compliance. Activate on 'terms of service', 'privacy policy', 'legal terms', 'medical disclaimer', 'HIPAA', 'user agreement'. NOT for contract negotiation (use attorney), app development (use domain skills), or moderation (use recovery-community-moderator).",
    category: 'architecture',
    icon: '💼',
    tags: ["document","strategy","health","production-ready","beginner-friendly"],
    difficulty: 'beginner',
    content: `# Recovery App Legal Terms

Generate legally-sound terms of service, privacy policies, and medical disclaimers for recovery and wellness applications. Expert in HIPAA, GDPR, CCPA compliance. Activate on 'terms of service', 'privacy policy', 'legal terms', 'medical disclaimer', 'HIPAA', 'user agreement'. NOT for contract negotiation (use attorney), app development (use domain skills), or moderation (use recovery-community-moderator).

## Installation

\`\`\`bash
claude skill add recovery-app-legal-terms
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- document
- strategy
- health
- production-ready
- beginner-friendly`,
    installCommand: 'claude skill add recovery-app-legal-terms',
  },
  {
    id: 'seo-visibility-expert',
    title: 'Seo Visibility Expert',
    description: "Comprehensive SEO, discoverability, and AI crawler optimization for web projects. Use for technical SEO audits, llms.txt/robots.txt setup, schema markup, social launch strategies (Product Hunt, HN, Reddit), and Answer Engine Optimization (AEO). Activate on 'SEO', 'discoverability', 'llms.txt', 'robots.txt', 'Product Hunt', 'launch strategy', 'get traffic', 'be found', 'search ranking'. NOT for paid advertising, PPC campaigns, or social media content creation (use marketing skills).",
    category: 'architecture',
    icon: '💼',
    tags: ["seo","llms-txt","discoverability","product-hunt","aeo"],
    difficulty: 'intermediate',
    content: `# Seo Visibility Expert

Comprehensive SEO, discoverability, and AI crawler optimization for web projects. Use for technical SEO audits, llms.txt/robots.txt setup, schema markup, social launch strategies (Product Hunt, HN, Reddit), and Answer Engine Optimization (AEO). Activate on 'SEO', 'discoverability', 'llms.txt', 'robots.txt', 'Product Hunt', 'launch strategy', 'get traffic', 'be found', 'search ranking'. NOT for paid advertising, PPC campaigns, or social media content creation (use marketing skills).

## Installation

\`\`\`bash
claude skill add seo-visibility-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- seo
- llms-txt
- discoverability
- product-hunt
- aeo`,
    installCommand: 'claude skill add seo-visibility-expert',
  },
  {
    id: 'tech-entrepreneur-coach-adhd',
    title: 'Tech Entrepreneur Coach Adhd',
    description: "Big tech ML engineer to indie founder transition coach. Expert in idea validation, MVP development, marketing, monetization, and sustainable growth for ADHD entrepreneurs. Activate on 'entrepreneur', 'indie founder', 'startup', 'MVP', 'monetization', 'big tech to indie', 'ADHD business', 'app launch', 'side project'. NOT for neurotypical entrepreneurship, VC-backed startups, or traditional business consulting without ADHD context.",
    category: 'architecture',
    icon: '💼',
    tags: ["entrepreneur","adhd","startup","mvp","indie"],
    difficulty: 'intermediate',
    content: `# Tech Entrepreneur Coach Adhd

Big tech ML engineer to indie founder transition coach. Expert in idea validation, MVP development, marketing, monetization, and sustainable growth for ADHD entrepreneurs. Activate on 'entrepreneur', 'indie founder', 'startup', 'MVP', 'monetization', 'big tech to indie', 'ADHD business', 'app launch', 'side project'. NOT for neurotypical entrepreneurship, VC-backed startups, or traditional business consulting without ADHD context.

## Installation

\`\`\`bash
claude skill add tech-entrepreneur-coach-adhd
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- entrepreneur
- adhd
- startup
- mvp
- indie`,
    installCommand: 'claude skill add tech-entrepreneur-coach-adhd',
  },
  {
    id: 'competitive-cartographer',
    title: 'Competitive Cartographer',
    description: "Strategic analyst that maps competitive landscapes, identifies white space opportunities, and provides positioning recommendations. Use when users need competitive analysis, market positioning strategy, differentiation tactics, or \"how do I stand out?\" guidance across any domain (portfolios, products, services). NOT for market size estimation or financial forecasting.",
    category: 'data',
    icon: '🔍',
    tags: ["competitive-analysis","market","positioning","strategy","differentiation"],
    difficulty: 'intermediate',
    content: `# Competitive Cartographer

Strategic analyst that maps competitive landscapes, identifies white space opportunities, and provides positioning recommendations. Use when users need competitive analysis, market positioning strategy, differentiation tactics, or "how do I stand out?" guidance across any domain (portfolios, products, services). NOT for market size estimation or financial forecasting.

## Installation

\`\`\`bash
claude skill add competitive-cartographer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- competitive-analysis
- market
- positioning
- strategy
- differentiation`,
    installCommand: 'claude skill add competitive-cartographer',
  },
  {
    id: 'design-archivist',
    title: 'Design Archivist',
    description: "Long-running design anthropologist that builds comprehensive visual databases from 500-1000 real-world examples, extracting color palettes, typography patterns, layout systems, and interaction design across any domain (portfolios, e-commerce, SaaS, adult content, technical showcases). This skill should be used when users need exhaustive design research, pattern recognition across large example sets, or systematic visual analysis for competitive positioning.",
    category: 'data',
    icon: '🔍',
    tags: ["design-research","patterns","analysis","visual-database","trends"],
    difficulty: 'intermediate',
    content: `# Design Archivist

Long-running design anthropologist that builds comprehensive visual databases from 500-1000 real-world examples, extracting color palettes, typography patterns, layout systems, and interaction design across any domain (portfolios, e-commerce, SaaS, adult content, technical showcases). This skill should be used when users need exhaustive design research, pattern recognition across large example sets, or systematic visual analysis for competitive positioning.

## Installation

\`\`\`bash
claude skill add design-archivist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- design-research
- patterns
- analysis
- visual-database
- trends`,
    installCommand: 'claude skill add design-archivist',
  },
  {
    id: 'hr-network-analyst',
    title: 'Hr Network Analyst',
    description: "Professional network graph analyst identifying Gladwellian superconnectors, mavens, and influence brokers using betweenness centrality, structural holes theory, and multi-source network reconstruction. Activate on 'superconnectors', 'network analysis', 'who knows who', 'professional network', 'influence mapping', 'betweenness centrality'. NOT for surveillance, discrimination, stalking, privacy violation, or speculation without data.",
    category: 'data',
    icon: '🔍',
    tags: ["network","superconnectors","influence","graph-theory","hr"],
    difficulty: 'intermediate',
    content: `# Hr Network Analyst

Professional network graph analyst identifying Gladwellian superconnectors, mavens, and influence brokers using betweenness centrality, structural holes theory, and multi-source network reconstruction. Activate on 'superconnectors', 'network analysis', 'who knows who', 'professional network', 'influence mapping', 'betweenness centrality'. NOT for surveillance, discrimination, stalking, privacy violation, or speculation without data.

## Installation

\`\`\`bash
claude skill add hr-network-analyst
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- network
- superconnectors
- influence
- graph-theory
- hr`,
    installCommand: 'claude skill add hr-network-analyst',
  },
  {
    id: 'product-appeal-analyzer',
    title: 'Product Appeal Analyzer',
    description: "Evaluate product desirability, market positioning, and emotional resonance—the complement to friction analysis. Assess whether users will WANT a product (not just use it), identity fit, trust signals, and value proposition clarity. Activate on \"will they like it\", \"market positioning\", \"appeal analysis\", \"product desirability\", \"value proposition\", \"why would someone choose this\", \"landing page review\", \"conversion optimization\", \"messaging strategy\". NOT for UX friction analysis (use ux-friction-analyzer), visual design implementation (use web-design-expert), or A/B test setup (use frontend-developer).",
    category: 'data',
    icon: '🔍',
    tags: ["product-strategy","marketing","positioning","value-proposition","conversion","user-research"],
    difficulty: 'intermediate',
    content: `# Product Appeal Analyzer

Evaluate product desirability, market positioning, and emotional resonance—the complement to friction analysis. Assess whether users will WANT a product (not just use it), identity fit, trust signals, and value proposition clarity. Activate on "will they like it", "market positioning", "appeal analysis", "product desirability", "value proposition", "why would someone choose this", "landing page review", "conversion optimization", "messaging strategy". NOT for UX friction analysis (use ux-friction-analyzer), visual design implementation (use web-design-expert), or A/B test setup (use frontend-developer).

## Installation

\`\`\`bash
claude skill add product-appeal-analyzer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- product-strategy
- marketing
- positioning
- value-proposition
- conversion
- user-research`,
    installCommand: 'claude skill add product-appeal-analyzer',
  },
  {
    id: 'research-analyst',
    title: 'Research Analyst',
    description: "Conducts thorough landscape research, competitive analysis, best practices evaluation, and evidence-based recommendations. Expert in market research and trend analysis.",
    category: 'data',
    icon: '🔍',
    tags: ["research","analysis","landscape","competitive","evidence-based"],
    difficulty: 'intermediate',
    content: `# Research Analyst

Conducts thorough landscape research, competitive analysis, best practices evaluation, and evidence-based recommendations. Expert in market research and trend analysis.

## Installation

\`\`\`bash
claude skill add research-analyst
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- research
- analysis
- landscape
- competitive
- evidence-based`,
    installCommand: 'claude skill add research-analyst',
  },
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    description: "Extend and modify the admin dashboard, developer portal, and operations console. Use when adding new admin tabs, metrics, monitoring features, or internal tools. Activates for dashboard development, analytics, user management, and internal tooling.",
    category: 'architecture',
    icon: '⚡',
    tags: ["dashboard","admin","internal-tools"],
    difficulty: 'intermediate',
    content: `# Admin Dashboard

Extend and modify the admin dashboard, developer portal, and operations console. Use when adding new admin tabs, metrics, monitoring features, or internal tools. Activates for dashboard development, analytics, user management, and internal tooling.

## Installation

\`\`\`bash
claude skill add admin-dashboard
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dashboard
- admin
- internal-tools`,
    installCommand: 'claude skill add admin-dashboard',
  },
  {
    id: 'agent-creator',
    title: 'Agent Creator',
    description: "Meta-agent for creating new custom agents, skills, and MCP integrations. Expert in agent design, MCP development, skill architecture, and rapid prototyping. Activate on 'create agent', 'new skill', 'MCP server', 'custom tool', 'agent design'. NOT for using existing agents (invoke them directly), general coding (use language-specific skills), or infrastructure setup (use deployment-engineer).",
    category: 'architecture',
    icon: '⚡',
    tags: ["agents","mcp","automation","meta","skill-development"],
    difficulty: 'intermediate',
    content: `# Agent Creator

Meta-agent for creating new custom agents, skills, and MCP integrations. Expert in agent design, MCP development, skill architecture, and rapid prototyping. Activate on 'create agent', 'new skill', 'MCP server', 'custom tool', 'agent design'. NOT for using existing agents (invoke them directly), general coding (use language-specific skills), or infrastructure setup (use deployment-engineer).

## Installation

\`\`\`bash
claude skill add agent-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- agents
- mcp
- automation
- meta
- skill-development`,
    installCommand: 'claude skill add agent-creator',
  },
  {
    id: 'feature-manifest',
    title: 'Feature Manifest',
    description: "Manage feature manifests for code traceability. Use when creating new features, updating existing features, checking feature health, or exploring the feature-to-code relationship. Activates for manifest validation, feature creation, changelog updates, and traceability queries.",
    category: 'architecture',
    icon: '⚡',
    tags: ["feature-management","code-traceability","documentation"],
    difficulty: 'intermediate',
    content: `# Feature Manifest

Manage feature manifests for code traceability. Use when creating new features, updating existing features, checking feature health, or exploring the feature-to-code relationship. Activates for manifest validation, feature creation, changelog updates, and traceability queries.

## Installation

\`\`\`bash
claude skill add feature-manifest
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- feature-management
- code-traceability
- documentation`,
    installCommand: 'claude skill add feature-manifest',
  },
  {
    id: 'liaison',
    title: 'Liaison',
    description: "Human interface agent that translates ecosystem activity into clear, actionable communication. Creates status briefings, decision requests, celebration reports, concern alerts, and opportunity summaries. Use for 'status update', 'brief me', 'what's happening', 'summarize progress', or when complex multi-agent work needs human-readable reporting.",
    category: 'architecture',
    icon: '⚡',
    tags: ["communication","briefings","coordination","human-interface","reporting"],
    difficulty: 'intermediate',
    content: `# Liaison

Human interface agent that translates ecosystem activity into clear, actionable communication. Creates status briefings, decision requests, celebration reports, concern alerts, and opportunity summaries. Use for 'status update', 'brief me', 'what's happening', 'summarize progress', or when complex multi-agent work needs human-readable reporting.

## Installation

\`\`\`bash
claude skill add liaison
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- communication
- briefings
- coordination
- human-interface
- reporting`,
    installCommand: 'claude skill add liaison',
  },
  {
    id: 'mcp-creator',
    title: 'Mcp Creator',
    description: "Expert MCP (Model Context Protocol) server developer creating safe, performant, production-ready servers with proper security, error handling, and developer experience. Activate on 'create MCP', 'MCP server', 'build MCP', 'custom tool server', 'MCP development', 'Model Context Protocol'. NOT for using existing MCPs (just invoke them), general API development (use backend-architect), or skills/agents without external state (use skill-coach/agent-creator).",
    category: 'architecture',
    icon: '⚡',
    tags: ["mcp","model-context-protocol","tools","integration","servers"],
    difficulty: 'intermediate',
    content: `# Mcp Creator

Expert MCP (Model Context Protocol) server developer creating safe, performant, production-ready servers with proper security, error handling, and developer experience. Activate on 'create MCP', 'MCP server', 'build MCP', 'custom tool server', 'MCP development', 'Model Context Protocol'. NOT for using existing MCPs (just invoke them), general API development (use backend-architect), or skills/agents without external state (use skill-coach/agent-creator).

## Installation

\`\`\`bash
claude skill add mcp-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- mcp
- model-context-protocol
- tools
- integration
- servers`,
    installCommand: 'claude skill add mcp-creator',
  },
  {
    id: 'orchestrator',
    title: 'Orchestrator',
    description: "Master coordinator that delegates to specialist skills, synthesizes outputs, AND creates new skills on-the-fly when needed. Expert in problem decomposition, skill orchestration, quality assurance, and skill creation for capability gaps. Use for multi-skill coordination, complex task decomposition, workflow design. Activates on 'orchestrate', 'coordinate', 'multi-skill', 'complex task'. NOT for single-domain tasks or simple linear workflows.",
    category: 'architecture',
    icon: '⚡',
    tags: ["coordination","multi-skill","delegation","synthesis","workflow"],
    difficulty: 'intermediate',
    content: `# Orchestrator

Master coordinator that delegates to specialist skills, synthesizes outputs, AND creates new skills on-the-fly when needed. Expert in problem decomposition, skill orchestration, quality assurance, and skill creation for capability gaps. Use for multi-skill coordination, complex task decomposition, workflow design. Activates on 'orchestrate', 'coordinate', 'multi-skill', 'complex task'. NOT for single-domain tasks or simple linear workflows.

## Installation

\`\`\`bash
claude skill add orchestrator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- coordination
- multi-skill
- delegation
- synthesis
- workflow`,
    installCommand: 'claude skill add orchestrator',
  },
  {
    id: 'project-management-guru-adhd',
    title: 'Project Management Guru Adhd',
    description: "Expert project manager for ADHD engineers managing multiple concurrent projects. Specializes in hyperfocus management, context-switching minimization, and parakeet-style gentle reminders. Activate on 'ADHD project management', 'context switching', 'hyperfocus', 'task prioritization', 'multiple projects', 'productivity for ADHD', 'task chunking', 'deadline management'. NOT for neurotypical project management, rigid waterfall processes, or general productivity advice without ADHD context.",
    category: 'architecture',
    icon: '⚡',
    tags: ["adhd","project-management","context-switching","hyperfocus","deadlines"],
    difficulty: 'intermediate',
    content: `# Project Management Guru Adhd

Expert project manager for ADHD engineers managing multiple concurrent projects. Specializes in hyperfocus management, context-switching minimization, and parakeet-style gentle reminders. Activate on 'ADHD project management', 'context switching', 'hyperfocus', 'task prioritization', 'multiple projects', 'productivity for ADHD', 'task chunking', 'deadline management'. NOT for neurotypical project management, rigid waterfall processes, or general productivity advice without ADHD context.

## Installation

\`\`\`bash
claude skill add project-management-guru-adhd
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- adhd
- project-management
- context-switching
- hyperfocus
- deadlines`,
    installCommand: 'claude skill add project-management-guru-adhd',
  },
  {
    id: 'skill-coach',
    title: 'Skill Coach',
    description: "Guides creation of high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure best practices. Activate on keywords: create skill, review skill, skill quality, skill best practices, skill anti-patterns, improve skill, skill audit. NOT for general coding advice, slash commands, MCP development, or non-skill Claude Code features.",
    category: 'architecture',
    icon: '⚡',
    tags: ["skills","quality","anti-patterns","best-practices","review"],
    difficulty: 'intermediate',
    content: `# Skill Coach

Guides creation of high-quality Agent Skills with domain expertise, anti-pattern detection, and progressive disclosure best practices. Activate on keywords: create skill, review skill, skill quality, skill best practices, skill anti-patterns, improve skill, skill audit. NOT for general coding advice, slash commands, MCP development, or non-skill Claude Code features.

## Installation

\`\`\`bash
claude skill add skill-coach
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- skills
- quality
- anti-patterns
- best-practices
- review`,
    installCommand: 'claude skill add skill-coach',
  },
  {
    id: 'skill-creator',
    title: 'Skill Creator',
    description: "Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.",
    category: 'architecture',
    icon: '⚡',
    tags: ["creation","templates","documentation","beginner-friendly"],
    difficulty: 'beginner',
    content: `# Skill Creator

Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.

## Installation

\`\`\`bash
claude skill add skill-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- creation
- templates
- documentation
- beginner-friendly`,
    installCommand: 'claude skill add skill-creator',
  },
  {
    id: 'skill-logger',
    title: 'Skill Logger',
    description: "Logs and scores skill usage quality, tracking output effectiveness, user satisfaction signals, and improvement opportunities. Expert in skill analytics, quality metrics, feedback loops, and continuous improvement. Activate on \"skill logging\", \"skill quality\", \"skill analytics\", \"skill scoring\", \"skill performance\", \"skill metrics\", \"track skill usage\", \"skill improvement\". NOT for creating skills (use agent-creator), skill documentation (use skill-coach), or runtime debugging (use debugger skills).",
    category: 'architecture',
    icon: '⚡',
    tags: ["logging","analytics","metrics","quality","improvement"],
    difficulty: 'intermediate',
    content: `# Skill Logger

Logs and scores skill usage quality, tracking output effectiveness, user satisfaction signals, and improvement opportunities. Expert in skill analytics, quality metrics, feedback loops, and continuous improvement. Activate on "skill logging", "skill quality", "skill analytics", "skill scoring", "skill performance", "skill metrics", "track skill usage", "skill improvement". NOT for creating skills (use agent-creator), skill documentation (use skill-coach), or runtime debugging (use debugger skills).

## Installation

\`\`\`bash
claude skill add skill-logger
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- logging
- analytics
- metrics
- quality
- improvement`,
    installCommand: 'claude skill add skill-logger',
  },
  {
    id: 'swift-executor',
    title: 'Swift Executor',
    description: "Rapid task execution without hesitation or deterrence. Expert in overcoming blockers, making quick decisions, and maintaining forward momentum. Use for urgent tasks, breaking through impediments, decisive action. Activates on 'swift', 'execute quickly', 'undeterred', 'overcome blocker', 'just do it'. NOT for strategic planning, careful analysis, or research tasks.",
    category: 'architecture',
    icon: '⚡',
    tags: ["execution","urgency","decisiveness","momentum","blockers"],
    difficulty: 'intermediate',
    content: `# Swift Executor

Rapid task execution without hesitation or deterrence. Expert in overcoming blockers, making quick decisions, and maintaining forward momentum. Use for urgent tasks, breaking through impediments, decisive action. Activates on 'swift', 'execute quickly', 'undeterred', 'overcome blocker', 'just do it'. NOT for strategic planning, careful analysis, or research tasks.

## Installation

\`\`\`bash
claude skill add swift-executor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- execution
- urgency
- decisiveness
- momentum
- blockers`,
    installCommand: 'claude skill add swift-executor',
  },
  {
    id: 'team-builder',
    title: 'Team Builder',
    description: "Designs high-performing team structures using organizational psychology AND creates new skills on-the-fly when team needs unmet expertise. Expert in team composition, personality balancing, collaboration ritual design, and skill creation for missing capabilities. Use for team design, role definition, skill gap identification. Activates on 'team building', 'team composition', 'skills needed', 'what skills'. NOT for general project management or solo work planning.",
    category: 'architecture',
    icon: '⚡',
    tags: ["teams","composition","roles","collaboration","skills"],
    difficulty: 'intermediate',
    content: `# Team Builder

Designs high-performing team structures using organizational psychology AND creates new skills on-the-fly when team needs unmet expertise. Expert in team composition, personality balancing, collaboration ritual design, and skill creation for missing capabilities. Use for team design, role definition, skill gap identification. Activates on 'team building', 'team composition', 'skills needed', 'what skills'. NOT for general project management or solo work planning.

## Installation

\`\`\`bash
claude skill add team-builder
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- teams
- composition
- roles
- collaboration
- skills`,
    installCommand: 'claude skill add team-builder',
  },
  {
    id: 'adhd-daily-planner',
    title: 'Adhd Daily Planner',
    description: "Time-blind friendly planning, executive function support, and daily structure for ADHD brains. Specializes in realistic time estimation, dopamine-aware task design, and building systems that actually work for neurodivergent minds.",
    category: 'documentation',
    icon: '🌱',
    tags: ["adhd","productivity","planning","neurodivergent","executive-function"],
    difficulty: 'intermediate',
    content: `# Adhd Daily Planner

Time-blind friendly planning, executive function support, and daily structure for ADHD brains. Specializes in realistic time estimation, dopamine-aware task design, and building systems that actually work for neurodivergent minds.

## Installation

\`\`\`bash
claude skill add adhd-daily-planner
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- adhd
- productivity
- planning
- neurodivergent
- executive-function`,
    installCommand: 'claude skill add adhd-daily-planner',
  },
  {
    id: 'crisis-response-protocol',
    title: 'Crisis Response Protocol',
    description: "Handle mental health crisis situations in AI coaching safely. Use when implementing crisis detection, safety protocols, emergency escalation, or suicide prevention features. Activates for crisis keywords, safety planning, hotline integration, and risk assessment.",
    category: 'documentation',
    icon: '🌱',
    tags: ["mental-health","crisis-intervention","safety"],
    difficulty: 'intermediate',
    content: `# Crisis Response Protocol

Handle mental health crisis situations in AI coaching safely. Use when implementing crisis detection, safety protocols, emergency escalation, or suicide prevention features. Activates for crisis keywords, safety planning, hotline integration, and risk assessment.

## Installation

\`\`\`bash
claude skill add crisis-response-protocol
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- mental-health
- crisis-intervention
- safety`,
    installCommand: 'claude skill add crisis-response-protocol',
  },
  {
    id: 'design-justice',
    title: 'Design Justice',
    description: "Digital equity and trauma-informed design for marginalized populations. Activate on \"accessibility\", \"offline-first\", \"trauma-informed\", \"reentry\", \"recovery population\", \"shared device\", \"unstable phone\", \"digital equity\", \"design justice\", \"low-literacy\", \"intermittent access\". NOT for general UX, marketing optimization, or enterprise SaaS design.",
    category: 'documentation',
    icon: '🌱',
    tags: ["accessibility","trauma-informed","equity","civic-tech","offline-first"],
    difficulty: 'intermediate',
    content: `# Design Justice

Digital equity and trauma-informed design for marginalized populations. Activate on "accessibility", "offline-first", "trauma-informed", "reentry", "recovery population", "shared device", "unstable phone", "digital equity", "design justice", "low-literacy", "intermittent access". NOT for general UX, marketing optimization, or enterprise SaaS design.

## Installation

\`\`\`bash
claude skill add design-justice
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- accessibility
- trauma-informed
- equity
- civic-tech
- offline-first`,
    installCommand: 'claude skill add design-justice',
  },
  {
    id: 'digital-estate-planner',
    title: 'Digital Estate Planner',
    description: "Organizing digital life for legacy, emergency access, and death preparedness. Specializes in password management, account documentation, digital asset preservation, and ensuring loved ones can access what they need.",
    category: 'documentation',
    icon: '🌱',
    tags: ["legacy","passwords","estate","death-preparedness","digital-assets"],
    difficulty: 'intermediate',
    content: `# Digital Estate Planner

Organizing digital life for legacy, emergency access, and death preparedness. Specializes in password management, account documentation, digital asset preservation, and ensuring loved ones can access what they need.

## Installation

\`\`\`bash
claude skill add digital-estate-planner
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- legacy
- passwords
- estate
- death-preparedness
- digital-assets`,
    installCommand: 'claude skill add digital-estate-planner',
  },
  {
    id: 'fancy-yard-landscaper',
    title: 'Fancy Yard Landscaper',
    description: "Expert landscape designer transforming yards through photo mapping, 3D visualization, seasonal planning, and deep plant knowledge. Specializes in fast-growing privacy screens (knows arborvitae pitfalls), architecture-appropriate design, outdoor living spaces, and realistic maintenance expectations. Activate on \"landscape design\", \"yard design\", \"garden planning\", \"plant selection\", \"privacy screen\", \"outdoor living\", \"backyard makeover\", \"arborvitae\", \"hedge\", \"fast growing tree\", \"landscaping ideas\". NOT for interior design (use interior-design-expert), hardscape construction (consult contractors), or lawn care chemicals (consult local experts).",
    category: 'documentation',
    icon: '🌱',
    tags: ["landscaping","garden","plants","outdoor","privacy-screen"],
    difficulty: 'intermediate',
    content: `# Fancy Yard Landscaper

Expert landscape designer transforming yards through photo mapping, 3D visualization, seasonal planning, and deep plant knowledge. Specializes in fast-growing privacy screens (knows arborvitae pitfalls), architecture-appropriate design, outdoor living spaces, and realistic maintenance expectations. Activate on "landscape design", "yard design", "garden planning", "plant selection", "privacy screen", "outdoor living", "backyard makeover", "arborvitae", "hedge", "fast growing tree", "landscaping ideas". NOT for interior design (use interior-design-expert), hardscape construction (consult contractors), or lawn care chemicals (consult local experts).

## Installation

\`\`\`bash
claude skill add fancy-yard-landscaper
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- landscaping
- garden
- plants
- outdoor
- privacy-screen`,
    installCommand: 'claude skill add fancy-yard-landscaper',
  },
  {
    id: 'grief-companion',
    title: 'Grief Companion',
    description: "Compassionate bereavement support, memorial creation, grief education, and healing journey guidance. Specializes in understanding grief stages, creating meaningful tributes, and supporting the non-linear path of loss.",
    category: 'documentation',
    icon: '🌱',
    tags: ["grief","bereavement","memorial","healing","loss"],
    difficulty: 'intermediate',
    content: `# Grief Companion

Compassionate bereavement support, memorial creation, grief education, and healing journey guidance. Specializes in understanding grief stages, creating meaningful tributes, and supporting the non-linear path of loss.

## Installation

\`\`\`bash
claude skill add grief-companion
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- grief
- bereavement
- memorial
- healing
- loss`,
    installCommand: 'claude skill add grief-companion',
  },
  {
    id: 'hrv-alexithymia-expert',
    title: 'Hrv Alexithymia Expert',
    description: "Heart rate variability biometrics and emotional awareness training. Expert in HRV analysis, interoception training, biofeedback, and emotional intelligence. Activate on 'HRV', 'heart rate variability', 'alexithymia', 'biofeedback', 'vagal tone', 'interoception', 'RMSSD', 'autonomic nervous system'. NOT for general fitness tracking without HRV focus, simple heart rate monitoring, or diagnosing medical conditions (only licensed professionals diagnose).",
    category: 'documentation',
    icon: '🌱',
    tags: ["hrv","biofeedback","interoception","emotional-awareness","vagal"],
    difficulty: 'intermediate',
    content: `# Hrv Alexithymia Expert

Heart rate variability biometrics and emotional awareness training. Expert in HRV analysis, interoception training, biofeedback, and emotional intelligence. Activate on 'HRV', 'heart rate variability', 'alexithymia', 'biofeedback', 'vagal tone', 'interoception', 'RMSSD', 'autonomic nervous system'. NOT for general fitness tracking without HRV focus, simple heart rate monitoring, or diagnosing medical conditions (only licensed professionals diagnose).

## Installation

\`\`\`bash
claude skill add hrv-alexithymia-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- hrv
- biofeedback
- interoception
- emotional-awareness
- vagal`,
    installCommand: 'claude skill add hrv-alexithymia-expert',
  },
  {
    id: 'jungian-psychologist',
    title: 'Jungian Psychologist',
    description: "Expert in Jungian analytical psychology, depth psychology, shadow work, archetypal analysis, dream interpretation, active imagination, addiction/recovery through Jungian lens, and the individuation process - grounded in primary sources and clinical frameworks. Activate on 'Jung', 'Jungian', 'shadow work', 'archetypes', 'dream interpretation', 'active imagination', 'individuation', 'anima', 'animus', 'collective unconscious', 'addiction', 'recovery', 'spiritus contra spiritum'. NOT for therapy or diagnosis (only licensed analysts diagnose), active psychosis, severe dissociation, or replacing the relational container of actual Jungian analysis.",
    category: 'documentation',
    icon: '🌱',
    tags: ["jung","archetypes","shadow","dreams","individuation"],
    difficulty: 'intermediate',
    content: `# Jungian Psychologist

Expert in Jungian analytical psychology, depth psychology, shadow work, archetypal analysis, dream interpretation, active imagination, addiction/recovery through Jungian lens, and the individuation process - grounded in primary sources and clinical frameworks. Activate on 'Jung', 'Jungian', 'shadow work', 'archetypes', 'dream interpretation', 'active imagination', 'individuation', 'anima', 'animus', 'collective unconscious', 'addiction', 'recovery', 'spiritus contra spiritum'. NOT for therapy or diagnosis (only licensed analysts diagnose), active psychosis, severe dissociation, or replacing the relational container of actual Jungian analysis.

## Installation

\`\`\`bash
claude skill add jungian-psychologist
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- jung
- archetypes
- shadow
- dreams
- individuation`,
    installCommand: 'claude skill add jungian-psychologist',
  },
  {
    id: 'modern-drug-rehab-computer',
    title: 'Modern Drug Rehab Computer',
    description: "Comprehensive knowledge system for addiction recovery environments, supporting both residential and outpatient (IOP/PHP) patients. Expert in evidence-based treatment modalities (CBT, DBT, MI, EMDR, MAT), recovery resources, coping strategies, crisis intervention, family systems, and holistic wellness. Activate on \"rehab\", \"addiction recovery\", \"substance abuse\", \"treatment center\", \"IOP\", \"PHP\", \"detox\", \"sobriety support\", \"MAT\", \"Suboxone\", \"methadone\", \"12 step\", \"SMART Recovery\". NOT for prescribing medications (consult medical professionals), emergency overdose situations (call 911), or replacing licensed counselors/therapists.",
    category: 'documentation',
    icon: '🌱',
    tags: ["recovery","addiction","treatment","mat","sobriety"],
    difficulty: 'intermediate',
    content: `# Modern Drug Rehab Computer

Comprehensive knowledge system for addiction recovery environments, supporting both residential and outpatient (IOP/PHP) patients. Expert in evidence-based treatment modalities (CBT, DBT, MI, EMDR, MAT), recovery resources, coping strategies, crisis intervention, family systems, and holistic wellness. Activate on "rehab", "addiction recovery", "substance abuse", "treatment center", "IOP", "PHP", "detox", "sobriety support", "MAT", "Suboxone", "methadone", "12 step", "SMART Recovery". NOT for prescribing medications (consult medical professionals), emergency overdose situations (call 911), or replacing licensed counselors/therapists.

## Installation

\`\`\`bash
claude skill add modern-drug-rehab-computer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- recovery
- addiction
- treatment
- mat
- sobriety`,
    installCommand: 'claude skill add modern-drug-rehab-computer',
  },
  {
    id: 'panic-room-finder',
    title: 'Panic Room Finder',
    description: "Expert in residential hollow space detection, hidden room discovery, and safe room planning. Helps map house dimensions, identify anomalies suggesting hidden spaces, and safely explore potential voids. Knowledge of architectural history, construction methods, and non-destructive investigation techniques. Activate on \"panic room\", \"hidden room\", \"secret room\", \"hollow space\", \"house mapping\", \"find hidden space\", \"room dimensions\", \"hidden door\", \"false wall\", \"priest hole\", \"prohibition era\", \"safe room\". NOT for illegal entry, structural modifications without permits, or bypassing security systems.",
    category: 'documentation',
    icon: '🌱',
    tags: ["hidden-rooms","architecture","investigation","safe-room","mapping"],
    difficulty: 'intermediate',
    content: `# Panic Room Finder

Expert in residential hollow space detection, hidden room discovery, and safe room planning. Helps map house dimensions, identify anomalies suggesting hidden spaces, and safely explore potential voids. Knowledge of architectural history, construction methods, and non-destructive investigation techniques. Activate on "panic room", "hidden room", "secret room", "hollow space", "house mapping", "find hidden space", "room dimensions", "hidden door", "false wall", "priest hole", "prohibition era", "safe room". NOT for illegal entry, structural modifications without permits, or bypassing security systems.

## Installation

\`\`\`bash
claude skill add panic-room-finder
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- hidden-rooms
- architecture
- investigation
- safe-room
- mapping`,
    installCommand: 'claude skill add panic-room-finder',
  },
  {
    id: 'partner-text-coach',
    title: 'Partner Text Coach',
    description: "Real-time communication coach for navigating partner/relationship texts. Analyzes incoming messages for emotional subtext, suggests thoughtful responses, helps de-escalate conflict, and provides follow-up conversation strategies. Expert in attachment theory, nonviolent communication (NVC), Gottman research, and healthy relationship dynamics. Activate on \"what should I say\", \"how to respond\", \"partner text\", \"relationship message\", \"what does this mean\", \"text my partner\", \"conversation with partner\". NOT for manipulation tactics, revenge/ghosting advice, replacing couples therapy, or abusive relationships (seek professional help).",
    category: 'documentation',
    icon: '🌱',
    tags: ["relationships","communication","nvc","conflict","attachment"],
    difficulty: 'intermediate',
    content: `# Partner Text Coach

Real-time communication coach for navigating partner/relationship texts. Analyzes incoming messages for emotional subtext, suggests thoughtful responses, helps de-escalate conflict, and provides follow-up conversation strategies. Expert in attachment theory, nonviolent communication (NVC), Gottman research, and healthy relationship dynamics. Activate on "what should I say", "how to respond", "partner text", "relationship message", "what does this mean", "text my partner", "conversation with partner". NOT for manipulation tactics, revenge/ghosting advice, replacing couples therapy, or abusive relationships (seek professional help).

## Installation

\`\`\`bash
claude skill add partner-text-coach
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- relationships
- communication
- nvc
- conflict
- attachment`,
    installCommand: 'claude skill add partner-text-coach',
  },
  {
    id: 'pet-memorial-creator',
    title: 'Pet Memorial Creator',
    description: "Compassionate support for pet loss, memorial creation, and honoring the bond between humans and their animal companions. Specializes in tribute writing, keepsake ideas, and navigating the unique grief of losing a pet.",
    category: 'documentation',
    icon: '🌱',
    tags: ["pets","memorial","grief","tribute","loss"],
    difficulty: 'intermediate',
    content: `# Pet Memorial Creator

Compassionate support for pet loss, memorial creation, and honoring the bond between humans and their animal companions. Specializes in tribute writing, keepsake ideas, and navigating the unique grief of losing a pet.

## Installation

\`\`\`bash
claude skill add pet-memorial-creator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- pets
- memorial
- grief
- tribute
- loss`,
    installCommand: 'claude skill add pet-memorial-creator',
  },
  {
    id: 'recovery-coach-patterns',
    title: 'Recovery Coach Patterns',
    description: "Follow Recovery Coach codebase patterns and conventions. Use when writing new code, components, API routes, or database queries. Activates for general development, code organization, styling, and architectural decisions in this project.",
    category: 'documentation',
    icon: '🌱',
    tags: ["recovery","patterns","next-js"],
    difficulty: 'intermediate',
    content: `# Recovery Coach Patterns

Follow Recovery Coach codebase patterns and conventions. Use when writing new code, components, API routes, or database queries. Activates for general development, code organization, styling, and architectural decisions in this project.

## Installation

\`\`\`bash
claude skill add recovery-coach-patterns
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- recovery
- patterns
- next-js`,
    installCommand: 'claude skill add recovery-coach-patterns',
  },
  {
    id: 'recovery-community-moderator',
    title: 'Recovery Community Moderator',
    description: "Trauma-informed AI moderator for addiction recovery communities. Applies harm reduction principles, honors 12-step traditions, distinguishes healthy conflict from abuse, detects crisis posts. Activate on 'community moderation', 'moderate forum', 'review post', 'check content', 'crisis detection'. NOT for legal documents (use recovery-app-legal-terms), app development (use domain skills), or therapy (use jungian-psychologist).",
    category: 'documentation',
    icon: '🌱',
    tags: ["analysis","validation","health","psychology","production-ready"],
    difficulty: 'advanced',
    content: `# Recovery Community Moderator

Trauma-informed AI moderator for addiction recovery communities. Applies harm reduction principles, honors 12-step traditions, distinguishes healthy conflict from abuse, detects crisis posts. Activate on 'community moderation', 'moderate forum', 'review post', 'check content', 'crisis detection'. NOT for legal documents (use recovery-app-legal-terms), app development (use domain skills), or therapy (use jungian-psychologist).

## Installation

\`\`\`bash
claude skill add recovery-community-moderator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- analysis
- validation
- health
- psychology
- production-ready`,
    installCommand: 'claude skill add recovery-community-moderator',
  },
  {
    id: 'recovery-education-writer',
    title: 'Recovery Education Writer',
    description: "Write neuroscientific, peer-oriented drug education content that roots experiences in body/brain mechanisms. Use when creating educational articles, explaining neurological phenomena, demystifying recovery challenges, or answering \"why does this happen?\" questions. Activates for harm reduction content, psychoeducation, recovery science writing, and content that reduces shame through understanding.",
    category: 'documentation',
    icon: '🌱',
    tags: ["recovery","education","neuroscience","harm-reduction","psychoeducation"],
    difficulty: 'intermediate',
    content: `# Recovery Education Writer

Write neuroscientific, peer-oriented drug education content that roots experiences in body/brain mechanisms. Use when creating educational articles, explaining neurological phenomena, demystifying recovery challenges, or answering "why does this happen?" questions. Activates for harm reduction content, psychoeducation, recovery science writing, and content that reduces shame through understanding.

## Installation

\`\`\`bash
claude skill add recovery-education-writer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- recovery
- education
- neuroscience
- harm-reduction
- psychoeducation`,
    installCommand: 'claude skill add recovery-education-writer',
  },
  {
    id: 'recovery-social-features',
    title: 'Recovery Social Features',
    description: "Privacy-first social features for recovery apps - sponsors, groups, messaging, friend connections. Use for sponsor/sponsee systems, meeting-based groups, peer support, safe messaging. Activate on \"sponsor\", \"sponsee\", \"recovery group\", \"accountability partner\", \"sober network\", \"meeting group\", \"peer support\". NOT for general social media patterns (use standard social), dating features, or public profiles.",
    category: 'documentation',
    icon: '🌱',
    tags: ["recovery","social","privacy","sponsor","groups","messaging","peer-support"],
    difficulty: 'intermediate',
    content: `# Recovery Social Features

Privacy-first social features for recovery apps - sponsors, groups, messaging, friend connections. Use for sponsor/sponsee systems, meeting-based groups, peer support, safe messaging. Activate on "sponsor", "sponsee", "recovery group", "accountability partner", "sober network", "meeting group", "peer support". NOT for general social media patterns (use standard social), dating features, or public profiles.

## Installation

\`\`\`bash
claude skill add recovery-social-features
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- recovery
- social
- privacy
- sponsor
- groups
- messaging
- peer-support`,
    installCommand: 'claude skill add recovery-social-features',
  },
  {
    id: 'sober-addict-protector',
    title: 'Sober Addict Protector',
    description: "Daily protection and relapse prevention companion for people in recovery. Expert in identifying high-risk situations, managing triggers, maintaining accountability, encouraging therapy/couples counseling investment, and building sustainable recovery habits. Activate on \"relapse prevention\", \"staying sober\", \"trigger management\", \"recovery daily\", \"sobriety check-in\", \"high risk situation\", \"couples therapy recovery\", \"protect sobriety\". NOT for active crisis (call 988 or your sponsor), prescribing medications (consult doctors), or replacing counselors/therapists.",
    category: 'documentation',
    icon: '🌱',
    tags: ["sobriety","relapse-prevention","triggers","recovery","daily"],
    difficulty: 'intermediate',
    content: `# Sober Addict Protector

Daily protection and relapse prevention companion for people in recovery. Expert in identifying high-risk situations, managing triggers, maintaining accountability, encouraging therapy/couples counseling investment, and building sustainable recovery habits. Activate on "relapse prevention", "staying sober", "trigger management", "recovery daily", "sobriety check-in", "high risk situation", "couples therapy recovery", "protect sobriety". NOT for active crisis (call 988 or your sponsor), prescribing medications (consult doctors), or replacing counselors/therapists.

## Installation

\`\`\`bash
claude skill add sober-addict-protector
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- sobriety
- relapse-prevention
- triggers
- recovery
- daily`,
    installCommand: 'claude skill add sober-addict-protector',
  },
  {
    id: 'wisdom-accountability-coach',
    title: 'Wisdom Accountability Coach',
    description: "Longitudinal memory tracking, philosophy teaching, and personal accountability with compassion. Expert in pattern recognition, Stoicism/Buddhism, and growth guidance. Activate on 'accountability', 'philosophy', 'Stoicism', 'Buddhism', 'personal growth', 'commitment tracking', 'wisdom teaching'. NOT for therapy or mental health treatment (refer to professionals), crisis intervention, or replacing professional coaching credentials.",
    category: 'documentation',
    icon: '🌱',
    tags: ["accountability","stoicism","buddhism","growth","philosophy"],
    difficulty: 'intermediate',
    content: `# Wisdom Accountability Coach

Longitudinal memory tracking, philosophy teaching, and personal accountability with compassion. Expert in pattern recognition, Stoicism/Buddhism, and growth guidance. Activate on 'accountability', 'philosophy', 'Stoicism', 'Buddhism', 'personal growth', 'commitment tracking', 'wisdom teaching'. NOT for therapy or mental health treatment (refer to professionals), crisis intervention, or replacing professional coaching credentials.

## Installation

\`\`\`bash
claude skill add wisdom-accountability-coach
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- accountability
- stoicism
- buddhism
- growth
- philosophy`,
    installCommand: 'claude skill add wisdom-accountability-coach',
  },
  {
    id: 'dag-capability-ranker',
    title: 'Dag Capability Ranker',
    description: "Ranks skill matches by fit, performance history, and contextual relevance. Applies multi-factor scoring including success rate, resource usage, and task alignment. Activate on 'rank skills', 'best skill for', 'skill ranking', 'compare skills', 'optimal skill'. NOT for semantic matching (use dag-semantic-matcher) or skill catalog (use dag-skill-registry).",
    category: 'development',
    icon: '📦',
    tags: ["dag","registry","ranking","scoring","optimization"],
    difficulty: 'intermediate',
    content: `# Dag Capability Ranker

Ranks skill matches by fit, performance history, and contextual relevance. Applies multi-factor scoring including success rate, resource usage, and task alignment. Activate on 'rank skills', 'best skill for', 'skill ranking', 'compare skills', 'optimal skill'. NOT for semantic matching (use dag-semantic-matcher) or skill catalog (use dag-skill-registry).

## Installation

\`\`\`bash
claude skill add dag-capability-ranker
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- registry
- ranking
- scoring
- optimization`,
    installCommand: 'claude skill add dag-capability-ranker',
  },
  {
    id: 'dag-confidence-scorer',
    title: 'Dag Confidence Scorer',
    description: "Assigns confidence scores to agent outputs based on multiple factors including source quality, consistency, and reasoning depth. Produces calibrated confidence estimates. Activate on 'confidence score', 'how confident', 'certainty level', 'output confidence', 'reliability score'. NOT for validation (use dag-output-validator) or hallucination detection (use dag-hallucination-detector).",
    category: 'development',
    icon: '📦',
    tags: ["dag","quality","confidence","scoring","reliability"],
    difficulty: 'intermediate',
    content: `# Dag Confidence Scorer

Assigns confidence scores to agent outputs based on multiple factors including source quality, consistency, and reasoning depth. Produces calibrated confidence estimates. Activate on 'confidence score', 'how confident', 'certainty level', 'output confidence', 'reliability score'. NOT for validation (use dag-output-validator) or hallucination detection (use dag-hallucination-detector).

## Installation

\`\`\`bash
claude skill add dag-confidence-scorer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- quality
- confidence
- scoring
- reliability`,
    installCommand: 'claude skill add dag-confidence-scorer',
  },
  {
    id: 'dag-context-bridger',
    title: 'Dag Context Bridger',
    description: "Manages context passing between DAG nodes and spawned agents. Handles context summarization, selective forwarding, and token budget optimization. Activate on 'bridge context', 'pass context', 'summarize context', 'context management', 'agent context'. NOT for execution (use dag-parallel-executor) or aggregation (use dag-result-aggregator).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","context","summarization","token-management"],
    difficulty: 'intermediate',
    content: `# Dag Context Bridger

Manages context passing between DAG nodes and spawned agents. Handles context summarization, selective forwarding, and token budget optimization. Activate on 'bridge context', 'pass context', 'summarize context', 'context management', 'agent context'. NOT for execution (use dag-parallel-executor) or aggregation (use dag-result-aggregator).

## Installation

\`\`\`bash
claude skill add dag-context-bridger
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- context
- summarization
- token-management`,
    installCommand: 'claude skill add dag-context-bridger',
  },
  {
    id: 'dag-convergence-monitor',
    title: 'Dag Convergence Monitor',
    description: "Tracks iteration progress toward task completion goals. Monitors quality trends, detects plateauing, and recommends when to stop iterating. Activate on 'convergence tracking', 'iteration progress', 'quality trend', 'stop iterating', 'progress monitoring'. NOT for iteration detection (use dag-iteration-detector) or feedback synthesis (use dag-feedback-synthesizer).",
    category: 'development',
    icon: '📦',
    tags: ["dag","feedback","convergence","monitoring","quality-trends"],
    difficulty: 'intermediate',
    content: `# Dag Convergence Monitor

Tracks iteration progress toward task completion goals. Monitors quality trends, detects plateauing, and recommends when to stop iterating. Activate on 'convergence tracking', 'iteration progress', 'quality trend', 'stop iterating', 'progress monitoring'. NOT for iteration detection (use dag-iteration-detector) or feedback synthesis (use dag-feedback-synthesizer).

## Installation

\`\`\`bash
claude skill add dag-convergence-monitor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- feedback
- convergence
- monitoring
- quality-trends`,
    installCommand: 'claude skill add dag-convergence-monitor',
  },
  {
    id: 'dag-dependency-resolver',
    title: 'Dag Dependency Resolver',
    description: "Validates DAG structures, performs topological sorting, detects cycles, and resolves dependency conflicts. Uses Kahn's algorithm for optimal execution ordering. Activate on 'resolve dependencies', 'topological sort', 'cycle detection', 'dependency order', 'validate dag'. NOT for building DAGs (use dag-graph-builder) or scheduling execution (use dag-task-scheduler).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","topological-sort","dependencies","cycle-detection"],
    difficulty: 'intermediate',
    content: `# Dag Dependency Resolver

Validates DAG structures, performs topological sorting, detects cycles, and resolves dependency conflicts. Uses Kahn's algorithm for optimal execution ordering. Activate on 'resolve dependencies', 'topological sort', 'cycle detection', 'dependency order', 'validate dag'. NOT for building DAGs (use dag-graph-builder) or scheduling execution (use dag-task-scheduler).

## Installation

\`\`\`bash
claude skill add dag-dependency-resolver
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- topological-sort
- dependencies
- cycle-detection`,
    installCommand: 'claude skill add dag-dependency-resolver',
  },
  {
    id: 'dag-dynamic-replanner',
    title: 'Dag Dynamic Replanner',
    description: "Modifies DAG structure during execution in response to failures, new requirements, or runtime discoveries. Supports node insertion, removal, and dependency rewiring. Activate on 'replan dag', 'modify workflow', 'add node', 'remove node', 'dynamic modification'. NOT for initial DAG building (use dag-graph-builder) or scheduling (use dag-task-scheduler).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","replanning","dynamic","adaptation"],
    difficulty: 'intermediate',
    content: `# Dag Dynamic Replanner

Modifies DAG structure during execution in response to failures, new requirements, or runtime discoveries. Supports node insertion, removal, and dependency rewiring. Activate on 'replan dag', 'modify workflow', 'add node', 'remove node', 'dynamic modification'. NOT for initial DAG building (use dag-graph-builder) or scheduling (use dag-task-scheduler).

## Installation

\`\`\`bash
claude skill add dag-dynamic-replanner
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- replanning
- dynamic
- adaptation`,
    installCommand: 'claude skill add dag-dynamic-replanner',
  },
  {
    id: 'dag-execution-tracer',
    title: 'Dag Execution Tracer',
    description: "Traces complete execution paths through DAG workflows. Records timing, inputs, outputs, and state transitions for all nodes. Activate on 'execution trace', 'trace execution', 'execution path', 'debug execution', 'execution log'. NOT for performance analysis (use dag-performance-profiler) or failure investigation (use dag-failure-analyzer).",
    category: 'development',
    icon: '📦',
    tags: ["dag","observability","tracing","debugging","logging"],
    difficulty: 'intermediate',
    content: `# Dag Execution Tracer

Traces complete execution paths through DAG workflows. Records timing, inputs, outputs, and state transitions for all nodes. Activate on 'execution trace', 'trace execution', 'execution path', 'debug execution', 'execution log'. NOT for performance analysis (use dag-performance-profiler) or failure investigation (use dag-failure-analyzer).

## Installation

\`\`\`bash
claude skill add dag-execution-tracer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- observability
- tracing
- debugging
- logging`,
    installCommand: 'claude skill add dag-execution-tracer',
  },
  {
    id: 'dag-failure-analyzer',
    title: 'Dag Failure Analyzer',
    description: "Performs root cause analysis on DAG execution failures. Traces failure propagation, identifies systemic issues, and generates actionable remediation guidance. Activate on 'failure analysis', 'root cause', 'why did it fail', 'debug failure', 'error investigation'. NOT for execution tracing (use dag-execution-tracer) or performance issues (use dag-performance-profiler).",
    category: 'development',
    icon: '📦',
    tags: ["dag","observability","debugging","failures","root-cause"],
    difficulty: 'intermediate',
    content: `# Dag Failure Analyzer

Performs root cause analysis on DAG execution failures. Traces failure propagation, identifies systemic issues, and generates actionable remediation guidance. Activate on 'failure analysis', 'root cause', 'why did it fail', 'debug failure', 'error investigation'. NOT for execution tracing (use dag-execution-tracer) or performance issues (use dag-performance-profiler).

## Installation

\`\`\`bash
claude skill add dag-failure-analyzer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- observability
- debugging
- failures
- root-cause`,
    installCommand: 'claude skill add dag-failure-analyzer',
  },
  {
    id: 'dag-feedback-synthesizer',
    title: 'Dag Feedback Synthesizer',
    description: "Synthesizes actionable feedback from validation results, confidence scores, and iteration triggers. Creates structured improvement guidance for re-execution. Activate on 'synthesize feedback', 'improvement suggestions', 'actionable feedback', 'iteration guidance', 'feedback generation'. NOT for iteration detection (use dag-iteration-detector) or convergence tracking (use dag-convergence-monitor).",
    category: 'development',
    icon: '📦',
    tags: ["dag","feedback","iteration","guidance","improvement"],
    difficulty: 'intermediate',
    content: `# Dag Feedback Synthesizer

Synthesizes actionable feedback from validation results, confidence scores, and iteration triggers. Creates structured improvement guidance for re-execution. Activate on 'synthesize feedback', 'improvement suggestions', 'actionable feedback', 'iteration guidance', 'feedback generation'. NOT for iteration detection (use dag-iteration-detector) or convergence tracking (use dag-convergence-monitor).

## Installation

\`\`\`bash
claude skill add dag-feedback-synthesizer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- feedback
- iteration
- guidance
- improvement`,
    installCommand: 'claude skill add dag-feedback-synthesizer',
  },
  {
    id: 'dag-graph-builder',
    title: 'Dag Graph Builder',
    description: "Parses complex problems into DAG (Directed Acyclic Graph) execution structures. Decomposes tasks into nodes with dependencies, identifies parallelization opportunities, and creates optimal execution plans. Activate on 'build dag', 'create workflow graph', 'decompose task', 'execution graph', 'task graph'. NOT for simple linear tasks or when an existing DAG structure is provided.",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","graph","task-decomposition","workflow"],
    difficulty: 'intermediate',
    content: `# Dag Graph Builder

Parses complex problems into DAG (Directed Acyclic Graph) execution structures. Decomposes tasks into nodes with dependencies, identifies parallelization opportunities, and creates optimal execution plans. Activate on 'build dag', 'create workflow graph', 'decompose task', 'execution graph', 'task graph'. NOT for simple linear tasks or when an existing DAG structure is provided.

## Installation

\`\`\`bash
claude skill add dag-graph-builder
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- graph
- task-decomposition
- workflow`,
    installCommand: 'claude skill add dag-graph-builder',
  },
  {
    id: 'dag-hallucination-detector',
    title: 'Dag Hallucination Detector',
    description: "Detects fabricated content, false citations, and unverifiable claims in agent outputs. Uses source verification and consistency checking. Activate on 'detect hallucination', 'fact check', 'verify claims', 'check accuracy', 'find fabrications'. NOT for validation (use dag-output-validator) or confidence scoring (use dag-confidence-scorer).",
    category: 'development',
    icon: '📦',
    tags: ["dag","quality","hallucination","fact-checking","verification"],
    difficulty: 'intermediate',
    content: `# Dag Hallucination Detector

Detects fabricated content, false citations, and unverifiable claims in agent outputs. Uses source verification and consistency checking. Activate on 'detect hallucination', 'fact check', 'verify claims', 'check accuracy', 'find fabrications'. NOT for validation (use dag-output-validator) or confidence scoring (use dag-confidence-scorer).

## Installation

\`\`\`bash
claude skill add dag-hallucination-detector
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- quality
- hallucination
- fact-checking
- verification`,
    installCommand: 'claude skill add dag-hallucination-detector',
  },
  {
    id: 'dag-isolation-manager',
    title: 'Dag Isolation Manager',
    description: "Manages agent isolation levels and resource boundaries. Configures strict, moderate, and permissive isolation profiles. Activate on 'isolation level', 'agent isolation', 'resource boundaries', 'sandboxing', 'agent containment'. NOT for permission validation (use dag-permission-validator) or runtime enforcement (use dag-scope-enforcer).",
    category: 'development',
    icon: '📦',
    tags: ["dag","permissions","isolation","sandboxing","containment"],
    difficulty: 'intermediate',
    content: `# Dag Isolation Manager

Manages agent isolation levels and resource boundaries. Configures strict, moderate, and permissive isolation profiles. Activate on 'isolation level', 'agent isolation', 'resource boundaries', 'sandboxing', 'agent containment'. NOT for permission validation (use dag-permission-validator) or runtime enforcement (use dag-scope-enforcer).

## Installation

\`\`\`bash
claude skill add dag-isolation-manager
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- permissions
- isolation
- sandboxing
- containment`,
    installCommand: 'claude skill add dag-isolation-manager',
  },
  {
    id: 'dag-iteration-detector',
    title: 'Dag Iteration Detector',
    description: "Identifies when task outputs require iteration based on quality signals, unmet requirements, or explicit feedback. Triggers appropriate re-execution strategies. Activate on 'needs iteration', 'retry needed', 'not good enough', 'try again', 'refine output'. NOT for feedback generation (use dag-feedback-synthesizer) or convergence tracking (use dag-convergence-monitor).",
    category: 'development',
    icon: '📦',
    tags: ["dag","feedback","iteration","refinement","quality"],
    difficulty: 'intermediate',
    content: `# Dag Iteration Detector

Identifies when task outputs require iteration based on quality signals, unmet requirements, or explicit feedback. Triggers appropriate re-execution strategies. Activate on 'needs iteration', 'retry needed', 'not good enough', 'try again', 'refine output'. NOT for feedback generation (use dag-feedback-synthesizer) or convergence tracking (use dag-convergence-monitor).

## Installation

\`\`\`bash
claude skill add dag-iteration-detector
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- feedback
- iteration
- refinement
- quality`,
    installCommand: 'claude skill add dag-iteration-detector',
  },
  {
    id: 'dag-output-validator',
    title: 'Dag Output Validator',
    description: "Validates agent outputs against expected schemas and quality criteria. Ensures outputs meet structural requirements and content standards. Activate on 'validate output', 'output validation', 'schema validation', 'check output', 'output quality'. NOT for confidence scoring (use dag-confidence-scorer) or hallucination detection (use dag-hallucination-detector).",
    category: 'development',
    icon: '📦',
    tags: ["dag","quality","validation","schemas","outputs"],
    difficulty: 'intermediate',
    content: `# Dag Output Validator

Validates agent outputs against expected schemas and quality criteria. Ensures outputs meet structural requirements and content standards. Activate on 'validate output', 'output validation', 'schema validation', 'check output', 'output quality'. NOT for confidence scoring (use dag-confidence-scorer) or hallucination detection (use dag-hallucination-detector).

## Installation

\`\`\`bash
claude skill add dag-output-validator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- quality
- validation
- schemas
- outputs`,
    installCommand: 'claude skill add dag-output-validator',
  },
  {
    id: 'dag-parallel-executor',
    title: 'Dag Parallel Executor',
    description: "Executes DAG waves with controlled parallelism using the Task tool. Manages concurrent agent spawning, resource limits, and execution coordination. Activate on 'execute dag', 'parallel execution', 'concurrent tasks', 'run workflow', 'spawn agents'. NOT for scheduling (use dag-task-scheduler) or building DAGs (use dag-graph-builder).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","parallel-execution","concurrency","task-tool"],
    difficulty: 'intermediate',
    content: `# Dag Parallel Executor

Executes DAG waves with controlled parallelism using the Task tool. Manages concurrent agent spawning, resource limits, and execution coordination. Activate on 'execute dag', 'parallel execution', 'concurrent tasks', 'run workflow', 'spawn agents'. NOT for scheduling (use dag-task-scheduler) or building DAGs (use dag-graph-builder).

## Installation

\`\`\`bash
claude skill add dag-parallel-executor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- parallel-execution
- concurrency
- task-tool`,
    installCommand: 'claude skill add dag-parallel-executor',
  },
  {
    id: 'dag-pattern-learner',
    title: 'Dag Pattern Learner',
    description: "Learns from DAG execution history to improve future performance. Identifies successful patterns, detects anti-patterns, and provides recommendations. Activate on 'learn patterns', 'execution patterns', 'what worked', 'optimize based on history', 'pattern analysis'. NOT for failure analysis (use dag-failure-analyzer) or performance profiling (use dag-performance-profiler).",
    category: 'development',
    icon: '📦',
    tags: ["dag","observability","learning","patterns","optimization"],
    difficulty: 'intermediate',
    content: `# Dag Pattern Learner

Learns from DAG execution history to improve future performance. Identifies successful patterns, detects anti-patterns, and provides recommendations. Activate on 'learn patterns', 'execution patterns', 'what worked', 'optimize based on history', 'pattern analysis'. NOT for failure analysis (use dag-failure-analyzer) or performance profiling (use dag-performance-profiler).

## Installation

\`\`\`bash
claude skill add dag-pattern-learner
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- observability
- learning
- patterns
- optimization`,
    installCommand: 'claude skill add dag-pattern-learner',
  },
  {
    id: 'dag-performance-profiler',
    title: 'Dag Performance Profiler',
    description: "Profiles DAG execution performance including latency, token usage, cost, and resource consumption. Identifies bottlenecks and optimization opportunities. Activate on 'performance profile', 'execution metrics', 'latency analysis', 'token usage', 'cost analysis'. NOT for execution tracing (use dag-execution-tracer) or failure analysis (use dag-failure-analyzer).",
    category: 'development',
    icon: '📦',
    tags: ["dag","observability","performance","metrics","optimization"],
    difficulty: 'intermediate',
    content: `# Dag Performance Profiler

Profiles DAG execution performance including latency, token usage, cost, and resource consumption. Identifies bottlenecks and optimization opportunities. Activate on 'performance profile', 'execution metrics', 'latency analysis', 'token usage', 'cost analysis'. NOT for execution tracing (use dag-execution-tracer) or failure analysis (use dag-failure-analyzer).

## Installation

\`\`\`bash
claude skill add dag-performance-profiler
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- observability
- performance
- metrics
- optimization`,
    installCommand: 'claude skill add dag-performance-profiler',
  },
  {
    id: 'dag-permission-validator',
    title: 'Dag Permission Validator',
    description: "Validates permission inheritance between parent and child agents. Ensures child permissions are equal to or more restrictive than parent. Activate on 'validate permissions', 'permission check', 'inheritance validation', 'permission matrix', 'security validation'. NOT for runtime enforcement (use dag-scope-enforcer) or isolation management (use dag-isolation-manager).",
    category: 'development',
    icon: '📦',
    tags: ["dag","permissions","security","validation","inheritance"],
    difficulty: 'intermediate',
    content: `# Dag Permission Validator

Validates permission inheritance between parent and child agents. Ensures child permissions are equal to or more restrictive than parent. Activate on 'validate permissions', 'permission check', 'inheritance validation', 'permission matrix', 'security validation'. NOT for runtime enforcement (use dag-scope-enforcer) or isolation management (use dag-isolation-manager).

## Installation

\`\`\`bash
claude skill add dag-permission-validator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- permissions
- security
- validation
- inheritance`,
    installCommand: 'claude skill add dag-permission-validator',
  },
  {
    id: 'dag-result-aggregator',
    title: 'Dag Result Aggregator',
    description: "Combines and synthesizes outputs from parallel DAG branches. Handles merge strategies, conflict resolution, and result formatting. Activate on 'aggregate results', 'combine outputs', 'merge branches', 'synthesize results', 'fan-in'. NOT for execution (use dag-parallel-executor) or scheduling (use dag-task-scheduler).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","aggregation","merge","fan-in"],
    difficulty: 'intermediate',
    content: `# Dag Result Aggregator

Combines and synthesizes outputs from parallel DAG branches. Handles merge strategies, conflict resolution, and result formatting. Activate on 'aggregate results', 'combine outputs', 'merge branches', 'synthesize results', 'fan-in'. NOT for execution (use dag-parallel-executor) or scheduling (use dag-task-scheduler).

## Installation

\`\`\`bash
claude skill add dag-result-aggregator
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- aggregation
- merge
- fan-in`,
    installCommand: 'claude skill add dag-result-aggregator',
  },
  {
    id: 'dag-scope-enforcer',
    title: 'Dag Scope Enforcer',
    description: "Runtime enforcement of file system boundaries and tool access restrictions. Blocks unauthorized operations and logs violations. Activate on 'enforce scope', 'access control', 'boundary enforcement', 'tool restrictions', 'runtime security'. NOT for validation (use dag-permission-validator) or isolation management (use dag-isolation-manager).",
    category: 'development',
    icon: '📦',
    tags: ["dag","permissions","enforcement","security","runtime"],
    difficulty: 'intermediate',
    content: `# Dag Scope Enforcer

Runtime enforcement of file system boundaries and tool access restrictions. Blocks unauthorized operations and logs violations. Activate on 'enforce scope', 'access control', 'boundary enforcement', 'tool restrictions', 'runtime security'. NOT for validation (use dag-permission-validator) or isolation management (use dag-isolation-manager).

## Installation

\`\`\`bash
claude skill add dag-scope-enforcer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- permissions
- enforcement
- security
- runtime`,
    installCommand: 'claude skill add dag-scope-enforcer',
  },
  {
    id: 'dag-semantic-matcher',
    title: 'Dag Semantic Matcher',
    description: "Matches natural language task descriptions to appropriate skills using semantic similarity. Handles fuzzy matching, intent extraction, and capability alignment. Activate on 'find skill', 'match task', 'semantic search', 'skill lookup', 'what skill for'. NOT for ranking matches (use dag-capability-ranker) or skill catalog (use dag-skill-registry).",
    category: 'development',
    icon: '📦',
    tags: ["dag","registry","semantic-matching","nlp","discovery"],
    difficulty: 'intermediate',
    content: `# Dag Semantic Matcher

Matches natural language task descriptions to appropriate skills using semantic similarity. Handles fuzzy matching, intent extraction, and capability alignment. Activate on 'find skill', 'match task', 'semantic search', 'skill lookup', 'what skill for'. NOT for ranking matches (use dag-capability-ranker) or skill catalog (use dag-skill-registry).

## Installation

\`\`\`bash
claude skill add dag-semantic-matcher
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- registry
- semantic-matching
- nlp
- discovery`,
    installCommand: 'claude skill add dag-semantic-matcher',
  },
  {
    id: 'dag-skill-registry',
    title: 'Dag Skill Registry',
    description: "Central catalog of available skills with metadata, capabilities, and performance history. Provides skill discovery and lookup services. Activate on 'skill registry', 'list skills', 'skill catalog', 'available skills', 'skill metadata'. NOT for matching skills to tasks (use dag-semantic-matcher) or ranking (use dag-capability-ranker).",
    category: 'development',
    icon: '📦',
    tags: ["dag","registry","skills","catalog","discovery"],
    difficulty: 'intermediate',
    content: `# Dag Skill Registry

Central catalog of available skills with metadata, capabilities, and performance history. Provides skill discovery and lookup services. Activate on 'skill registry', 'list skills', 'skill catalog', 'available skills', 'skill metadata'. NOT for matching skills to tasks (use dag-semantic-matcher) or ranking (use dag-capability-ranker).

## Installation

\`\`\`bash
claude skill add dag-skill-registry
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- registry
- skills
- catalog
- discovery`,
    installCommand: 'claude skill add dag-skill-registry',
  },
  {
    id: 'dag-task-scheduler',
    title: 'Dag Task Scheduler',
    description: "Wave-based parallel scheduling for DAG execution. Manages execution order, resource allocation, and parallelism constraints. Activate on 'schedule dag', 'execution waves', 'parallel scheduling', 'task queue', 'resource allocation'. NOT for building DAGs (use dag-graph-builder) or actual execution (use dag-parallel-executor).",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","scheduling","parallelism","resource-allocation"],
    difficulty: 'intermediate',
    content: `# Dag Task Scheduler

Wave-based parallel scheduling for DAG execution. Manages execution order, resource allocation, and parallelism constraints. Activate on 'schedule dag', 'execution waves', 'parallel scheduling', 'task queue', 'resource allocation'. NOT for building DAGs (use dag-graph-builder) or actual execution (use dag-parallel-executor).

## Installation

\`\`\`bash
claude skill add dag-task-scheduler
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- scheduling
- parallelism
- resource-allocation`,
    installCommand: 'claude skill add dag-task-scheduler',
  },
  {
    id: 'react-performance-optimizer',
    title: 'React Performance Optimizer',
    description: "Optimize React apps for 60fps performance. Implements memoization, virtualization, code splitting, bundle optimization. Use for slow renders, large lists, bundle bloat. Activate on \"React performance\", \"slow render\", \"useMemo\", \"bundle size\", \"virtualization\". NOT for backend optimization, non-React frameworks, or premature optimization.",
    category: 'development',
    icon: '📦',
    tags: [],
    difficulty: 'intermediate',
    content: `# React Performance Optimizer

Optimize React apps for 60fps performance. Implements memoization, virtualization, code splitting, bundle optimization. Use for slow renders, large lists, bundle bloat. Activate on "React performance", "slow render", "useMemo", "bundle size", "virtualization". NOT for backend optimization, non-React frameworks, or premature optimization.

## Installation

\`\`\`bash
claude skill add react-performance-optimizer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add react-performance-optimizer',
  },
  {
    id: 'sobriety-tools-guardian',
    title: 'Sobriety Tools Guardian',
    description: "Performance optimization and continuous improvement for sobriety.tools recovery app. Use for load time optimization, offline capability, crisis detection, performance monitoring, automated issue detection. Activate on \"sobriety.tools\", \"recovery app perf\", \"crisis detection\", \"offline meetings\", \"HALT check-in\", \"sponsor contacts\". NOT for general Next.js help, unrelated Cloudflare Workers, or non-recovery apps.",
    category: 'development',
    icon: '📦',
    tags: [],
    difficulty: 'intermediate',
    content: `# Sobriety Tools Guardian

Performance optimization and continuous improvement for sobriety.tools recovery app. Use for load time optimization, offline capability, crisis detection, performance monitoring, automated issue detection. Activate on "sobriety.tools", "recovery app perf", "crisis detection", "offline meetings", "HALT check-in", "sponsor contacts". NOT for general Next.js help, unrelated Cloudflare Workers, or non-recovery apps.

## Installation

\`\`\`bash
claude skill add sobriety-tools-guardian
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

`,
    installCommand: 'claude skill add sobriety-tools-guardian',
  },
  {
    id: 'dag-executor',
    title: 'Dag Executor',
    description: "End-to-end DAG execution orchestrator that decomposes arbitrary tasks into agent graphs and executes them in parallel. The intelligence layer that makes DAG Framework operational.",
    category: 'development',
    icon: '📦',
    tags: ["dag","orchestration","task-decomposition","parallel-execution","agent-spawning"],
    difficulty: 'intermediate',
    content: `# Dag Executor

End-to-end DAG execution orchestrator that decomposes arbitrary tasks into agent graphs and executes them in parallel. The intelligence layer that makes DAG Framework operational.

## Installation

\`\`\`bash
claude skill add dag-executor
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- dag
- orchestration
- task-decomposition
- parallel-execution
- agent-spawning`,
    installCommand: 'claude skill add dag-executor',
  },
  {
    id: 'mdx-sanitizer',
    title: 'Mdx Sanitizer',
    description: "Comprehensive MDX content sanitizer that escapes angle brackets, generics, and other JSX-conflicting patterns to prevent build failures",
    category: 'development',
    icon: '📦',
    tags: ["mdx","docusaurus","markdown","build-tools","sanitization"],
    difficulty: 'intermediate',
    content: `# Mdx Sanitizer

Comprehensive MDX content sanitizer that escapes angle brackets, generics, and other JSX-conflicting patterns to prevent build failures

## Installation

\`\`\`bash
claude skill add mdx-sanitizer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- mdx
- docusaurus
- markdown
- build-tools
- sanitization`,
    installCommand: 'claude skill add mdx-sanitizer',
  },
  {
    id: 'nextjs-app-router-expert',
    title: 'Nextjs App Router Expert',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'development',
    icon: '📦',
    tags: ["nextjs","react","app-router","rsc","server-components","full-stack"],
    difficulty: 'intermediate',
    content: `# Nextjs App Router Expert

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add nextjs-app-router-expert
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- nextjs
- react
- app-router
- rsc
- server-components
- full-stack`,
    installCommand: 'claude skill add nextjs-app-router-expert',
  },
  {
    id: 'oauth-oidc-implementer',
    title: 'Oauth Oidc Implementer',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'development',
    icon: '📦',
    tags: ["oauth","oidc","authentication","authorization","jwt","security"],
    difficulty: 'intermediate',
    content: `# Oauth Oidc Implementer

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add oauth-oidc-implementer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- oauth
- oidc
- authentication
- authorization
- jwt
- security`,
    installCommand: 'claude skill add oauth-oidc-implementer',
  },
  {
    id: 'openapi-spec-writer',
    title: 'Openapi Spec Writer',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'development',
    icon: '📦',
    tags: ["openapi","swagger","api-documentation","rest","api-design"],
    difficulty: 'intermediate',
    content: `# Openapi Spec Writer

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add openapi-spec-writer
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- openapi
- swagger
- api-documentation
- rest
- api-design`,
    installCommand: 'claude skill add openapi-spec-writer',
  },
  {
    id: 'postgresql-optimization',
    title: 'Postgresql Optimization',
    description: "A powerful Claude skill for enhancing your workflow.",
    category: 'development',
    icon: '📦',
    tags: ["postgresql","sql","performance","indexing","query-optimization","database"],
    difficulty: 'intermediate',
    content: `# Postgresql Optimization

A powerful Claude skill for enhancing your workflow.

## Installation

\`\`\`bash
claude skill add postgresql-optimization
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- postgresql
- sql
- performance
- indexing
- query-optimization
- database`,
    installCommand: 'claude skill add postgresql-optimization',
  },
  {
    id: 'reactive-dashboard-performance',
    title: 'Reactive Dashboard Performance',
    description: "Expert in building blazing-fast reactive dashboards with comprehensive testing. Masters React performance patterns, testing strategies for async components, and real-world patterns from Linear, Vercel, Notion.",
    category: 'development',
    icon: '📦',
    tags: ["react","performance","testing","dashboard","optimization"],
    difficulty: 'intermediate',
    content: `# Reactive Dashboard Performance

Expert in building blazing-fast reactive dashboards with comprehensive testing. Masters React performance patterns, testing strategies for async components, and real-world patterns from Linear, Vercel, Notion.

## Installation

\`\`\`bash
claude skill add reactive-dashboard-performance
\`\`\`

## When to Use

This skill activates automatically based on context, or you can explicitly request it.

## Tags

- react
- performance
- testing
- dashboard
- optimization`,
    installCommand: 'claude skill add reactive-dashboard-performance',
  },
];

export function getSkillById(id: string): Skill | undefined {
  return skills.find((s) => s.id === id);
}

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((s) => s.category === category);
}

export function searchSkills(query: string): Skill[] {
  const lower = query.toLowerCase();
  return skills.filter(
    (s) =>
      s.title.toLowerCase().includes(lower) ||
      s.description.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower))
  );
}
