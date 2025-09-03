"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
var posts = [];
var idCounter = 1;
function handler(req, res) {
    if (req.method === "GET") {
        return res.status(200).json(posts);
    }
    if (req.method === "POST") {
        var _a = req.body, title = _a.title, content = _a.content, lat = _a.lat, lng = _a.lng;
        if (!title || !content) {
            return res.status(400).json({ error: "titleとcontentが必要です" });
        }
        var newPost = { id: idCounter++, title: title, content: content, lat: lat, lng: lng };
        posts.push(newPost);
        return res.status(201).json(newPost);
    }
    return res.status(405).json({ error: "Method not allowed" });
}
