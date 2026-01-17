import { FolderOutlineIcon } from "../icons";

interface EmptyStateProps {
    type: "no-workspace" | "loading" | "empty";
}

export function EmptyState({ type }: EmptyStateProps) {
    if (type === "loading") {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            </div>
        );
    }

    if (type === "no-workspace") {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                <FolderOutlineIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" strokeWidth={1.5} />
                <p>ワークスペースを</p>
                <p>選択してください</p>
            </div>
        );
    }

    return (
        <div className="text-center py-8 text-gray-400 text-sm">
            <p>PDF・MDファイルが</p>
            <p>見つかりません</p>
        </div>
    );
}
