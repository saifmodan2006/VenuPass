import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CameraOff,
  QrCode,
  ArrowDownRight,
  ArrowUpLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Volume2,
  VolumeX,
  Sparkles,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { Navbar } from '../components/navigation/Navbar';
import { ScanProcessResult } from '../types';
import { generateExpiredToken, generateTamperedToken } from '../services/qrService';

export const GateScannerPage: React.FC = () => {
  const {
    event,
    selectedGate,
    selectedDirection,
    setGate,
    setDirection,
    processScan,
    getCurrentCrowd,
    participants,
  } = useAppStore();

  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [verdict, setVerdict] = useState<ScanProcessResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'gate-qr-reader';

  const currentCrowd = getCurrentCrowd();
  const maxCapacity = event.maxCapacity || 1;
  const occupancyPct = Math.min(100, Math.round((currentCrowd / maxCapacity) * 100));

  // Audio tone generator
  const playBeep = (type: 'success' | 'error' | 'duplicate') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.16);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else if (type === 'duplicate') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(330, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.22);
      }
    } catch {
      // AudioContext blocked without user interaction
    }
  };

  const handleScanInput = (rawString: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const res = processScan(rawString, selectedGate, selectedDirection);
    setVerdict(res);

    if (res.success) {
      playBeep('success');
    } else {
      if (res.reason === 'DUPLICATE_ENTRY') {
        playBeep('duplicate');
      } else {
        playBeep('error');
      }
    }

    setTimeout(() => {
      setIsProcessing(false);
    }, 650);
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      const scanConfig = {
        fps: 10,
        qrbox: { width: 240, height: 240 },
        aspectRatio: 1.0,
      };

      try {
        // Try rear-facing camera first (typical for handheld mobile scanners)
        await html5QrCodeRef.current.start(
          { facingMode: 'environment' },
          scanConfig,
          (decoded) => handleScanInput(decoded),
          () => {}
        );
      } catch (backCamErr) {
        console.warn('Rear camera not available, falling back to front/default webcam:', backCamErr);
        // Fallback for laptops, PCs, or webcams without 'environment' facing mode
        await html5QrCodeRef.current.start(
          { facingMode: 'user' },
          scanConfig,
          (decoded) => handleScanInput(decoded),
          () => {}
        );
      }

      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraError(
        'Camera permission was denied or no active camera was detected. Please allow camera permissions in your browser URL bar, or use the instant simulator buttons below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error('Stop error:', e);
      }
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleScanInput(manualInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#0E0F10] text-[#F5F5F2] flex flex-col dark-scanner">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-8 flex flex-col">
        {/* Operations Control Bar (Section 21, 22) */}
        <div className="rounded-card border border-[#2A2D30] bg-[#17191B] p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
          {/* Gate Selector */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-semibold text-[#8A8F95] uppercase tracking-wider">
              Gate:
            </span>
            <select
              value={selectedGate}
              onChange={(e) => setGate(e.target.value)}
              className="rounded-btn border border-[#2A2D30] bg-[#0E0F10] px-3 py-1.5 text-xs font-semibold text-[#F5F5F2] focus:outline-none focus:border-[#FF7A00]"
            >
              {event.gates.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector Toggle: ENTRY vs EXIT */}
          <div className="flex items-center justify-center p-1 rounded-btn bg-[#0E0F10] border border-[#2A2D30]">
            <button
              type="button"
              onClick={() => setDirection('IN')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-btn text-xs font-bold transition-all ${
                selectedDirection === 'IN'
                  ? 'bg-[#16794C] text-white shadow-subtle'
                  : 'text-[#8A8F95] hover:text-[#F5F5F2]'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              ENTRY MODE
            </button>
            <button
              type="button"
              onClick={() => setDirection('OUT')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-btn text-xs font-bold transition-all ${
                selectedDirection === 'OUT'
                  ? 'bg-[#2864A8] text-white shadow-subtle'
                  : 'text-[#8A8F95] hover:text-[#F5F5F2]'
              }`}
            >
              <ArrowUpLeft className="w-3.5 h-3.5" />
              EXIT MODE
            </button>
          </div>

          {/* Audio toggle & Crowd Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-btn bg-[#0E0F10] border border-[#2A2D30] text-[#8A8F95] hover:text-[#F5F5F2]"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#FF7A00]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-btn bg-[#0E0F10] border border-[#2A2D30]">
              <span className="w-2 h-2 rounded-full bg-[#16794C]" />
              <span className="text-[#8A8F95] text-[11px]">Crowd:</span>
              <strong className="font-mono text-xs text-[#F5F5F2]">
                {currentCrowd}/{maxCapacity}
              </strong>
              <span className="font-mono text-[10px] text-[#FF7A00]">({occupancyPct}%)</span>
            </div>
          </div>
        </div>

        {/* Viewfinder & Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Scanner Section (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Viewfinder Container */}
            <div className="relative w-full max-w-md aspect-square rounded-card border border-[#2A2D30] bg-[#0E0F10] overflow-hidden flex flex-col items-center justify-center p-4">
              {/* Four Corner Brackets (Section 21) */}
              <div className="absolute top-5 left-5 w-8 h-8 border-t-2 border-l-2 border-[#FF7A00] pointer-events-none z-20" />
              <div className="absolute top-5 right-5 w-8 h-8 border-t-2 border-r-2 border-[#FF7A00] pointer-events-none z-20" />
              <div className="absolute bottom-5 left-5 w-8 h-8 border-b-2 border-l-2 border-[#FF7A00] pointer-events-none z-20" />
              <div className="absolute bottom-5 right-5 w-8 h-8 border-b-2 border-r-2 border-[#FF7A00] pointer-events-none z-20" />

              {/* Single animated scanning line */}
              <div className="absolute left-8 right-8 h-0.5 bg-[#FF7A00] shadow-[0_0_8px_#FF7A00] animate-scan pointer-events-none z-20" />

              {/* HTML5 Camera feed target */}
              <div
                id={scannerContainerId}
                className={`w-full h-full rounded-btn overflow-hidden ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />

              {/* Inactive State Graphic */}
              {!isCameraActive && (
                <div className="flex flex-col items-center justify-center text-center p-6 z-10">
                  <div className="w-12 h-12 rounded-btn bg-[#17191B] border border-[#2A2D30] flex items-center justify-center text-[#FF7A00] mb-3">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-sm font-bold text-[#F5F5F2] mb-1">
                    Position Pass Inside Frame
                  </h3>
                  <p className="text-xs text-[#8A8F95] max-w-xs mb-4">
                    Uses low-level camera pipeline. Or run simulation inputs below.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-btn bg-[#FF7A00] hover:bg-[#E86A00] text-[#FFFFFF] font-semibold text-xs transition-all flex items-center gap-1.5 shadow-subtle"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Open Camera
                  </button>
                </div>
              )}

              {/* Stop camera button */}
              {isCameraActive && (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="absolute bottom-3 z-30 px-3.5 py-1 rounded-btn bg-black/80 text-[#C43D3D] border border-[#C43D3D]/30 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CameraOff className="w-3 h-3" />
                  Stop Camera
                </button>
              )}

              {/* Status HUD Header */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 text-[9px] font-mono font-bold tracking-wider text-[#8A8F95] pointer-events-none z-20 uppercase">
                {selectedDirection === 'IN' ? (
                  <span className="text-[#16794C]">IN-BOUND GATE</span>
                ) : (
                  <span className="text-[#2864A8]">OUT-BOUND GATE</span>
                )}
              </div>
            </div>

            {cameraError && (
              <div className="mt-2.5 p-2.5 rounded-btn bg-[#FDF6E9]/10 border border-[#A96500]/30 text-xs text-[#A96500] max-w-md w-full text-center">
                {cameraError}
              </div>
            )}
          </div>

          {/* Verdict HUD & Simulator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Scan Verdict Display (Section 23, 24, 25) */}
            <AnimatePresence mode="wait">
              {verdict && (
                <motion.div
                  key={verdict.log.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className={`rounded-card border p-4 text-left transition-all ${
                    verdict.success
                      ? verdict.verdictType === 'ENTRY_APPROVED'
                        ? 'border-[#16794C] bg-[#17191B]'
                        : 'border-[#2864A8] bg-[#17191B]'
                      : verdict.reason === 'DUPLICATE_ENTRY'
                      ? 'border-[#A96500] bg-[#17191B]'
                      : 'border-[#C43D3D] bg-[#17191B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {verdict.success ? (
                        <CheckCircle2 className="w-5 h-5 text-[#16794C]" />
                      ) : verdict.reason === 'DUPLICATE_ENTRY' ? (
                        <AlertTriangle className="w-5 h-5 text-[#A96500]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#C43D3D]" />
                      )}
                      <h4 className="font-heading text-base font-bold text-[#F5F5F2]">
                        {verdict.title}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setVerdict(null)}
                      className="text-[10px] text-[#8A8F95] hover:text-white px-2 py-0.5 rounded bg-white/5"
                    >
                      Dismiss
                    </button>
                  </div>

                  <p className="text-xs text-[#F5F5F2] mb-3 leading-relaxed">{verdict.message}</p>

                  {/* Duplicate Entry details */}
                  {verdict.firstEntryInfo && (
                    <div className="mb-3 p-2 rounded-btn bg-[#A96500]/15 border border-[#A96500]/30 text-xs text-[#F5F5F2]">
                      <span className="font-semibold block text-[#A96500]">First Entry On Record:</span>
                      <span>Gate: {verdict.firstEntryInfo.gate}</span>
                      <span className="block text-[10px] text-[#8A8F95]">
                        Time: {new Date(verdict.firstEntryInfo.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  )}

                  {/* Participant card details if known */}
                  {verdict.participant && (
                    <div className="rounded-btn bg-[#0E0F10] border border-[#2A2D30] p-2.5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#8A8F95]">Participant</span>
                        <span className="font-semibold text-[#F5F5F2]">{verdict.participant.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8F95]">ID</span>
                        <span className="font-mono text-[#FF7A00] font-bold">
                          {verdict.participant.participantId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8F95]">Department</span>
                        <span className="text-[#F5F5F2]">{verdict.participant.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#8A8F95]">State</span>
                        <span className="font-mono font-bold text-[#F5F5F2]">
                          {verdict.participant.state}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulate Scan Card (Section 26 - Unified Pipeline) */}
            <div className="rounded-card border border-[#2A2D30] bg-[#17191B] p-4 text-left shadow-subtle">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-[#FF7A00]" />
                <h3 className="font-heading text-xs font-bold text-[#F5F5F2] uppercase tracking-wider">
                  Simulate Scan (Single Master Pipeline)
                </h3>
              </div>
              <p className="text-[11px] text-[#8A8F95] mb-3 leading-relaxed">
                Accepts either a <strong>Participant ID</strong> (e.g. STU1001) or a{' '}
                <strong>Full QR Token JSON</strong>. Executes the same verification logic.
              </p>

              <form onSubmit={handleManualSubmit} className="space-y-2.5">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter ID (e.g. STU1001) or JSON token"
                  className="w-full rounded-btn border border-[#2A2D30] bg-[#0E0F10] px-3 py-2 text-xs text-[#F5F5F2] placeholder-[#8A8F95] font-mono focus:outline-none focus:border-[#FF7A00]"
                />

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2 rounded-btn bg-[#FF7A00] hover:bg-[#E86A00] text-white font-bold text-xs shadow-subtle transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  Process Scan
                </button>
              </form>

              {/* Exact Judge Test Case Shortcuts */}
              <div className="mt-4 pt-3 border-t border-[#2A2D30]">
                <span className="text-[10px] font-bold text-[#8A8F95] uppercase tracking-wider block mb-2">
                  Judge Test Case Shortcuts
                </span>

                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setManualInput('UNKNOWN123');
                      handleScanInput('UNKNOWN123');
                    }}
                    className="p-2 rounded-btn bg-[#0E0F10] hover:bg-[#2A2D30] text-left border border-[#2A2D30] text-[#F5F5F2] transition-colors"
                  >
                    <span className="text-[#FF7A00] font-bold block text-[10px]">TEST 1</span>
                    Unknown (UNKNOWN123)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const p = participants[0];
                      if (p) {
                        setManualInput(p.participantId);
                        handleScanInput(p.participantId);
                      }
                    }}
                    className="p-2 rounded-btn bg-[#0E0F10] hover:bg-[#2A2D30] text-left border border-[#2A2D30] text-[#F5F5F2] transition-colors"
                  >
                    <span className="text-[#16794C] font-bold block text-[10px]">TEST 3</span>
                    Scan Participant
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = generateTamperedToken('STU1001', event.id);
                      setManualInput(t);
                      handleScanInput(t);
                    }}
                    className="p-2 rounded-btn bg-[#0E0F10] hover:bg-[#2A2D30] text-left border border-[#2A2D30] text-[#F5F5F2] transition-colors"
                  >
                    <span className="text-[#C43D3D] font-bold block text-[10px]">TEST 8</span>
                    Tampered QR (Bad Sig)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const t = generateExpiredToken('STU1001', event.id);
                      setManualInput(t);
                      handleScanInput(t);
                    }}
                    className="p-2 rounded-btn bg-[#0E0F10] hover:bg-[#2A2D30] text-left border border-[#2A2D30] text-[#F5F5F2] transition-colors"
                  >
                    <span className="text-[#A96500] font-bold block text-[10px]">TEST 9</span>
                    Expired QR Token
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
