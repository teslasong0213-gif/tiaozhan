import React, { useState } from "react";
import { motion } from "motion/react";
import { Play, Sparkles, Award } from "lucide-react";
import { BARCODE_DEFINITIONS } from "../constants";
import { audio } from "../utils/audio";

interface HomeViewProps {
  onStart: () => void;
}

export default function HomeView({ onStart }: HomeViewProps) {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const handleStartGame = () => {
    audio.playPop();
    setTimeout(() => {
      onStart();
    }, 150);
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-5 py-6 bg-[#FFFDF7] pb-10 select-none">
      
      {/* App Header Zone */}
      <div className="text-center space-y-2 mt-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 150, damping: 10 }}
          className="inline-block bg-[#FFD93D] text-[#111111] px-4 py-1.5 rounded-full border-2 border-black font-extrabold text-xs tracking-wider uppercase shadow-[2px_2px_0px_0px_#111111]"
        >
          🦖 趣味解压大清洗
        </motion.div>

        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="text-4xl font-extrabold tracking-tight text-[#111111] leading-none select-none relative inline-block py-2"
          style={{ fontFamily: "var(--font-comic)" }}
        >
          刘海条形码
          <span className="block text-2xl text-amber-500 mt-1">三连大挑战！</span>
          {/* Accent slash decorations in pure comical vector style */}
          <span className="absolute -right-3 top-2 text-yellow-400 rotate-12 text-lg">⚡</span>
          <span className="absolute -left-4 bottom-2 text-yellow-500 -rotate-12 text-sm">✨</span>
        </motion.h1>

        <p className="text-xs text-stone-600 font-bold bg-[#F9F5EB] border-2 border-dashed border-[#111111] rounded-lg py-1 px-3 mx-4 leading-relaxed">
          今日测试：头油过度！刘海已硬化成“条形码”，请立即执行切、吸、溶三部曲完成拯救！
        </p>
      </div>

      {/* Main Cute Avatar / Mascot Animation Area */}
      <div className="my-4 flex justify-center items-center relative py-2">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-44 h-44 bg-white border-4 border-black rounded-full flex flex-col items-center justify-center shadow-[6px_6px_0px_0px_#111111] overflow-hidden"
        >
          {/* Dynamic Background Rays */}
          <div className="absolute inset-0 bg-[radial-gradient(#FFE0B2_1px,transparent_1px)] [background-size:12px_12px] opacity-40"></div>
          
          {/* Interactive Mascot Character rendered beautifully in CSS/SVG */}
          <svg viewBox="0 0 100 100" className="w-32 h-32 z-10">
            {/* Cute rosy cheeks */}
            <circle cx="28" cy="62" r="6" fill="#FF8A80" opacity="0.6" />
            <circle cx="72" cy="62" r="6" fill="#FF8A80" opacity="0.6" />
            
            {/* Cute Face Body */}
            <circle cx="50" cy="58" r="24" fill="#FFE082" stroke="#111111" strokeWidth="3.5" />
            
            {/* Messy greasy eyes */}
            <g stroke="#111111" strokeWidth="3" strokeLinecap="round" fill="none">
              {/* Blinking / squinting funny eyes */}
              <path d="M36 57 Q41 53 44 57" />
              <path d="M56 57 Q59 53 64 57" />
              {/* Worried mouth */}
              <path d="M43 68 Q50 64 57 68" />
            </g>

            {/* BARCODE BANGS (Liu Hai) -- The focus of the game! */}
            {/* We draw distinct greasy rigid "bars" hanging down representing bar code forehead bangs! */}
            <g fill="#111111" stroke="#111111" strokeWidth="0.5">
              {/* Thick block bangs with yellow greasy highlights */}
              <rect x="22" y="32" width="7" height="15" rx="1.5" />
              <rect x="31" y="32" width="4" height="20" rx="1" />
              <rect x="37" y="32" width="9" height="18" rx="1.5" />
              <rect x="48" y="32" width="3" height="20" rx="1" />
              <rect x="53" y="32" width="7" height="17" rx="1.5" />
              <rect x="62" y="32" width="5" height="22" rx="1.5" />
              <rect x="69" y="32" width="8" height="14" rx="1.5" />
              
              {/* Yellow oil glow dots */}
              <circle cx="25" cy="43" r="1.5" fill="#FFEB3B" />
              <circle cx="41" cy="45" r="2" fill="#FFEB3B" />
              <circle cx="56" cy="44" r="1.5" fill="#FFEB3B" />
              <circle cx="65" cy="47" r="1.5" fill="#FFEB3B" />
            </g>

            {/* Flies / odor waves */}
            <path d="M22 20 Q25 15 28 20" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M72 18 Q75 13 78 18" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>

          {/* Funny Status Sweatdrop Sticker */}
          <div className="absolute top-16 right-4 rotate-12 bg-[#FFD93D] text-[#111111] text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-black shadow-[1px_1px_0px_0px_#111111]">
            超黏腻! 💧
          </div>
        </motion.div>
      </div>

      {/* Roster of Barcode State - "Today's Hair Barcodes" */}
      <div className="space-y-3 mt-1">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-black tracking-widest text-stone-700">📋 今日异常条形码图鉴：</span>
          <span className="text-[10px] font-bold text-amber-600 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">6款待洗净</span>
        </div>

        {/* Small horizontal scroll or grid collection of barcodes */}
        <div className="grid grid-cols-3 gap-2 px-1">
          {BARCODE_DEFINITIONS.map((barcode, idx) => (
            <motion.div
              key={barcode.id}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredCard(idx)}
              onHoverEnd={() => setHoveredCard(null)}
              className={`p-2 rounded-xl border-2 border-black ${barcode.bgColor} text-center flex flex-col items-center justify-between relative shadow-[2px_2px_0px_0px_#111111] cursor-pointer`}
            >
              <div className="text-xl inline-block">{barcode.icon}</div>
              <div className="text-[11px] font-extrabold text-[#111111]">{barcode.name}</div>
              <div className="text-[9px] text-[#666666] font-bold mt-0.5">
                {idx === 2 ? "👿 油率 99%" : idx === 4 ? "☕ 湿漉度" : "⚠️ 黏成股"}
              </div>

              {/* Hover overlay description tooltip */}
              {hoveredCard === idx && (
                <div className="absolute bottom-11 left-1/2 -translate-x-1/2 w-[180px] z-20 bg-white border-2 border-black rounded-lg p-2 text-left shadow-[4px_4px_0px_0px_#111111] text-[10px] leading-relaxed text-stone-800 animate-fadeIn">
                  <div className="font-extrabold text-amber-600 mb-1 flex items-center gap-1">
                    <span>{barcode.icon}</span>
                    <span>{barcode.name}</span>
                  </div>
                  {barcode.description}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call To Action Buttons Block */}
      <div className="mt-6 flex flex-col items-center space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartGame}
          className="w-full max-w-[280px] bg-[#FFD93D] hover:bg-yellow-300 text-[#111111] py-4 px-6 rounded-2xl border-4 border-black font-black text-xl flex items-center justify-center gap-3 shadow-[5px_5px_0px_0px_#111111] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[3px_3px_0px_0px_#111111] transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-current text-black" />
          <span>开始挑战！</span>
        </motion.button>

        <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>三阶段连击：切码 ➔ 吸码 ➔ 溶码，冲刺100%洗净度！</span>
        </div>
      </div>
      
    </div>
  );
}
