import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  createCommand,
} from "lexical";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
  ListType,
} from "@lexical/list";
import React, { useCallback, useState, useEffect } from "react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaListOl,
  FaListUl,
} from "react-icons/fa";

const FONT_SIZE_COMMAND = createCommand("FONT_SIZE_COMMAND");

const FONT_SIZE_OPTIONS = [
  { value: "small", label: "14" },
  { value: "normal", label: "16" },
  { value: "large", label: "18" },
  { value: "xlarge", label: "20" },
];

type ListFormat = "ordered" | "unordered" | null;

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    align: "left",
    listType: null as ListFormat,
  });

  const updateActiveFormats = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      const format = selection.format;
      const element = selection.anchor.getNode().getParent();
      const listType = $isListNode(element) 
        ? ((element as ListNode).__listType === "number" ? "ordered" : "unordered")
        : null;

      setActiveFormats({
        bold: (format & 1) === 1,
        italic: (format & 2) === 2,
        underline: (format & 4) === 4,
        strikethrough: (format & 8) === 8,
        align: element?.getFormatType() || "left",
        listType,
      });
    });
  }, [editor]);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateActiveFormats();
      });
    });
  }, [editor, updateActiveFormats]);

  const handleFontSizeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const size = event.target.value;
      editor.dispatchCommand(FONT_SIZE_COMMAND, size);
    },
    [editor]
  );

  const getButtonClassName = (
    format: keyof typeof activeFormats,
    value?: string
  ) => {
    const baseClass = "p-2 text-neutral-500 hover:bg-neutral-200 rounded-full";
    const isActive =
      activeFormats[format] === true ||
      (format === "align" && activeFormats.align === value) ||
      (format === "listType" && activeFormats.listType === value);

    return `${baseClass} ${isActive ? "bg-neutral-200" : ""}`;
  };

  return (
    <div className="flex items-center gap-6 px-4 py-2 bg-neutral-100 rounded-t-lg">
      <select
        className="text-[18px] text-neutral-500 bg-transparent border-none focus:outline-none appearance-none pr-6 mr-2"
        onChange={handleFontSizeChange}
        defaultValue="normal"
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        title="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        className={getButtonClassName("bold")}
      >
        <FaBold />
      </button>
      <button
        type="button"
        title="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        className={getButtonClassName("italic")}
      >
        <FaItalic />
      </button>
      <button
        type="button"
        title="Underline"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        className={getButtonClassName("underline")}
      >
        <FaUnderline />
      </button>
      <button
        type="button"
        title="Strikethrough"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")
        }
        className={getButtonClassName("strikethrough")}
      >
        <FaStrikethrough />
      </button>
      <button
        type="button"
        title="Left Align"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        className={getButtonClassName("align", "left")}
      >
        <FaAlignLeft />
      </button>
      <button
        type="button"
        title="Center Align"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        className={getButtonClassName("align", "center")}
      >
        <FaAlignCenter />
      </button>
      <button
        type="button"
        title="Right Align"
        onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        className={getButtonClassName("align", "right")}
      >
        <FaAlignRight />
      </button>
      <button
        type="button"
        title="Numbered List"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
        className={getButtonClassName("listType", "ordered")}
      >
        <FaListOl />
      </button>
      <button
        type="button"
        title="Bulleted List"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
        className={getButtonClassName("listType", "unordered")}
      >
        <FaListUl />
      </button>
      <button
        type="button"
        title="Remove List"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
        className="p-2 text-neutral-500 hover:bg-neutral-200 rounded-full"
      >
        ⨯
      </button>
    </div>
  );
}
