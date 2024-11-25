declare module '@uiw/react-md-editor' {
  import { ReactNode } from 'react';

  interface MDEditorProps {
    value?: string;
    onChange?: (value?: string) => void;
    preview?: 'live' | 'edit' | 'preview';
    height?: number;
    children?: ReactNode;
  }

  const MDEditor: React.ForwardRefExoticComponent<MDEditorProps>;
  export default MDEditor;
}
