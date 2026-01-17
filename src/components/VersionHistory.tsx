import { useState, useEffect } from "react";
import { isTauri } from "../lib/tauri";
import { VERSION_HISTORY } from "../constants";
import type { VersionInfo } from "../types";
import {
    ClockIcon,
    CloseIcon,
    CloudUploadIcon,
    DownloadIcon,
    CheckFilledIcon,
    SpinnerIcon,
} from "./icons";

interface VersionHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    updateAvailable: boolean;
    newVersion: string | null;
    onUpdate: () => void;
    isUpdating: boolean;
}

export function VersionHistoryModal({
    isOpen,
    onClose,
    updateAvailable,
    newVersion,
    onUpdate,
    isUpdating,
}: VersionHistoryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">更新履歴</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <CloseIcon className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Update Banner */}
                {updateAvailable && (
                    <UpdateBanner
                        newVersion={newVersion}
                        onUpdate={onUpdate}
                        isUpdating={isUpdating}
                    />
                )}

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <VersionTimeline versions={VERSION_HISTORY} />
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-400 text-center">
                        Summary Editor - 授業資料まとめツール
                    </p>
                </div>
            </div>
        </div>
    );
}

interface UpdateBannerProps {
    newVersion: string | null;
    onUpdate: () => void;
    isUpdating: boolean;
}

function UpdateBanner({ newVersion, onUpdate, isUpdating }: UpdateBannerProps) {
    return (
        <div className="px-6 py-3 bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CloudUploadIcon className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                        新しいバージョン {newVersion} が利用可能です
                    </span>
                </div>
                <button
                    onClick={onUpdate}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                >
                    {isUpdating ? (
                        <>
                            <SpinnerIcon className="w-4 h-4" />
                            更新中...
                        </>
                    ) : (
                        <>
                            <DownloadIcon className="w-4 h-4" />
                            今すぐ更新
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

interface VersionTimelineProps {
    versions: VersionInfo[];
}

function VersionTimeline({ versions }: VersionTimelineProps) {
    return (
        <div className="space-y-6">
            {versions.map((version, idx) => (
                <VersionTimelineItem
                    key={version.version}
                    version={version}
                    isLatest={idx === 0}
                    showLine={idx < versions.length - 1}
                />
            ))}
        </div>
    );
}

interface VersionTimelineItemProps {
    version: VersionInfo;
    isLatest: boolean;
    showLine: boolean;
}

function VersionTimelineItem({
    version,
    isLatest,
    showLine,
}: VersionTimelineItemProps) {
    return (
        <div className="relative">
            {/* Timeline line */}
            {showLine && (
                <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Version header */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isLatest ? "bg-gray-700 text-white" : "bg-gray-200 text-gray-600"
                        }`}
                >
                    <CheckFilledIcon className="w-3 h-3" />
                </div>
                <div>
                    <span
                        className={`font-semibold ${isLatest ? "text-gray-800" : "text-gray-600"
                            }`}
                    >
                        {version.version}
                    </span>
                    {isLatest && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            最新
                        </span>
                    )}
                    <span className="ml-2 text-sm text-gray-400">{version.date}</span>
                </div>
            </div>

            {/* Changes list */}
            <div className="ml-9">
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {version.changes.map((change, changeIdx) => (
                        <li key={changeIdx} className="leading-relaxed">
                            {change}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export function VersionBadge() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [newVersion, setNewVersion] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const currentVersion = VERSION_HISTORY[0];

    useEffect(() => {
        // Check for updates on mount (only in production Tauri build)
        if (isTauri()) {
            checkForUpdates();
        }
    }, []);

    const checkForUpdates = async () => {
        try {
            // Dynamic import to avoid issues in dev mode
            const updater = await import("@tauri-apps/plugin-updater");
            const update = await updater.check();
            if (update?.available) {
                setUpdateAvailable(true);
                setNewVersion(update.version);
                console.log(`Update available: ${update.version}`);
            }
        } catch (error) {
            // Expected to fail in dev mode - updater plugin is only enabled in release builds
            console.log("Update check skipped (dev mode or not available)");
        }
    };

    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            const updater = await import("@tauri-apps/plugin-updater");
            const update = await updater.check();
            if (update?.available) {
                console.log("Downloading and installing update...");
                await update.downloadAndInstall();
                // App will restart automatically
            }
        } catch (error) {
            console.error("Failed to update:", error);
            alert("更新に失敗しました。後でもう一度お試しください。");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-500 transition-colors flex items-center gap-1 relative"
                title="更新履歴を表示"
            >
                <ClockIcon className="w-3.5 h-3.5" />
                {currentVersion.version}

                {/* Update notification badge */}
                {updateAvailable && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            <VersionHistoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                updateAvailable={updateAvailable}
                newVersion={newVersion}
                onUpdate={handleUpdate}
                isUpdating={isUpdating}
            />
        </>
    );
}
