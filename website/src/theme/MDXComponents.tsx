import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import type MDXComponentsType from '@theme/MDXComponents';
import SkillHeader from '../components/SkillHeader';
import InstallTabs from '../components/InstallTabs';

const CustomMDXComponents: typeof MDXComponentsType = {
  ...MDXComponents,
  SkillHeader,
  InstallTabs,
  table: (props: React.ComponentPropsWithoutRef<'table'>) => (
    <table {...props} tabIndex={props.tabIndex ?? 0} />
  ),
  wrapper: ({ children }) => (
    <div className="win31-doc-content">{children}</div>
  ),
};

export default CustomMDXComponents;
