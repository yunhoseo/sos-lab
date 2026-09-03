# SoS Lab 출근 시간표

- `index.html` — 학생용(공개). 시간표 칠하기·저장.
- `admin.html` — 관리자용. Supabase Auth 로그인(admins 테이블 등록 이메일)으로 일정·구성원·학생 명단 편집.
- `db.js` / `config.js` — Supabase 접속. `config.js`에 프로젝트 URL과 anon key 입력.
- `supabase/schema.sql` — 테이블·RLS·실시간 설정. SQL Editor에서 1회 실행 후 seed(별도 보관) 실행.

관리자 추가: Supabase Dashboard → Authentication → Users → Add user(이메일/비밀번호, Auto Confirm) → SQL `insert into admins values ('email')`.

## 다른 관리자가 Supabase(DB 스키마·계정)를 관리하려면

Supabase 프로젝트 `sos-lab`(조직 "SoS Lab", 서울 리전)의 **조직 멤버**여야 합니다. 소유자(yunho.seo@kyonggi.ac.kr)가 한 번 초대하면 이후로는 소유자 없이 모든 작업이 가능합니다.

1. **초대(소유자가 1회)**: https://supabase.com/dashboard/org/pmyzbzqfdeuayydpyzol/team → Invite → 이메일 입력, 역할 **Administrator**(계정·스키마 관리 가능).
2. **초대받은 사람**: 메일의 초대 링크로 Supabase 가입(GitHub 또는 이메일) → 프로젝트 https://supabase.com/dashboard/project/tvvezzfbufsveybsncfm 접근 확인.

### 관리자(로그인 계정) 추가·비밀번호 변경
- 추가: Authentication → Users → **Add user** → 이메일·비밀번호 입력, **Auto Confirm User** 체크 → 생성. 그다음 SQL Editor에서:
  ```sql
  insert into admins (email) values ('새관리자@kyonggi.ac.kr');
  ```
- 비밀번호 변경: Authentication → Users → 해당 사용자 → ⋯ → **Reset password**(또는 Send password recovery).
- 제거: `delete from admins where email='...';` 후 Users에서 삭제.

### 스키마(테이블·권한) 변경
1. SQL Editor에서 변경 SQL 실행 (예: 컬럼 추가 `alter table students add column memo text;`).
2. 같은 변경을 이 저장소의 `supabase/schema.sql`에도 반영해 커밋 — 새 프로젝트를 다시 만들 때 이 파일 하나로 복원할 수 있어야 합니다.
3. 화면이 새 컬럼을 써야 하면 `db.js`의 select/update 목록과 `index.html`/`admin.html`을 고치고 push(GitHub Pages는 1~2분 뒤 반영, 브라우저 캐시는 Cmd+Shift+R).

### 주의
- 학생(anon)이 고칠 수 있는 컬럼은 `students.work`, `students.seminar`뿐이며 `grant update (work, seminar) on students to anon`으로 제한됩니다. 학생이 수정해야 할 컬럼을 추가하면 이 grant에도 추가해야 합니다.
- `is_admin()` 함수는 `security definer`여야 합니다. 이를 빼면 관리자 저장이 조용히 0행 갱신으로 실패합니다.
- `config.js`의 anon key는 공개용 키라 저장소에 있어도 됩니다. **service_role key와 DB 비밀번호는 절대 저장소에 넣지 마세요.**
- 데이터 백업: Database → Backups(무료 플랜은 미제공) 대신 SQL Editor에서 `select * from students;` / `select * from lab_state;` 결과를 CSV로 내려받아 두면 됩니다.
