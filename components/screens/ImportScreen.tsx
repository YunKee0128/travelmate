"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  useImportedPlaces,
  type ImportedPlaceDetailsUpdate,
  type SaveImportedPlacesResult,
} from "@/hooks/useImportedPlaces";
import { parseGoogleMapsPlacesWithReport } from "@/lib/googleMapsImport";
import type { Place, PlaceCategory } from "@/types/place";

type ImportScreenProps = {
  onBack: () => void;
};

type EditablePlaceDetails = {
  description: string;
  memo: string;
  priceRange: string;
  openingHours: string;
  phone: string;
  website: string;
  reservationRequired: boolean;
  reservationUrl: string;
  averageStayTime: string;
  recommendedTime: string;
};

const exampleJson = JSON.stringify(
  [
    {
      name: "이치란 본점",
      address: "일본 후쿠오카",
      latitude: 33.591,
      longitude: 130.401,
      note: "라멘 맛집",
    },
  ],
  null,
  2,
);

const importFlowSteps = [
  "Google Maps 또는 Google Takeout에서 장소 데이터 준비",
  "JSON 파일 업로드 또는 붙여넣기",
  "미리보기 확인",
  "가져온 장소 저장",
  "카테고리와 상세정보 수정",
];

const categoryOptions: Array<{ value: PlaceCategory; label: string }> = [
  { value: "food", label: "맛집" },
  { value: "cafe", label: "카페" },
  { value: "shopping", label: "쇼핑" },
  { value: "sightseeing", label: "관광" },
  { value: "convenience", label: "편의" },
];

const detailTextFields: Array<{
  key: Exclude<keyof EditablePlaceDetails, "reservationRequired">;
  label: string;
  placeholder: string;
  multiline?: boolean;
}> = [
  {
    key: "description",
    label: "설명",
    placeholder: "장소를 한두 문장으로 설명해 주세요.",
    multiline: true,
  },
  {
    key: "memo",
    label: "메모",
    placeholder: "개인 메모나 방문 팁",
    multiline: true,
  },
  { key: "priceRange", label: "가격대", placeholder: "예: 1,000엔~2,000엔" },
  { key: "openingHours", label: "영업시간", placeholder: "예: 10:00~21:00" },
  { key: "phone", label: "전화번호", placeholder: "예: +81-92-000-0000" },
  { key: "website", label: "웹사이트", placeholder: "https://example.com" },
  { key: "reservationUrl", label: "예약 URL", placeholder: "https://example.com/reserve" },
  { key: "averageStayTime", label: "평균 체류 시간", placeholder: "예: 1~2시간" },
  { key: "recommendedTime", label: "추천 시간", placeholder: "예: 오전, 저녁" },
];

function getCategoryLabel(category: PlaceCategory) {
  return (
    categoryOptions.find((option) => option.value === category)?.label ??
    category
  );
}

function createEditablePlaceDetails(place: Place): EditablePlaceDetails {
  return {
    description: place.description ?? "",
    memo: place.memo,
    priceRange: place.priceRange ?? "",
    openingHours: place.openingHours ?? "",
    phone: place.phone ?? "",
    website: place.website ?? "",
    reservationRequired: place.reservationRequired ?? false,
    reservationUrl: place.reservationUrl ?? "",
    averageStayTime: place.averageStayTime ?? "",
    recommendedTime: place.recommendedTime ?? "",
  };
}

function toImportedPlaceDetailsUpdate(
  details: EditablePlaceDetails,
): ImportedPlaceDetailsUpdate {
  return {
    description: details.description.trim() || undefined,
    memo: details.memo.trim(),
    priceRange: details.priceRange.trim() || undefined,
    openingHours: details.openingHours.trim() || undefined,
    phone: details.phone.trim() || undefined,
    website: details.website.trim() || undefined,
    reservationRequired: details.reservationRequired,
    reservationUrl: details.reservationUrl.trim() || undefined,
    averageStayTime: details.averageStayTime.trim() || undefined,
    recommendedTime: details.recommendedTime.trim() || undefined,
  };
}

