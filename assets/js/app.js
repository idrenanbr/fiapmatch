// FIAP Match – app.js (Parte 1/3)
// Migração por blocos: estado global, utilitários, navegação/telas, partículas
// Esta migração evita efeitos colaterais com um guard simples.
if (!window.__FIAP_APP_PART1__) {
  window.__FIAP_APP_PART1__ = true;


  // ===== Estado Global =====
  window.state = window.state || {
    currentUser: null,
    selectedRole: null,
    selectedAdminRole: null,
    users: [],
    matches: [],
    currentCardIndex: 0,
    streak: 0,
    isDragging: false,
    startX: 0,
    currentX: 0,
    cardElem: null,
    appSecret: 'FIAP_NEXT_2025_SECRET_KEY',
    roles: {
      STU: { name: 'Alunos FIAP', color: '#0066CC', emoji: '🎓', points: 10 },
      VIS: { name: 'Visitantes', color: '#FFD700', emoji: '🌟', points: 30 },
      IC: { name: 'Iniciação Científica', color: '#9932CC', emoji: '🔬', points: 20 },
      CHL: { name: 'Challenge', color: '#DC143C', emoji: '🏆', points: 20 },
      PRO: { name: 'Professores', color: '#FF8C00', emoji: '👨‍🏫', points: 10 },
      STA: { name: 'Funcionários', color: '#228B22', emoji: '👥', points: 15 }
    }
  };

  // ===== Utilitários (UID/QR/Assinatura) =====
  window.generateUID = function(role) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 7; i++) randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    return `NEXT25-${role}-${randomPart}`;
  }
  window.generateSignature = function(payload) {
    const secret = state.appSecret; let hash = 0;
    for (let i = 0; i < payload.length; i++) { const char = payload.charCodeAt(i); hash = ((hash << 5) - hash) + char; hash = hash & hash; }
    return btoa(hash.toString() + secret).substring(0, 32);
  }
  window.generateQRPayload = function(uid, role) {
    const payload = { uid, role, issued_at: new Date().toISOString(), ver: '1' };
    const signature = generateSignature(JSON.stringify(payload));
    payload.sig = signature; return payload;
  }
  window.verifySignature = function(payload, signature) {
    const expectedSig = generateSignature(JSON.stringify(payload));
    return expectedSig === signature;
  }
  window.generateShortCode = function(uid) { return uid.split('-').slice(1).join('-'); }

  // ===== Normalização / Sessão / Device =====
  window.normalizeName = function(str){ return (str||'').trim().replace(/\s+/g,' ').normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase(); }
  window.normalizeEmail = function(str){ return (str||'').trim().toLowerCase(); }
  window.normalizeRM = function(str){ return (str||'').replace(/\D+/g,''); }
  window.singleActiveSession = function(user){ const tabKey = `fiapTabLock_${user.uid}`; if (localStorage.getItem(tabKey)){ alert('Outra aba do FIAP Match já está ativa. Use apenas uma aba.'); window.close?.(); } localStorage.setItem(tabKey, String(Date.now())); window.addEventListener('beforeunload', ()=> localStorage.removeItem(tabKey)); }
  window.getOrCreateDeviceId = function(){ let id = localStorage.getItem('fiapDeviceId'); if(!id){ id = Math.random().toString(36).slice(2)+Date.now().toString(36); localStorage.setItem('fiapDeviceId', id);} return id; }
  window.getDeviceBinding = function(uid){ const map = JSON.parse(localStorage.getItem('fiapDeviceBinding')||'{}'); return map[uid]||null; }
  window.setDeviceBinding = function(uid, deviceId){ const map = JSON.parse(localStorage.getItem('fiapDeviceBinding')||'{}'); map[uid]=deviceId; localStorage.setItem('fiapDeviceBinding', JSON.stringify(map)); }
  window.openSupport = function(){ alert('Procure o stand FIAP Match ou chame o suporte.'); }

  // ===== Navegação / Telas =====
  window.startQuickSetup = function(){ document.getElementById('welcomeScreen').classList.add('hidden'); document.getElementById('quickSetup').classList.remove('hidden'); }
  window.showLoginScreen = function(){ document.getElementById('welcomeScreen').classList.add('hidden'); document.getElementById('loginScreen').classList.remove('hidden'); }
  window.showAdminLogin = function(){ document.getElementById('welcomeScreen').classList.add('hidden'); document.getElementById('adminLoginScreen').classList.remove('hidden'); }
  window.goBackToWelcome = function(){ document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden')); document.getElementById('welcomeScreen').classList.remove('hidden'); }
  
  // ===== Feature Pages =====
  window.showFeaturePage = function(page) {
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    if (page === 'connect') document.getElementById('connectFeaturePage').classList.remove('hidden');
    if (page === 'points') document.getElementById('pointsFeaturePage').classList.remove('hidden');
    if (page === 'prizes') document.getElementById('prizesFeaturePage').classList.remove('hidden');
  }
  
  // ===== Role Selection =====
  window.selectRole = function(role) {
    state.selectedRole = role;
    document.querySelectorAll('.bracelet-card').forEach(card => card.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
    document.getElementById('registrationForm').classList.remove('hidden');
    generateDynamicFields(role);
  }
  
  // ===== Dynamic Fields Generation =====
  window.generateDynamicFields = function(role) {
    const container = document.getElementById('dynamicFields');
    container.innerHTML = '';
    
    // Common fields
    container.innerHTML += `
      <div class="input-group">
        <label for="userName">Nome Completo</label>
        <input type="text" id="userName" placeholder="Seu nome completo" class="input-field" required>
      </div>
      <div class="input-group">
        <label for="userEmail">E-mail</label>
        <input type="email" id="userEmail" placeholder="seu@email.com" class="input-field" required>
      </div>
    `;
    
    // Role-specific fields
    if (role === 'STU') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userRM">RM (Registro Acadêmico)</label>
          <input type="text" id="userRM" placeholder="Ex: 123456" class="input-field" required>
        </div>
        <div class="input-group">
          <label for="userCourse">Curso</label>
          <select id="userCourse" class="input-field" required>
            <option value="">Selecione seu curso</option>
            <option value="ADS">Análise e Desenvolvimento de Sistemas</option>
            <option value="CCO">Ciência da Computação</option>
            <option value="ECA">Engenharia da Computação</option>
            <option value="ESI">Engenharia de Software</option>
            <option value="JOG">Jogos Digitais</option>
            <option value="SIS">Sistemas de Informação</option>
          </select>
        </div>
      `;
    } else if (role === 'PRO') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userArea">Área de Atuação</label>
          <input type="text" id="userArea" placeholder="Ex: Desenvolvimento Web" class="input-field" required>
        </div>
      `;
    } else if (role === 'STA') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userFunction">Função</label>
          <input type="text" id="userFunction" placeholder="Ex: Suporte Técnico" class="input-field" required>
        </div>
      `;
    } else if (role === 'IC') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userProject">Projeto de Pesquisa</label>
          <input type="text" id="userProject" placeholder="Ex: Interface Inteligente" class="input-field" required>
        </div>
        <div class="input-group">
          <label for="userArea">Área de Pesquisa</label>
          <input type="text" id="userArea" placeholder="Ex: UX/UI" class="input-field" required>
        </div>
      `;
    } else if (role === 'CHL') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userProject">Projeto Challenge</label>
          <input type="text" id="userProject" placeholder="Ex: Cloud Challenge" class="input-field" required>
        </div>
        <div class="input-group">
          <label for="userArea">Área de Desafio</label>
          <input type="text" id="userArea" placeholder="Ex: Infraestrutura" class="input-field" required>
        </div>
      `;
    } else if (role === 'VIS') {
      container.innerHTML += `
        <div class="input-group">
          <label for="userInterests">Interesses (separados por vírgula)</label>
          <input type="text" id="userInterests" placeholder="Ex: Games, Cloud, DevOps" class="input-field" required>
        </div>
      `;
    }
  }
  
  // ===== Finish Setup =====
  window.finishSetup = function() {
    const lgpdConsent = document.getElementById('lgpdConsent').checked;
    if (!lgpdConsent) {
      alert('Você deve concordar com o tratamento dos dados conforme a LGPD para continuar.');
      return;
    }
    
    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    
    if (!name || !email) {
      alert('Nome e e-mail são obrigatórios.');
      return;
    }
    
    // Collect additional data based on role
    const additionalData = {};
    if (state.selectedRole === 'STU') {
      additionalData.rm = document.getElementById('userRM').value.trim();
      additionalData.course = document.getElementById('userCourse').value;
    } else if (state.selectedRole === 'PRO') {
      additionalData.area = document.getElementById('userArea').value.trim();
    } else if (state.selectedRole === 'STA') {
      additionalData.function = document.getElementById('userFunction').value.trim();
    } else if (state.selectedRole === 'IC') {
      additionalData.project = document.getElementById('userProject').value.trim();
      additionalData.area = document.getElementById('userArea').value.trim();
    } else if (state.selectedRole === 'CHL') {
      additionalData.project = document.getElementById('userProject').value.trim();
      additionalData.area = document.getElementById('userArea').value.trim();
    } else if (state.selectedRole === 'VIS') {
      additionalData.interests = document.getElementById('userInterests').value.trim().split(',').map(s => s.trim());
    }
    
    // Create user
    const uid = generateUID(state.selectedRole);
    const roleInfo = state.roles[state.selectedRole];
    const shortCode = generateShortCode(uid);
    
    const user = {
      uid: uid,
      name: name,
      email: email,
      role: state.selectedRole,
      roleName: roleInfo.name,
      shortCode: shortCode,
      qrPayload: generateQRPayload(uid, state.selectedRole),
      validated: false,
      points: 0,
      matches: 0,
      badges: [],
      connections: [],
      ...additionalData
    };
    
    // Save to directory
    const directory = JSON.parse(localStorage.getItem('fiapMatchDirectory') || '[]');
    directory.push(user);
    localStorage.setItem('fiapMatchDirectory', JSON.stringify(directory));
    
    // Set as current user
    state.currentUser = user;
    localStorage.setItem('fiapMatchUser', JSON.stringify(user));
    
    // Show QR code screen
    showQRCodeScreen();
  }

  // ===== Partículas (UI) =====
  window.createParticles = function(){
    const container = document.getElementById('particles');
    if (!container) return;
    const particles = ['F', 'I', 'A', 'P', '🚀', '💡'];
    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 6 + 's';
      container.appendChild(particle);
    }
  }

  // (Sem bootstrap aqui para evitar inicialização dupla)
}

// FIAP Match – app.js (Parte 3b/3)
// QR/Conexões, Badges/Ranking, Notificações, Inicialização e Modais
if (!window.__FIAP_APP_PART3B__) {
  window.__FIAP_APP_PART3B__ = true;

  // ===== QR / Código curto =====
  window.generateQRCode = function(){
    const qrContainer = document.getElementById('userQR'); if (!qrContainer) return;
    qrContainer.innerHTML = '';
    try { new QRCode(qrContainer, { text: state.currentUser.id, width: 200, height: 200, colorDark: '#ED145B', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.H }); } catch(e) {}
  }

  window.confirmScan = function(){
    if (!state.currentUser?.validated) { showNotification('Valide seu cadastro no stand para pontuar.', 'error'); return; }
    const code = (document.getElementById('scanInput')?.value || '').trim();
    if (!code) { showNotification('Digite o código curto!', 'error'); return; }
    const parts = code.split('-'); if (parts.length !== 2) { showNotification('Formato inválido! Use: ROLE-XXXXXXX', 'error'); return; }
    const [role, randomPart] = parts; const uid = `NEXT25-${code}`;
    const already = state.currentUser.connections.some(conn => conn.uid === uid || conn.uid.includes(randomPart)); if (already){ showNotification('Você já se conectou com esta pessoa!', 'error'); return; }
    const points = state.roles[role] ? state.roles[role].points : 10; const roleName = state.roles[role] ? state.roles[role].name : 'Desconhecido';
    let badgeEarned = null; if (role === 'PRO') badgeEarned = 'MENTORIA_NEXT';
    const connection = { uid, role, name: `Usuário ${role}`, points, timestamp: new Date().toISOString() };
    state.currentUser.connections.push(connection); state.currentUser.matches++; state.currentUser.points += points;
    if (badgeEarned && !state.currentUser.badges.includes(badgeEarned)) { state.currentUser.badges.push(badgeEarned); showBadgeNotification(badgeEarned); }
    localStorage.setItem('fiapMatchUser', JSON.stringify(state.currentUser));
    updateStats(); updateConnectionsList(); celebrateAction(`CONEXÃO COM ${roleName}!`, points);
    try { confetti?.({ particleCount: 50, spread: 60, colors: ['#ED145B', '#FFFFFF', '#1E1E1E'] }); } catch(e) {}
    const si = document.getElementById('scanInput'); if (si) si.value = '';
  }

  window.updateConnectionsList = function(){
    const connectionsList = document.getElementById('connectionsList'); if (!connectionsList) return;
    if (state.currentUser.connections.length === 0) { connectionsList.innerHTML = '<div style="text-align: center; opacity: 0.7;">Nenhuma conexão ainda</div>'; return; }
    connectionsList.innerHTML = state.currentUser.connections.map(conn => {
      const roleInfo = state.roles[conn.role]; const time = new Date(conn.timestamp).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--fiap-gray);"><div><span style="color:${roleInfo?.color||'#fff'};font-weight:bold;">${conn.name}</span><div style=\"font-size:12px;opacity:.8;\">${time}</div></div><div style=\"color: var(--fiap-pink); font-weight: bold;\">+${conn.points}pts</div></div>`;
    }).join('');
  }

  // ===== Navegação de abas =====
  window.showTab = function(tabName){
    document.querySelectorAll('.nav-item').forEach(i=>i.classList.remove('active'));
    event.currentTarget.classList.add('active');
    const ids = ['matchSection','rankingSection','qrSection','badgesSection','prizeSection'];
    ids.forEach(id=> document.getElementById(id)?.classList.add('hidden'));
    if (tabName==='match') document.getElementById('matchSection')?.classList.remove('hidden');
    if (tabName==='ranking'){ document.getElementById('rankingSection')?.classList.remove('hidden'); updateRanking(); }
    if (tabName==='qr'){ document.getElementById('qrSection')?.classList.remove('hidden'); updateConnectionsList(); }
    if (tabName==='badges'){ document.getElementById('badgesSection')?.classList.remove('hidden'); updateBadgesList(); }
    if (tabName==='prize') document.getElementById('prizeSection')?.classList.remove('hidden');
  }

  // ===== Badges / Ranking =====
  window.updateBadgesList = function(){
    const badgesList = document.getElementById('badgesList'); if (!badgesList) return;
    const badgeInfo = {
      'CHECKIN_NEXT': { name:'Check-in Next', description:'Valide seu cadastro no stand', icon:'✅', color:'#4CAF50' },
      'MENTORIA_NEXT': { name:'Mentoria Next', description:'Conecte com um professor', icon:'👨‍🏫', color:'#FF8C00' },
      'ALL_ROLES': { name:'Conector Universal', description:'Conecte com todos os papéis', icon:'🌟', color:'#9C27B0' },
      'NETWORKER_PRO': { name:'Networker Pro', description:'Faça 10 conexões', icon:'🤝', color:'#2196F3' },
      'SOCIAL_BUTTERFLY': { name:'Social Butterfly', description:'Faça 25 conexões', icon:'🦋', color:'#E91E63' }
    };
    if (state.currentUser.badges.length === 0) { badgesList.innerHTML = '<div style="text-align:center;color:var(--fiap-light-gray);padding:40px;">Nenhuma badge conquistada ainda</div>'; return; }
    badgesList.innerHTML = state.currentUser.badges.map(code => { const b=badgeInfo[code]; if(!b) return ''; return `<div class=\"ranking-item\" style=\"border-color:${b.color};\"><div style=\"width:50px;height:50px;border-radius:50%;background:${b.color};display:flex;align-items:center;justify-content:center;font-size:24px;margin-right:15px;\">${b.icon}</div><div style=\"flex:1;\"><div style=\"font-weight:bold;color:#fff;margin-bottom:5px;\">${b.name}</div><div style=\"font-size:12px;color:var(--fiap-light-gray);\">${b.description}</div></div></div>`; }).join('');
  }

  window.updateRanking = function(){
    const rankingList = document.getElementById('rankingList'); if (!rankingList) return;
    const topUsers = [ { name: state.currentUser.name, points: state.currentUser.points, matches: state.currentUser.matches }, { name:'Tech Master', points:580, matches:42 }, { name:'Code Ninja', points:455, matches:35 }, { name:'Dev Pro', points:380, matches:28 }, { name:'Hacker Girl', points:320, matches:24 } ];
    topUsers.sort((a,b)=>b.points-a.points); rankingList.innerHTML='';
    topUsers.forEach((user,index)=>{ const item=document.createElement('div'); item.className='ranking-item'; if (user.name===state.currentUser.name){ item.style.borderColor='var(--fiap-pink)'; item.style.boxShadow='0 0 20px rgba(237,20,91,.2)'; }
      item.innerHTML = `<div class=\"ranking-position rank-${index<3? index+1 : 'other'}\">${index+1}</div><div class=\"ranking-user\"><div class=\"ranking-name\">${user.name}</div><div class=\"ranking-stats\">${user.matches} conexões</div></div><div class=\"ranking-points\">${user.points}</div>`; rankingList.appendChild(item); });
  }

  // ===== Notificações / UI =====
  window.celebrateAction = function(text, points){
    const celebration=document.createElement('div'); celebration.className='celebration-text'; celebration.textContent=text; document.body.appendChild(celebration); setTimeout(()=>celebration.remove(), 1000);
    if (points>0){ const popup=document.createElement('div'); popup.className='points-popup'; popup.textContent = `+${points} pontos!`; document.body.appendChild(popup); setTimeout(()=>popup.remove(), 1000); }
  }

  window.showNotification = function(message, type='info'){
    const notification=document.createElement('div'); notification.style = `position:fixed;top:20px;left:50%;transform:translateX(-50%);background:${type==='error'?'var(--fiap-gray)':'var(--fiap-pink)'};color:#fff;padding:15px 30px;border-radius:50px;font-weight:bold;z-index:3000;animation:slideDown .3s ease;`; notification.textContent = message; document.body.appendChild(notification); setTimeout(()=>notification.remove(), 3000);
  }

  window.showBadgeNotification = function(badgeCode){
    const badgeNames = { 'MENTORIA_NEXT':'Mentoria Next', 'CHECKIN_NEXT':'Check-in Next', 'ALL_ROLES':'Conector Universal' };
    const notification=document.createElement('div'); notification.style='position:fixed;top:50%;left:50%;transform:translate(-50%, -50%);background:linear-gradient(135deg, var(--fiap-pink), #C41E3A);color:#fff;padding:30px;border-radius:20px;font-weight:bold;z-index:3000;text-align:center;box-shadow:0 20px 40px rgba(237,20,91,.3);animation:badgePop 1s ease-out;';
    notification.innerHTML = `<div style=\"font-size:48px;margin-bottom:15px;\">🏆</div><div style=\"font-size:24px;margin-bottom:10px;\">Nova Badge Desbloqueada!</div><div style=\"font-size:18px;opacity:.9;\">${badgeNames[badgeCode]||badgeCode}</div>`; document.body.appendChild(notification); setTimeout(()=>notification.remove(), 3000);
  }

  // ===== Inicialização de telas =====
  window.initializeApp = function(){ updateStats(); generateQRCode(); loadMatchCards(); /* setInterval(updateRanking, 5000); - Removido para evitar problemas de performance */ }

  window.showQRCodeScreen = function(){
    document.getElementById('quickSetup')?.classList.add('hidden');
    const qrScreen=document.createElement('div'); qrScreen.id='qrCodeScreen'; qrScreen.className='screen';
    qrScreen.style.cssText='height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(135deg, var(--fiap-dark) 0%, var(--fiap-darker) 100%);color:#fff;text-align:center;padding:20px;';
    qrScreen.innerHTML = `
      <div style=\"margin-bottom:30px;\"><h2 style=\"font-size:32px;font-weight:bold;margin-bottom:10px;color:var(--fiap-pink);\">🎉 Cadastro Concluído!</h2><p style=\"color:var(--fiap-light-gray);margin-bottom:20px;\">Olá, ${state.currentUser.name}!<br>Seu papel: <strong>${state.currentUser.roleName}</strong></p></div>
      <div style=\"background:#fff;padding:20px;border-radius:20px;margin:20px 0;\"><div id=\"userQRCode\"></div></div>
      <div style=\"background: var(--fiap-dark); padding: 20px; border-radius: 15px; margin: 20px 0; border: 2px solid var(--fiap-pink);\"><h3 style=\"color: var(--fiap-pink); margin-bottom: 10px;\">Seu Código Curto:</h3><div style=\"font-size: 24px; font-weight: bold; font-family: monospace; color: var(--fiap-white);\">${state.currentUser.shortCode}</div></div>
      <div style=\"background: var(--fiap-darker); padding: 20px; border-radius: 15px; margin: 20px 0; border: 1px solid var(--fiap-gray);\"><h3 style=\"color:#fff;margin-bottom:15px;\">📋 Próximos Passos:</h3><div style=\"text-align:left;color:var(--fiap-light-gray);\"><div style=\"margin-bottom:10px;\">1. 📱 <strong>Vá ao stand FIAP Match</strong></div><div style=\"margin-bottom:10px;\">2. 📷 <strong>Mostre seu QR Code</strong> ou digite o código curto</div><div style=\"margin-bottom:10px;\">3. 🎁 <strong>Pegue seu brinde garantido!</strong></div><div style=\"margin-bottom:10px;\">4. 🤝 <strong>Comece a conectar</strong> com outras pessoas</div></div></div>
      <button onclick=\"startMainApp()\" class=\"btn-primary\" style=\"margin-top:20px;\">COMEÇAR A CONECTAR! 🚀</button>`;
    document.getElementById('app')?.appendChild(qrScreen);
    try { const qrContainer=document.getElementById('userQRCode'); qrContainer.innerHTML=''; new QRCode(qrContainer, { text: JSON.stringify(state.currentUser.qrPayload), width:200, height:200, colorDark:'#ED145B', colorLight:'#ffffff', correctLevel: QRCode.CorrectLevel.H }); } catch(e) {}
  }

  window.startMainApp = function(){ const qrScreen=document.getElementById('qrCodeScreen'); if (qrScreen) qrScreen.remove(); document.getElementById('mainApp')?.classList.remove('hidden'); initializeApp(); const banner=document.getElementById('validationBanner'); if (banner) banner.style.display = state.currentUser.validated ? 'none' : 'block'; celebrateAction('BEM-VINDO AO FIAP MATCH!', 0); generateDemoProfiles(); }

  // ===== Modais =====
  window.confirmRMWithCheckbox = function(len){
    return new Promise((resolve)=>{ const overlay=document.createElement('div'); overlay.style='position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:4000;'; const modal=document.createElement('div'); modal.style='max-width:360px;width:90%;background:#1E1E1E;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:20px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.5);'; modal.innerHTML = `<h3 style=\"margin:0 0 10px 0;font-size:18px;font-weight:800;\">Confirmar RM</h3><p style=\"opacity:.9;margin:0 0 10px 0;\">Detectamos um RM com <b>${len}</b> dígitos. Confirme se está correto.</p><label style=\"display:flex;align-items:center;gap:8px;margin:10px 0;\"><input id=\"rmConfirmChk\" type=\"checkbox\" style=\"transform:scale(1.3)\"><span>Confirmo que meu RM tem exatamente ${len} dígitos</span></label><div style=\"display:flex;gap:10px;justify-content:flex-end;margin-top:10px;\"><button id=\"rmCancel\" class=\"btn\" style=\"background:#374151;color:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;\">Cancelar</button><button id=\"rmOk\" class=\"btn\" style=\"background:var(--fiap-pink);color:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;opacity:.9;\">Confirmar</button></div>`; overlay.appendChild(modal); document.body.appendChild(overlay); const cleanup=()=>overlay.remove(); overlay.querySelector('#rmCancel').onclick=()=>{ cleanup(); resolve(false); }; overlay.querySelector('#rmOk').onclick=()=>{ const ok=overlay.querySelector('#rmConfirmChk').checked; if(!ok) return; cleanup(); resolve(true); }; });
  }

  window.showDuplicateModal = function(info, inline=false){
    return new Promise((resolve)=>{ const overlay=document.createElement('div'); overlay.style='position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:4000;'; const modal=document.createElement('div'); modal.style='max-width:380px;width:92%;background:#1E1E1E;border:1px solid rgba(255,255,255,0.15);border-radius:16px;padding:20px;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,0.5);'; modal.innerHTML = `<h3 style=\"margin:0 0 8px 0;font-size:18px;font-weight:800;\">Possível cadastro já existente</h3><p style=\"opacity:.9;margin:0 0 12px 0;\">Encontramos dados iguais (nome, e-mail ou RM). Por segurança, valide sua identidade com a equipe.</p><div style=\"display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;\"><button id=\"dupSupport\" style=\"background:#F59E0B;color:#0D0D0D;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:700;\">Falar com suporte</button><button id=\"dupStand\" style=\"background:#10B981;color:#0D0D0D;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:700;\">Ir ao stand</button><button id=\"dupLogin\" style=\"background:var(--fiap-pink);color:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;opacity:.95;\">Fazer login</button><button id=\"dupCancel\" style=\"background:#374151;color:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;\">Cancelar</button></div>`; overlay.appendChild(modal); document.body.appendChild(overlay); const cleanup=()=>overlay.remove(); overlay.querySelector('#dupCancel').onclick=()=>{ cleanup(); resolve('cancel'); }; overlay.querySelector('#dupSupport').onclick=()=>{ cleanup(); resolve('support'); }; overlay.querySelector('#dupStand').onclick=()=>{ cleanup(); resolve('support'); }; overlay.querySelector('#dupLogin').onclick=()=>{ cleanup(); state._navigatedToLogin=true; showLoginScreen(); resolve('login'); }; });
  }
}

