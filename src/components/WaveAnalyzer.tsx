import React, { useRef, useEffect } from 'react';
import { Activity, BarChart3 } from 'lucide-react';

interface WaveAnalyzerProps {
  analyserNode: AnalyserNode | null;
  isAudioActive: boolean;
}

export function WaveAnalyzer({ analyserNode, isAudioActive }: WaveAnalyzerProps) {
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

      // Dark background with slight trace persistence
      ctx.fillStyle = 'rgba(6, 10, 19, 0.35)';
      ctx.fillRect(0, 0, width, height);

      // Draw subtle grid lines
      ctx.strokeStyle = '#121d2e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x += 40) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      if (isAudioActive && analyserNode) {
        analyserNode.getByteFrequencyData(dataArray);

        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height;

          // Gradient color from cyan to teal to green
          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#005544');
          gradient.addColorStop(0.5, '#00e1ff');
          gradient.addColorStop(1, '#00ffcc');

          ctx.fillStyle = gradient;
          ctx.fillRect(x, height - barHeight, Math.max(1, barWidth - 1), barHeight);

          // Top peak pixel glow
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, height - barHeight - 1, Math.max(1, barWidth - 1), 1.5);

          x += barWidth + 1;
        }

        // Oscilloscope overlay line
        const timeData = new Uint8Array(bufferLength);
        analyserNode.getByteTimeDomainData(timeData);
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1.5;
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

      } else {
        // Idle Ambient Sine Wave Sweep
        const time = Date.now() * 0.003;
        ctx.beginPath();
        ctx.strokeStyle = '#1b2a40';
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x++) {
          const y = height / 2 + Math.sin(x * 0.04 + time) * 8 + Math.cos(x * 0.01 - time * 0.5) * 4;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.fillStyle = '#415573';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OSCILLATOR STANDBY // WAITING FOR SCALAR ACTIVATION', width / 2, height / 2 + 3);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyserNode, isAudioActive]);

  return (
    <div className="p-4 border-b border-[#1a2636] bg-[#050912]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#00ffcc]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#d0e0f5]">
            HARMONIC WAVEFORM ANALYZER (FFT SPECTRUM)
          </h2>
        </div>
        <span className="text-[10px] text-[#556e8f] font-mono">256 BINS // 48kHz</span>
      </div>

      <div className="border border-[#182638] rounded overflow-hidden bg-[#04070d] relative shadow-inner">
        <canvas
          ref={canvasRef}
          width={560}
          height={110}
          className="w-full h-[110px] block"
        />
      </div>
    </div>
  );
}