export default function ImportScreen({ onBack }: ImportScreenProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [selectedJsonFileName, setSelectedJsonFileName] = useState("");
  const [previewPlaces, setPreviewPlaces] = useState<Place[]>([]);
  const [message, setMessage] = useState("");
  const [saveResult, setSaveResult] =
    useState<SaveImportedPlacesResult | null>(null);
  const [editingDetailsPlaceId, setEditingDetailsPlaceId] = useState<
    string | null
  >(null);
  const [editingDetails, setEditingDetails] =
    useState<EditablePlaceDetails | null>(null);
  const {
    clearImportedPlaces,
    importedPlaces,
    saveImportedPlaces,
    updateImportedPlaceCategory,
    updateImportedPlaceDetails,
  } = useImportedPlaces();

  const handleJsonInputChange = (value: string) => {
    setJsonInput(value);
    setSaveResult(null);
  };

  const handleUseExampleJson = () => {
    setJsonInput(exampleJson);
    setSelectedJsonFileName("");
    setPreviewPlaces([]);
    setSaveResult(null);
    setMessage("예시 JSON을 입력했습니다. 가져오기 미리보기를 눌러 확인해 주세요.");
  };

  const handleJsonFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".json")) {
      setSelectedJsonFileName("");
      setPreviewPlaces([]);
      setSaveResult(null);
      setMessage(".json 파일만 업로드할 수 있습니다. JSON 파일을 다시 선택해 주세요.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setSelectedJsonFileName("");
        setPreviewPlaces([]);
        setSaveResult(null);
        setMessage("파일 내용을 읽지 못했습니다. JSON 텍스트가 들어 있는 파일인지 확인해 주세요.");
        return;
      }

      setJsonInput(reader.result);
      setSelectedJsonFileName(file.name);
      setPreviewPlaces([]);
      setSaveResult(null);
      setMessage("JSON 파일을 읽었습니다. 가져오기 미리보기를 실행해 주세요.");
    };

    reader.onerror = () => {
      setSelectedJsonFileName("");
      setPreviewPlaces([]);
      setSaveResult(null);
      setMessage("JSON 파일 읽기에 실패했습니다. 파일을 다시 선택하거나 내용을 직접 붙여넣어 주세요.");
    };

    reader.readAsText(file);
  };

  const handlePreviewImport = () => {
    try {
      const result = parseGoogleMapsPlacesWithReport(jsonInput);
      setPreviewPlaces(result.places);
      setSaveResult(null);

      if (!jsonInput.trim()) {
        setMessage("먼저 JSON 파일을 업로드하거나 textarea에 JSON을 붙여넣어 주세요.");
        return;
      }

      if (result.candidateCount === 0) {
        setMessage(
          "장소 배열을 찾지 못했습니다. 예시처럼 [{ name, latitude, longitude }] 형태이거나 places/items 배열을 가진 JSON인지 확인해 주세요.",
        );
        return;
      }

      if (result.places.length === 0) {
        setMessage(
          `총 ${result.candidateCount}개 항목을 읽었지만 좌표가 없어 모두 제외되었습니다. latitude/longitude 또는 lat/lng 값을 넣어 주세요.`,
        );
        return;
      }

      const excludedMessage =
        result.excludedWithoutCoordinatesCount > 0
          ? ` 좌표가 없는 ${result.excludedWithoutCoordinatesCount}개 항목은 제외했습니다.`
          : "";

      setMessage(
        `${result.places.length}개 장소를 미리보기로 변환했습니다.${excludedMessage}`,
      );
    } catch {
      setPreviewPlaces([]);
      setSaveResult(null);
      setMessage(
        "JSON 파싱에 실패했습니다. 쉼표, 따옴표, 대괄호가 올바른지 확인하거나 예시 JSON을 넣어 형식을 비교해 주세요.",
      );
    }
  };

  const handleSaveImportedPlaces = () => {
    const result = saveImportedPlaces(previewPlaces);

    setSaveResult(result);
    setMessage("가져온 장소 저장 결과를 확인해 주세요.");
  };

  const handleClearImportedPlaces = () => {
    clearImportedPlaces();
    setPreviewPlaces([]);
    setSaveResult(null);
    setEditingDetailsPlaceId(null);
    setEditingDetails(null);
    setMessage("가져온 장소를 삭제했습니다.");
  };

  const handleCategoryChange = (placeId: string, category: PlaceCategory) => {
    updateImportedPlaceCategory(placeId, category);
    setMessage("카테고리를 변경했습니다.");
  };

  const handleOpenDetailsEditor = (place: Place) => {
    if (editingDetailsPlaceId === place.id) {
      setEditingDetailsPlaceId(null);
      setEditingDetails(null);
      return;
    }

    setEditingDetailsPlaceId(place.id);
    setEditingDetails(createEditablePlaceDetails(place));
  };

  const handleDetailsFieldChange = <Field extends keyof EditablePlaceDetails>(
    field: Field,
    value: EditablePlaceDetails[Field],
  ) => {
    setEditingDetails((currentDetails) =>
      currentDetails ? { ...currentDetails, [field]: value } : currentDetails,
    );
  };

  const handleSavePlaceDetails = (placeId: string) => {
    if (!editingDetails) {
      return;
    }

    updateImportedPlaceDetails(
      placeId,
      toImportedPlaceDetailsUpdate(editingDetails),
    );
    setEditingDetailsPlaceId(null);
    setEditingDetails(null);
    setMessage("상세 정보를 저장했습니다.");
  };

  return (
    <section className="space-y-4 pb-[var(--app-screen-bottom-space)]">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="mb-4 min-h-11 rounded-2xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-700"
        >
          설정으로 돌아가기
        </button>
        <h1 className="text-2xl font-bold tracking-normal text-black">
          Google Maps 장소 가져오기
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          OAuth나 외부 API 없이 브라우저에서 JSON 파일을 읽거나 붙여넣어 TravelMate 장소로 저장합니다.
        </p>
      </div>

      <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
        <p className="text-sm font-semibold text-blue-600">테스트 흐름</p>
        <h2 className="mt-2 text-lg font-bold tracking-normal text-black">
          Google Maps 장소 가져오기
        </h2>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-zinc-600">
          {importFlowSteps.map((step, index) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-700">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-normal text-black">
              JSON 입력
            </h2>
            <p className="mt-1 text-sm leading-6 text-zinc-500">
              name/title과 latitude/longitude 또는 lat/lng가 있으면 가져올 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleUseExampleJson}
            className="shrink-0 rounded-2xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
          >
            예시 JSON 넣기
          </button>
        </div>

        <details className="mt-4 rounded-2xl bg-zinc-50 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-zinc-700">
            테스트용 예시 JSON 보기
          </summary>
          <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-white p-3 text-xs leading-5 text-zinc-700 ring-1 ring-zinc-100">
            {exampleJson}
          </pre>
        </details>

        <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-4">
          <label
            htmlFor="google-maps-json-file"
            className="block text-sm font-semibold text-zinc-700"
          >
            JSON 파일 업로드
          </label>
          <input
            id="google-maps-json-file"
            type="file"
            accept=".json,application/json"
            onChange={handleJsonFileChange}
            className="mt-3 w-full text-sm text-zinc-600 file:mr-3 file:min-h-10 file:rounded-xl file:border-0 file:bg-white file:px-4 file:text-sm file:font-semibold file:text-zinc-700"
          />
          {selectedJsonFileName && (
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              선택한 파일: {selectedJsonFileName}
            </p>
          )}
        </div>

        <label htmlFor="google-maps-json" className="mt-4 block">
          <span className="text-sm font-semibold text-zinc-700">
            JSON 붙여넣기
          </span>
          <textarea
            id="google-maps-json"
            value={jsonInput}
            onChange={(event) => handleJsonInputChange(event.target.value)}
            placeholder={exampleJson}
            className="mt-2 min-h-52 w-full resize-y rounded-2xl border border-zinc-200 bg-zinc-50 p-4 font-mono text-sm leading-6 text-zinc-800 outline-none focus:border-blue-300 focus:bg-white"
          />
        </label>

        <button
          type="button"
          onClick={handlePreviewImport}
          className="mt-4 min-h-12 w-full rounded-2xl bg-black px-4 text-sm font-semibold text-white"
        >
          가져오기 미리보기
        </button>

        {message && (
          <p className="mt-3 rounded-2xl bg-zinc-50 p-3 text-sm leading-6 text-zinc-600">
            {message}
          </p>
        )}

        {saveResult && (
          <div className="mt-3 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">
            <p>새 장소 {saveResult.addedCount}개 추가</p>
            <p>중복 {saveResult.duplicateCount}개 제외</p>
            <p>총 {saveResult.totalCount}개 저장됨</p>
          </div>
        )}

        {importedPlaces.length > 0 && (
          <p className="mt-3 text-sm leading-6 text-zinc-500">
            저장된 가져오기 장소: {importedPlaces.length}개
          </p>
        )}
      </section>

      {previewPlaces.length > 0 && (
        <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
          <h2 className="text-lg font-bold tracking-normal text-black">
            가져오기 미리보기
          </h2>
          <div className="mt-4 max-h-80 space-y-3 overflow-auto pr-1">
            {previewPlaces.map((place) => (
              <div
                key={place.id}
                className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
              >
                <p className="font-semibold text-black">{place.name}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  좌표: {place.latitude}, {place.longitude}
                </p>
                <p className="text-sm leading-6 text-zinc-600">
                  source: {place.source}
                </p>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleSaveImportedPlaces}
            className="mt-4 min-h-12 w-full rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white"
          >
            가져온 장소 저장
          </button>
        </section>
      )}

      {importedPlaces.length > 0 && (
        <section className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
          <h2 className="text-lg font-bold tracking-normal text-black">
            저장된 가져온 장소
          </h2>
          <p className="mt-1 text-sm leading-6 text-zinc-500">
            카테고리와 상세정보를 바꾸면 장소 목록, 내 주변, 홈 추천과 상세 모달에 바로 반영됩니다.
          </p>

          <div className="mt-4 space-y-3">
            {importedPlaces.map((place) => {
              const isEditingDetails = editingDetailsPlaceId === place.id;

              return (
                <div
                  key={place.id}
                  className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-black">{place.name}</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">
                        현재 카테고리: {getCategoryLabel(place.category)}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-600">
                      {place.source}
                    </span>
                  </div>

                  <label className="mt-3 block">
                    <span className="text-sm font-semibold text-zinc-700">
                      카테고리
                    </span>
                    <select
                      value={place.category}
                      onChange={(event) =>
                        handleCategoryChange(
                          place.id,
                          event.target.value as PlaceCategory,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-700 outline-none focus:border-blue-300"
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleOpenDetailsEditor(place)}
                    className="mt-3 min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700"
                  >
                    {isEditingDetails ? "상세 정보 닫기" : "상세 정보 수정"}
                  </button>

                  {isEditingDetails && editingDetails && (
                    <div className="mt-4 space-y-3 rounded-2xl bg-white p-4 ring-1 ring-zinc-100">
                      {detailTextFields.map((field) => (
                        <label key={field.key} className="block">
                          <span className="text-sm font-semibold text-zinc-700">
                            {field.label}
                          </span>
                          {field.multiline ? (
                            <textarea
                              value={editingDetails[field.key]}
                              onChange={(event) =>
                                handleDetailsFieldChange(
                                  field.key,
                                  event.target.value,
                                )
                              }
                              placeholder={field.placeholder}
                              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm leading-6 text-zinc-800 outline-none focus:border-blue-300 focus:bg-white"
                            />
                          ) : (
                            <input
                              type="text"
                              value={editingDetails[field.key]}
                              onChange={(event) =>
                                handleDetailsFieldChange(
                                  field.key,
                                  event.target.value,
                                )
                              }
                              placeholder={field.placeholder}
                              className="mt-2 h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-800 outline-none focus:border-blue-300 focus:bg-white"
                            />
                          )}
                        </label>
                      ))}

                      <label className="flex items-center gap-3 rounded-xl bg-zinc-50 px-3 py-3 text-sm font-semibold text-zinc-700">
                        <input
                          type="checkbox"
                          checked={editingDetails.reservationRequired}
                          onChange={(event) =>
                            handleDetailsFieldChange(
                              "reservationRequired",
                              event.target.checked,
                            )
                          }
                          className="h-4 w-4"
                        />
                        예약 권장
                      </label>

                      <button
                        type="button"
                        onClick={() => handleSavePlaceDetails(place.id)}
                        className="min-h-11 w-full rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white"
                      >
                        상세 정보 저장
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-500">아직 하지 않는 일</p>
        <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
          <p>Google OAuth 연결</p>
          <p>Google Places API 호출</p>
          <p>AI 자동 분류</p>
          <p>data/places.ts 자동 저장</p>
        </div>
        <button
          type="button"
          onClick={handleClearImportedPlaces}
          disabled={importedPlaces.length === 0}
          className="mt-4 min-h-11 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:text-zinc-400"
        >
          가져온 장소 삭제
        </button>
      </section>
    </section>
  );
}