// FIAP Match – app.js (Parte 2/3)
// Autenticação (login/admin) e utilitários de terminal admin
if (!window.__FIAP_APP_PART2__) {
  window.__FIAP_APP_PART2__ = true;

  // ===== Autenticação =====
  window.attemptLogin = function() {
    const identifier = document.getElementById('loginIdentifier').value.trim();
    if (!identifier){ alert('Digite seu e-mail, RM ou nome completo'); return; }
    const dir = JSON.parse(localStorage.getItem('fiapMatchDirectory') || '[]');
    // Try email
    let found = dir.find(u => u.email && normalizeEmail(u.email) === normalizeEmail(identifier));
    // Try RM
    if (!found) found = dir.find(u => u.rm && u.rm === normalizeRM(identifier));
    // Try name (with collision rule)
    if (!found){
      const normName = normalizeName(identifier);
      if (normName){
        const same = dir.filter(u => normalizeName(u.name) === normName);
        if (same.length === 1) found = same[0];
        if (same.length > 1){ alert('Nome encontrado em múltiplas contas. Use seu e-mail ou RM.'); return; }
      }
    }
    if (!found){ if (confirm('Usuário não encontrado. Deseja criar um cadastro?')) startQuickSetup(); return; }

    // Anti-abuso: bloquear se conta vinculada a outro aparelho
    const deviceId = getOrCreateDeviceId();
    const bound = getDeviceBinding(found.uid);
    if (bound && bound !== deviceId) { showDeviceBlockedModal(); return; }

    // Auto-entrada
    const saved = JSON.parse(localStorage.getItem('fiapMatchUser')||'null');
    const user = saved && saved.uid === found.uid ? saved : { uid: found.uid, name: found.name, email: found.email, rm: found.rm, role: found.role, validated: false, points: 0, matches: 0, badges: [], connections: [] };
    state.currentUser = user;
    singleActiveSession(user);
    if (!bound) setDeviceBinding(user.uid, deviceId);
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    generateDemoProfiles?.();
    initializeApp?.();
  }

  window.selectAdminRole = function(role){
    document.querySelectorAll('.admin-role-btn').forEach(btn => { btn.classList.remove('selected'); });
    event.currentTarget.classList.add('selected');
    state.selectedAdminRole = role;
  }

  window.attemptAdminLogin = function(){
    const code = document.getElementById('adminCode').value.trim();
    const role = state.selectedAdminRole;
    if (!role) { alert('Por favor, selecione um tipo de acesso'); return; }
    if (!code) { alert('Por favor, digite o código de acesso'); return; }
    const adminCodes = { 'STAFF': 'FIAP2025', 'ADMIN': 'teste', 'VALIDATOR': 'FIAPVALID2025' };
    if (code === adminCodes[role]) {
      switch(role){
        case 'VALIDATOR': window.location.href = 'validador-stand.html'; break;
        case 'ADMIN':
        case 'STAFF': showAdminDashboard(); break;
      }
    } else { alert('Código de acesso inválido'); }
  }

  window.showAdminDashboard = function(){
    document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
    document.getElementById('adminLoginScreen').classList.add('hidden');
    document.getElementById('adminDashboard').classList.remove('hidden');
    adminRefresh();
  }

  window.showForgotPassword = function(){
    alert('Funcionalidade de recuperação de senha em desenvolvimento. Entre em contato com o suporte.');
  }

  // ===== Admin terminal helpers =====
  window.adminReadDirectory = function(){
    const dir = JSON.parse(localStorage.getItem('fiapMatchDirectory')||'[]');
    const binding = JSON.parse(localStorage.getItem('fiapDeviceBinding')||'{}');
    const validatedUsers = JSON.parse(localStorage.getItem('validatedUsers')||'[]');
    return dir.map(u=>({ ...u, deviceId: binding[u.uid]||'-', validated: !!validatedUsers.find(v=>v.uid===u.uid) }));
  }
  window.adminRefresh = function(){
    const rows = adminReadDirectory();
    const total = rows.length;
    const validated = rows.filter(r=>r.validated).length;
    document.getElementById('adminStats').innerHTML = `
      <div class="stat-item" style="background:var(--fiap-dark);border:1px solid var(--fiap-gray);border-radius:10px;"><div class="stat-value">${total}</div><div class="stat-label">cadastros</div></div>
      <div class="stat-item" style="background:var(--fiap-dark);border:1px solid var(--fiap-gray);border-radius:10px;"><div class="stat-value">${validated}</div><div class="stat-label">validados</div></div>
    `;
    const term = (document.getElementById('adminSearch').value||'').trim().toLowerCase();
    const filtered = rows.filter(r=> !term || (r.name && r.name.toLowerCase().includes(term)) || (r.email && r.email.toLowerCase().includes(term)) || (r.rm && String(r.rm).includes(term)) || (r.uid && r.uid.toLowerCase().includes(term)) );
    document.getElementById('adminTable').innerHTML = filtered.map(r=>`
      <tr>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);">${r.name||'-'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);">${r.role||'-'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);">${r.email||'-'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);">${r.rm||'-'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);font-family:monospace;">${r.uid}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);">${r.validated? '✅' : '⏳'}</td>
        <td style="padding:8px;border-bottom:1px solid var(--fiap-gray);font-family:monospace;">${r.deviceId}</td>
      </tr>
    `).join('');
  }
  window.adminExportJSON = function(){
    const data = { directory: adminReadDirectory(), timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'fiap-match-export.json'; a.click();
  }
  window.adminClearDirectory = function(){ if (!confirm('Tem certeza que deseja limpar o diretório local?')) return; localStorage.removeItem('fiapMatchDirectory'); adminRefresh(); }
}

// FIAP Match – app.js (Parte 3a/3)
// Match cards, ações (accept/reject/super) e estatísticas
if (!window.__FIAP_APP_PART3A__) {
  window.__FIAP_APP_PART3A__ = true;

  // ===== Match cards =====
  window.generateDemoProfiles = function(){
    const profiles = [
      { name: 'Ana Tech', role: 'STU', course: 'ADS', interests: ['IA','Web','Mobile'] },
      { name: 'Carlos Dev', role: 'VIS', interests: ['Games','Cloud','DevOps'] },
      { name: 'Marina UX', role: 'IC', project: 'Interface Inteligente', area: 'UX/UI' },
      { name: 'Pedro Cloud', role: 'CHL', project: 'Cloud Challenge', area: 'Infraestrutura' },
      { name: 'Julia Data', role: 'PRO', area: 'Ciência de Dados' },
      { name: 'Lucas Mobile', role: 'STA', function: 'Suporte Técnico' },
      { name: 'Beatriz AI', role: 'STU', course: 'Eng. Software', interests: ['IA','Machine Learning'] },
      { name: 'Rafael Game', role: 'VIS', interests: ['Games','Unity','3D'] },
      { name: 'Camila Cyber', role: 'IC', project: 'Segurança Digital', area: 'Cybersecurity' },
      { name: 'Gabriel Web', role: 'CHL', project: 'Web Challenge', area: 'Frontend' }
    ];
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      const roleInfo = state.roles[profile.role];
      state.users.push({
        id: 'demo_' + i,
        uid: generateUID(profile.role),
        name: profile.name,
        role: profile.role,
        roleName: roleInfo.name,
        course: profile.course || null,
        interests: profile.interests || null,
        project: profile.project || null,
        area: profile.area || null,
        function: profile.function || null,
        matchScore: Math.floor(Math.random() * 50) + 50,
        avatar: roleInfo.emoji,
        color: roleInfo.color
      });
    }
  }

  window.loadMatchCards = function(){
    const matchSection = document.getElementById('matchSection');
    if (!matchSection) return;
    matchSection.innerHTML = '';
    const cardsToShow = state.users.slice(state.currentCardIndex, state.currentCardIndex + 3);
    cardsToShow.reverse().forEach((user, index) => {
      const card = createMatchCard(user, index);
      matchSection.appendChild(card);
    });
    if (cardsToShow.length > 0) {
      setupCardDrag(matchSection.querySelector('.match-card:last-child'));
    }
  }

  window.createMatchCard = function(user, stackIndex){
    const card = document.createElement('div');
    card.className = 'match-card';
    card.style.zIndex = 3 - stackIndex;
    card.style.transform = `scale(${1 - stackIndex * 0.05}) translateY(${stackIndex * 10}px)`;
    card.dataset.userId = user.id;
    let roleInfo = '';
    let tags = [];
    if (user.role === 'STU') { roleInfo = user.course || 'Aluno FIAP'; tags = user.interests || []; }
    else if (user.role === 'VIS') { roleInfo = 'Visitante'; tags = user.interests || []; }
    else if (user.role === 'IC') { roleInfo = user.project || 'Iniciação Científica'; tags = [user.area || 'Pesquisa']; }
    else if (user.role === 'CHL') { roleInfo = user.project || 'Challenge'; tags = [user.area || 'Desafio']; }
    else if (user.role === 'PRO') { roleInfo = user.area || 'Professor'; tags = ['Mentoria']; }
    else if (user.role === 'STA') { roleInfo = user.function || 'Funcionário'; tags = ['Suporte']; }

    card.innerHTML = `
      <div class="match-card-content">
        <div class="match-card-header" style="background: linear-gradient(135deg, ${user.color} 0%, ${user.color}CC 100%);">
          <div class="match-avatar">${user.avatar}</div>
          <div class="match-score-badge" style="background:${user.color};color:#fff;">+${state.roles[user.role]?.points || 10}pts</div>
        </div>
        <div class="match-card-body">
          <div class="match-name">${user.name}</div>
          <div class="match-info" style="color:${user.color};font-weight:600;">${user.roleName}</div>
          <div class="match-info">${roleInfo}</div>
          <div class="match-tags">${tags.map(tag => `<span class="match-tag" style="background:${user.color};">${tag}</span>`).join('')}</div>
        </div>
      </div>
      <div class="action-buttons">
        <div class="action-btn btn-reject" onclick="rejectMatch()"><i class="fas fa-times"></i></div>
        <div class="action-btn btn-super" onclick="superMatch()"><i class="fas fa-star"></i></div>
        <div class="action-btn btn-accept" onclick="acceptMatch()"><i class="fas fa-heart"></i></div>
      </div>
    `;
    return card;
  }

  window.setupCardDrag = function(card){
    if (!card) return;
    let startX = 0, currentX = 0, startY = 0, currentY = 0;
    
    // Remove event listeners anteriores se existirem
    card.removeEventListener('touchstart', handleStart);
    card.removeEventListener('touchmove', handleMove);
    card.removeEventListener('touchend', handleEnd);
    card.removeEventListener('mousedown', handleStart);
    card.removeEventListener('mousemove', handleMove);
    card.removeEventListener('mouseup', handleEnd);
    card.removeEventListener('mouseleave', handleEnd);
    
    // Adiciona novos event listeners
    card.addEventListener('touchstart', handleStart, { passive: false });
    card.addEventListener('touchmove', handleMove, { passive: false });
    card.addEventListener('touchend', handleEnd);
    card.addEventListener('mousedown', handleStart);
    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseup', handleEnd);
    card.addEventListener('mouseleave', handleEnd);

    function handleStart(e){
      state.isDragging = true; card.classList.add('dragging');
      if (e.type === 'touchstart') { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }
      else { startX = e.clientX; startY = e.clientY; e.preventDefault(); }
    }
    function handleMove(e){
      if (!state.isDragging) return;
      if (e.type === 'touchmove') { currentX = e.touches[0].clientX - startX; currentY = e.touches[0].clientY - startY; }
      else { currentX = e.clientX - startX; currentY = e.clientY - startY; }
      card.style.transform = `translateX(${currentX}px) translateY(${currentY}px) rotate(${currentX * 0.1}deg)`;
      const opacity = 1 - Math.abs(currentX) / 300; card.style.opacity = opacity; e.preventDefault();
    }
    function handleEnd(){
      if (!state.isDragging) return; state.isDragging = false; card.classList.remove('dragging');
      if (Math.abs(currentX) > 100) { if (currentX > 0) acceptMatch(); else rejectMatch(); }
      else { card.style.transform = ''; card.style.opacity = ''; }
    }
  }

  // ===== Ações de match =====
  window.acceptMatch = function(){
    if (!state.currentUser?.validated) { showNotification?.('Valide seu cadastro no stand para pontuar.', 'error'); return; }
    const currentCard = document.querySelector('.match-card:last-child');
    const userId = currentCard ? currentCard.dataset.userId : null;
    const matchedUser = state.users.find(u => u.id === userId);
    if (matchedUser) {
      const points = state.roles[matchedUser.role] ? state.roles[matchedUser.role].points : 10;
      let badgeEarned = null; if (matchedUser.role === 'PRO') badgeEarned = 'MENTORIA_NEXT';
      const connection = { uid: matchedUser.uid || matchedUser.id, role: matchedUser.role, name: matchedUser.name, points, timestamp: new Date().toISOString() };
      state.currentUser.connections.push(connection); state.currentUser.matches++; state.currentUser.points += points; state.streak++;
      if (badgeEarned && !state.currentUser.badges.includes(badgeEarned)) { state.currentUser.badges.push(badgeEarned); showBadgeNotification?.(badgeEarned); }
      localStorage.setItem('fiapMatchUser', JSON.stringify(state.currentUser));
      updateStats(); celebrateAction?.('MATCH!', points);
    }
    animateCardExit('right'); setTimeout(()=>{ state.currentCardIndex++; loadMatchCards(); }, 300);
  }

  window.rejectMatch = function(){
    animateCardExit('left'); state.streak = 0; updateStats(); setTimeout(()=>{ state.currentCardIndex++; loadMatchCards(); }, 300);
  }

  window.superMatch = function(){
    const card = document.querySelector('.match-card:last-child'); if (card){ card.style.transform = 'scale(1.1)'; setTimeout(()=>{ card.style.transform=''; }, 200); }
    state.currentUser.matches++; state.currentUser.points += 25; state.streak += 2; updateStats(); celebrateAction?.('SUPER MATCH!', 25);
    try { confetti?.({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#ED145B', '#FFFFFF', '#1E1E1E'] }); } catch(e) {}
    setTimeout(()=>{ animateCardExit('up'); setTimeout(()=>{ state.currentCardIndex++; loadMatchCards(); }, 300); }, 500);
  }

  window.animateCardExit = function(direction){
    const card = document.querySelector('.match-card:last-child'); if (!card) return;
    let transform = ''; if (direction==='left') transform = 'translateX(-150%) rotate(-30deg)'; else if (direction==='right') transform = 'translateX(150%) rotate(30deg)'; else if (direction==='up') transform = 'translateY(-150%) scale(0.5)';
    card.style.transform = transform; card.style.opacity = '0';
  }

  // ===== Stats =====
  window.updateStats = function(){
    const p=document.getElementById('userPoints'), s=document.getElementById('userStreak'), m=document.getElementById('userMatches'), r=document.getElementById('userRank');
    if (p) p.textContent = state.currentUser.points;
    if (s) s.textContent = state.streak;
    if (m) m.textContent = state.currentUser.matches;
    const rank = calculateRank(); if (r) r.textContent = '#' + rank; state.currentUser.rank = rank;
  }

  window.calculateRank = function(){
    if (state.currentUser.points > 500) return 1;
    if (state.currentUser.points > 300) return 2;
    if (state.currentUser.points > 200) return 3;
    if (state.currentUser.points > 100) return Math.floor(Math.random() * 10) + 4;
    return Math.floor(Math.random() * 50) + 10;
  }
}

