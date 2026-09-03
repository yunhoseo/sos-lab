-- SoS Lab 출근 시간표: Supabase SQL Editor에서 1회 실행 (seed는 별도 파일)
create table if not exists students (
  name text primary key,
  ord int not null default 0,
  work jsonb not null default '[]',
  seminar jsonb not null default '[]'
);
create table if not exists lab_state (
  id text primary key,          -- 'admin' 한 행: {cal, events, semDay, members}
  data jsonb not null default '{}'
);
create table if not exists admins (email text primary key);  -- 관리자 이메일 목록 (Dashboard에서 insert)

alter table students  enable row level security;
alter table lab_state enable row level security;
alter table admins    enable row level security;   -- 정책 없음 = API로는 읽기/쓰기 불가

create or replace function is_admin() returns boolean language sql stable as $$
  select exists (select 1 from admins where email = auth.jwt()->>'email');
$$;

-- 누구나 열람
create policy read_students on students  for select using (true);
create policy read_state    on lab_state for select using (true);
-- 학생(anon): 시간표 칠하기만 (컬럼 권한으로 name/ord 변경 차단)
create policy student_paint on students for update to anon using (true) with check (true);
revoke update on students from anon;
grant  update (work, seminar) on students to anon;
-- 관리자(로그인 + admins 등록): 전부
create policy admin_students on students  for all to authenticated using (is_admin()) with check (is_admin());
create policy admin_state    on lab_state for all to authenticated using (is_admin()) with check (is_admin());

-- 실시간 반영
alter publication supabase_realtime add table students, lab_state;
