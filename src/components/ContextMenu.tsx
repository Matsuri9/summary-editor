import { useEffect, useRef, useState } from "react";
import type { ContextMenuItem } from "../types";
import { TrashIcon } from "./icons";

interface ContextMenuProps {
    x: number;
    y: number;
    items: ContextMenuItem[];
    onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x, y });

    useEffect(() => {
        // Adjust position if menu would go off screen
        if (menuRef.current) {
            const rect = menuRef.current.getBoundingClientRect();
            const newX = x + rect.width > window.innerWidth ? x - rect.width : x;
            const newY = y + rect.height > window.innerHeight ? y - rect.height : y;
            setPosition({ x: Math.max(0, newX), y: Math.max(0, newY) });
        }
    }, [x, y]);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
            style={{ left: position.x, top: position.y }}
        >
            {items.map((item, idx) => (
                <div key={idx}>
                    {item.divider && <div className="my-1 border-t border-gray-100" />}
                    <button
                        onClick={() => {
                            if (!item.disabled) {
                                item.onClick();
                                onClose();
                            }
                        }}
                        disabled={item.disabled}
                        className={`w-full px-3 py-2 text-sm text-left flex items-center gap-2 transition-colors ${item.disabled
                                ? "text-gray-300 cursor-not-allowed"
                                : item.danger
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        <span className="w-4 h-4">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                </div>
            ))}
        </div>
    );
}

// Rename Dialog
interface RenameDialogProps {
    isOpen: boolean;
    currentName: string;
    onRename: (newName: string) => void;
    onClose: () => void;
}

export function RenameDialog({
    isOpen,
    currentName,
    onRename,
    onClose,
}: RenameDialogProps) {
    const [newName, setNewName] = useState(currentName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setNewName(currentName);
            setTimeout(() => {
                inputRef.current?.focus();
                // Select filename without extension
                const dotIndex = currentName.lastIndexOf(".");
                if (dotIndex > 0) {
                    inputRef.current?.setSelectionRange(0, dotIndex);
                } else {
                    inputRef.current?.select();
                }
            }, 0);
        }
    }, [isOpen, currentName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newName.trim() && newName !== currentName) {
            onRename(newName.trim());
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    名前を変更
                </h3>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 text-sm"
                        placeholder="新しい名前"
                    />
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            disabled={!newName.trim() || newName === currentName}
                            className="px-4 py-2 text-sm text-white bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            変更
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Delete Confirmation Dialog
interface DeleteDialogProps {
    isOpen: boolean;
    fileName: string;
    onDelete: () => void;
    onClose: () => void;
}

export function DeleteDialog({
    isOpen,
    fileName,
    onDelete,
    onClose,
}: DeleteDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <TrashIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            ファイルを削除
                        </h3>
                        <p className="text-sm text-gray-500">この操作は取り消せません</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                    「<span className="font-medium">{fileName}</span>」を削除しますか？
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={() => {
                            onDelete();
                            onClose();
                        }}
                        className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        削除
                    </button>
                </div>
            </div>
        </div>
    );
}
