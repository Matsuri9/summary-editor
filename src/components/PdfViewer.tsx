import { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
    ZOOM_PRESETS,
    ZOOM_MIN,
    ZOOM_MAX,
    ZOOM_STEP,
} from "../constants";
import {
    CloudUploadIcon,
    ZoomInIcon,
    ZoomOutIcon,
    WarningIcon,
    SpinnerIcon,
} from "./icons";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
    file: File | Blob | null;
    onFileSelect: (file: File) => void;
}

export function PdfViewer({ file, onFileSelect }: PdfViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState<number>(1.0);
    const [isDragOver, setIsDragOver] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile && droppedFile.type === "application/pdf") {
                onFileSelect(droppedFile);
            }
        },
        [onFileSelect]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            onFileSelect(selectedFile);
        }
    };

    const zoomIn = () => setScale((prev) => Math.min(ZOOM_MAX, prev + ZOOM_STEP));
    const zoomOut = () =>
        setScale((prev) => Math.max(ZOOM_MIN, prev - ZOOM_STEP));
    const resetZoom = () => setScale(1.0);

    if (!file) {
        return <EmptyPdfState isDragOver={isDragOver} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onFileSelect={handleFileInput} />;
    }

    return (
        <div className="h-full flex flex-col">
            {/* Toolbar */}
            <PdfToolbar
                numPages={numPages}
                scale={scale}
                onScaleChange={setScale}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
                onReset={resetZoom}
            />

            {/* PDF Content - Continuous scroll showing all pages */}
            <div
                ref={containerRef}
                className="flex-1 overflow-auto pdf-viewer bg-gray-100"
            >
                <Document
                    file={file}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<PdfLoading />}
                    error={<PdfError />}
                >
                    {/* Render all pages for continuous scrolling */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        {Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_${index + 1}`} className="relative">
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    className="shadow-lg bg-white"
                                    renderTextLayer={true}
                                    renderAnnotationLayer={true}
                                />
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                                    {index + 1} / {numPages}
                                </div>
                            </div>
                        ))}
                    </div>
                </Document>
            </div>
        </div>
    );
}

// Empty state when no PDF is selected
interface EmptyPdfStateProps {
    isDragOver: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function EmptyPdfState({
    isDragOver,
    onDrop,
    onDragOver,
    onDragLeave,
    onFileSelect,
}: EmptyPdfStateProps) {
    return (
        <div
            className={`h-full flex items-center justify-center p-8 transition-colors ${isDragOver ? "bg-gray-100" : "bg-gray-50"
                }`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
        >
            <div
                className={`w-full max-w-md border-2 border-dashed rounded-xl p-12 text-center transition-colors ${isDragOver
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-300 bg-white"
                    }`}
            >
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <CloudUploadIcon className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                </div>
                <p className="text-gray-600 mb-2">
                    PDFファイルをドラッグ＆ドロップ
                </p>
                <p className="text-sm text-gray-400 mb-4">または</p>
                <label className="inline-block px-4 py-2 bg-gray-700 text-white text-sm font-medium rounded-lg cursor-pointer hover:bg-gray-800 transition-colors">
                    ファイルを選択
                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={onFileSelect}
                    />
                </label>
                <p className="mt-4 text-xs text-gray-400">
                    または左のサイドバーからPDFを選択
                </p>
            </div>
        </div>
    );
}

// PDF Toolbar
interface PdfToolbarProps {
    numPages: number;
    scale: number;
    onScaleChange: (scale: number) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onReset: () => void;
}

function PdfToolbar({
    numPages,
    scale,
    onScaleChange,
    onZoomIn,
    onZoomOut,
    onReset,
}: PdfToolbarProps) {
    return (
        <div className="shrink-0 px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{numPages} ページ</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onZoomOut}
                    disabled={scale <= ZOOM_MIN}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    title="縮小"
                >
                    <ZoomOutIcon className="w-4 h-4 text-gray-600" />
                </button>

                {/* Zoom preset dropdown */}
                <select
                    value={scale}
                    onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                    className="text-sm text-gray-600 bg-white border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                    {ZOOM_PRESETS.map((preset) => (
                        <option key={preset} value={preset}>
                            {Math.round(preset * 100)}%
                        </option>
                    ))}
                    {!ZOOM_PRESETS.includes(scale as typeof ZOOM_PRESETS[number]) && (
                        <option value={scale}>{Math.round(scale * 100)}%</option>
                    )}
                </select>

                <button
                    onClick={onZoomIn}
                    disabled={scale >= ZOOM_MAX}
                    className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                    title="拡大"
                >
                    <ZoomInIcon className="w-4 h-4 text-gray-600" />
                </button>

                <button
                    onClick={onReset}
                    className="px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 rounded transition-colors"
                >
                    リセット
                </button>
            </div>
        </div>
    );
}

function PdfLoading() {
    return (
        <div className="flex items-center justify-center py-12">
            <SpinnerIcon className="w-8 h-8 text-gray-600" />
        </div>
    );
}

function PdfError() {
    return (
        <div className="text-center py-12 text-red-500">
            <WarningIcon className="w-12 h-12 mx-auto mb-2 text-red-300" />
            PDFの読み込みに失敗しました
        </div>
    );
}
