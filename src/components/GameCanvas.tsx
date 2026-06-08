import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Zap, Award, AlertTriangle } from "lucide-react";
import { BARCODE_DEFINITIONS, GAME_LEVELS } from "../constants";
import { GameItem, GameStats } from "../types";
import { audio } from "../utils/audio";

interface GameCanvasProps {
  onGameComplete: (stats: GameStats) => void;
  onExit: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number; // 0 to 1
  decay: number;
}

interface ComboIndicator {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number; // 0 to 1
}

interface SlashPoint {
  x: number;
  y: number;
  time: number;
}

export default function GameCanvas({ onGameComplete, onExit }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Level State
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const [showLevelIntro, setShowLevelIntro] = useState(true);

  // Score/Combos State
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    combos: 0,
    maxCombo: 0,
    cutCount: 0,
    suckCount: 0,
    meltCount: 0,
    startTime: Date.now(),
    endTime: 0,
  });

  // Canvas Dimensions
  const [dimensions, setDimensions] = useState({ width: 360, height: 600 });

  // Game loop entity references (to avoid React re-render lags)
  const itemsRef = useRef<GameItem[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const comboIndicatorsRef = useRef<ComboIndicator[]>([]);
  const slashPointsRef = useRef<SlashPoint[]>([]);
  const isMouseDownRef = useRef(false);
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const suctionActiveRef = useRef(false);

  // Initialize dimensions from container sizing
  useEffect(() => {
    if (!containerRef.current) return;
    
    const handleResize = () => {
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Fallback or exact sizes bounded inside layout
        setDimensions({
          width: rect.width || 360,
          height: rect.height || 600,
        });
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Sync canvas width & height
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
    }
  }, [dimensions]);

  // Handle Level Starts and Spawn entities
  useEffect(() => {
    if (showLevelIntro) {
      audio.playWinFanfare();
      // Clear past states on canvas loop
      particlesRef.current = [];
      comboIndicatorsRef.current = [];
      
      const timer = setTimeout(() => {
        setShowLevelIntro(false);
        spawnItemsForLevel(currentLevel.key);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [currentLevelIdx, showLevelIntro]);

  // Spawning logic based on Level
  const spawnItemsForLevel = (levelKey: "cut" | "suck" | "melt") => {
    const arr: GameItem[] = [];
    const count = levelKey === "melt" ? 6 : 8; // 8 items for L1/L2, 6 items for L3
    
    for (let i = 0; i < count; i++) {
      const def = BARCODE_DEFINITIONS[i % BARCODE_DEFINITIONS.length];
      
      let x = 0;
      let y = 0;
      let speedX = 0;
      let speedY = 0;
      let rotate = 0;
      
      const width = 60;
      const height = 130;

      if (levelKey === "cut") {
        // Top dropping setup
        x = 40 + Math.random() * (dimensions.width - 120);
        y = -150 - (i * 180); // Staggered drop heights
        speedX = (Math.random() - 0.5) * 1.2;
        speedY = 1.8 + Math.random() * 1.5; // slow gravity drop
        rotate = (Math.random() - 0.5) * 20;
      } else if (levelKey === "suck") {
        // Random floating scattered in area
        x = 30 + Math.random() * (dimensions.width - 90);
        y = 80 + Math.random() * (dimensions.height * 0.5);
        speedX = (Math.random() - 0.5) * 2.5;
        speedY = (Math.random() - 0.5) * 2.5;
        rotate = Math.random() * 360;
      } else {
        // Clean layout grid for melting challenge (fixed position cards)
        const cols = 2;
        const row = Math.floor(i / cols);
        const col = i % cols;
        const marginX = dimensions.width * 0.15;
        const spacingX = dimensions.width * 0.45;
        const spacingY = dimensions.height * 0.18;
        const startY = dimensions.height * 0.14;
        
        x = marginX + col * spacingX;
        y = startY + row * spacingY;
        speedX = 0;
        speedY = 0;
        rotate = (Math.random() - 0.5) * 8; // slightly skewed cards
      }

      // Generate greasy dark oil spots for level 3 (melt)
      const oilSpots: { x: number; y: number; radius: number; opacity: number }[] = [];
      if (levelKey === "melt") {
        const spotCount = 4 + Math.floor(Math.random() * 3);
        for (let s = 0; s < spotCount; s++) {
          oilSpots.push({
            x: 10 + Math.random() * (width - 20),
            y: 10 + Math.random() * (height - 20),
            radius: 12 + Math.random() * 14,
            opacity: 0.85,
          });
        }
      }

      arr.push({
        id: `bang_${levelKey}_${i}_${Date.now()}`,
        codeId: def.id,
        codeName: def.name,
        icon: def.icon,
        bgColor: def.bgColor,
        x,
        y,
        width,
        height,
        rotate,
        speedX,
        speedY,
        status: "active",
        progress: 0,
        scale: 1,
        oilSpots,
      });
    }

    itemsRef.current = arr;
  };

  // Helper spawn splash particles
  const spawnExplosionOfParticles = (x: number, y: number, color: string, count: number = 10) => {
    for (let p = 0; p < count; p++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 6,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.03,
      });
    }
  };

  // Soap bubble foam spray for melt mode
  const spawnSoapBubbles = (x: number, y: number, count: number = 5) => {
    const bubbleColors = ["#E3F2FD", "#F3E5F5", "#FFFDE7", "#E0F7FA", "#FFFFFF"];
    for (let p = 0; p < count; p++) {
      const angle = (Math.random() - 0.5) * Math.PI; // spray upward mostly
      const speed = 2.0 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.sin(angle) * speed,
        vy: -Math.abs(Math.cos(angle) * speed), // fly upward
        color: bubbleColors[Math.floor(Math.random() * bubbleColors.length)],
        size: 8 + Math.random() * 12,
        life: 1.0,
        decay: 0.03 + Math.random() * 0.04,
      });
    }
  };

  const addComboLabel = (x: number, y: number, text: string, color: string = "#FFD93D") => {
    comboIndicatorsRef.current.push({
      x,
      y,
      text,
      color,
      life: 1.0,
    });
  };

  // Slicing Collision Check with Line segment intersection
  const checkSliceIntersection = (
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    item: GameItem
  ) => {
    // Simplify matching: bounding circle or simple AABB box with padding
    const rectX = item.x;
    const rectY = item.y;
    const rectW = item.width;
    const rectH = item.height;

    // Check if the mid-point of the slice is inside the barcode card
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    if (
      midX >= rectX &&
      midX <= rectX + rectW &&
      midY >= rectY &&
      midY <= rectY + rectH
    ) {
      return true;
    }

    // Line intersection with bounding borders of barcode
    const xMin = rectX;
    const xMax = rectX + rectW;
    const yMin = rectY;
    const yMax = rectY + rectH;

    // Simple segment overlap test
    if (
      (p1.x < xMin && p2.x < xMin) ||
      (p1.x > xMax && p2.x > xMax) ||
      (p1.y < yMin && p2.y < yMin) ||
      (p1.y > yMax && p2.y > yMax)
    ) {
      return false;
    }

    return true;
  };

  // Core Game Loop via requestAnimationFrame
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Clear Screen with beautiful grid lines
      ctx.fillStyle = "#FFFDF7";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      // Render Comic Comic Dots Background Style
      ctx.fillStyle = "rgba(17,17,17,0.03)";
      const dotSpacing = 16;
      for (let x = 0; x < dimensions.width; x += dotSpacing) {
        for (let y = 0; y < dimensions.height; y += dotSpacing) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render Suction Vortex in Level 2
      if (currentLevel.key === "suck") {
        const vortexX = dimensions.width / 2;
        const vortexY = dimensions.height - 70;

        ctx.save();
        ctx.translate(vortexX, vortexY);
        // Spin angle based on timestamp
        const rAngle = (Date.now() / 150) % (Math.PI * 2);
        ctx.rotate(rAngle);

        // Draw Swirl
        ctx.strokeStyle = "#FFD93D";
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 8; a += 0.2) {
          const r = 5 + a * 3;
          ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.stroke();

        ctx.fillStyle = "#111111";
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Draw Tornado Funnel Guide (dashed comic lines)
        ctx.strokeStyle = "rgba(17,17,17,0.08)";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(0, dimensions.height - 150);
        ctx.quadraticCurveTo(dimensions.width / 2, dimensions.height - 70, dimensions.width, dimensions.height - 150);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 1. UPDATE AND DRAW PARTICLES
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // 2. UPDATE AND DRAW ITEMS
      const items = itemsRef.current;
      let completedCount = 0;

      for (let idx = 0; idx < items.length; idx++) {
        const item = items[idx];

        // Process Level Specific Mechanics
        if (item.status === "active") {
          if (currentLevel.key === "cut") {
            // Apply physics drop
            item.x += item.speedX;
            item.y += item.speedY;

            // Soft-rebound of borders
            if (item.x < 10 || item.x > dimensions.width - item.width - 10) {
              item.speedX = -item.speedX;
            }

            // Loop back on overflow
            if (item.y > dimensions.height) {
              item.y = -180;
              item.x = 40 + Math.random() * (dimensions.width - 120);
              item.rotate = (Math.random() - 0.5) * 20;
            }
          } else if (currentLevel.key === "suck") {
            // Floating bounce on bounding box
            item.x += item.speedX;
            item.y += item.speedY;

            if (item.x < 15 || item.x > dimensions.width - item.width - 15) {
              item.speedX *= -1;
            }
            if (item.y < 50 || item.y > dimensions.height - item.height - 120) {
              item.speedY *= -1;
            }

            // Dynamic rotation wave
            item.rotate += 1;

            // If suction is active, force pull items
            if (suctionActiveRef.current) {
              const vortexX = dimensions.width / 2 - item.width / 2;
              const vortexY = dimensions.height - 120;
              
              // Delta direction vector
              const dx = vortexX - item.x;
              const dy = vortexY - item.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 40) {
                // Sucking succeeded!
                item.status = "sucked";
                item.scale = 1.0;
                audio.playPop();
                
                // Add statistical scoring
                const gainCombos = comboCount + 1;
                setComboCount(gainCombos);
                setMaxCombo(prev => Math.max(prev, gainCombos));
                setGameStats(prev => ({
                  ...prev,
                  score: prev.score + 150 * gainCombos,
                  suckCount: prev.suckCount + 1,
                }));

                addComboLabel(item.x + 30, item.y + 20, `吸除! +${150 * gainCombos}`, "#4FC3F7");
                spawnExplosionOfParticles(item.x + 30, item.y + 50, "#4FC3F7", 12);
              } else {
                // Pull step
                item.x += dx * 0.14;
                item.y += dy * 0.14;
                // Spin faster inside suction
                item.rotate += 12;
                // Shrink based on distance
                item.scale = Math.max(0.2, dist / (dimensions.height * 0.7));
              }
            } else {
              // Fade back scale
              if (item.scale && item.scale < 1.0) {
                item.scale += (1.0 - item.scale) * 0.1;
              }
            }
          } else if (currentLevel.key === "melt") {
            // Level 3 static grease overlay cards
            if (item.progress >= 100) {
              item.status = "clean";
              audio.playShine();

              const gainCombos = comboCount + 1;
              setComboCount(gainCombos);
              setMaxCombo(prev => Math.max(prev, gainCombos));
              setGameStats(prev => ({
                ...prev,
                score: prev.score + 250 * gainCombos,
                meltCount: prev.meltCount + 1,
              }));

              addComboLabel(item.x + 30, item.y + 40, `洗净! +${250 * gainCombos}`, "#4CAF50");
              spawnExplosionOfParticles(item.x + 30, item.y + 60, "#FFEB3B", 20);
            }
          }
        }

        // Count terminal components
        if (item.status === "hit" || item.status === "sucked" || item.status === "clean" || item.status === "melted") {
          completedCount++;
        }

        // DRAW INDIVIDUAL BARCODE ITEM 
        if (item.status !== "sucked") {
          ctx.save();
          
          // Apply rotations and translation coordinates
          const centerX = item.x + item.width / 2;
          const centerY = item.y + item.height / 2;
          ctx.translate(centerX, centerY);
          
          if (item.rotate) {
            ctx.rotate((item.rotate * Math.PI) / 180);
          }
          
          const drawScale = item.scale !== undefined ? item.scale : 1.0;
          ctx.scale(drawScale, drawScale);

          // Get background colors (parse class colors into actual hex safely)
          let cardBg = "#FFFFFF";
          if (item.bgColor.includes("amber-100")) cardBg = "#FFE082";
          else if (item.bgColor.includes("emerald-100")) cardBg = "#A5D6A7";
          else if (item.bgColor.includes("orange-100")) cardBg = "#FFCC80";
          else if (item.bgColor.includes("purple-100")) cardBg = "#E1BEE7";
          else if (item.bgColor.includes("sky-100")) cardBg = "#B3E5FC";
          else if (item.bgColor.includes("amber-900")) cardBg = "#D7CCC8";

          // If item is Clean (Level 3 reveal), draw high glow!
          if (item.status === "clean") {
            cardBg = "#E8F5E9"; // Fresh sparkling green card
          }

          // 1. Draw Thick Black shadow/border
          ctx.fillStyle = "#111111";
          ctx.fillRect(-item.width / 2 + 4, -item.height / 2 + 4, item.width, item.height);

          // 2. Draw Front card face
          ctx.fillStyle = cardBg;
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 3.5;
          ctx.fillRect(-item.width / 2, -item.height / 2, item.width, item.height);
          ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);

          // 3. Draw Barcode Vertical Lines represent Hair Bangs!
          ctx.fillStyle = "#111111";
          const lineYStart = -item.height / 2 + 35;
          const lineH = item.height - 75;
          
          // Predefined structured barcode lines width
          const linePositions = [
            { offset: -22, w: 5 },
            { offset: -14, w: 2 },
            { offset: -9, w: 8 },
            { offset: 2, w: 1.5 },
            { offset: 6, w: 4 },
            { offset: 13, w: 6 },
            { offset: 21, w: 3 },
          ];

          linePositions.forEach(line => {
            ctx.fillRect(line.offset, lineYStart, line.w, lineH);
          });

          // Draw Scan helper line
          if (item.status === "active") {
            ctx.fillStyle = "rgba(244, 67, 54, 0.25)";
            ctx.fillRect(-item.width / 2 + 4, -5, item.width - 8, 3);
          }

          // 4. Draw Header/Metadata
          ctx.fillStyle = "#111111";
          ctx.font = "bold 9.5px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.codeName, 0, -item.height / 2 + 16);

          // Bottom numeric scanner layout
          ctx.fillStyle = "#666666";
          ctx.font = "500 8.5px monospace";
          ctx.fillText(`ID:09827-${item.codeId}`, 0, item.height / 2 - 24);

          // Small emoticon circle
          ctx.fillStyle = "#FFFFFF";
          ctx.strokeStyle = "#111111";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, item.height / 2 - 11, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#111111";
          ctx.font = "10px sans-serif";
          ctx.fillText(item.icon, 0, item.height / 2 - 8);

          // 5. Render Level 3 grease overlays
          if (currentLevel.key === "melt" && item.status === "active") {
            const oilOpacity = 1 - item.progress / 100;
            ctx.save();
            ctx.globalAlpha = oilOpacity;
            
            // Draw greasy sludge spot blobs
            ctx.fillStyle = "rgba(43, 31, 23, 0.9)"; // oily dark mud soot
            ctx.strokeStyle = "#111111";
            ctx.lineWidth = 1.5;

            item.oilSpots.forEach(spot => {
              ctx.beginPath();
              ctx.arc(
                spot.x - item.width / 2,
                spot.y - item.height / 2,
                spot.radius,
                0,
                Math.PI * 2
              );
              ctx.fill();
              ctx.stroke();

              // Shine reflection on oily drop
              ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
              ctx.beginPath();
              ctx.arc(
                spot.x - item.width / 2 - spot.radius * 0.3,
                spot.y - item.height / 2 - spot.radius * 0.3,
                spot.radius * 0.25,
                0,
                Math.PI * 2
              );
              ctx.fill();
            });

            ctx.restore();

            // Progress bar slider
            const barW = item.width - 20;
            const barY = -item.height / 2 - 10;
            ctx.fillStyle = "#111111";
            ctx.fillRect(-barW / 2, barY, barW, 6);

            ctx.fillStyle = "#E53935"; // greasy red
            if (item.progress > 40) ctx.fillStyle = "#FFB300"; // cleaning amber
            if (item.progress > 80) ctx.fillStyle = "#4CAF50"; // fresh green
            ctx.fillRect(-barW / 2 + 1, barY + 1, (barW - 2) * (item.progress / 100), 4);
          }

          // If item is cleanly revealing sparkles (sparkling frame)
          if (item.status === "clean") {
            ctx.strokeStyle = "#4CAF50";
            ctx.lineWidth = 4;
            ctx.strokeRect(-item.width / 2, -item.height / 2, item.width, item.height);
            
            // Draw shiny cute sparkles icon in corner
            ctx.fillStyle = "#FFC107";
            ctx.font = "14px sans-serif";
            ctx.fillText("✨", -item.width / 2 + 10, -item.height / 2 + 12);
            ctx.fillText("✨", item.width / 2 - 10, item.height / 2 - 10);
          }

          // Split visual in Level 1 (Cut) halves!
          if (item.status === "hit") {
            // Cut half rendering sequence (we can just draw double half shapes dispersing off)
            // But since the itemsRef gets split, we don't render standard, item already disappeared.
          }

          ctx.restore();
        }
      }

      // 3. COMBOS FLOATING LABELS
      const comboLabels = comboIndicatorsRef.current;
      for (let i = comboLabels.length - 1; i >= 0; i--) {
        const ind = comboLabels[i];
        ind.y -= 1.4; // float upwards
        ind.life -= 0.02;

        if (ind.life <= 0) {
          comboLabels.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ind.life;
        ctx.fillStyle = ind.color;
        ctx.shadowColor = "#111111";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.font = "Black 12px sans-serif";
        ctx.textAlign = "center";
        
        // Render text outline
        ctx.strokeStyle = "#111111";
        ctx.lineWidth = 3.5;
        ctx.strokeText(ind.text, ind.x, ind.y);
        ctx.fillText(ind.text, ind.x, ind.y);
        
        ctx.restore();
      }

      // 4. DRAW SLICING BLADE TRAIL (Level 1)
      if (currentLevel.key === "cut" && slashPointsRef.current.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = "#FFD93D"; // Glow Yellow Blade Trail
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const points = slashPointsRef.current;
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke();

        ctx.strokeStyle = "#FFFFFF"; // Inner core white glow
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();
      }

      // 5. DETECT AUTO-ADVANCE COMPLETED STAGE
      if (items.length > 0 && completedCount === items.length) {
        // Halt loop triggers during transition
        itemsRef.current = [];
        handleLevelCompletedTransition();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [dimensions, currentLevelIdx, showLevelIntro]);

  // Sliching decay tracker
  useEffect(() => {
    const checkDecay = setInterval(() => {
      const now = Date.now();
      // Throw away old blade points (older than 150ms) to ensure smooth fading trails
      slashPointsRef.current = slashPointsRef.current.filter(p => now - p.time < 180);
    }, 16);
    return () => clearInterval(checkDecay);
  }, []);

  const handleLevelCompletedTransition = () => {
    // End of level chimes
    audio.playWinFanfare();
    
    // Add nice completion banner labels
    addComboLabel(dimensions.width / 2, dimensions.height / 2, currentLevel.completeText, "#FFD93D");
    setComboCount(0); // clear combos between stages

    setTimeout(() => {
      if (currentLevel.nextLevel === "result") {
        onGameComplete({
          ...gameStats,
          endTime: Date.now(),
          combos: gameStats.maxCombo,
          maxCombo: gameStats.maxCombo
        });
      } else {
        // Increment Index
        setCurrentLevelIdx(prev => prev + 1);
        setShowLevelIntro(true);
      }
    }, 1200);
  };

  // TOUCH / MOUSE INTERACTION ROUTERS

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches[0].clientX - rect.left;
    const clientY = e.touches[0].clientY - rect.top;

    isMouseDownRef.current = true;
    mousePositionRef.current = { x: clientX, y: clientY };

    if (currentLevel.key === "cut") {
      slashPointsRef.current = [{ x: clientX, y: clientY, time: Date.now() }];
    } else if (currentLevel.key === "suck") {
      suctionActiveRef.current = true;
      audio.playSuction();
    } else if (currentLevel.key === "melt") {
      handleMeltClick(clientX, clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.touches[0].clientX - rect.left;
    const clientY = e.touches[0].clientY - rect.top;

    const prevX = mousePositionRef.current.x;
    const prevY = mousePositionRef.current.y;
    mousePositionRef.current = { x: clientX, y: clientY };

    if (currentLevel.key === "cut" && isMouseDownRef.current) {
      slashPointsRef.current.push({ x: clientX, y: clientY, time: Date.now() });
      handleCutSwipeCollision(prevX, prevY, clientX, clientY);
    }
  };

  const handleTouchEnd = () => {
    isMouseDownRef.current = false;
    suctionActiveRef.current = false;
  };

  // MOUSE CONTROLS

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    isMouseDownRef.current = true;
    mousePositionRef.current = { x: clientX, y: clientY };

    if (currentLevel.key === "cut") {
      slashPointsRef.current = [{ x: clientX, y: clientY, time: Date.now() }];
    } else if (currentLevel.key === "suck") {
      suctionActiveRef.current = true;
      audio.playSuction();
    } else if (currentLevel.key === "melt") {
      handleMeltClick(clientX, clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const prevX = mousePositionRef.current.x;
    const prevY = mousePositionRef.current.y;
    mousePositionRef.current = { x: clientX, y: clientY };

    if (currentLevel.key === "cut" && isMouseDownRef.current) {
      slashPointsRef.current.push({ x: clientX, y: clientY, time: Date.now() });
      handleCutSwipeCollision(prevX, prevY, clientX, clientY);
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    suctionActiveRef.current = false;
  };

  // ACTION INTERACTORS

  const handleCutSwipeCollision = (x1: number, y1: number, x2: number, y2: number) => {
    const items = itemsRef.current;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === "active") {
        const isSliced = checkSliceIntersection({ x: x1, y: y1 }, { x: x2, y: y2 }, item);
        
        if (isSliced) {
          item.status = "hit";
          audio.playSlice();

          // Increment Combos/Score
          const gainedCombos = comboCount + 1;
          setComboCount(gainedCombos);
          setMaxCombo(prev => Math.max(prev, gainedCombos));
          setGameStats(prev => ({
            ...prev,
            score: prev.score + 100 * gainedCombos,
            cutCount: prev.cutCount + 1,
          }));

          // Trigger particle splines
          const sliceCenterX = item.x + item.width / 2;
          const sliceCenterY = item.y + item.height / 2;
          spawnExplosionOfParticles(sliceCenterX, sliceCenterY, "#FFD93D", 15);
          
          addComboLabel(sliceCenterX, sliceCenterY - 10, `${item.codeName} 切除! +${100 * gainedCombos}`);
        }
      }
    }
  };

  const handleMeltClick = (cx: number, cy: number) => {
    const items = itemsRef.current;
    
    items.forEach(item => {
      if (item.status === "active") {
        if (
          cx >= item.x &&
          cx <= item.x + item.width &&
          cy >= item.y &&
          cy <= item.y + item.height
        ) {
          // Inside targeted card: Spray cleanser froth!
          audio.playBubble();
          spawnSoapBubbles(cx, cy, 6);

          // Work on oil spots: shrink closest spots
          let spotsCleanedFraction = 0;
          item.oilSpots.forEach(spot => {
            const sx = item.x + spot.x;
            const sy = item.y + spot.y;
            const dist = Math.sqrt((cx - sx) * (cx - sx) + (cy - sy) * (cy - sy));
            
            if (dist < 45) {
              spot.radius = Math.max(0, spot.radius - 4);
              spot.opacity = Math.max(0, spot.opacity - 0.25);
            }
            if (spot.radius <= 0 || spot.opacity <= 0) {
              spotsCleanedFraction += 1.0 / item.oilSpots.length;
            }
          });

          // Increase overall clean status progress
          item.progress = Math.min(100, item.progress + 25);
          item.scale = 1.06; // slight click pulse bounce
          setTimeout(() => {
            if (item) item.scale = 1.0;
          }, 80);
        }
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full bg-[#FFFDF7] flex flex-col relative overflow-hidden select-none"
    >
      {/* Top Floating Mini Status Panel */}
      <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
        
        {/* Level Box Badge */}
        <div className="bg-white border-2 border-black rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#111111]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFD93D] border border-black animate-pulse"></span>
          <span className="text-[10px] font-black tracking-wide">{currentLevel.title}</span>
        </div>

        {/* Score & Combo Stickers */}
        <div className="flex gap-1.5 items-center">
          <div className="bg-black text-[#FFD93D] rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,0.15)]">
            SCORE:{String(gameStats.score).padStart(6, "0")}
          </div>

          <AnimatePresence mode="popLayout">
            {comboCount > 0 && (
              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-red-500 text-white rounded-lg px-2 py-0.5 text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_#111111]"
              >
                {comboCount} 连击 🔥
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage Hint text banner at bottom margin of stage */}
      <div className="absolute bottom-28 left-4 right-4 z-20 pointer-events-none text-center">
        <span className="inline-block bg-[rgba(17,17,17,0.85)] text-white text-[10px] py-1 px-3 rounded-md leading-normal text-stone-300">
          {currentLevel.hint}
        </span>
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full flex-1 block cursor-crosshair"
      />

      {/* Stage Transition Slide Overlays */}
      <AnimatePresence>
        {showLevelIntro && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 18, stiffness: 120 }}
            className="absolute inset-0 z-40 bg-[#FFD93D] flex flex-col items-center justify-center p-6 border-b-8 border-black select-none"
          >
            {/* Retro comic burst decoration overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:20px_20px] opacity-25"></div>

            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.25, type: "spring" }}
              className="bg-white border-4 border-black p-6 rounded-3xl text-center shadow-[8px_8px_0px_0px_#111111] max-w-[280px]"
            >
              <div className="text-stone-500 font-bold text-xs tracking-wider uppercase mb-1">
                - 挑战关卡 0{currentLevel.id} -
              </div>
              <h2 className="text-2xl font-black text-[#111111] mb-2 leading-none">
                {currentLevel.title}
              </h2>
              <p className="text-xs text-stone-700 font-medium leading-relaxed mb-4">
                {currentLevel.subtitle}
              </p>

              <div className="bg-amber-100 border-2 border-[#111111] py-1.5 rounded-xl font-bold text-xs text-stone-800 flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-yellow-600 fill-current" />
                <span>立即进入洗护阶段...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Quit Button at very bottom panel of canvas view wrapper */}
      <div className="p-3 bg-white border-t-4 border-black flex items-center justify-between z-10 select-none">
        <button
          onClick={onExit}
          className="px-3.5 py-1.5 bg-[#FFFDF7] text-[11px] font-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_#111111] active:translate-y-0.5 active:shadow-[0px_0px_0px_0px_#111111] transition-all cursor-pointer"
        >
          返回大厅
        </button>

        <div className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5 mr-1 select-none">
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>全神贯注：不放过每一绺油脂！</span>
        </div>
      </div>
    </div>
  );
}
