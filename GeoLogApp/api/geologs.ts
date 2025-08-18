import type { VercelRequest, VercelResponse } from '@vercel/node';

// 仮のGeoLogデータ
const dummyGeoLogs = [
  {
    id: "m1",
    location: "福岡タワー",
    feeling: "絶景に感動！",
    tag: "#絶景",
    latitude: 33.5935,
    longitude: 130.3508,
    color: "#2196F3",
  },
  {
    id: "m2",
    location: "キャナルシティ",
    feeling: "ショッピング楽しい！",
    tag: "#楽しい",
    latitude: 33.5904,
    longitude: 130.4026,
    color: "#FFC107",
  },
  // ...他のデータ
];

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method === 'GET') {
    response.status(200).json(dummyGeoLogs);
  } else {
    response.status(405).send('Method Not Allowed');
  }
}