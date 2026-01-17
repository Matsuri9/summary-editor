import { useState, useCallback, useRef } from "react";
import { isTauri, mockDialog, mockFs, mockPath } from "../lib/tauri";
import { isPdfFile, isMarkdownFile } from "../lib/fileUtils";
import { useTauriModules, useFileOperations } from "../hooks";
import type { FileItem, ContextMenuState, DialogState } from "../types";
import { ContextMenu, RenameDialog, DeleteDialog } from "./ContextMenu";
import { FileTreeItem, EmptyState } from "./workspace";
import {
    ChevronRightIcon,
    ChevronLeftIcon,
    FolderOutlineIcon,
    FolderAddIcon,
    PlusIcon,
    DocumentIcon,
    ExternalLinkIcon,
    CopyIcon,
    PencilIcon,
    TrashIcon,
} from "./icons";

interface WorkspaceSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onPdfSelect: (path: string) => void;
    onMarkdownSelect: (path: string, content: string) => void;
    currentPdfPath: string | null;
    currentNotePath: string | null;
}

export function WorkspaceSidebar({
    isOpen,
    onToggle,
    onPdfSelect,
    onMarkdownSelect,
    currentPdfPath,
    currentNotePath,
}: WorkspaceSidebarProps) {
    const [workspacePath, setWorkspacePath] = useState<string | null>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
    const [renameDialog, setRenameDialog] = useState<DialogState<FileItem>>({
        isOpen: false,
        item: null,
    });
    const [deleteDialog, setDeleteDialog] = useState<DialogState<FileItem>>({
        isOpen: false,
        item: null,
    });
    const [newFolderDialog, setNewFolderDialog] = useState(false);
    const [dragOverPath, setDragOverPath] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const tauriModules = useTauriModules();

    const loadDirectory = useCallback(
        async (dirPath: string): Promise<FileItem[]> => {
            try {
                const readDir = tauriModules.fs?.readDir ?? mockFs.readDir;
                const join = tauriModules.path?.join ?? mockPath.join;

                const entries = await readDir(dirPath);
                const items: FileItem[] = [];

                for (const entry of entries) {
                    const fullPath = await join(dirPath, entry.name);
                    const isPdf = isPdfFile(entry.name);
                    const isMd = isMarkdownFile(entry.name);
                    const isDir = entry.isDirectory;

                    if (isPdf || isMd || isDir) {
                        items.push({
                            name: entry.name,
                            path: fullPath,
                            isDirectory: isDir || false,
                            isExpanded: false,
                        });
                    }
                }

                items.sort((a, b) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.name.localeCompare(b.name);
                });

                return items;
            } catch (error) {
                console.error("Failed to load directory:", error);
                return [];
            }
        },
        [tauriModules]
    );

    const refreshWorkspace = useCallback(async () => {
        if (workspacePath) {
            const items = await loadDirectory(workspacePath);
            setFiles(items);
        }
    }, [workspacePath, loadDirectory]);

    const fileOperations = useFileOperations({
        tauriModules,
        workspacePath,
        onRefresh: refreshWorkspace,
    });

    const selectWorkspace = async () => {
        try {
            const open = tauriModules.dialog?.open ?? mockDialog.open;

            const selected = await open({
                directory: true,
                multiple: false,
                title: "ワークスペースを選択",
            });

            if (selected && typeof selected === "string") {
                setWorkspacePath(selected);
                setIsLoading(true);
                const items = await loadDirectory(selected);
                setFiles(items);
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Failed to open workspace:", error);
        }
    };

    const toggleDirectory = async (_item: FileItem, index: number[]) => {
        const updateFiles = async (
            items: FileItem[],
            indices: number[]
        ): Promise<FileItem[]> => {
            if (indices.length === 1) {
                const newItems = [...items];
                const targetItem = newItems[indices[0]];

                if (!targetItem.isExpanded && targetItem.isDirectory) {
                    targetItem.children = await loadDirectory(targetItem.path);
                }
                targetItem.isExpanded = !targetItem.isExpanded;
                return newItems;
            }

            const newItems = [...items];
            const [first, ...rest] = indices;
            if (newItems[first].children) {
                newItems[first].children = await updateFiles(
                    newItems[first].children!,
                    rest
                );
            }
            return newItems;
        };

        setFiles(await updateFiles(files, index));
    };

    const handleFileClick = async (item: FileItem) => {
        if (item.isDirectory) return;

        if (isPdfFile(item.name)) {
            onPdfSelect(item.path);
        } else if (isMarkdownFile(item.name)) {
            try {
                if (tauriModules.fs) {
                    const content = await tauriModules.fs.readTextFile(item.path);
                    onMarkdownSelect(item.path, content);
                }
            } catch (error) {
                console.error("Failed to read markdown file:", error);
            }
        }
    };

    const handleNewNote = async () => {
        const result = await fileOperations.createNewNote();
        if (result) {
            onMarkdownSelect(result.path, result.content);
        }
    };

    const handleNewFolder = async (folderName: string) => {
        await fileOperations.createNewFolder(folderName);
        setNewFolderDialog(false);
    };

    // Context menu handlers
    const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, item });
    };

    const handleWorkspaceContextMenu = (e: React.MouseEvent) => {
        // Only show if workspace is open and clicking on empty space (not on a file item)
        if (!workspacePath) return;
        if ((e.target as HTMLElement).closest(".file-item")) return;
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY, item: null });
    };

    const handleRename = async (newName: string) => {
        if (renameDialog.item) {
            await fileOperations.renameFile(renameDialog.item, newName);
        }
    };

    const handleDelete = async () => {
        if (deleteDialog.item) {
            await fileOperations.deleteFile(deleteDialog.item);
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent, item: FileItem) => {
        if (item.isDirectory) {
            e.preventDefault();
            setDragOverPath(item.path);
        }
    };

    const handleDragLeave = () => {
        setDragOverPath(null);
    };

    const handleDrop = async (e: React.DragEvent, targetDir: FileItem) => {
        e.preventDefault();
        setDragOverPath(null);

        if (!targetDir.isDirectory) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length === 0) return;

        try {
            // For external files dropped from OS
            for (const file of Array.from(droppedFiles)) {
                if (file.type === "application/pdf" || file.name.endsWith(".md")) {
                    const join = tauriModules.path?.join ?? mockPath.join;
                    const writeFile =
                        tauriModules.fs?.writeTextFile ?? mockFs.writeTextFile;

                    const targetPath = await join(targetDir.path, file.name);

                    if (file.name.endsWith(".md")) {
                        const content = await file.text();
                        await writeFile(targetPath, content);
                    }
                    // Note: For PDF files, we'd need binary write which uses writeBinaryFile
                }
            }
            await refreshWorkspace();
        } catch (error) {
            console.error("Failed to handle drop:", error);
        }
    };

    // Also handle drop on workspace root
    const handleWorkspaceDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (!workspacePath) return;

        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length === 0) return;

        try {
            for (const file of Array.from(droppedFiles)) {
                if (file.type === "application/pdf" || file.name.endsWith(".md")) {
                    const join = tauriModules.path?.join ?? mockPath.join;
                    const writeFile =
                        tauriModules.fs?.writeTextFile ?? mockFs.writeTextFile;

                    const targetPath = await join(workspacePath, file.name);

                    if (file.name.endsWith(".md")) {
                        const content = await file.text();
                        await writeFile(targetPath, content);
                    }
                }
            }
            await refreshWorkspace();
        } catch (error) {
            console.error("Failed to handle workspace drop:", error);
        }
    };

    const getContextMenuItems = (item: FileItem) => [
        {
            label: "エクスプローラーで表示",
            icon: <ExternalLinkIcon className="w-4 h-4" />,
            onClick: () => fileOperations.revealInExplorer(item),
        },
        {
            label: "コピー",
            icon: <CopyIcon className="w-4 h-4" />,
            onClick: () => fileOperations.copyFile(item),
            disabled: item.isDirectory,
        },
        {
            label: "名前を変更",
            icon: <PencilIcon className="w-4 h-4" />,
            onClick: () => setRenameDialog({ isOpen: true, item }),
        },
        {
            label: "削除",
            icon: <TrashIcon className="w-4 h-4" />,
            onClick: () => setDeleteDialog({ isOpen: true, item }),
            danger: true,
            divider: true,
        },
    ];

    const renderFileTree = (items: FileItem[], parentIndex: number[] = []) => {
        return items.map((item, idx) => {
            const currentIndex = [...parentIndex, idx];
            const isSelected =
                item.path === currentPdfPath || item.path === currentNotePath;
            const isDragOver = item.path === dragOverPath;

            return (
                <div key={item.path}>
                    <FileTreeItem
                        item={item}
                        depth={parentIndex.length}
                        isSelected={isSelected}
                        isDragOver={isDragOver}
                        onClick={() => handleFileClick(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                        onDragOver={(e) => handleDragOver(e, item)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, item)}
                        onToggle={() => toggleDirectory(item, currentIndex)}
                    />
                    {item.isDirectory && item.isExpanded && item.children && (
                        <div>{renderFileTree(item.children, currentIndex)}</div>
                    )}
                </div>
            );
        });
    };

    const showBrowserNotice = !isTauri();

    return (
        <>
            {/* Toggle button when closed */}
            {!isOpen && (
                <button
                    onClick={onToggle}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-l-0 border-gray-200 rounded-r-lg p-2 shadow-sm hover:bg-gray-50 transition-colors"
                >
                    <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                </button>
            )}

            {/* Sidebar */}
            <div
                className={`shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-0 overflow-hidden"
                    }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleWorkspaceDrop}
            >
                {/* Header */}
                <div className="shrink-0 px-3 py-3 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-gray-700">ワークスペース</h2>
                    <button
                        onClick={onToggle}
                        className="p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
                    </button>
                </div>

                {/* Browser notice */}
                {showBrowserNotice && (
                    <div className="p-2 bg-amber-50 border-b border-amber-100">
                        <p className="text-xs text-amber-700">
                            ⚠️ ブラウザモード: ファイル操作は Tauri アプリでのみ利用可能です
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="shrink-0 p-2 border-b border-gray-100 flex gap-1">
                    <button
                        onClick={selectWorkspace}
                        disabled={showBrowserNotice}
                        className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                    >
                        <FolderOutlineIcon className="w-3.5 h-3.5" />
                        開く
                    </button>
                    <button
                        onClick={handleNewNote}
                        disabled={!workspacePath || showBrowserNotice}
                        className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-gray-700 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        新規ノート
                    </button>
                </div>

                {/* File tree */}
                <div
                    className="flex-1 overflow-auto p-2"
                    onContextMenu={handleWorkspaceContextMenu}
                >
                    {!workspacePath ? (
                        <EmptyState type="no-workspace" />
                    ) : isLoading ? (
                        <EmptyState type="loading" />
                    ) : files.length === 0 ? (
                        <EmptyState type="empty" />
                    ) : (
                        renderFileTree(files)
                    )}
                </div>

                {/* Workspace path */}
                {workspacePath && (
                    <div className="shrink-0 px-3 py-2 border-t border-gray-100 bg-gray-50">
                        <p
                            className="text-xs text-gray-400 truncate"
                            title={workspacePath}
                        >
                            {workspacePath}
                        </p>
                    </div>
                )}
            </div>

            {/* Hidden file input for drag & drop from OS */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.md"
                multiple
            />

            {/* Context Menu for files */}
            {contextMenu && contextMenu.item && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={getContextMenuItems(contextMenu.item)}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Context Menu for workspace (empty space) */}
            {contextMenu && !contextMenu.item && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={[
                        {
                            label: "新規フォルダ",
                            icon: <FolderAddIcon className="w-4 h-4" />,
                            onClick: () => setNewFolderDialog(true),
                        },
                        {
                            label: "新規ノート",
                            icon: <DocumentIcon className="w-4 h-4" />,
                            onClick: handleNewNote,
                        },
                    ]}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {/* Rename Dialog */}
            <RenameDialog
                isOpen={renameDialog.isOpen}
                currentName={renameDialog.item?.name || ""}
                onRename={handleRename}
                onClose={() => setRenameDialog({ isOpen: false, item: null })}
            />

            {/* Delete Dialog */}
            <DeleteDialog
                isOpen={deleteDialog.isOpen}
                fileName={deleteDialog.item?.name || ""}
                onDelete={handleDelete}
                onClose={() => setDeleteDialog({ isOpen: false, item: null })}
            />

            {/* New Folder Dialog */}
            <RenameDialog
                isOpen={newFolderDialog}
                currentName=""
                onRename={handleNewFolder}
                onClose={() => setNewFolderDialog(false)}
            />
        </>
    );
}
