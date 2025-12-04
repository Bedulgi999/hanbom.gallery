// config.js — Supabase 클라이언트 초기화 (공통)

const SUPABASE_CONFIG = {
    url: "https://glmytzfqxdtlhmzbcsgd.supabase.co",
    key: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbXl0emZxeGR0bGhtemJjc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0Mzc4MjIsImV4cCI6MjA4MDAxMzgyMn0.8f0rAcPMUvLtY5EM9HI9uNOOOs5SKGNdC7A3U29cjyo"
};

// Supabase 클라이언트 전역 생성 (중복 방지)
let supabase;

// Supabase 라이브러리가 로드될 때까지 대기
if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    supabase = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.key
    );
} else {
    console.error('Supabase 라이브러리가 로드되지 않았습니다.');
}
