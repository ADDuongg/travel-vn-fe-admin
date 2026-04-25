import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import type { API } from '@editorjs/editorjs';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Embed from '@editorjs/embed';
import Warning from '@editorjs/warning';
import Checklist from '@editorjs/checklist';
import Raw from '@editorjs/raw';
import { uploadMedia } from '@/services/media.service';
import type { EditorJsBlock } from '@/interface/blog';
import './block-editor.css';

const DEFAULT_MIN_HEIGHT = 360;

/** Chờ dữ liệu thật từ Form — kể cả khi lần đầu Form chỉ truyền 1 block paragraph rỗng (placeholder). */
function isEmptyPlaceholderContent(
  blocks: EditorJsBlock[] | undefined | null,
): boolean {
  if (blocks == null || blocks.length === 0) {
    return true;
  }
  if (blocks.length > 1) {
    return false;
  }
  const b = blocks[0];
  if (b.type !== 'paragraph') {
    return false;
  }
  const text = (b.data?.text as string | undefined) ?? '';
  return !String(text).trim();
}

type Props = {
  /** Remount the editor (e.g. new post, reset form) */
  editorKey: string;
  value?: EditorJsBlock[];
  onChange?: (blocks: EditorJsBlock[]) => void;
  readOnly?: boolean;
  minHeight?: number;
  /** Ant Design Form: form disabled or Form.Item can pass this */
  disabled?: boolean;
  id?: string;
};

/**
 * Block editor (Editor.js) — output is `EditorJsBlock[]` for Blog API.
 * Dùng forwardRef + dọn `holder` khi unmount để tránh hỏng bởi React Strict Mode.
 */
