'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * DAGEEVES.EXE - File Manager for AI/DAG Navigation
 * 
 * "The File Manager of Ideas"
 * Instead of files, browse a problem space. Ask a question,
 * get a "file tree" of tasks (a DAG).
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState, useCallback } from 'react';
import styles from './dageeves.module.css';

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  skillType?: string;
  tokens?: number;
  children?: TreeNode[];
  expanded?: boolean;
}

interface DageevesProps {
  onAction?: (action: string) => void;
}

export function Dageeves({ onAction: _onAction }: DageevesProps) {
  const [query, setQuery] = useState('How do I launch a newsletter?');
  const [currentPath, setCurrentPath] = useState('C:\\Query\\How do I launch a newsletter?');
  const [status, setStatus] = useState('Ready');
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(null);
  const [tree, setTree] = useState<TreeNode[]>([
    {
      id: '1',
      name: '1_Strategy',
      type: 'folder',
      expanded: true,
      children: [
        { id: '1-1', name: 'Define_Audience.txt', type: 'file', skillType: 'ANALYST', tokens: 320 },
        { id: '1-2', name: 'Value_Proposition.doc', type: 'file', skillType: 'WRITER', tokens: 450 },
      ],
    },
    {
      id: '2',
      name: '2_Content_Creation',
      type: 'folder',
      expanded: true,
      children: [
        { id: '2-1', name: 'Draft_Intro.txt', type: 'file', skillType: 'WRITER', tokens: 450 },
        { id: '2-2', name: 'Tone_Voice.cfg', type: 'file', skillType: 'EDITOR', tokens: 280 },
        { id: '2-3', name: 'First_Issue.md', type: 'file', skillType: 'WRITER', tokens: 800 },
      ],
    },
    {
      id: '3',
      name: '3_Distribution',
      type: 'folder',
      expanded: false,
      children: [
        { id: '3-1', name: 'Platform_Selection.txt', type: 'file', skillType: 'ANALYST', tokens: 350 },
        { id: '3-2', name: 'Email_Setup.cfg', type: 'file', skillType: 'DEVOPS', tokens: 220 },
        { id: '3-3', name: 'Launch_Checklist.md', type: 'file', skillType: 'PM', tokens: 180 },
      ],
    },
  ]);

  const toggleFolder = useCallback((id: string) => {
    const toggleInTree = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === id) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) };
        }
        return node;
      });
    };
    setTree(toggleInTree(tree));
  }, [tree]);

  const handleFileSelect = useCallback((file: TreeNode) => {
    setSelectedFile(file);
  }, []);

  const handleExecute = useCallback(() => {
    if (selectedFile) {
      setStatus(`Executing ${selectedFile.name}...`);
      // Simulate execution
      setTimeout(() => {
        setStatus(`Completed: ${selectedFile.name}`);
      }, 1500);
    }
  }, [selectedFile]);

  const handleNewQuery = useCallback(() => {
    const newQuery = prompt('Enter your query:', query);
    if (newQuery) {
      setQuery(newQuery);
      setCurrentPath(`C:\\Query\\${newQuery}`);
      setStatus('ANALYZING...');
      setTimeout(() => setStatus('Ready'), 1500);
    }
  }, [query]);

  const renderTreeNode = (node: TreeNode, depth: number = 0): React.ReactNode => {
    const indent = depth * 16;
    const isFolder = node.type === 'folder';
    const isSelected = selectedFile?.id === node.id;

    return (
      <React.Fragment key={node.id}>
        <div
          className={`${styles.treeItem} ${isSelected ? styles.treeItemSelected : ''}`}
          style={{ paddingLeft: indent }}
          onClick={() => isFolder ? toggleFolder(node.id) : handleFileSelect(node)}
          onDoubleClick={() => isFolder ? toggleFolder(node.id) : handleExecute()}
        >
          <span className={styles.treeIcon}>
            {isFolder ? (node.expanded ? '📂' : '📁') : '📄'}
          </span>
          <span className={styles.treeName}>{node.name}</span>
        </div>
        {isFolder && node.expanded && node.children?.map(child => 
          renderTreeNode(child, depth + 1)
        )}
      </React.Fragment>
    );
  };

  return (
    <div className={styles.container}>
      {/* Drive Bar */}
      <div className={styles.driveBar}>
        <button className={`${styles.driveButton} ${styles.driveButtonActive}`}>
          <span className={styles.driveIcon}>🧠</span>
          <span>A:</span>
        </button>
        <button className={styles.driveButton}>
          <span className={styles.driveIcon}>🌐</span>
          <span>B:</span>
        </button>
        <button className={styles.driveButton}>
          <span className={styles.driveIcon}>🗄️</span>
          <span>C:</span>
        </button>
      </div>

      {/* Path Bar */}
      <div className={styles.pathBar}>
        <span className={styles.pathLabel}>Current Path:</span>
        <span className={styles.pathValue}>{currentPath}</span>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Tree View */}
        <div className={styles.treePane}>
          <div className={styles.treePaneHeader}>
            <button className={styles.treeBackButton} title="Parent Directory">..</button>
            <span>[ C:\\ ]</span>
          </div>
          <div className={styles.treeContent}>
            {tree.map(node => renderTreeNode(node))}
          </div>
        </div>

        {/* Detail Pane */}
        <div className={styles.detailPane}>
          <div className={styles.detailHeader}>
            STATUS: <span className={styles.statusValue}>{status}</span>
          </div>
          <div className={styles.detailContent}>
            {selectedFile ? (
              <>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>File Name:</span>
                  <div className={styles.detailInput}>{selectedFile.name}</div>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Skill Type:</span>
                  <div className={styles.detailInput}>{selectedFile.skillType || 'N/A'}</div>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Est. Tokens:</span>
                  <div className={styles.detailInput}>{selectedFile.tokens || 0}</div>
                </div>
                <div className={styles.detailButtons}>
                  <button className={styles.win31Button} onClick={handleExecute}>
                    EXECUTE
                  </button>
                  <button className={styles.win31Button} onClick={() => setSelectedFile(null)}>
                    CANCEL
                  </button>
                </div>
              </>
            ) : (
              <div className={styles.detailPlaceholder}>
                Select a file to view details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusPanel}>
          {selectedFile ? `Selected: ${selectedFile.name}` : 'Select a task to execute'}
        </div>
        <div className={styles.statusPanel}>
          {tree.length} folders | {tree.reduce((acc, f) => acc + (f.children?.length || 0), 0)} files
        </div>
      </div>

      {/* New Query Button */}
      <button className={styles.newQueryButton} onClick={handleNewQuery}>
        📝 New Query...
      </button>
    </div>
  );
}
