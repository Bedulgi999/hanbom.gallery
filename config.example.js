// config.example.js — Supabase 설정 예시 파일
// 실제 사용 시 이 파일을 config.js로 복사하고 실제 값을 입력하세요

const SUPABASE_CONFIG = {
    url: "YOUR_SUPABASE_URL",
    key: "YOUR_SUPABASE_ANON_KEY"
};

// Supabase 클라이언트 전역 생성
const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url,
    SUPABASE_CONFIG.key
);
