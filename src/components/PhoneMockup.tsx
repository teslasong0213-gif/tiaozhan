import React, { useState } from "react";
import { Volume2, VolumeX, Sparkles } from "lucide-react";
import { audio } from "../utils/audio";

interface PhoneMockupProps {
  children: React.ReactNode;
}

export default function PhoneMockup({ children }: PhoneMockupProps) {
  const [isMuted, setIsMuted] = useState(audio.getMuted());

  const handleToggleMute = () => {
    const nextMute = audio.toggleMute();
    setIsMuted(nextMute);
    
    // Synthesize a fast high pop to confirm unmuting if applicable
    if (!nextMute) {
      setTimeout(() => {
        audio.playPop();
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EB] text-[#111111] font-sans flex items-center justify-center p-0 md:p-6 select-none relative overflow-hidden">
      {/* Decorative background cartoon elements for desktop */}
      <div className="absolute top-10 left-10 hidden xl:flex flex-col items-start space-y-2 pointer-events-none transform -rotate-6">
        <div className="bg-[#FFD93D] text-[#111111] px-4 py-2 rounded-xl border-4 border-[#111111] shadow-[4px_4px_0px_0px_#111111] font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 fill-current" />
          <span>去头油 · 救毛囊！</span>
        </div>
        <div className="bg-white text-[#666666] px-3 py-1 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-medium">
          # 反击条形码刘海
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden xl:flex flex-col items-end space-y-2 pointer-events-none transform rotate-3">
        <div className="bg-emerald-300 text-[#111111] px-4 py-2 rounded-xl border-4 border-[#111111] shadow-[4px_4px_0px_0px_#111111] font-bold text-base">
          【 100% 物理洗涤技术 】
        </div>
        <div className="bg-white text-[#666666] px-3 py-1 rounded-lg border-2 border-[#111111] shadow-[2px_2px_0px_0px_#111111] text-xs font-medium">
          今日发质顺滑度恢复：99.9%
        </div>
      </div>

      {/* Main phone screen container */}
      <div className="w-full h-screen md:h-[820px] md:max-w-[410px] md:rounded-[36px] bg-[#FFFDF7] border-0 md:border-[6px] border-[#111111] relative shadow-none md:shadow-[12px_12px_0px_0px_#111111] flex flex-col overflow-hidden transition-all duration-300">
        
        {/* Mock WeChat Mini-App Status Bar and Header */}
        <div className="bg-[#FFFDF7] border-b-4 border-[#111111] py-3 px-4 flex items-center justify-between z-30 select-none">
          {/* Simulated Left: Time & Sound Control */}
          <div className="flex items-center space-x-2">
            <button
              id="audio_toggle_btn"
              onClick={handleToggleMute}
              className="w-10 h-10 select-none flex items-center justify-center rounded-xl bg-white border-2 border-[#111111] active:translate-y-0.5 shadow-[2px_2px_0px_0px_#111111] active:shadow-[0px_0px_0px_0px_#111111] hover:bg-amber-100 transition-colors"
              title={isMuted ? "点击取消静音" : "点击静音"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-red-500" />
              ) : (
                <Volume2 className="w-5 h-5 text-green-600 animate-pulse" />
              )}
            </button>
            <div className="text-[11px] font-bold tracking-tight bg-white border-2 border-[#111111] px-2 py-0.5 rounded-md hidden sm:block">
              12:00
            </div>
          </div>

          {/* Micro App Indicator / Logo */}
          <div className="flex items-center space-x-1 font-bold text-sm tracking-widest text-[#111111]">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black inline-block animate-ping"></span>
            <span>刘海条形码·清洗中</span>
          </div>

          {/* Simulated Right: WeChat controls (pill buttons) */}
          <div className="bg-white border-2 border-[#111111] px-2 py-1.5 rounded-full flex items-center space-x-3 shadow-[2px_2px_0px_0px_#111111]">
            {/* Options button (three dots) */}
            <div className="flex space-x-1 items-center px-1">
              <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
              <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
            </div>
            <div className="w-[1px] h-3.5 bg-gray-300"></div>
            {/* Close circle button */}
            <div className="relative w-4 h-4 flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-black flex items-center justify-center bg-transparent">
                <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Game Content Layer */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-[#FFFDF7]">
          {children}
        </div>
      </div>
    </div>
  );
}
