import React, { useRef, useEffect } from 'react';
import { Gem, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface WaveAnalyzerProps {
  analyserNode: AnalyserNode | null;
  isAudioActive: boolean;
}

export function WaveAnalyzer({ analyserNode, isAudioActive }: WaveAnalyzerProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 64;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const width = canvas.width;
      const height = canvas.height;

      // Dark crystalline obsidian or light diamond quartz background
      if (isLight) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(0, 0, width, height);

        // Faceted crystal grid
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 32) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 18) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      } else {
        ctx.fillStyle = 'rgba(6, 8, 20, 0.35)';
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < width; x += 32) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
        }
        for (let y = 0; y < height; y += 20) {
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
        }
        ctx.stroke();
      }

      if (isAudioActive && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          // Prismatic crystalline gradient (Cyan -> Magenta -> Violet -> Emerald)
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          if (isLight) {
            gradient.addColorStop(0, '#7c3aed');
            gradient.addColorStop(0.35, '#a855f7');
            gradient.addColorStop(0.7, '#06b6d4');
            gradient.addColorStop(1, '#ec4899');
          } else {
            gradient.addColorStop(0, '#4c1d95');
            gradient.addColorStop(0.35, '#9333ea');
            gradient.addColorStop(0.7, '#06b6d4');
            gradient.addColorStop(1, '#f43f5e');
          }

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);

          // Crystalline facet top sparkle (diamond shape)
          ctx.fillStyle = isLight ? '#06b6d4' : '#22d3ee';
          ctx.fillRect(x, height - barHeight - 2, Math.max(1, barWidth - 1), 2);

          x += barWidth + 1;
        }

        // Crystalline Holographic Oscilloscope Laser Line
        const timeData = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(timeData);
        ctx.beginPath();
        ctx.strokeStyle = isLight ? 'rgba(124, 58, 237, 0.7)' : 'rgba(34, 211, 238, 0.8)';
        ctx.lineWidth = 2;
        ctx.shadowColor = isLight ? '#a855f7' : '#06b6d4';
        ctx.shadowBlur = 8;
        const sliceWidth = width / bufferLength;
        let lineX = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = timeData[i] / 128.0;
          const y = (v * height) / 2;
          if (i === 0) ctx.moveTo(lineX, y);
          else ctx.lineTo(lineX, y);
          lineX += sliceWidth;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else {
        // Idle Ambient Crystalline Lattice Sweep (decelerated to smooth, meditative wave)
        const time = Date.now() * 0.0006;
        ctx.beginPath();
        ctx.strokeStyle = isLight ? 'rgba(168, 85, 247, 0.35)' : 'rgba(34, 211, 238, 0.3)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.03 + time) * 8 + Math.cos(x * 0.015 - time * 0.6) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = isLight ? '#7c3aed' : '#a855f7';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✦ CRYSTALLINE HARMONIC COHERENCE // STANDBY ✦', width / 2, height / 2 + 3);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isAudioActive, isLight]);

  return (
    <div className={`p-4 border-b transition-colors ${
      isLight ? 'bg-white border-purple-200' : 'bg-[#050717] border-purple-900/40'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gem className={`w-4 h-4 ${isLight ? 'text-purple-600' : 'text-cyan-400'}`} />
          <h2 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-purple-950' : 'text-cyan-200'}`}>
            PRISMATIC FFT HARMONIC ANALYZER
          </h2>
        </div>
        <span className={`text-[10px] font-mono ${isLight ? 'text-purple-700' : 'text-cyan-400/80'}`}>
          256 BINS // 48kHz REFRACTION
        </span>
      </div>

      <div className={`border rounded overflow-hidden relative shadow-inner ${
        isLight ? 'bg-gradient-to-b from-white to-purple-50/20 border-purple-200' : 'bg-[#030511] border-purple-900/60 shadow-[inset_0_0_15px_rgba(168,85,247,0.1)]'
      }`}>
        <canvas
          ref={canvasRef}
          width={560}
          height={115}
          className="w-full h-[115px] block"
        />
      </div>
    </div>
  );
}
