import React, { useEffect, useRef } from "react";

interface AudioVisualizerProps {
  isActive: boolean;
  isSpeaking: boolean;
  audioLevel?: number; // 0 to 1
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  isSpeaking,
  audioLevel = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      // Draw subtle background guide line
      ctx.beginPath();
      ctx.strokeStyle = "rgba(216, 203, 187, 0.35)";
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      if (!isActive && !isSpeaking) {
        // Serene calm wave when idle
        ctx.beginPath();
        ctx.strokeStyle = "rgba(163, 88, 60, 0.4)";
        ctx.lineWidth = 1.5;
        for (let x = 0; x < width; x++) {
          const y = centerY + Math.sin(x * 0.02 + phase) * 2;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        phase += 0.02;
      } else {
        // Active sound waves (voice input or Meï speaking)
        const amplitudeMultiplier = isSpeaking ? 22 : 12;
        const currentAmp = Math.max(3, audioLevel * amplitudeMultiplier);

        const waves = [
          { freq: 0.03, speed: 0.07, color: "rgba(163, 88, 60, 0.8)", width: 2.2, amp: currentAmp },
          { freq: 0.02, speed: -0.05, color: "rgba(194, 155, 56, 0.65)", width: 1.6, amp: currentAmp * 0.75 },
          { freq: 0.045, speed: 0.09, color: "rgba(68, 64, 60, 0.45)", width: 1.2, amp: currentAmp * 0.5 },
        ];

        waves.forEach((w) => {
          ctx.beginPath();
          ctx.strokeStyle = w.color;
          ctx.lineWidth = w.width;

          for (let x = 0; x < width; x++) {
            // Envelope so ends taper to zero
            const envelope = Math.sin((x / width) * Math.PI);
            const y = centerY + Math.sin(x * w.freq + phase * (w.speed > 0 ? 1 : -1)) * w.amp * envelope;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });

        phase += 0.08;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isActive, isSpeaking, audioLevel]);

  return (
    <div className="w-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={320}
        height={64}
        className="w-full max-w-xs h-16 pointer-events-none"
      />
    </div>
  );
};
