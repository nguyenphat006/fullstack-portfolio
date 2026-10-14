"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { toast } from "sonner";
import {
  Bold, Code, FileCode2, Film, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Minus, Pilcrow, Quote,
  Redo2, Strikethrough, Undo2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { extractErrorMessage } from "@/lib/api/errorUtils";
import { cn } from "@/lib/utils";

export type MediaKind = "image" | "video";

interface MarkdownEditorProps {
  /** Nội dung Markdown (lưu xuống API dạng Markdown, landing hiển thị lại y hệt) */
  value: string;
  onChange: (value: string) => void;
  /** Tải ảnh / video lên server, trả URL tệp */
  upload: (file: File, kind: MediaKind) => Promise<string>;
  minHeight?: number;
  invalid?: boolean;
  id?: string;
}

/** Khối video (lưu thành thẻ HTML `<video>` trong Markdown — landing render bằng rehype-raw) */
const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: "video[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "true", playsinline: "true" })];
  },
});

const getMarkdown = (editor: Editor): string =>
  (editor.storage as unknown as { markdown: { getMarkdown: () => string } }).markdown.getMarkdown();

/**
 * Trình soạn thảo trực quan (WYSIWYG): người dùng thấy nội dung đã định dạng, không thấy ký hiệu Markdown.
 * Giá trị vào / ra vẫn là Markdown để API và landing không phải đổi. Hỗ trợ chèn / kéo thả / dán ảnh và video.
 */
