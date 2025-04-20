import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { MDEditorProps } from '@uiw/react-md-editor';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

interface CustomMDEditorProps {
  value: string;
  onChange: (value?: string) => void;
  height?: number;
}

export default function CustomMDEditor({ value, onChange, height = 500 }: CustomMDEditorProps) {
  const [preview, setPreview] = useState<'live' | 'edit' | 'preview'>('live');

  return (
    <div data-color-mode="light">
      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={preview}
        onPreviewChange={setPreview}
        previewOptions={{
          components: {
            iframe: (props: any) => (
              <iframe
                {...props}
                style={{ width: '100%', height: '500px', margin: '1rem 0', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
              />
            ),
          },
        }}
      />
    </div>
  );
} 