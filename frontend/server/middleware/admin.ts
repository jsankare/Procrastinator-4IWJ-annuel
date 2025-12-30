// Server middleware placeholder: admin
//
// If you want server-side verification (validate JWT in cookies / headers and
// block SSR rendering for non-admins), replace the no-op handler below with
// actual validation logic that inspects cookies or Authorization headers.
//
// Note: This file is intentionally minimal and safe — it simply lets server
// requests proceed.

export default defineEventHandler((event) => {
  // No-op: allow the request to continue.
  return;
});
