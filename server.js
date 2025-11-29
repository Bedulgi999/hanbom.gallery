import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "hanbom_gallery"
});

// 회원 목록 불러오기
app.get("/users", (req, res) => {
    const sort = req.query.sort || "id";
    const order = req.query.order || "ASC";

    const query = `SELECT * FROM users ORDER BY ${sort} ${order}`;
    db.query(query, (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// 회원 삭제
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;

    const sql = "DELETE FROM users WHERE id = ?";
    db.query(sql, [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("🔥 MySQL API 서버 실행됨 : 3000번"));
