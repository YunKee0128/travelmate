"use client";

type ImportScreenProps = {
  onBack: () => void;
};

const importSteps = [
  {
    title: "1. Google Maps에서 여행 리스트 생성",
    description: "가져오고 싶은 저장 장소를 여행별 리스트로 정리합니다.",
  },
  {
    title: "2. TravelMate로 가져오기",
    description: "나중에 Google 계정 연결 후 저장 장소를 불러올 예정입니다.",
  },
  {
    title: "3. 자동 분류",
    description: "맛집, 카페, 쇼핑, 관광지 같은 카테고리로 정리합니다.",
  },
];

export default function ImportScreen({ onBack }: ImportScreenProps) {
  return (
    <section className="pb-[var(--app-screen-bottom-space)]">
      <div className="mb-6">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 min-h-11 rounded-2xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-700"
        >
          ← 설정으로 돌아가기
        </button>
        <p className="text-sm font-semibold text-zinc-500">
          Google Maps 연동
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-normal text-black">
          저장 장소 가져오기 준비 중
        </h1>
        <p className="mt-2 text-sm leading-6 text-zinc-500">
          아직 Google API와 로그인은 연결하지 않았습니다. 지금은 나중에 붙일
          흐름만 정리해둔 화면입니다.
        </p>
      </div>

      <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-lg shadow-zinc-100">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-50 text-3xl">
          🗺️
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-normal text-black">
          향후 연동 흐름
        </h2>

        <div className="mt-5 space-y-4">
          {importSteps.map((step, index) => (
            <div key={step.title}>
              <div className="rounded-2xl bg-zinc-50 p-4">
                <p className="font-semibold text-black">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-500">
                  {step.description}
                </p>
              </div>
              {index < importSteps.length - 1 && (
                <div className="flex justify-center py-2 text-xl text-zinc-300">
                  ↓
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-dashed border-zinc-200 bg-zinc-50 p-5">
        <p className="text-sm font-semibold text-zinc-500">개발 TODO</p>
        <div className="mt-3 space-y-2 text-sm leading-6 text-zinc-600">
          <p>TODO: Google OAuth</p>
          <p>TODO: Saved Places Import</p>
          <p>TODO: 여행별 장소 자동 분류</p>
        </div>
      </div>
    </section>
  );
}
