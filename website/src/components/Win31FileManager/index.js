"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Win31FileManager;
var react_1 = require("react");
require("../../css/win31.css");
require("./Win31FileManager.css");
// Get file icon based on extension
function getFileIcon(filename) {
    var _a;
    var ext = ((_a = filename.split('.').pop()) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    var name = filename.toLowerCase();
    // Special files first
    if (name === 'skill.md')
        return '📜';
    if (name === 'readme.md')
        return '📖';
    if (name === 'changelog.md')
        return '📋';
    if (name === 'overview.md')
        return '📑';
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
function getFolderIcon(name, isOpen) {
    var nameLower = name.toLowerCase();
    // Special folders
    if (nameLower === 'scripts')
        return isOpen ? '📂' : '⚙️';
    if (nameLower === 'references')
        return isOpen ? '📂' : '📚';
    if (nameLower === 'examples')
        return isOpen ? '📂' : '💡';
    if (nameLower === 'guides')
        return isOpen ? '📂' : '🗺️';
    if (nameLower === 'website')
        return isOpen ? '📂' : '🌐';
    return isOpen ? '📂' : '📁';
}
function TreeNode(_a) {
    var node = _a.node, depth = _a.depth, expandedPaths = _a.expandedPaths, selectedPath = _a.selectedPath, onToggleExpand = _a.onToggleExpand, onSelect = _a.onSelect;
    var isFolder = node.type === 'folder';
    var isExpanded = expandedPaths.has(node.path);
    var isSelected = selectedPath === node.path;
    var handleClick = function () {
        if (isFolder) {
            onToggleExpand(node.path);
        }
        onSelect(node);
    };
    return (<div className="win31-tree-node">
      <div className={"win31-tree-item ".concat(isSelected ? 'win31-tree-item--selected' : '')} style={{ paddingLeft: "".concat(depth * 16 + 4, "px") }} onClick={handleClick}>
        {/* Expand/collapse indicator for folders */}
        {isFolder && (<span className="win31-tree-toggle">
            {node.children && node.children.length > 0 ? (isExpanded ? '▼' : '▶') : '·'}
          </span>)}
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
      {isFolder && isExpanded && node.children && (<div className="win31-tree-children">
          {node.children.map(function (child) { return (<TreeNode key={child.path} node={child} depth={depth + 1} expandedPaths={expandedPaths} selectedPath={selectedPath} onToggleExpand={onToggleExpand} onSelect={onSelect}/>); })}
        </div>)}
    </div>);
}
function FileViewer(_a) {
    var _b, _c;
    var file = _a.file;
    if (!file) {
        return (<div className="win31-file-viewer-empty">
        <div className="win31-file-viewer-empty-icon">📁</div>
        <div className="win31-file-viewer-empty-text">
          Select a file to view its contents
        </div>
      </div>);
    }
    if (file.type === 'folder') {
        var fileCount = ((_b = file.children) === null || _b === void 0 ? void 0 : _b.filter(function (c) { return c.type === 'file'; }).length) || 0;
        var folderCount = ((_c = file.children) === null || _c === void 0 ? void 0 : _c.filter(function (c) { return c.type === 'folder'; }).length) || 0;
        return (<div className="win31-file-viewer-folder">
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
        {file.children && file.children.length > 0 && (<div className="win31-file-viewer-grid">
            {file.children.map(function (child) { return (<div key={child.path} className="win31-file-viewer-grid-item">
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
              </div>); })}
          </div>)}
      </div>);
    }
    // File content view
    return (<div className="win31-file-viewer-content">
      <div className="win31-file-viewer-header">
        <span className="win31-file-viewer-file-icon">{getFileIcon(file.name)}</span>
        <span className="win31-file-viewer-file-name">{file.name}</span>
        {file.size !== undefined && (<span className="win31-file-viewer-file-size">
            {file.size < 1024
                ? "".concat(file.size, " bytes")
                : "".concat((file.size / 1024).toFixed(1), " KB")}
          </span>)}
      </div>
      <div className="win31-file-viewer-body">
        {file.content ? (<pre className="win31-file-viewer-pre">{file.content}</pre>) : (<div className="win31-file-viewer-no-content">
            Content not available in preview.
            <br />
            <a href={"https://github.com/erichowens/some_claude_skills/blob/main/.claude/skills/".concat(file.path)} target="_blank" rel="noopener noreferrer" className="win31-file-viewer-link">
              View on GitHub →
            </a>
          </div>)}
      </div>
    </div>);
}
// Main File Manager Component
function Win31FileManager(_a) {
    var title = _a.title, rootFolder = _a.rootFolder, _b = _a.defaultExpanded, defaultExpanded = _b === void 0 ? [] : _b, defaultSelected = _a.defaultSelected, _c = _a.height, height = _c === void 0 ? 400 : _c, _d = _a.showStatusBar, showStatusBar = _d === void 0 ? true : _d, onFileSelect = _a.onFileSelect;
    // Initialize expanded paths
    var _e = (0, react_1.useState)(function () { return new Set(__spreadArray([rootFolder.path], defaultExpanded, true)); }), expandedPaths = _e[0], setExpandedPaths = _e[1];
    // Selected file/folder
    var _f = (0, react_1.useState)(function () {
        if (!defaultSelected)
            return null;
        // Find the node at defaultSelected path
        var findNode = function (node) {
            if (node.path === defaultSelected)
                return node;
            if (node.children) {
                for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
                    var child = _a[_i];
                    var found = findNode(child);
                    if (found)
                        return found;
                }
            }
            return null;
        };
        return findNode(rootFolder);
    }), selectedNode = _f[0], setSelectedNode = _f[1];
    // Count total files/folders
    var stats = (0, react_1.useMemo)(function () {
        var files = 0;
        var folders = 0;
        var count = function (node) {
            var _a;
            if (node.type === 'file')
                files++;
            else {
                folders++;
                (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(count);
            }
        };
        count(rootFolder);
        return { files: files, folders: folders - 1 }; // Don't count root
    }, [rootFolder]);
    var handleToggleExpand = function (path) {
        setExpandedPaths(function (prev) {
            var next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            }
            else {
                next.add(path);
            }
            return next;
        });
    };
    var handleSelect = function (node) {
        setSelectedNode(node);
        onFileSelect === null || onFileSelect === void 0 ? void 0 : onFileSelect(node);
    };
    // Expand all folders
    var handleExpandAll = function () {
        var allPaths = new Set();
        var collect = function (node) {
            var _a;
            if (node.type === 'folder') {
                allPaths.add(node.path);
                (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(collect);
            }
        };
        collect(rootFolder);
        setExpandedPaths(allPaths);
    };
    // Collapse all folders
    var handleCollapseAll = function () {
        setExpandedPaths(new Set([rootFolder.path]));
    };
    return (<div className="win31-window win31-file-manager">
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
        <button className="win31-push-button" onClick={handleExpandAll} title="Expand All">
          + All
        </button>
        <button className="win31-push-button" onClick={handleCollapseAll} title="Collapse All">
          - All
        </button>
        <div className="win31-file-manager-toolbar-divider"/>
        <span className="win31-file-manager-toolbar-path">
          C:\SKILLS\{rootFolder.name.toUpperCase().replace(/-/g, '_')}
        </span>
      </div>

      {/* Main Content Area - Split Pane */}
      <div className="win31-file-manager-content" style={{ height: typeof height === 'number' ? "".concat(height, "px") : height }}>
        {/* Left Panel - Tree View */}
        <div className="win31-file-manager-tree-panel">
          <div className="win31-panel-inset win31-file-manager-tree-inner">
            <TreeNode node={rootFolder} depth={0} expandedPaths={expandedPaths} selectedPath={(selectedNode === null || selectedNode === void 0 ? void 0 : selectedNode.path) || null} onToggleExpand={handleToggleExpand} onSelect={handleSelect}/>
          </div>
        </div>

        {/* Divider */}
        <div className="win31-file-manager-divider"/>

        {/* Right Panel - File Viewer */}
        <div className="win31-file-manager-view-panel">
          <div className="win31-panel-inset win31-file-manager-view-inner">
            <FileViewer file={selectedNode}/>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {showStatusBar && (<div className="win31-statusbar">
          <div className="win31-statusbar-panel" style={{ flex: 1 }}>
            {selectedNode
                ? "Selected: ".concat(selectedNode.name)
                : 'Ready'}
          </div>
          <div className="win31-statusbar-panel">
            {stats.folders} folder{stats.folders !== 1 ? 's' : ''}
          </div>
          <div className="win31-statusbar-panel">
            {stats.files} file{stats.files !== 1 ? 's' : ''}
          </div>
        </div>)}
    </div>);
}
