// ファイル・ディレクトリの型定義
export interface FileItem {
    name: string;
    path: string;
    isDirectory: boolean;
    children?: FileItem[];
    isExpanded?: boolean;
}

// コンテキストメニューの状態
export interface ContextMenuState {
    x: number;
    y: number;
    item: FileItem | null; // null for workspace context menu
}

// コンテキストメニューアイテム
export interface ContextMenuItem {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    danger?: boolean;
    disabled?: boolean;
    divider?: boolean;
}

// ダイアログの状態
export interface DialogState<T> {
    isOpen: boolean;
    item: T | null;
}

// バージョン情報
export interface VersionInfo {
    version: string;
    date: string;
    changes: string[];
}

// エディタモード
export type EditorMode = "wysiwyg" | "raw";
