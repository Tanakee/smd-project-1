import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';

const SECRET_KEY = 'your-secret-key'; // 本番環境では環境変数に設定してください

// ダミーのユーザー
const users = [{ id: 'user1', username: 'testuser', password: 'password' }];

export default function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== 'POST') {
    return response.status(405).send('Method Not Allowed');
  }

  const { username, password } = request.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    response.status(200).json({ token });
  } else {
    response.status(401).send('Invalid credentials');
  }
}