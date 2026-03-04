import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";

interface VoiceVisualizerProps {
  isRecording: boolean;
  isActive: boolean;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ isRecording, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrame: number;
    let time = 0;

    const render = () => {
      time += 0.05;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;
      
      // Draw multiple rings
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 2;
        
        const currentRadius = radius + (isActive ? Math.sin(time + i) * 10 : 0);
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
          const noise = isActive ? Math.sin(angle * 10 + time + i) * 5 : 0;
          const x = centerX + (currentRadius + noise) * Math.cos(angle);
          const y = centerY + (currentRadius + noise) * Math.sin(angle);
          
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.closePath();
        ctx.stroke();
      }

      animationFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]);

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="absolute inset-0 w-full h-full"
      />
      <motion.div
        animate={{
          scale: isActive ? [1, 1.1, 1] : 1,
          opacity: isRecording ? 1 : 0.5,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="z-10 w-32 h-32 rounded-full bg-brand-yellow flex items-center justify-center shadow-[0_0_50px_rgba(251,191,36,0.5)]"
      >
        <div className="w-24 h-24 rounded-full bg-brand-black flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full bg-brand-yellow ${isActive ? 'animate-ping' : ''}`} />
        </div>
      </motion.div>
      
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-2 border-brand-yellow/30 pulse-ring" />
      )}
    </div>
  );
};
