'use client';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { useStore } from '@/store/useStore';
export const InteractiveBackground = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const { profile } = useStore();
  const bg = profile.settings.background;
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  useEffect(() => {
    let animationFrameId: number;
    const handleMouseMove = (e: MouseEvent) => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        setMousePos({ x, y });
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);
  const getBackgroundStyle = () => {
    switch (bg) {
      case 'neon':
        return {
          backgroundColor: '#0b0c10',
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(34,197,94,0.15) 0%, transparent 40%),
            radial-gradient(circle at ${100 - mousePos.x}% ${100 - mousePos.y}%, rgba(59,130,246,0.1) 0%, transparent 40%)
          `
        };
      case 'casino':
        return {
          backgroundColor: '#2a0800',
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,0,0,0.2) 0%, transparent 60%),
            repeating-linear-gradient(45deg, rgba(0,0,0,0.2) 0px, rgba(0,0,0,0.2) 2px, transparent 2px, transparent 10px)
          `
        };
      case 'matrix':
        return {
          backgroundColor: '#001100',
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,255,0,0.15) 0%, transparent 50%),
            linear-gradient(rgba(0,255,0,0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0,255,0,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 20px 20px, 20px 20px'
        };
      case 'ocean':
        return {
          backgroundColor: '#000a1f',
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% 20%, rgba(0,100,255,0.25) 0%, transparent 50%),
            radial-gradient(circle at ${mousePos.x + 20}% ${mousePos.y + 20}%, rgba(0,200,255,0.1) 0%, transparent 40%)
          `
        };
      case 'lava':
        return {
          backgroundColor: '#1a0500',
          backgroundImage: `
            radial-gradient(circle at ${mousePos.x}% ${mousePos.y + 20}%, rgba(255,100,0,0.2) 0%, transparent 50%),
            radial-gradient(circle at ${100 - mousePos.x}% 100%, rgba(255,0,0,0.15) 0%, transparent 60%)
          `
        };
      case 'dark':
        return { backgroundColor: '#000' };
      case 'none':
        return { backgroundColor: '#09090b' }; 
      case 'classic':
      default:
        return { backgroundColor: '#18181b' }; 
    }
  };
  return (
    <div 
      className={clsx("transition-colors duration-1000", className)}
      style={getBackgroundStyle() as React.CSSProperties}
    >
      {children}
    </div>
  );
};