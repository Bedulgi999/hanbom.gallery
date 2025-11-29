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

// ⭐ 회원가입 API 추가
app.post("/register", (req, res) => {
    const { id, pw, name, major, grade, classNum, studentNum } = req.body;

    const sql = `
        INSERT INTO users (id, pw, name, major, grade, classNum, studentNum)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [id, pw, name, major, grade, classNum, studentNum], (err) => {
        if (err) {
            // 중복 아이디 처리
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ success: false, message: "이미 존재하는 아이디입니다." });
            }
            return res.status(500).json({ success: false, message: "DB 오류" });
        }
        res.json({ success: true });
    });
});

// 기존: 회원 목록 불러오기
app.get("/users", (req, res) => {
    const sort = req.query.sort || "id";
    const order = req.query.order || "ASC";

    db.query(`SELECT * FROM users ORDER BY ${sort} ${order}`, (err, rows) => {
        if (err) return res.status(500).send(err);
        res.json(rows);
    });
});

// 기존: 회원 삭제
app.delete("/users/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("🔥 MySQL API 서버 실행됨 : 3000번"));
