"use client";

import { useState } from "react";
import BottomNav, { type TabId } from "@/components/BottomNav";
import HomeScreen from "@/components/screens/HomeScreen";
import ItineraryScreen from "@/components/screens/ItineraryScreen";
import JapaneseScreen from "@/components/screens/JapaneseScreen";
import MapScreen from "@/components/screens/MapScreen";
import NearbyScreen from "@/components/screens/NearbyScreen";
import PlacesScreen from "@/components/screens/PlacesScreen";
import SettingsScreen from "@/components/screens/SettingsScreen";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="min-h-dvh bg-white px-4 pb-[var(--app-page-bottom-space)] pt-[calc(var(--app-safe-top)+2rem)] text-black sm:px-6 sm:pt-[calc(var(--app-safe-top)+3rem)]">
      <main className="mx-auto min-h-[calc(100dvh-var(--app-page-bottom-space)-3rem)] w-full max-w-sm">
        {activeTab === "home" && <HomeScreen />}
        {activeTab === "nearby" && <NearbyScreen />}
        {activeTab === "places" && <PlacesScreen />}
        {activeTab === "itinerary" && <ItineraryScreen />}
        {activeTab === "map" && <MapScreen />}
        {activeTab === "japanese" && <JapaneseScreen />}
        {activeTab === "settings" && <SettingsScreen />}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
