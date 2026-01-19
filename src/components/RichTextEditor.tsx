import JoditEditor from 'jodit-react';
import { useRef } from 'react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};
const config = {
  readonly: false,
  toolbarAdaptive: false,
  buttons: [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    '|',
    'ul',
    'ol',
    '|',
    'fontsize',
    'paragraph',
    'brush',
    '|',
    'align',
    'link',
    'image',
    '|',
    'undo',
    'redo',
  ],
  controls: {
    fontsize: {
      list: [10, 12, 14, 16, 18, 24, 32],
    },
  },
};
export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useRef(null);

  return (
    <JoditEditor
      ref={editor}
      value={value || ''}
      onBlur={(newContent) => onChange?.(newContent)}
      config={config}
    />
  );
}
