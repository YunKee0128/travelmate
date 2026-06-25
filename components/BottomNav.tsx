"use client";

export type TabId =
  | "home"
  | "nearby"
  | "places"
  | "itinerary"
  | "map"
  | "japanese"
  | "settings";

type BottomNavProps = {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
};

const tabs: { id: TabId; label: string }[] = [
  { id: "home", label: "홈" },
  { id: "nearby", label: "📍 내 주변" },
  { id: "places", label: "장소" },
  { id: "itinerary", label: "일정" },
  { id: "map", label: "지도" },
  { id: "japanese", label: "일본어" },
  { id: "settings", label: "설정" },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-200 bg-white/95 pb-[var(--app-safe-bottom)] backdrop-blur">
      <div className="mx-auto grid h-[var(--app-bottom-nav-height)] max-w-md grid-cols-7 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`min-h-11 px-0.5 text-[10px] font-medium transition-colors sm:text-xs ${
                isActive ? "text-black" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
