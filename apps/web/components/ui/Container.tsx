import type { ElementType, HTMLAttributes, ReactNode } from 'react';

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/** Shared page container: max 80rem with responsive 16 / 24 / 32px gutters. Passes through ARIA/HTML attributes. */
export function Container({ as: Tag = 'div', className = '', children, ...rest }: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-site px-4 sm:px-6 lg:px-8 ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
