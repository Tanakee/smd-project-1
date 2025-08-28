import { Request, Response } from "express";

let posts: { id: number; title: string; content: string; lat?: number; lng?: number }[] = [];
let idCounter = 1;

export default function handler(req: Request, res: Response) {
  if (req.method === "GET") {
    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    const { title, content, lat, lng } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "titleとcontentが必要です" });
    }
    const newPost = { id: idCounter++, title, content, lat, lng };
    posts.push(newPost);
    return res.status(201).json(newPost);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
