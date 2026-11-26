
import express from "express";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Todoアプリが起動しました！！");
});

// Todo一覧を取得
app.get("/api/todos", async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(todos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Todoの取得に失敗しました" });
  }
});

// Todoを登録
app.post("/api/todos", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Todoの内容を入力してください",
      });
    }

    const todo = await prisma.todo.create({
      data: {
        title: title.trim(),
      },
    });

    res.status(201).json(todo);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Todoの登録に失敗しました",
    });
  }
});

// Todoを更新
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    const data = {};

    if (typeof title === "string") {
      data.title = title.trim();
    }

    if (typeof completed === "boolean") {
      data.completed = completed;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        message: "更新する内容を指定してください",
      });
    }

    const todo = await prisma.todo.update({
      where: { id },
      data,
    });

    res.json(todo);
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Todoが見つかりません",
      });
    }

    res.status(500).json({
      message: "Todoの更新に失敗しました",
    });
  }
});

// Todoを削除
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.todo.delete({
      where: { id },
    });

    res.json({
      message: "Todoを削除しました",
    });
  } catch (error) {
    console.error(error);

    if (error.code === "P2025") {
      return res.status(404).json({
        message: "Todoが見つかりません",
      });
    }

    res.status(500).json({
      message: "Todoの削除に失敗しました",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
