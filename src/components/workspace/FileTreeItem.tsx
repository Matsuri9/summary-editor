import type { FileItem } from "../../types";
import {
    ChevronRightIcon,
    FolderIcon,
    PdfIcon,
    MarkdownIcon,
} from "../icons";

interface FileTreeItemProps {
    item: FileItem;
    depth: number;
    isSelected: boolean;
    isDragOver: boolean;
    onClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    onToggle: () => void;
}

export function FileTreeItem({
    item,
    depth,
    isSelected,
    isDragOver,
    onClick,
    onContextMenu,
    onDragOver,
    onDragLeave,
    onDrop,
    onToggle,
}: FileTreeItemProps) {
    const handleClick = () => {
        if (item.isDirectory) {
            onToggle();
        } else {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            onContextMenu={onContextMenu}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`file-item w-full flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded transition-colors ${isDragOver
                    ? "bg-blue-100 border-2 border-blue-400 border-dashed"
                    : isSelected
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-700 hover:bg-gray-100"
                }`}
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
            {item.isDirectory ? (
                <>
                    <ChevronRightIcon
                        className={`w-4 h-4 text-gray-400 transition-transform ${item.isExpanded ? "rotate-90" : ""
                            }`}
                    />
                    <FolderIcon className="w-4 h-4 text-yellow-500" />
                </>
            ) : item.name.endsWith(".pdf") ? (
                <>
                    <span className="w-4" />
                    <PdfIcon className="w-4 h-4 text-red-500" />
                </>
            ) : (
                <>
                    <span className="w-4" />
                    <MarkdownIcon className="w-4 h-4 text-blue-500" />
                </>
            )}
            <span className="truncate flex-1">{item.name}</span>
        </button>
    );
}
