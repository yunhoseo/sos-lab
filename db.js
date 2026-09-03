// db.js — index.html / admin.html 공용 Supabase 글루. config.js(SUPABASE_URL, SUPABASE_ANON_KEY) 뒤에 로드.
if(!SUPABASE_URL||!SUPABASE_ANON_KEY){
  document.body.innerHTML='<p style="padding:24px;font-family:system-ui">아직 Supabase 연결 전입니다 — config.js에 SUPABASE_URL / SUPABASE_ANON_KEY를 넣어 주세요.</p>';
  throw new Error("config.js: Supabase 설정 없음");
}
var DB=(function(){
  var sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
  function chk(r){ if(r.error) throw r.error; return r.data; }
  function load(){
    return Promise.all([
      sb.from("students").select("name,work,seminar").order("ord"),
      sb.from("lab_state").select("data").eq("id","admin").single()
    ]).then(function(r){
      var a=chk(r[1]).data||{};
      return {students:chk(r[0]),cal:a.cal||{},events:a.events||{},semDay:a.semDay,members:a.members||[]};
    });
  }
  // 학생: 자기 행의 work/seminar만 갱신 (컬럼 권한은 schema.sql에서 제한)
  function saveStudents(list){
    return Promise.all(list.map(function(s){
      return sb.from("students").update({work:s.work,seminar:s.seminar}).eq("name",s.name).then(chk);
    }));
  }
  // 관리자: 일정·구성원 원본 + 학생 명단(추가/이름변경/삭제 포함) 전체 저장
  function saveAll(st,prevNames){
    var names=st.students.map(function(s){return s.name;});
    var gone=(prevNames||[]).filter(function(n){return names.indexOf(n)<0;});
    var p=[sb.from("lab_state").upsert({id:"admin",data:{cal:st.cal,events:st.events,semDay:st.semDay,members:st.members}}).then(chk),
           sb.from("students").upsert(st.students.map(function(s,i){return {name:s.name,ord:i,work:s.work,seminar:s.seminar};})).then(chk)];
    if(gone.length) p.push(sb.from("students").delete().in("name",gone).then(chk));
    return Promise.all(p);
  }
  // 다른 기기의 저장을 실시간 수신 (테이블은 schema.sql에서 realtime publication에 등록)
  function watch(cb){
    sb.channel("lab").on("postgres_changes",{event:"*",schema:"public"},cb).subscribe();
  }
  return {sb:sb,load:load,saveStudents:saveStudents,saveAll:saveAll,watch:watch};
})();
