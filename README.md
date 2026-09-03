# SoS Lab 출근 시간표

- `index.html` — 학생용(공개). 시간표 칠하기·저장.
- `admin.html` — 관리자용. Supabase Auth 로그인(admins 테이블 등록 이메일)으로 일정·구성원·학생 명단 편집.
- `db.js` / `config.js` — Supabase 접속. `config.js`에 프로젝트 URL과 anon key 입력.
- `supabase/schema.sql` — 테이블·RLS·실시간 설정. SQL Editor에서 1회 실행 후 seed(별도 보관) 실행.

관리자 추가: Supabase Dashboard → Authentication → Users → Add user(이메일/비밀번호, Auto Confirm) → SQL `insert into admins values ('email')`.
