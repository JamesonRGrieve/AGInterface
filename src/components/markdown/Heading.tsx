import React, { ReactNode } from 'react';
import generateId from './generateID';

interface MarkdownHeadingProps {
  tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  children: ReactNode;
  className?: string;
}

export default function MarkdownHeading({ tag, children, className, ...props }: MarkdownHeadingProps): ReactNode {
  let text = '';
  if (React.isValidElement(children)) {
    text = children.props.children;
  } else if (typeof children === 'string') {
    text = children;
  }

  const id = generateId(text);

  const baseClasses = 'my-1 font-bold';
  const sizeClasses = {
    h1: 'text-4xl',
    h2: 'text-3xl',
    h3: 'text-2xl',
    h4: 'text-xl',
    h5: 'text-lg',
    h6: 'text-base',
  };

  const HeadingTag = tag;

  return (
    <HeadingTag id={id} className={`${baseClasses} ${sizeClasses[tag]} ${className || ''}`} {...props}>
      {children}
    </HeadingTag>
  );
}