const BlockEditor = forwardRef<HTMLDivElement, Props>(function BlockEditor(
  {
    editorKey,
    value,
    onChange,
    readOnly,
    minHeight = DEFAULT_MIN_HEIGHT,
    disabled,
    id,
  },
  ref,
) {
  const holderRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<EditorJS | null>(null);
  /** Cần gọi `render()` khi Form inject nội dung thật sau lần mount (placeholder/đồng bộ trễ). */
  const needsFormHydration = useRef(false);
  /** Đã có thay đổi từ Editor (user gõ) — không gọi `render` từ ngoài đè lên. */
  const touchedByEditorRef = useRef(false);
  /** Bỏ qua onChange từ Editor khi gọi `render()` từ code (không coi là user). */
  const suppressChangeFromProgrammaticRender = useRef(false);
  const onChangeRef = useRef<Props['onChange']>(onChange);
  onChangeRef.current = onChange;
  const valueRef = useRef(value);
  valueRef.current = value;

  const readOnlyOrDisabled = readOnly || disabled;

  useLayoutEffect(() => {
    const wrap = holderRef.current;
    if (!wrap) {
      return;
    }

    /** Gỡ toàn bộ con (StrictMode: mount2 chạy trước khi async cleanup of mount1 xong). */
    wrap.replaceChildren();
    instanceRef.current = null;
    needsFormHydration.current = false;
    touchedByEditorRef.current = false;
    suppressChangeFromProgrammaticRender.current = false;

    const v = valueRef.current;
    const initialBlocks: EditorJsBlock[] =
      v && v.length > 0
        ? v
        : [{ id: 'p0', type: 'paragraph', data: { text: '' } }];

    needsFormHydration.current = isEmptyPlaceholderContent(v);

    const el = document.createElement('div');
    el.className = 'block-editor-holder-inner';
    el.style.minHeight = `${minHeight}px`;
    el.style.width = '100%';
    wrap.appendChild(el);

    let instance: EditorJS;
    let cancelled = false;
    try {
      instance = new EditorJS({
        holder: el,
        readOnly: !!readOnlyOrDisabled,
        minHeight,
        data: { blocks: initialBlocks as never },
        tools: {
          paragraph: {
            class: Paragraph,
            /** Bôi chọn chữ: Bold / Italic / Link (inline tools sẵn có trong @editorjs/editorjs) */
            inlineToolbar: ['bold', 'italic', 'link'],
            config: {
              placeholder: 'Bắt đầu viết nội dung…',
            },
          },
          header: {
            class: Header,
            inlineToolbar: ['bold', 'italic', 'link'],
            config: {
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: ['bold', 'italic', 'link'],
            config: { defaultStyle: 'unordered' },
          },
          image: {
            class: Image,
            config: {
              uploader: {
                uploadByFile: async (file: File) => {
                  const r = await uploadMedia(file);
                  return {
                    success: 1,
                    file: {
                      url: r.url,
                      ...(r.publicId ? { publicId: r.publicId } : {}),
                    },
                  };
                },
              },
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: ['bold', 'italic', 'link'],
          },
          code: { class: Code },
          delimiter: { class: Delimiter },
          table: { class: Table },
          embed: { class: Embed },
          warning: { class: Warning },
          /** Giống demo trên editorjs.io: thêm block “tùy chọn” thường dùng */
          checklist: {
            class: Checklist,
            inlineToolbar: ['bold', 'italic', 'link'],
          },
          raw: { class: Raw },
        } as never,
        onChange: async (api: API) => {
          if (readOnlyOrDisabled) {
            return;
          }
          if (!suppressChangeFromProgrammaticRender.current) {
            touchedByEditorRef.current = true;
          }
          try {
            const data = await api.saver.save();
            onChangeRef.current?.(data.blocks as EditorJsBlock[]);
          } catch (e) {
            console.error('EditorJS save', e);
          }
        },
      });
    } catch (e) {
      console.error('EditorJS init', e);
      if (el.parentNode === wrap) {
        wrap.removeChild(el);
      }
      return;
    }

    instanceRef.current = instance;

    void instance.isReady
      .then(() => {
        if (cancelled) {
          return;
        }
        wrap.closest('.block-editor-wrap')?.classList.add('block-editor--ready');
      })
      .catch((e) => {
        if (!cancelled) {
          console.error('EditorJS isReady', e);
        }
      });

    return () => {
      cancelled = true;
      instanceRef.current = null;
      wrap.closest('.block-editor-wrap')?.classList.remove('block-editor--ready');
      void instance.isReady
        .then(() => {
          void instance.destroy();
        })
        .catch(() => {
          // ignore
        })
        .finally(() => {
          if (el.parentNode === wrap) {
            wrap.removeChild(el);
          }
        });
    };
  }, [editorKey, readOnlyOrDisabled, minHeight]);

  /**
   * Khi Form inject nội dung thật sau khi mount (trễ / placeholder).
   * — Không để `value` trong dependency: mỗi lần Form re-render tạo mảng mới sẽ hủy effect,
   *   cắt `render()` giữa chừng → nhấp nháy, mất nội dung.
   * — Dùng rAF thử tối đa vài lần rồi gọi `render` một lần (đọc `valueRef.current`).
   */
  useEffect(() => {
    if (readOnlyOrDisabled) {
      return;
    }
    if (!needsFormHydration.current) {
      return;
    }

    const maxRafTries = 40;
    let raf: number;
    let stopped = false;
    let n = 0;

    const runRender = (blocks: EditorJsBlock[]) => {
      const inst = instanceRef.current;
      if (!inst) {
        return;
      }
      let willRender = false;
      return inst.isReady
        .then(() => {
          if (stopped) {
            return;
          }
          if (touchedByEditorRef.current) {
            needsFormHydration.current = false;
            return;
          }
          if (isEmptyPlaceholderContent(valueRef.current)) {
            return;
          }
          willRender = true;
          suppressChangeFromProgrammaticRender.current = true;
          return inst.render({ blocks: blocks as never });
        })
        .then(() => {
          if (willRender && !stopped) {
            needsFormHydration.current = false;
          }
          if (willRender) {
            window.setTimeout(() => {
              suppressChangeFromProgrammaticRender.current = false;
            }, 0);
          }
        })
        .catch((e) => {
          suppressChangeFromProgrammaticRender.current = false;
          console.error('EditorJS late render', e);
        });
    };

    const tryHydrate = () => {
      if (stopped) {
        return;
      }
      if (touchedByEditorRef.current) {
        needsFormHydration.current = false;
        return;
      }
      const v = valueRef.current;
      if (isEmptyPlaceholderContent(v) && n < maxRafTries) {
        n += 1;
        raf = requestAnimationFrame(tryHydrate);
        return;
      }
      if (isEmptyPlaceholderContent(v) || !v?.length) {
        return;
      }
      void runRender(v);
    };

    raf = requestAnimationFrame(tryHydrate);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [readOnlyOrDisabled, editorKey]);

  return (
    <div
      id={id}
      ref={ref}
      className="block-editor-wrap"
      style={{
        border:
          '1px solid var(--ant-color-border, var(--border-primary, #d9d9d9))',
        borderRadius: 8,
        padding: 8,
        color: 'var(--ant-color-text, var(--text-primary, inherit))',
        background:
          'var(--ant-color-bg-container, var(--warm-surface-200, #fff))',
        width: '100%',
        minHeight,
        overflow: 'visible',
      }}
    >
      <div
        ref={holderRef}
        className="block-editor-holder"
        style={{ minHeight, width: '100%' }}
      />
    </div>
  );
});

BlockEditor.displayName = 'BlockEditor';

export default BlockEditor;
