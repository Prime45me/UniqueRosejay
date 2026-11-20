import type { ElementType, ReactNode } from 'react';

interface ContainerProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Shared page container: max 80rem with responsive 16 / 24 / 32px gutters. */
export function Container({ as: Tag = 'div', className = '', children }: ContainerProps) {
  return <Tag className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`}>{children}</Tag>;
}
