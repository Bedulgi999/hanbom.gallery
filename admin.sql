CREATE DATABASE IF NOT EXISTS hanbom_gallery
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE hanbom_gallery;

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    pw VARCHAR(255) NOT NULL,
    name VARCHAR(50),
    major VARCHAR(50),
    grade INT,
    classNum INT,
    studentNum INT,
    visits INT DEFAULT 0,
    role ENUM('user','admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, pw, name, role)
VALUES ('hanbom', 'hb0330', '한봄고등학교', 'admin');
