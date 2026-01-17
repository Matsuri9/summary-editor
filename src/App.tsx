import { useState, useCallback } from "react";
import { isTauri } from "./lib/tauri";
import { getFileName } from "./lib/fileUtils";
import { getDefaultNoteContent } from "./constants";
import { PdfViewer } from "./components/PdfViewer";
import { NotePanel } from "./components/NotePanel";
import { WorkspaceSidebar } from "./components/WorkspaceSidebar";
import { VersionBadge } from "./components/VersionHistory";
import { ResizablePanels } from "./components/ResizablePanels";
import { DocumentIcon, MenuIcon, PdfIcon } from "./components/icons";

// Dynamic import for Tauri fs
let tauriFs: typeof import("@tauri-apps/plugin-fs") | null = null;

if (isTauri()) {
  import("@tauri-apps/plugin-fs").then((m) => (tauriFs = m));
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | Blob | null>(null);
  const [pdfPath, setPdfPath] = useState<string | null>(null);
  const [notePath, setNotePath] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>(getDefaultNoteContent());

  const handlePdfSelect = (file: File) => {
    setPdfFile(file);
    setPdfPath(null);
  };

  const handlePdfPathSelect = async (path: string) => {
    setPdfPath(path);

    // Tauriでファイルパスからバイナリを読み込んでBlobに変換
    if (isTauri() && tauriFs) {
      try {
        const data = await tauriFs.readFile(path);
        const blob = new Blob([data], { type: "application/pdf" });
        setPdfFile(blob);
      } catch (error) {
        console.error("Failed to load PDF:", error);
        setPdfFile(null);
      }
    }
  };

  const handleMarkdownSelect = (path: string, content: string) => {
    setNotePath(path);
    setMarkdown(content);
  };

  const handleMarkdownChange = (newContent: string) => {
    setMarkdown(newContent);
  };

  const handleSaveNote = useCallback(
    async (content: string) => {
      if (notePath) {
        try {
          const writeTextFile =
            tauriFs?.writeTextFile ??
            (async () => {
              console.log("[Mock] writeTextFile called - not available in browser");
            });
          await writeTextFile(notePath, content);
          console.log("Note saved:", notePath);
        } catch (error) {
          console.error("Failed to save note:", error);
        }
      }
    },
    [notePath]
  );

  // Extract PDF file name (handle both / and \ separators)
  const pdfFileName = getFileName(pdfPath);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Workspace Sidebar */}
        <WorkspaceSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          onPdfSelect={handlePdfPathSelect}
          onMarkdownSelect={handleMarkdownSelect}
          currentPdfPath={pdfPath}
          currentNotePath={notePath}
        />

        {/* Resizable PDF and Note panels */}
        <ResizablePanels
          leftMinWidth={300}
          rightMinWidth={300}
          defaultLeftWidth={50}
          leftPanel={
            <PdfPanel
              pdfFileName={pdfFileName}
              pdfPath={pdfPath}
              pdfFile={pdfFile}
              onFileSelect={handlePdfSelect}
            />
          }
          rightPanel={
            <NotePanel
              content={markdown}
              onChange={handleMarkdownChange}
              filePath={notePath}
              onSave={handleSaveNote}
            />
          }
        />
      </main>
    </div>
  );
}

// Header Component
interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
          <DocumentIcon className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-lg font-semibold text-gray-800">Summary Editor</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Sidebar toggle button */}
        <button
          onClick={onToggleSidebar}
          className={`p-2 rounded-lg transition-colors ${sidebarOpen
            ? "bg-gray-100 text-gray-700"
            : "text-gray-500 hover:bg-gray-100"
            }`}
          title={sidebarOpen ? "サイドバーを閉じる" : "サイドバーを開く"}
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <VersionBadge />
      </div>
    </header>
  );
}

// PDF Panel Component
interface PdfPanelProps {
  pdfFileName: string | null;
  pdfPath: string | null;
  pdfFile: File | Blob | null;
  onFileSelect: (file: File) => void;
}

function PdfPanel({
  pdfFileName,
  pdfPath,
  pdfFile,
  onFileSelect,
}: PdfPanelProps) {
  return (
    <>
      {/* PDF Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
        <PdfIcon className="w-4 h-4 text-red-500" />
        {pdfFileName ? (
          <span
            className="text-sm font-medium text-gray-700 truncate"
            title={pdfPath || ""}
          >
            {pdfFileName}
          </span>
        ) : (
          <span className="text-sm text-gray-400">PDFを選択してください</span>
        )}
      </div>
      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden">
        <PdfViewer file={pdfFile} onFileSelect={onFileSelect} />
      </div>
    </>
  );
}

export default App;
