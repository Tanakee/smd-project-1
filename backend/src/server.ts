import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(cors());

// ダミーデータ（メモリ上で管理）
let posts = [
  {
    id: '1',
    location: '大濠公園',
    lat: 33.589, 
    lng: 130.366,
    feeling: '心が洗われる景色！'
  },
  {
    id: '2',
    location: '天神地下街',
    lat: 33.590,
    lng: 130.401,
    feeling: '雨の日でも楽しめるカフェ発見！'
  }
];

// ホーム画面用
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({ message: 'GeoLogへようこそ！' });
});

// 投稿一覧取得
app.get('/api/posts', (req: Request, res: Response) => {
  res.json(posts);
});

// 投稿を追加
app.post('/api/posts', (req: Request, res: Response) => {
  const { location, lat, lng, feeling, tag, color } = req.body;
  
  if (!location || !lat || !lng || !feeling) {
    return res.status(400).json({ error: '必要な情報が不足しています。' });
  }

  const newPost = {
    id: (posts.length + 1).toString(),
    location,
    lat,
    lng,
    feeling,
    tag: tag || '',
    color: color || '#2196F3'
  };

  posts.push(newPost);
  res.status(201).json(newPost);
});

app.listen(PORT, HOST, () => {
  console.log(`✅ Server running on http://${HOST}:${PORT}`);
});
