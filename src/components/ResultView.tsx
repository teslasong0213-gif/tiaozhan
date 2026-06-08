import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, RefreshCcw, Share2, Sparkles, Copy, Check } from "lucide-react";
import { GameStats } from "../types";
import { audio } from "../utils/audio";

interface ResultViewProps {
  stats: GameStats;
  onRestart: () => void;
}

export default function ResultView({ stats, onRestart }: ResultViewProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Interactive Slider: ranges 0 to 100 for Before & After hair comparison
  const [comparisonSlider, setComparisonSlider] = useState(50);

  // Derive custom ratings and remarks based on performance score
  const getHairRating = (score: number) => {
    if (score > 12000) return { grade: "SSS级 顺滑天神", desc: "头油率：0.00%！飘逸秀发，折射出耀眼的钻石光波！", medal: "🏆" };
    if (score > 8000) return { grade: "S级 丝滑顺亮", desc: "头油率：0.5%！一梳到底，狂风也无法蹂躏你的顺溜！", medal: "🥇" };
    if (score > 4000) return { grade: "A级 恢复如初", desc: "头油率：2.1%！刘海重获新生，终于不再能扫出价格！", medal: "🥈" };
    return { grade: "B级 清爽无忧", desc: "头油率：5.8%！挽救成功，好歹能维持一整天的体面了！", medal: "🥉" };
  };

  const rating = getHairRating(stats.score);

  // Play button pop and restart callback
  const handleRestart = () => {
    audio.playPop();
    setTimeout(() => {
      onRestart();
    }, 150);
  };

  const shareText = `🧼【刘海条形码·三连大挑战】🚿
我成功完成了今日刘海大清洗，秀发顺滑如新！
🌟 终极得分：${stats.score} 分
🏅 清洗等级：${rating.grade}
📊 关卡清洗清点：
 - ✂️ 切码挑战：切除 ${stats.cutCount} 个
 - 🌪️ 吸码挑战：吸附 ${stats.suckCount} 个
 - 🧴 溶码挑战：油脂溶解 100%
✨ 快来拯救你的条形码刘海，重现飘逸光彩吧！`;

  const copyToClipboard = () => {
    try {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      audio.playShine();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto px-5 py-6 bg-[#FFFDF7] select-none pb-10">
      
      {/* Celebration Header sticker */}
      <div className="text-center space-y-1.5 mt-2">
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 10 }}
          className="inline-block bg-[#4CAF50] text-white px-4 py-1 rounded-full border-2 border-black font-extrabold text-xs shadow-[2px_2px_0px_0px_#111111]"
        >
          🧹 洗涤任务已完美达标！
        </motion.div>

        <h1 className="text-3xl font-black text-[#111111] tracking-tight leading-none pt-1">
          刘海清洗完成！
        </h1>
        <p className="text-xs text-stone-600 font-bold">
          恭喜全部刘海清洗如初，重现顺滑秀发！
        </p>
      </div>

      {/* BEFORE / AFTER INTERACTIVE SLIDER BOX (Aesthetic Showcase) */}
      <div className="my-4 p-4.5 bg-white border-4 border-black rounded-2xl shadow-[5px_5px_0px_0px_#111111] flex flex-col space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-black tracking-widest text-[#111111]">
            🔍 滑动滑条，检视发质治愈度：
          </span>
          <span className="text-[10px] bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold px-1.5 py-0.5 rounded">
            治愈度 {comparisonSlider}%
          </span>
        </div>

        {/* Visual Comparison Area */}
        <div className="relative h-28 bg-[#FFF9E6] border-2 border-black rounded-xl overflow-hidden flex items-center justify-center">
          
          {/* BACKGROUND TEXT */}
          <div className="absolute inset-0 flex items-center justify-between px-6 text-2xl font-black opacity-10 pointer-events-none select-none">
            <span>BEFORE</span>
            <span>AFTER</span>
          </div>

          {/* RIGHT SIDE: Silk smooth gorgeous clean avatar bangs */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Draw Silky smooth hair profile */}
            <svg viewBox="0 0 100 100" className="w-24 h-24">
              <circle cx="50" cy="55" r="22" fill="#FFE082" stroke="#111111" strokeWidth="3" />
              {/* Cute Clean Shiny happy eyes */}
              <circle cx="40" cy="55" r="2.5" fill="#111111" />
              <circle cx="60" cy="55" r="2.5" fill="#111111" />
              <path d="M46 64 Q50 67 54 64" stroke="#111111" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              {/* Soft, beautiful, flowing clean hair strands bangs */}
              <g fill="#111111">
                <path d="M26 33 C 35 30, 45 32, 50 35 C 55 32, 65 30, 74 33 C 70 42, 60 48, 50 49 C 40 48, 30 42, 26 33 Z" stroke="#111111" strokeWidth="1" />
                <path d="M50 35 L50 49" stroke="#FFF" strokeWidth="1" opacity="0.4" />
              </g>
              {/* Golden sparkle items */}
              <circle cx="28" cy="42" r="1.5" fill="#FFC107" />
              <text x="73" y="47" className="text-[10px]" fill="#FFC107">✨</text>
              <text x="20" y="58" className="text-[10px]" fill="#FFC107">✨</text>
            </svg>
          </div>

          {/* LEFT SIDE: Greasy split locks of oil barcode overlay (Slices/masks left side depending on slider) */}
          <div 
            className="absolute inset-y-0 left-0 bg-[#3E2723]/10 border-r-2 border-black/50 overflow-hidden"
            style={{ width: `${100 - comparisonSlider}%` }}
          >
            {/* Content mirror alignment inside */}
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-24 h-24 opacity-60">
                {/* Sweat particles */}
                <path d="M50 31 L50 50" stroke="#111" strokeWidth="2.5" />
                {/* Thick dirty greasy barcode profile */}
                <g fill="#111111">
                  <rect x="25" y="32" width="7" height="15" rx="1" />
                  <rect x="35" y="32" width="4" height="20" rx="1" />
                  <rect x="42" y="32" width="9" height="18" rx="1" />
                  <rect x="54" y="32" width="3" height="22" rx="1" />
                  <rect x="60" y="32" width="8" height="15" rx="1" />
                </g>
              </svg>
            </div>
            {/* Split "Stale" indicator */}
            <div className="absolute right-2 top-2 bg-red-100 text-red-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-red-300">
              油结! 💦
            </div>
          </div>
        </div>

        {/* Input slider control */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={comparisonSlider}
          onChange={(e) => setComparisonSlider(Number(e.target.value))}
          className="w-full accent-[#FFD93D] h-2 bg-stone-200 rounded-lg cursor-ew-resize appearance-none outline-none mt-1 border border-black"
        />
      </div>

      {/* RESULTS STATS BLOCK */}
      <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0px_0px_#111111] space-y-4">
        
        {/* Rating and Grade Sticker */}
        <div className="flex items-center gap-3.5 border-b-2 border-black pb-3">
          <div className="text-4xl">{rating.medal}</div>
          <div className="flex-1 text-left leading-tight">
            <div className="text-lg font-black text-[#111111] flex items-center gap-1.5">
              <span>等级:</span>
              <span className="text-amber-500 bg-amber-50 px-2 py-0.5 rounded border border-black text-sm font-extrabold">{rating.grade}</span>
            </div>
            <div className="text-[10px] text-stone-600 font-bold mt-1 leading-normal">
              {rating.desc}
            </div>
          </div>
        </div>

        {/* Breakdown Row details */}
        <div className="grid grid-cols-2 gap-3 pb-1">
          <div className="bg-[#F9F5EB] border-2 border-black rounded-xl p-2.5 text-center flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111]">
            <span className="text-[9.5px] font-extrabold text-stone-500">🏆 终极得分</span>
            <span className="text-lg font-black text-[#111111]">{stats.score} pt</span>
          </div>

          <div className="bg-[#F9F5EB] border-2 border-black rounded-xl p-2.5 text-center flex flex-col justify-between shadow-[2px_2px_0px_0px_#111111]">
            <span className="text-[9.5px] font-extrabold text-stone-500">🔥 最高连击</span>
            <span className="text-lg font-black text-red-500">{stats.maxCombo} Combo</span>
          </div>
        </div>

        {/* Three challenge completed counts */}
        <div className="bg-amber-50/50 border-2 border-black rounded-xl p-3 space-y-2 text-xs font-bold text-stone-700">
          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="inline-block">✂️</span>
              <span>第一关 · 碎掉条形码：</span>
            </span>
            <span className="text-stone-900 font-extrabold">{stats.cutCount} 个刘海</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="inline-block">🌪️</span>
              <span>第二关 · 吸空残留码：</span>
            </span>
            <span className="text-stone-900 font-extrabold">{stats.suckCount} 个残留</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="flex items-center gap-1.5 text-stone-600">
              <span className="inline-block">🧴</span>
              <span>第三关 · 深层强效溶解：</span>
            </span>
            <span className="text-green-600 font-black">100% 污垢清除</span>
          </div>
        </div>
      </div>

      {/* BOTTOM BUTTON ROUTER OPTIONS */}
      <div className="mt-5 flex flex-col items-center space-y-3.5">
        
        <div className="grid grid-cols-2 gap-3.5 w-full">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRestart}
            className="bg-[#FFD93D] hover:bg-yellow-300 text-[#111111] py-3.5 px-4 rounded-xl border-3 border-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111111] cursor-pointer"
          >
            <RefreshCcw className="w-4 h-4 text-black" />
            <span>再来一盘</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowShareModal(true)}
            className="bg-white hover:bg-gray-50 text-[#111111] py-3.5 px-4 rounded-xl border-3 border-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#111111] cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-black" />
            <span>分享战绩</span>
          </motion.button>
        </div>

        <p className="text-[10px] text-gray-400 font-black tracking-widest text-center select-none uppercase">
          - 🚿 洗去一身黏腻，清爽迎接明天！ -
        </p>
      </div>

      {/* SHARE MODAL BOTTOM SHEET OVERLAY */}
      <AnimatePresence>
        {showShareModal && (
          <div className="absolute inset-0 z-50 bg-black/60 flex items-end justify-center select-none">
            {/* Tap backdrop to close */}
            <div className="absolute inset-0" onClick={() => setShowShareModal(false)}></div>

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-[#FFFDF7] border-t-4 border-black w-full rounded-t-[28px] p-6 z-10 flex flex-col space-y-4 shadow-[0_-10px_25px_rgba(0,0,0,0.15)] relative"
            >
              <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-1"></div>

              <div className="flex items-center justify-between border-b-2 border-black pb-2.5">
                <span className="font-black text-sm text-[#111111] flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500 fill-current" />
                  <span>战绩已生成，点击复制：</span>
                </span>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-stone-400 hover:text-stone-700 font-extrabold text-lg px-2"
                >
                  ✕
                </button>
              </div>

              {/* Share card content block */}
              <div className="bg-[#F9F5EB] border-2 border-black rounded-2xl p-4 text-left font-mono text-[11px] leading-relaxed text-stone-800 whitespace-pre-wrap select-text">
                {shareText}
              </div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={copyToClipboard}
                className="w-full py-3.5 bg-black hover:bg-stone-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#111111] cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">复制成功！快发给小伙伴!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>复制战绩文本</span>
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
