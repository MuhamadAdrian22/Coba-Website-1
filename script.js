// Basic interactions: slider (auto + manual), modal open/close, form handlers, small demo dashboard
document.addEventListener('DOMContentLoaded', function(){

  // === YEAR ===
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // === NAV toggle for mobile ===
  const navToggle = document.getElementById('navToggle');
  const navlinks = document.getElementById('navlinks');
  if (navToggle && navlinks) {
    navToggle.addEventListener('click', ()=> navlinks.classList.toggle('show'));
  }

  // === SLIDER ===
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.querySelector('.prev');
  const nextBtn = document.querySelector('.next');
  let current = 0;
  let autoSlide = true;
  let intervalId = null;

  if(slides.length){
    slides.forEach((s,i)=>{
      const b = document.createElement('button');
      if(i===0) b.classList.add('active');
      b.addEventListener('click', ()=> goTo(i));
      if(dotsWrap) dotsWrap.appendChild(b);
    });
    const dots = Array.from(dotsWrap?.children || []);
  
    function show(index){
      slides.forEach((s,i)=> s.classList.toggle('active', i===index));
      dots.forEach((d,i)=> d.classList.toggle('active', i===index));
    }
  
    function goTo(i){
      current = (i + slides.length) % slides.length;
      show(current);
      resetAuto();
    }
  
    if(prevBtn) prevBtn.addEventListener('click', ()=> goTo(current-1));
    if(nextBtn) nextBtn.addEventListener('click', ()=> goTo(current+1));
  
    function next(){
      goTo(current+1);
    }
    function startAuto(){
      if(intervalId) clearInterval(intervalId);
      intervalId = setInterval(next, 4500);
    }
    function resetAuto(){
      if(autoSlide){
        startAuto();
      }
    }
  
    show(0);
    startAuto();
  }

  // === LOGIN modal logic ===
  const loginModal = document.getElementById('loginModal');
  const openLogin = document.getElementById('openLogin');
  const closeLogin = document.getElementById('closeLogin');
  const loginForm = document.getElementById('loginForm');

  if(openLogin && loginModal){
    openLogin.addEventListener('click', ()=> loginModal.setAttribute('aria-hidden','false'));
  }
  if(closeLogin && loginModal){
    closeLogin.addEventListener('click', ()=> loginModal.setAttribute('aria-hidden','true'));
  }
  if(loginModal){
    loginModal.addEventListener('click', (e)=>{
      if(e.target === loginModal) loginModal.setAttribute('aria-hidden','true');
    });
  }

  // === DASHBOARD modal ===
  const dashboardModal = document.getElementById('dashboardModal');
  const closeDash = document.getElementById('closeDash');
  const dashTitle = document.getElementById('dashTitle');
  const dashContent = document.getElementById('dashContent');

  if(closeDash && dashboardModal){
    closeDash.addEventListener('click', ()=> dashboardModal.setAttribute('aria-hidden','true'));
  }
  if(dashboardModal){
    dashboardModal.addEventListener('click', (e)=> { 
      if(e.target === dashboardModal) dashboardModal.setAttribute('aria-hidden','true'); 
    });
  }

  // === LOGIN HANDLER (Admin / Teacher) ===
  if(loginForm){
    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      const form = new FormData(loginForm);
      const role = form.get('role');
      const email = form.get('email');
      const password = form.get('password');
      
      // Simulasi user login
      if(role === 'admin' && password === '1234'){
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userEmail', email);
        loginModal.setAttribute('aria-hidden','true');
        loadDashboard(role, email);
      } 
      else if(role === 'teacher' && password === '1234'){
        localStorage.setItem('userRole', 'teacher');
        localStorage.setItem('userEmail', email);
        loginModal.setAttribute('aria-hidden','true');
        loadDashboard(role, email);
      }
      else {
        alert('Username atau password salah!');
      }
    });
  }

  // === DASHBOARD LOADER ===
  function loadDashboard(role, email){
    dashTitle.textContent = (role === 'admin') ? 'Admin Dashboard' : 'Teacher Dashboard';
    dashboardModal.setAttribute('aria-hidden','false');

    if(role === 'admin'){
      dashContent.innerHTML = `
        <p>Halo <b>${email}</b>! Anda login sebagai <b>Admin</b>.</p>
        <h3>Data Absensi Teacher</h3>
        <table class="data-table" id="absenTable">
          <thead>
            <tr><th>Nama</th><th>Tanggal</th><th>Jam Masuk</th><th>Jam Keluar</th><th>Durasi</th></tr>
          </thead>
          <tbody id="absenBody"></tbody>
        </table>
        <button id="exportBtn" class="btn-primary">Export CSV</button>
      `;
      renderAbsensi();
    } else {
      dashContent.innerHTML = `
        <p>Halo <b>${email}</b>! Anda login sebagai <b>Teacher</b>.</p>
        <form id="absensiForm" class="form-card">
          <label>Nama Teacher: <input type="text" id="teacherName" required></label>
          <label>Tanggal: <input type="date" id="date" required></label>
          <label>Jam Masuk: <input type="time" id="startTime" required></label>
          <label>Jam Keluar: <input type="time" id="endTime" required></label>
          <button type="submit" class="btn-primary full">Simpan Absensi</button>
        </form>
      `;
      attachAbsensiForm();
    }
  }

  // === TEACHER: Simpan absensi ke localStorage ===
  function attachAbsensiForm(){
    const absensiForm = document.getElementById('absensiForm');
    if(!absensiForm) return;
    absensiForm.addEventListener('submit', function(e){
      e.preventDefault();
      const teacherName = document.getElementById('teacherName').value;
      const date = document.getElementById('date').value;
      const start = document.getElementById('startTime').value;
      const end = document.getElementById('endTime').value;
      const durasi = hitungDurasi(start, end);

      const data = JSON.parse(localStorage.getItem('absensi')) || [];
      data.push({ teacherName, date, start, end, durasi });
      localStorage.setItem('absensi', JSON.stringify(data));

      alert('Absensi berhasil disimpan!');
      absensiForm.reset();
    });
  }

  // === ADMIN: Tampilkan absensi di tabel ===
  function renderAbsensi(){
    const data = JSON.parse(localStorage.getItem('absensi')) || [];
    const body = document.getElementById('absenBody');
    if(!body) return;
    body.innerHTML = data.map((d,i)=>`
      <tr>
        <td>${d.teacherName}</td>
        <td>${d.date}</td>
        <td>${d.start}</td>
        <td>${d.end}</td>
        <td>${d.durasi}</td>
      </tr>
    `).join('');
  }

  // === Hitung durasi ===
  function hitungDurasi(start, end){
    const [h1,m1] = start.split(':').map(Number);
    const [h2,m2] = end.split(':').map(Number);
    let total = (h2*60+m2) - (h1*60+m1);
    const jam = Math.floor(total/60);
    const menit = total % 60;
    return `${jam} jam ${menit} menit`;
  }

  // === EXPORT CSV ===
  document.addEventListener('click', function(e){
    if(e.target && e.target.id === 'exportBtn'){
      const rows = [["Nama","Tanggal","Jam Masuk","Jam Keluar","Durasi"]];
      const trs = document.querySelectorAll('#absenBody tr');
      trs.forEach(tr=>{
        const cells = Array.from(tr.children).map(td=> td.textContent.trim());
        rows.push(cells);
      });
      const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
      const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'absensi_teacher.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
  });

  // === CONTACT FORM (demo) ===
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', function(e){
      e.preventDefault();
      const fd = new FormData(contactForm);
      alert(`Terima kasih ${fd.get('name')}. Pesan Anda untuk program "${fd.get('program')}" telah kami terima (demo).`);
      contactForm.reset();
      window.location.hash = '#contact';
    });
  }

});
