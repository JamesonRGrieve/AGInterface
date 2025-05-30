import React, { ReactNode } from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
}
export default function TabPanel(props: TabPanelProps): ReactNode {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      className={props.className}
      ref={props.ref}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}
