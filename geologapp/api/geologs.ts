import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { Pool } from '@vercel/postgres'; // Vercel Postgres用

const SECRET_KEY = 'your-secret-key';
const pool = new Pool(); // Vercelの環境変数を自動で読み込みます

// 投稿データの型定義
interface GeoLog {
  userId: string;
  feelingText: string; // 非公開の日記内容
  feelingTag: string;
  color: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  try {
    if (request.method === 'POST') {
      // POSTリクエスト (日記投稿)
      const token = request.headers.authorization?.split(' ')[1];
      if (!token) {
        return response.status(401).send('Unauthorized');
      }
      const decoded = jwt.verify(token, SECRET_KEY) as { id: string };
      const { feelingText, feelingTag, color, latitude, longitude } = request.body;
      const newGeoLog: GeoLog = {
        userId: decoded.id,
        feelingText,
        feelingTag,
        color,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      };
      
      await pool.query(
        'INSERT INTO geologs (userId, feelingText, feelingTag, color, latitude, longitude, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [newGeoLog.userId, newGeoLog.feelingText, newGeoLog.feelingTag, newGeoLog.color, newGeoLog.latitude, newGeoLog.longitude, newGeoLog.timestamp]
      );

      return response.status(201).json(newGeoLog);
    } else if (request.method === 'GET') {
      // GETリクエスト (ヒートマップ用データ取得)
      const { latitude, longitude, radius } = request.query;
      // クエリパラメータを数値に変換
      const latNum = Number(latitude);
      const lonNum = Number(longitude);
      const radNum = Number(radius);
      // ダミーのヒートマップデータを返します（実装の方向性を示すための例です）
      const heatMapData = await pool.query(
        'SELECT feelingTag, color, latitude, longitude FROM geologs WHERE latitude > $1 AND latitude < $2 AND longitude > $3 AND longitude < $4',
        [latNum - radNum, latNum + radNum, lonNum - radNum, lonNum + radNum]
      );
      
      return response.status(200).json(heatMapData.rows);
    } else {
      return response.status(405).send('Method Not Allowed');
    }
  } catch (error) {
    console.error(error);
    return response.status(500).send('Internal Server Error');
  }
}