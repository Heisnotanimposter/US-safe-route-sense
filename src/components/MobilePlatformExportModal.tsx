import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FLUTTER_CODE_SUITE, SWIFT_CODE_SUITE, CodeFile } from '@/lib/mobile-code-templates';
import { Check, Copy, Download, Smartphone, Apple, Code2, Sparkles, Layers } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobilePlatformExportModal: React.FC<Props> = ({ open, onOpenChange }) => {
  const [platform, setPlatform] = useState<'flutter' | 'swift' | 'webgl'>('flutter');
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeSuite: CodeFile[] = platform === 'flutter' ? FLUTTER_CODE_SUITE : SWIFT_CODE_SUITE;
  const currentFile: CodeFile = activeSuite[activeFileIndex] || activeSuite[0];

  const handleCopyCode = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    toast.success(`${currentFile.filename} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!currentFile) return;
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.filename.split('/').pop() || 'code.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${currentFile.filename}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col bg-slate-950 border-slate-800 text-slate-100 p-6 overflow-hidden">
        <DialogHeader className="pb-2 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-100 flex items-center gap-2">
                  Native Mobile & WebGL Implementation Suite
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400">
                  Ready-to-integrate Android Flutter, iOS Swift, and WebGL modules for Quarter-View Safe Route Navigation.
                </DialogDescription>
              </div>
            </div>

            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs font-mono">
              Production Ready
            </Badge>
          </div>
        </DialogHeader>

        {/* Platform Selector Tabs */}
        <div className="flex items-center justify-between pt-3 pb-2 gap-3">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <Button
              size="sm"
              variant={platform === 'flutter' ? 'default' : 'ghost'}
              onClick={() => {
                setPlatform('flutter');
                setActiveFileIndex(0);
              }}
              className={`h-7 px-3 text-xs gap-1.5 ${
                platform === 'flutter' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Android Flutter (Dart)
            </Button>

            <Button
              size="sm"
              variant={platform === 'swift' ? 'default' : 'ghost'}
              onClick={() => {
                setPlatform('swift');
                setActiveFileIndex(0);
              }}
              className={`h-7 px-3 text-xs gap-1.5 ${
                platform === 'swift' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              iOS Swift & SwiftUI
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="h-8 px-3 text-xs border-slate-800 text-slate-200 hover:bg-slate-900 gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Code'}
            </Button>

            <Button
              size="sm"
              onClick={handleDownloadFile}
              className="h-8 px-3 text-xs bg-slate-800 hover:bg-slate-700 text-white gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </Button>
          </div>
        </div>

        {/* File Sub-Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800/80">
          {activeSuite.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setActiveFileIndex(idx)}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all whitespace-nowrap ${
                activeFileIndex === idx
                  ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {file.filename}
            </button>
          ))}
        </div>

        {/* Code Content Box */}
        <div className="flex-1 overflow-auto rounded-xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs text-slate-200 leading-relaxed relative my-2">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-slate-400">
            <span>{currentFile?.title} — {currentFile?.description}</span>
            <span className="text-[10px] text-slate-500 uppercase">{currentFile?.language}</span>
          </div>
          <pre className="overflow-x-auto">
            <code>{currentFile?.code}</code>
          </pre>
        </div>

        {/* Footer Note */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800">
          <span>SafeRoute Sense 3D Core Algorithm v2.5</span>
          <span className="text-emerald-400 font-mono">Compatible with Flutter 3.x+ and iOS 17+ Swift 5.9</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
