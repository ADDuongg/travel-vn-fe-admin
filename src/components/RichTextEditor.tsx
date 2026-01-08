import JoditEditor from 'jodit-react';
import { useRef } from 'react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useRef(null);

  return (
    <JoditEditor
      ref={editor}
      value={value || ''}
      onBlur={(newContent) => onChange?.(newContent)}
    />
  );
}
