export interface LevelConfig {
  id: number;
  key: "cut" | "suck" | "melt";
  title: string;
  subtitle: string;
  actionText: string;
  statusText: string;
  completeText: string;
  nextLevel: "suck" | "melt" | "result";
  hint: string;
}

export interface BarcodeDefinition {
  id: number;
  name: string;
  icon: string;
  bgColor: string;
  description: string;
}

export interface GameItem {
  id: string;
  codeId: number;
  codeName: string;
  icon: string;
  bgColor: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number; // in degrees
  speedX: number;
  speedY: number;
  status: "active" | "hit" | "sucked" | "melted" | "clean";
  progress: number; // for dissolving grease, 0 to 100
  comboText?: string;
  scale?: number; // for animations
  oilSpots: { x: number; y: number; radius: number; opacity: number }[];
}

export interface GameStats {
  score: number;
  combos: number;
  maxCombo: number;
  cutCount: number;
  suckCount: number;
  meltCount: number;
  startTime: number;
  endTime: number;
}
