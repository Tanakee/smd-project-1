"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const PORT = 3000;
const HOST = '0.0.0.0';
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// ホーム画面用の簡単なメッセージ
app.get('/api/hello', (req, res) => {
    res.json({ message: 'GeoLogへようこそ！' });
});
// マップ画面用の投稿データ（サンプル）
app.get('/api/posts', (req, res) => {
    res.json([
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
    ]);
});
app.listen(PORT, () => {
    console.log(`✅ Server running on http://192.168.2.181:${PORT}`);
});
