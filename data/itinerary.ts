import type { Itinerary } from "@/types/itinerary";

export const sampleItinerary: Itinerary = {
  id: "fukuoka-3n4d-sample",
  title: "후쿠오카 3박 4일 예시 일정",
  city: "후쿠오카",
  days: [
    {
      id: "fukuoka-day-1",
      dayNumber: 1,
      title: "하카타 도착과 나카스 밤 산책",
      places: [
        {
          id: "day-1-hakata-arrival",
          name: "하카타역 도착",
          memo: "숙소 체크인 전 교통패스와 간단한 간식 준비",
          timeLabel: "오후",
        },
        {
          id: "day-1-familymart",
          placeId: "hakata-station-familymart",
          name: "하카타역 패밀리마트",
          memo: "물, 간식, 다음 날 아침용 간단한 먹거리 구매",
          timeLabel: "오후",
        },
        {
          id: "day-1-yatai",
          placeId: "yatai-nakasu-dori",
          name: "나카스 야타이 거리",
          memo: "후쿠오카 첫날 저녁 분위기 즐기기",
          timeLabel: "저녁",
        },
      ],
    },
    {
      id: "fukuoka-day-2",
      dayNumber: 2,
      title: "텐진 쇼핑과 하카타 맛집",
      places: [
        {
          id: "day-2-coffee",
          placeId: "tenjin-coffee-stand",
          name: "텐진 커피 스탠드",
          memo: "쇼핑 전에 커피 마시며 동선 정리",
          timeLabel: "오전",
        },
        {
          id: "day-2-underground-mall",
          placeId: "tenjin-underground-mall",
          name: "텐진 지하상가",
          memo: "기념품과 잡화 둘러보기",
          timeLabel: "오후",
        },
        {
          id: "day-2-canal-city",
          placeId: "canal-city-hakata",
          name: "캐널시티 하카타",
          memo: "저녁 식사 전 쇼핑몰 구경",
          timeLabel: "저녁",
        },
      ],
    },
    {
      id: "fukuoka-day-3",
      dayNumber: 3,
      title: "공원, 신사, 해변 느긋한 하루",
      places: [
        {
          id: "day-3-ohori",
          placeId: "ohori-park",
          name: "오호리 공원",
          memo: "아침 산책과 사진 찍기",
          timeLabel: "오전",
        },
        {
          id: "day-3-kushida",
          placeId: "kushida-shrine",
          name: "구시다 신사",
          memo: "하카타 지역 산책 중 들르기",
          timeLabel: "오후",
        },
        {
          id: "day-3-momochi",
          placeId: "momochi-seaside-park",
          name: "모모치 해변공원",
          memo: "해변에서 노을 보기",
          timeLabel: "저녁",
        },
      ],
    },
    {
      id: "fukuoka-day-4",
      dayNumber: 4,
      title: "마지막 카페와 출국 준비",
      places: [
        {
          id: "day-4-dessert",
          placeId: "daimyo-dessert-cafe",
          name: "다이묘 디저트 카페",
          memo: "공항 가기 전 마지막 카페 시간",
          timeLabel: "오전",
        },
        {
          id: "day-4-ramen",
          placeId: "fukuoka-ramen-nakasu",
          name: "나카스 하카타 라멘",
          memo: "가능하면 마지막 식사 후보",
          timeLabel: "점심",
        },
        {
          id: "day-4-airport",
          name: "후쿠오카 공항 이동",
          memo: "출국 시간에 맞춰 여유 있게 이동",
          timeLabel: "오후",
        },
      ],
    },
  ],
};
