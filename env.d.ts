// D1 바인딩 타입 선언. wrangler.json은 빌드 시점에 vite.config.ts가 만들어내므로,
// 여기서는 `cloudflare:workers`의 전역 Env 인터페이스에 실제 바인딩 이름만 알려준다.
declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
  }
}
