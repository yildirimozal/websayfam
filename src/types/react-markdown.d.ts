declare module 'react-markdown' {
  import { ReactNode } from 'react';

  interface ReactMarkdownProps {
    children: string;
    components?: Record<string, React.ComponentType<any>>;
    className?: string;
    remarkPlugins?: any[];
    rehypePlugins?: any[];
  }

  export default function ReactMarkdown(props: ReactMarkdownProps): ReactNode;
}
