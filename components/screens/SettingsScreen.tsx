"use client";

import { useState } from "react";
import ImportScreen from "@/components/screens/ImportScreen";
import { useTravelSettings } from "@/hooks/useTravelSettings";
import type { Travel, TravelStatus } from "@/types/travel";
import { formatTravelDateRange } from "@/utils/date";

function travelToForm(travel: Travel) {
  return {
    title: travel.title,
    country: travel.country,
    cities: travel.cities.join(", "),
    startDate: travel.startDate,
    endDate: travel.endDate,
    nights: String(travel.nights),
    days: String(travel.days),
  };
}

export default function SettingsScreen() {
  const { travel, setTravel } = useTravelSettings();
  const [form, setForm] = useState(() => travelToForm(travel));
  const [isEditing, setIsEditing] = useState(false);
  const [isImportScreenOpen, setIsImportScreenOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  function updateForm(field: keyof typeof form, value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function openEditForm() {
    setForm(travelToForm(travel));
    setIsEditing(true);
    setSavedMessage("");
  }

  function handleSave() {
    const nextTravel: Travel = {
      ...travel,
      title: form.title.trim() || travel.title,
      country: form.country.trim() || travel.country,
      cities: form.cities
        .split(",")
        .map((city) => city.trim())
        .filter(Boolean),
      startDate: form.startDate,
      endDate: form.endDate,
      nights: Number(form.nights) || 0,
      days: Number(form.days) || 0,
    };

    setTravel(nextTravel);
    setIsEditing(false);
    setSavedMessage("저장되었습니다.");
    window.setTimeout(() => setSavedMessage(""), 1800);
  }

  if (isImportScreenOpen) {
    return <ImportScreen onBack={() => setIsImportScreenOpen(false)} />;
  }

  return (
    <section className="pb-[var(--app-screen-bottom-space)]">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-normal">설정</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          여행 정보를 확인하고 필요할 때만 수정하세요.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-blue-50 text-3xl">
            {travel.coverEmoji ?? "✈️"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-zinc-500">현재 여행</p>
              <StatusBadge status={travel.status ?? "planning"} />
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-normal text-black">
              {travel.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              {travel.country} ·{" "}
              {formatTravelDateRange(travel.startDate, travel.endDate)}
            </p>
            <p className="mt-1 text-lg font-semibold text-black">
              {travel.nights}박 {travel.days}일
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {travel.cities.map((city) => (
            <span
              key={city}
              className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700"
            >
              {city}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={openEditForm}
          className="mt-5 h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          여행 정보 수정
        </button>

        {savedMessage && (
          <p className="mt-3 text-center text-sm font-medium text-zinc-500">
            {savedMessage}
          </p>
        )}
      </div>

      {isEditing && (
        <div className="mt-5 space-y-4 rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
          <SettingsField
            label="여행 제목"
            value={form.title}
            onChange={(value) => updateForm("title", value)}
          />
          <SettingsField
            label="국가"
            value={form.country}
            onChange={(value) => updateForm("country", value)}
          />
          <SettingsField
            label="도시 목록"
            value={form.cities}
            onChange={(value) => updateForm("cities", value)}
            placeholder="후쿠오카, 유후인"
          />
          <SettingsField
            label="시작일"
            type="date"
            value={form.startDate}
            onChange={(value) => updateForm("startDate", value)}
          />
          <SettingsField
            label="종료일"
            type="date"
            value={form.endDate}
            onChange={(value) => updateForm("endDate", value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <SettingsField
              label="몇 박"
              type="number"
              value={form.nights}
              onChange={(value) => updateForm("nights", value)}
            />
            <SettingsField
              label="며칠"
              type="number"
              value={form.days}
              onChange={(value) => updateForm("days", value)}
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="h-12 w-full rounded-2xl bg-black text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            저장
          </button>
        </div>
      )}

      <GoogleMapsImportCard onOpen={() => setIsImportScreenOpen(true)} />

      <AppUsageGuide />
    </section>
  );
}

function GoogleMapsImportCard({ onOpen }: { onOpen: () => void }) {
  return (
    <section className="mt-5 rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
          🗺️
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-zinc-500">
            Google Maps 연동 (준비 중)
          </p>
          <h2 className="mt-1 text-xl font-bold tracking-normal text-black">
            Google Maps 저장 장소 가져오기
          </h2>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <GuideItem text="Google Maps 저장 장소 가져오기" />
        <GuideItem text="여행별 장소 자동 분류" />
        <GuideItem text="TravelMate 추천 우선 사용" />
        <GuideItem text="현재는 준비 중" />
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-5 min-h-12 w-full rounded-2xl bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        연동 준비 화면 보기
      </button>
    </section>
  );
}

function AppUsageGuide() {
  return (
    <div className="mt-5 space-y-4">
      <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
            📱
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-500">앱 사용 안내</p>
            <h2 className="mt-1 text-xl font-bold tracking-normal text-black">
              iPhone에서 앱처럼 사용하기
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <GuideItem text="Safari에서 홈 화면에 추가하면 앱처럼 사용할 수 있어요." />
          <GuideItem text="내 주변 추천은 위치 권한을 허용해야 사용할 수 있어요." />
          <GuideItem text="저장한 정보는 현재 이 기기의 localStorage에 저장돼요." />
          <GuideItem text="브라우저 데이터를 삭제하면 저장 정보가 사라질 수 있어요." />
        </div>
      </section>

      <section className="rounded-3xl border border-zinc-100 bg-zinc-50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
            📍
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-500">
              위치 권한이 안 될 때
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-normal text-black">
              iPhone 설정을 확인하세요
            </h2>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          <GuideItem text="iPhone 설정 > Safari > 위치 접근을 확인하세요." />
          <GuideItem text="사이트 권한에서 TravelMate 위치 권한을 허용하세요." />
        </div>
      </section>
    </div>
  );
}

function GuideItem({ text }: { text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-zinc-600 ring-1 ring-zinc-100">
      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
      <p>{text}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: TravelStatus }) {
  const statusConfig: Record<
    TravelStatus,
    { label: string; className: string }
  > = {
    planning: {
      label: "Planning",
      className: "bg-zinc-100 text-zinc-600",
    },
    traveling: {
      label: "Traveling",
      className: "bg-blue-50 text-blue-700",
    },
    completed: {
      label: "Completed",
      className: "bg-emerald-50 text-emerald-700",
    },
  };
  const config = statusConfig[status];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-zinc-600">{label}</span>
      <input
        type={type}
        value={value}
        min={type === "number" ? 0 : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-black outline-none transition-colors placeholder:text-zinc-400 focus:border-black"
      />
    </label>
  );
}
