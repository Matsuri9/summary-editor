import { useState } from "react";
import { Editor, rootCtx, defaultValueCtx } from "@milkdown/core";
import { commonmark } from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { useAutoSave } from "../hooks";
import type { EditorMode } from "../types";
import { getFileName } from "../lib/fileUtils";
import { MarkdownIcon, CheckIcon, SaveIcon, SpinnerIcon } from "./icons";

interface NotePanelProps {
    content: string;
    onChange: (content: string) => void;
    filePath: string | null;
    onSave?: (content: string) => void;
}

function MilkdownEditor({
    content,
    onChange,
    triggerAutoSave,
}: {
    content: string;
    onChange: (content: string) => void;
    triggerAutoSave: (content: string) => void;
}) {
    useEditor((root) =>
        Editor.make()
            .config((ctx) => {
                ctx.set(rootCtx, root);
                ctx.set(defaultValueCtx, content);

                // Setup listener for changes
                const listenerManager = ctx.get(listenerCtx);
                listenerManager.markdownUpdated((_, markdown) => {
                    onChange(markdown);
                    triggerAutoSave(markdown);
                });
            })
            .use(commonmark)
            .use(gfm)
            .use(listener)
    );

    return (
        <div className="milkdown-editor markdown-body max-w-none">
            <Milkdown />
        </div>
    );
}

export function NotePanel({
    content,
    onChange,
    filePath,
    onSave,
}: NotePanelProps) {
    const [mode, setMode] = useState<EditorMode>("wysiwyg");
    const [editorKey, setEditorKey] = useState(0);

    const { isSaving, lastSaved, triggerAutoSave, manualSave } = useAutoSave({
        onSave,
        filePath,
    });

    // Handle mode switch
    const switchMode = (newMode: EditorMode) => {
        setMode(newMode);
        // Remount WYSIWYG editor when switching back
        if (newMode === "wysiwyg") {
            setEditorKey((prev) => prev + 1);
        }
    };

    const handleRawChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        onChange(newContent);
        triggerAutoSave(newContent);
    };

    const handleManualSave = () => {
        manualSave(content);
    };

    const fileName = getFileName(filePath);

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <NoteToolbar
                fileName={fileName}
                characterCount={content.length}
                isSaving={isSaving}
                lastSaved={lastSaved}
                mode={mode}
                onModeSwitch={switchMode}
                onSave={handleManualSave}
                showSaveButton={!!filePath}
            />

            {/* Editor Content */}
            <div className="flex-1 overflow-auto note-panel p-6 bg-white">
                {mode === "wysiwyg" ? (
                    <MilkdownProvider key={editorKey}>
                        <MilkdownEditor
                            content={content}
                            onChange={onChange}
                            triggerAutoSave={triggerAutoSave}
                        />
                    </MilkdownProvider>
                ) : (
                    /* Raw Markdown mode */
                    <textarea
                        value={content}
                        onChange={handleRawChange}
                        onKeyDown={(e) => {
                            // Ctrl+S to save
                            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                                e.preventDefault();
                                handleManualSave();
                            }
                        }}
                        className="w-full h-full resize-none focus:outline-none font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 leading-relaxed"
                        placeholder="Markdownでメモを入力..."
                        spellCheck={false}
                    />
                )}
            </div>

            {/* Status bar for raw mode */}
            {mode === "raw" && (
                <div className="shrink-0 px-4 py-1.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Raw Markdown file editor</span>
                    <span>Ctrl + S to save</span>
                </div>
            )}
        </div>
    );
}

// Note Toolbar
interface NoteToolbarProps {
    fileName: string | null;
    characterCount: number;
    isSaving: boolean;
    lastSaved: Date | null;
    mode: EditorMode;
    onModeSwitch: (mode: EditorMode) => void;
    onSave: () => void;
    showSaveButton: boolean;
}

function NoteToolbar({
    fileName,
    characterCount,
    isSaving,
    lastSaved,
    mode,
    onModeSwitch,
    onSave,
    showSaveButton,
}: NoteToolbarProps) {
    return (
        <div className="shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <MarkdownIcon className="w-4 h-4 text-blue-500" />
                    {fileName ? (
                        <span className="text-sm font-medium text-gray-700">
                            {fileName}
                        </span>
                    ) : (
                        <span className="text-sm text-gray-400">未保存のメモ</span>
                    )}
                </div>
                <span className="text-xs text-gray-400">{characterCount} 文字</span>
            </div>
            <div className="flex items-center gap-2">
                <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />

                {/* Mode toggle */}
                <ModeToggle mode={mode} onModeSwitch={onModeSwitch} />

                {/* Manual save button */}
                {showSaveButton && (
                    <button
                        onClick={onSave}
                        className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded transition-colors flex items-center gap-1"
                        title="保存 (Ctrl+S)"
                    >
                        <SaveIcon className="w-3 h-3" />
                        保存
                    </button>
                )}
            </div>
        </div>
    );
}

interface SaveStatusProps {
    isSaving: boolean;
    lastSaved: Date | null;
}

function SaveStatus({ isSaving, lastSaved }: SaveStatusProps) {
    if (isSaving) {
        return (
            <span className="text-xs text-blue-500 flex items-center gap-1">
                <SpinnerIcon className="w-3 h-3" />
                保存中...
            </span>
        );
    }

    if (lastSaved) {
        return (
            <span className="text-xs text-green-600 flex items-center gap-1">
                <CheckIcon className="w-3 h-3" />
                保存済み
            </span>
        );
    }

    return null;
}

interface ModeToggleProps {
    mode: EditorMode;
    onModeSwitch: (mode: EditorMode) => void;
}

function ModeToggle({ mode, onModeSwitch }: ModeToggleProps) {
    return (
        <div className="flex border border-gray-200 rounded-md overflow-hidden">
            <button
                onClick={() => onModeSwitch("wysiwyg")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "wysiwyg"
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                title="Rich editor"
            >
                Rich
            </button>
            <button
                onClick={() => onModeSwitch("raw")}
                className={`px-3 py-1 text-xs font-medium transition-colors ${mode === "raw"
                        ? "bg-gray-700 text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                title="Raw editor"
            >
                Raw
            </button>
        </div>
    );
}
