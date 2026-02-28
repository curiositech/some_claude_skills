import React, { useState, useMemo } from 'react';
import '../../css/win31.css';
import './Win31FileManager.css';

// File/folder node structure
export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: FileNode[];
  content?: string;  // For files, the actual content
  size?: number;     // File size in bytes
}

// Props for the file manager component
interface Win31FileManagerProps {
  title: string;
  rootFolder: FileNode;
  defaultExpanded?: string[];  // Paths of folders to expand by default
  defaultSelected?: string;    // Path of file to select by default
  height?: number | string;
  showStatusBar?: boolean;
  onFileSelect?: (file: FileNode) => void;
}

// Get file icon based on extension
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const name = filename.toLowerCase();

  // Special files first
  if (name === 'skill.md') return '📜';
  if (name === 'readme.md') return '📖';
  if (name === 'changelog.md') return '📋';
  if (name === 'overview.md') return '📑';

  // By extension
  switch (ext) {
    case 'md': return '📄';
    case 'py': return '🐍';
    case 'sh': return '⚙️';
    case 'js': return '📦';
    case 'ts': return '📦';
    case 'tsx': return '⚛️';
    case 'jsx': return '⚛️';
    case 'json': return '{}';
    case 'css': return '🎨';
    case 'txt': return '📝';
    case 'png':
    case 'jpg':
    case 'gif':
    case 'svg': return '🖼️';
    default: return '📄';
  }
}

// Get folder icon
function getFolderIcon(name: string, isOpen: boolean): string {
  const nameLower = name.toLowerCase();

  // Special folders
  if (nameLower === 'scripts') return isOpen ? '📂' : '⚙️';
  if (nameLower === 'references') return isOpen ? '📂' : '📚';
  if (nameLower === 'examples') return isOpen ? '📂' : '💡';
  if (nameLower === 'guides') return isOpen ? '📂' : '🗺️';
  if (nameLower === 'website') return isOpen ? '📂' : '🌐';

  return isOpen ? '📂' : '📁';
}

// Tree Node Component
interface TreeNodeProps {
  node: FileNode;
  depth: number;
  expandedPaths: Set<string>;
  selectedPath: string | null;
  onToggleExpand: (path: string) => void;
  onSelect: (node: FileNode) => void;
}

