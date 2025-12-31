import JoditEditor from 'jodit-react';
import { useRef } from 'react';

type Props = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
  const contentRef = useRef(value || '');

  return (
    <JoditEditor
      value={contentRef.current}
      config={{
        readonly: false,
        height: 250,
        toolbarAdaptive: false,
      }}
      onChange={(newContent) => {
        contentRef.current = newContent;
      }}
      onBlur={() => {
        onChange?.(contentRef.current);
      }}
    />
  );
}
