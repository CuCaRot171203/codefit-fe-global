import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { message, Upload as AntUpload } from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link as LinkIcon,
  Highlighter,
  Minus,
  Upload,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const { theme } = useAppSelector((state) => state.theme);
  const isDark = theme === 'dark';
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Bắt đầu viết nội dung...',
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload: UploadProps['onChange'] = useCallback(async ({ fileList }) => {
    if (fileList.length > 0 && fileList[0].originFileObj) {
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj as Blob);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          editor?.chain().focus().setImage({ src: data.data.url }).run();
          message.success('Upload ảnh thành công');
        }
      } catch (error) {
        console.error('Upload error:', error);
        message.error('Upload ảnh thất bại');
      }
    }
  }, [editor]);

  const addImageByUrl = () => {
    if (imageUrlInput.trim()) {
      editor?.chain().focus().setImage({ src: imageUrlInput.trim() }).run();
      setImageUrlInput('');
      setShowImageInput(false);
    }
  };

  const addLink = () => {
    if (linkUrl.trim()) {
      editor?.chain().focus().setLink({ href: linkUrl.trim() }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title?: string;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center w-8 h-8 rounded border text-sm transition-all',
        isActive
          ? 'bg-cyan-500 border-cyan-500 text-white'
          : isDark
          ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
      )}
    >
      {children}
    </button>
  );

  return (
    <div className={cn('tiptap-editor rounded-lg border overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="toolbar">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Hoàn tác"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Làm lại"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <div className="divider" />

        {/* Text Format */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="In đậm (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="In nghiêng (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Gạch ngang"
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          title="Mã inline"
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          title="Tô đậm"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <div className="divider" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Tiêu đề 1"
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Tiêu đề 2"
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Tiêu đề 3"
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <div className="divider" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Danh sách"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Danh sách số"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Trích dẫn"
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>

        <div className="divider" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Canh trái"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Canh giữa"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Canh phải"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          isActive={editor.isActive({ textAlign: 'justify' })}
          title="Canh đều"
        >
          <AlignJustify className="w-4 h-4" />
        </ToolbarButton>

        <div className="divider" />

        {/* Link & Image */}
        <ToolbarButton
          onClick={() => setShowLinkInput(!showLinkInput)}
          isActive={editor.isActive('link')}
          title="Chèn liên kết"
        >
          <LinkIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => setShowImageInput(!showImageInput)}
          title="Chèn hình ảnh"
        >
          <ImageIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Đường kẻ ngang"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Link Input Popup */}
      {showLinkInput && (
        <div
          className={cn(
            'p-3 border-b flex items-center gap-2',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}
        >
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Nhập URL (ví dụ: https://example.com)"
            className={cn(
              'flex-1 px-3 py-1.5 rounded border text-sm',
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-slate-700'
            )}
            onKeyDown={(e) => e.key === 'Enter' && addLink()}
          />
          <button
            onClick={addLink}
            className="px-3 py-1.5 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600"
          >
            Thêm
          </button>
          {editor.isActive('link') && (
            <button
              onClick={removeLink}
              className={cn(
                'px-3 py-1.5 rounded text-sm',
                isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
              )}
            >
              Xóa
            </button>
          )}
          <button
            onClick={() => setShowLinkInput(false)}
            className={cn(
              'px-3 py-1.5 rounded text-sm',
              isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
            )}
          >
            Hủy
          </button>
        </div>
      )}

      {/* Image URL Input Popup */}
      {showImageInput && (
        <div
          className={cn(
            'p-3 border-b flex items-center gap-2',
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          )}
        >
          <input
            type="url"
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Nhập URL hình ảnh"
            className={cn(
              'flex-1 px-3 py-1.5 rounded border text-sm',
              isDark
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-slate-300 text-slate-700'
            )}
            onKeyDown={(e) => e.key === 'Enter' && addImageByUrl()}
          />
          <button
            onClick={addImageByUrl}
            className="px-3 py-1.5 bg-cyan-500 text-white rounded text-sm hover:bg-cyan-600"
          >
            Thêm URL
          </button>
          <span className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>hoặc</span>
          <AntUpload
            showUploadList={false}
            beforeUpload={() => false}
            accept="image/*"
            onChange={handleImageUpload}
          >
            <button
              type="button"
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded text-sm',
                isDark ? 'bg-slate-700 text-slate-200' : 'bg-white border border-slate-300 text-slate-700'
              )}
            >
              <Upload className="w-4 h-4" />
              Upload ảnh
            </button>
          </AntUpload>
          <button
            onClick={() => setShowImageInput(false)}
            className={cn(
              'px-3 py-1.5 rounded text-sm',
              isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-200 text-slate-600'
            )}
          >
            Hủy
          </button>
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className={cn(
          'editor-content',
          isDark ? 'bg-slate-900' : 'bg-white'
        )}
      />
    </div>
  );
}
