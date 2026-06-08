/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import PhoneMockup from "./components/PhoneMockup";
import HomeView from "./components/HomeView";
import GameCanvas from "./components/GameCanvas";
import ResultView from "./components/ResultView";
import { GameStats } from "./types";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "game" | "result">("home");
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    combos: 0,
    maxCombo: 0,
    cutCount: 0,
    suckCount: 0,
    meltCount: 0,
    startTime: Date.now(),
    endTime: Date.now()
  });

  const handleStartGame = () => {
    setCurrentView("game");
  };

  const handleGameComplete = (finalStats: GameStats) => {
    setStats(finalStats);
    setCurrentView("result");
  };

  const handleReturnToHome = () => {
    setCurrentView("home");
  };

  return (
    <PhoneMockup>
      {currentView === "home" && (
        <HomeView onStart={handleStartGame} />
      )}
      {currentView === "game" && (
        <GameCanvas 
          onGameComplete={handleGameComplete} 
          onExit={handleReturnToHome} 
        />
      )}
      {currentView === "result" && (
        <ResultView 
          stats={stats} 
          onRestart={handleStartGame} 
        />
      )}
    </PhoneMockup>
  );
}

