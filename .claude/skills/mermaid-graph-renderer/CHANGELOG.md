# Changelog: mermaid-graph-renderer

## v1.0.0 (2026-02-05)

### Created
- Rendering decision tree (web vs. CLI vs. SSR)
- Web rendering: lazy-loaded mermaid.js, @mermaid-js/tiny, build-time SSR trade-offs
- CLI rendering: mermaid-cli, Kroki, mmdr (Rust native, 1000x faster)
- Comparison matrix across all rendering options
- Recommendations by use case table
- Anti-patterns: SSR obsession, foreignObject surprise, one-tool-for-everything
- Based on 2025-2026 library landscape research