export function MarkdownEditor({ value, onChange, upload, minHeight = 420, invalid, id }: MarkdownEditorProps) {
  const t = useTranslations("form.markdown");
  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const lastEmitted = useRef(value);
  const [uploading, setUploading] = useState(false);
  const uploadRef = useRef(upload);
  useEffect(() => {
    uploadRef.current = upload;
  }, [upload]);

  const insertMedia = async (editor: Editor, file: File, kind: MediaKind) => {
    setUploading(true);
    try {
      const url = await uploadRef.current(file, kind);
      if (kind === "image") editor.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, "") }).run();
      else editor.chain().focus().insertContent({ type: "video", attrs: { src: url } }).run();
    } catch (error) {
      toast.error(extractErrorMessage(error, t("uploadError")));
    } finally {
      setUploading(false);
    }
  };

  const editor = useEditor({
    immediatelyRender: false, // tránh lệch hydrate với Next.js SSR
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false, autolink: false } }),
      Image.configure({ inline: false }),
      Video,
      Placeholder.configure({ placeholder: t("placeholder") }),
      Markdown.configure({ html: true, transformPastedText: true, linkify: false, breaks: false }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "md-preview tiptap-editor outline-none", ...(id ? { id } : {}) },
      handleDrop: (view, event) => {
        const file = (event as DragEvent).dataTransfer?.files?.[0];
        if (!file || !editorRef.current) return false;
        const kind: MediaKind | null = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null;
        if (!kind) return false;
        event.preventDefault();
        void insertMedia(editorRef.current, file, kind);
        return true;
      },
      handlePaste: (_view, event) => {
        const file = event.clipboardData?.files?.[0];
        if (!file || !file.type.startsWith("image/") || !editorRef.current) return false;
        event.preventDefault();
        void insertMedia(editorRef.current, file, "image");
        return true;
      },
    },
    onUpdate: ({ editor: e }) => {
      const md = getMarkdown(e);
      lastEmitted.current = md;
      onChange(md);
    },
  });
  const editorRef = useRef<Editor | null>(null);
  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Giá trị đổi từ ngoài (tải bản ghi, dịch tự động) -> nạp lại nội dung
  useEffect(() => {
    if (!editor || value === lastEmitted.current) return;
    lastEmitted.current = value;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const run = (key: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    switch (key) {
      case "paragraph": return chain.setParagraph().run();
      case "h2": return chain.toggleHeading({ level: 2 }).run();
      case "h3": return chain.toggleHeading({ level: 3 }).run();
      case "bold": return chain.toggleBold().run();
      case "italic": return chain.toggleItalic().run();
      case "strike": return chain.toggleStrike().run();
      case "code": return chain.toggleCode().run();
      case "ul": return chain.toggleBulletList().run();
      case "ol": return chain.toggleOrderedList().run();
      case "quote": return chain.toggleBlockquote().run();
      case "codeBlock": return chain.toggleCodeBlock().run();
      case "hr": return chain.setHorizontalRule().run();
      case "link": {
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt(t("link"), prev ?? "https://");
        if (url === null) return;
        if (!url) return chain.extendMarkRange("link").unsetLink().run();
        return chain.extendMarkRange("link").setLink({ href: url }).run();
      }
      case "image": return imageInput.current?.click();
      case "video": return videoInput.current?.click();
      case "undo": return chain.undo().run();
      case "redo": return chain.redo().run();
    }
  };

  const isActive = (key: string): boolean => {
    if (!editor) return false;
    switch (key) {
      case "paragraph": return editor.isActive("paragraph");
      case "h2": return editor.isActive("heading", { level: 2 });
      case "h3": return editor.isActive("heading", { level: 3 });
      case "ul": return editor.isActive("bulletList");
      case "ol": return editor.isActive("orderedList");
      case "quote": return editor.isActive("blockquote");
      case "codeBlock": return editor.isActive("codeBlock");
      case "link": return editor.isActive("link");
      case "bold": case "italic": case "strike": case "code": return editor.isActive(key);
      default: return false;
    }
  };

  const tools: { key: string; icon: React.ReactNode; label: string }[][] = [
    [
      { key: "undo", icon: <Undo2 />, label: "Undo" },
      { key: "redo", icon: <Redo2 />, label: "Redo" },
    ],
    [
      { key: "paragraph", icon: <Pilcrow />, label: t("paragraph") },
      { key: "h2", icon: <Heading2 />, label: t("h2") },
      { key: "h3", icon: <Heading3 />, label: t("h3") },
    ],
    [
      { key: "bold", icon: <Bold />, label: t("bold") },
      { key: "italic", icon: <Italic />, label: t("italic") },
      { key: "strike", icon: <Strikethrough />, label: t("strike") },
      { key: "code", icon: <Code />, label: t("code") },
      { key: "link", icon: <Link2 />, label: t("link") },
    ],
    [
      { key: "ul", icon: <List />, label: t("ul") },
      { key: "ol", icon: <ListOrdered />, label: t("ol") },
      { key: "quote", icon: <Quote />, label: t("quote") },
      { key: "codeBlock", icon: <FileCode2 />, label: t("codeBlock") },
      { key: "hr", icon: <Minus />, label: t("hr") },
    ],
    [
      { key: "image", icon: <ImagePlus />, label: t("image") },
      { key: "video", icon: <Film />, label: t("video") },
    ],
  ];

  return (
    <div className={cn("overflow-hidden rounded-lg border bg-card", invalid && "border-destructive")}>
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-[var(--c-bg-subtle)] px-2 py-1.5">
        {tools.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span className="mx-1 h-5 w-px bg-border" aria-hidden />}
            {group.map((tool) => (
              <Tooltip key={tool.key}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()} // giữ vùng chọn trong trình soạn
                    onClick={() => run(tool.key)}
                    disabled={!editor || uploading}
                    aria-label={tool.label}
                    aria-pressed={isActive(tool.key)}
                    className={cn(
                      "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--c-bg-muted)] hover:text-foreground disabled:opacity-40 [&_svg]:size-4",
                      isActive(tool.key) && "bg-[var(--c-primary-bg)] text-[var(--c-primary)]",
                    )}
                  >
                    {tool.icon}
                  </button>
                </TooltipTrigger>
                <TooltipContent>{tool.label}</TooltipContent>
              </Tooltip>
            ))}
          </React.Fragment>
        ))}
        {uploading && (
          <span className="ml-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" /> {t("uploading")}
          </span>
        )}
      </div>

      <div className="cursor-text px-5 py-4" style={{ minHeight }} onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <div className="flex items-center justify-between gap-2 border-t bg-[var(--c-bg-subtle)] px-3 py-1.5 text-xs text-muted-foreground">
        <span>{t("hint")}</span>
        <span className="shrink-0 tabular-nums">{t("chars", { count: value.length })}</span>
      </div>

      <input ref={imageInput} type="file" accept="image/png,image/jpeg,image/webp" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f && editor) void insertMedia(editor, f, "image"); e.target.value = ""; }} />
      <input ref={videoInput} type="file" accept="video/mp4,video/webm" hidden
        onChange={(e) => { const f = e.target.files?.[0]; if (f && editor) void insertMedia(editor, f, "video"); e.target.value = ""; }} />
    </div>
  );
}