function TreeNode({
  node,
  depth,
  expandedPaths,
  selectedPath,
  onToggleExpand,
  onSelect,
}: TreeNodeProps): JSX.Element {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;

  const handleClick = () => {
    if (isFolder) {
      onToggleExpand(node.path);
    }
    onSelect(node);
  };

  return (
    <div className="win31-tree-node">
      <div
        className={`win31-tree-item ${isSelected ? 'win31-tree-item--selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={handleClick}
      >
        {/* Expand/collapse indicator for folders */}
        {isFolder && (
          <span className="win31-tree-toggle">
            {node.children && node.children.length > 0 ? (isExpanded ? '▼' : '▶') : '·'}
          </span>
        )}
        {!isFolder && <span className="win31-tree-toggle" style={{ visibility: 'hidden' }}>·</span>}

        {/* Icon */}
        <span className="win31-tree-icon">
          {isFolder ? getFolderIcon(node.name, isExpanded) : getFileIcon(node.name)}
        </span>

        {/* Label - DOS-style uppercase for effect */}
        <span className="win31-tree-label">
          {node.name.toUpperCase()}
        </span>
      </div>

      {/* Children */}
      {isFolder && isExpanded && node.children && (
        <div className="win31-tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedPaths={expandedPaths}
              selectedPath={selectedPath}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// File Content Viewer
interface FileViewerProps {
  file: FileNode | null;
}

function FileViewer({ file }: FileViewerProps): JSX.Element {
  if (!file) {
    return (
      <div className="win31-file-viewer-empty">
        <div className="win31-file-viewer-empty-icon">📁</div>
        <div className="win31-file-viewer-empty-text">
          Select a file to view its contents
        </div>
      </div>
    );
  }

  if (file.type === 'folder') {
    const fileCount = file.children?.filter(c => c.type === 'file').length || 0;
    const folderCount = file.children?.filter(c => c.type === 'folder').length || 0;

    return (
      <div className="win31-file-viewer-folder">
        <div className="win31-file-viewer-folder-header">
          <span className="win31-file-viewer-folder-icon">📁</span>
          <span className="win31-file-viewer-folder-name">{file.name.toUpperCase()}</span>
        </div>
        <div className="win31-file-viewer-folder-info">
          <div className="win31-groupbox">
            <div className="win31-groupbox__label">Contents</div>
            <div className="win31-file-viewer-folder-stats">
              <div>📁 {folderCount} folder{folderCount !== 1 ? 's' : ''}</div>
              <div>📄 {fileCount} file{fileCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* Show folder contents as icon grid */}
        {file.children && file.children.length > 0 && (
          <div className="win31-file-viewer-grid">
            {file.children.map((child) => (
              <div key={child.path} className="win31-file-viewer-grid-item">
                <span className="win31-file-viewer-grid-icon">
                  {child.type === 'folder'
                    ? getFolderIcon(child.name, false)
                    : getFileIcon(child.name)}
                </span>
                <span className="win31-file-viewer-grid-label">
                  {child.name.length > 12
                    ? child.name.slice(0, 10) + '...'
                    : child.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // File content view
  return (
    <div className="win31-file-viewer-content">
      <div className="win31-file-viewer-header">
        <span className="win31-file-viewer-file-icon">{getFileIcon(file.name)}</span>
        <span className="win31-file-viewer-file-name">{file.name}</span>
        {file.size !== undefined && (
          <span className="win31-file-viewer-file-size">
            {file.size < 1024
              ? `${file.size} bytes`
              : `${(file.size / 1024).toFixed(1)} KB`}
          </span>
        )}
      </div>
      <div className="win31-file-viewer-body">
        {file.content ? (
          <pre className="win31-file-viewer-pre">{file.content}</pre>
        ) : (
          <div className="win31-file-viewer-no-content">
            Content not available in preview.
            <br />
            <a
              href={`https://github.com/curiositech/some_claude_skills/blob/main/.claude/skills/${file.path}`}
              target="_blank"
              rel="noopener noreferrer"
              className="win31-file-viewer-link"
            >
              View on GitHub →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Main File Manager Component
export default function Win31FileManager({
  title,
  rootFolder,
  defaultExpanded = [],
  defaultSelected,
  height = 400,
  showStatusBar = true,
  onFileSelect,
}: Win31FileManagerProps): JSX.Element {
  // Initialize expanded paths
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    () => new Set([rootFolder.path, ...defaultExpanded])
  );

  // Selected file/folder
  const [selectedNode, setSelectedNode] = useState<FileNode | null>(() => {
    if (!defaultSelected) return null;
    // Find the node at defaultSelected path
    const findNode = (node: FileNode): FileNode | null => {
      if (node.path === defaultSelected) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child);
          if (found) return found;
        }
      }
      return null;
    };
    return findNode(rootFolder);
  });

  // Count total files/folders
  const stats = useMemo(() => {
    let files = 0;
    let folders = 0;
    const count = (node: FileNode) => {
      if (node.type === 'file') files++;
      else {
        folders++;
        node.children?.forEach(count);
      }
    };
    count(rootFolder);
    return { files, folders: folders - 1 }; // Don't count root
  }, [rootFolder]);

  const handleToggleExpand = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleSelect = (node: FileNode) => {
    setSelectedNode(node);
    onFileSelect?.(node);
  };

  // Expand all folders
  const handleExpandAll = () => {
    const allPaths = new Set<string>();
    const collect = (node: FileNode) => {
      if (node.type === 'folder') {
        allPaths.add(node.path);
        node.children?.forEach(collect);
      }
    };
    collect(rootFolder);
    setExpandedPaths(allPaths);
  };

  // Collapse all folders
  const handleCollapseAll = () => {
    setExpandedPaths(new Set([rootFolder.path]));
  };

  return (
    <div className="win31-window win31-file-manager">
      {/* Title Bar */}
      <div className="win31-titlebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="win31-btn-3d win31-btn-3d--small">─</div>
        </div>
        <span className="win31-title-text">{title}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div className="win31-btn-3d win31-btn-3d--small">▲</div>
          <div className="win31-btn-3d win31-btn-3d--small">▼</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="win31-file-manager-toolbar">
        <button
          className="win31-push-button"
          onClick={handleExpandAll}
          title="Expand All"
        >
          + All
        </button>
        <button
          className="win31-push-button"
          onClick={handleCollapseAll}
          title="Collapse All"
        >
          - All
        </button>
        <div className="win31-file-manager-toolbar-divider" />
        <span className="win31-file-manager-toolbar-path">
          C:\SKILLS\{rootFolder.name.toUpperCase().replace(/-/g, '_')}
        </span>
      </div>

      {/* Main Content Area - Split Pane */}
      <div
        className="win31-file-manager-content"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {/* Left Panel - Tree View */}
        <div className="win31-file-manager-tree-panel">
          <div className="win31-panel-inset win31-file-manager-tree-inner">
            <TreeNode
              node={rootFolder}
              depth={0}
              expandedPaths={expandedPaths}
              selectedPath={selectedNode?.path || null}
              onToggleExpand={handleToggleExpand}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Divider */}
        <div className="win31-file-manager-divider" />

        {/* Right Panel - File Viewer */}
        <div className="win31-file-manager-view-panel">
          <div className="win31-panel-inset win31-file-manager-view-inner">
            <FileViewer file={selectedNode} />
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {showStatusBar && (
        <div className="win31-statusbar">
          <div className="win31-statusbar-panel" style={{ flex: 1 }}>
            {selectedNode
              ? `Selected: ${selectedNode.name}`
              : 'Ready'}
          </div>
          <div className="win31-statusbar-panel">
            {stats.folders} folder{stats.folders !== 1 ? 's' : ''}
          </div>
          <div className="win31-statusbar-panel">
            {stats.files} file{stats.files !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
