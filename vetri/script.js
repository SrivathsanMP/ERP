const firebaseConfig = {
    apiKey: "AIzaSyDyTHwlDmPhq4qiU0200TYzPKfkzX9qarQ",
    authDomain: "intern-4b83d.firebaseapp.com",
    projectId: "intern-4b83d",
    storageBucket: "intern-4b83d.firebasestorage.app",
    messagingSenderId: "302858789209",
    appId: "1:302858789209:web:909d9df262d0bd65f8ac48",
    measurementId: "G-884PTJNJWE"
  };
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('menuBtn');
  const greeting = document.getElementById('greeting');
  const profileName = document.getElementById('profileName');
  const profileRole = document.getElementById('profileRole');
  const profilePic = document.getElementById('profilePic');
  const sidebarLoginLogoutBtn = document.getElementById('sidebarLoginLogoutBtn');
  
  menuBtn.addEventListener('click', () => { sidebar.classList.toggle('active'); });
  
  document.getElementById('navDashboard').addEventListener('click', () => { if(typeof showPage==='function') showPage('dashboard'); });
  document.getElementById('navResponse').addEventListener('click', () => { if(typeof showPage==='function') showPage('requests'); });
  document.getElementById('navNotification').addEventListener('click', () => { if(typeof showPage==='function') showPage('notifications'); });
  document.getElementById('navTicket').addEventListener('click', () => { if(typeof showPage==='function') showPage('tickets'); });
  
  function loginWithGoogle(){ const provider = new firebase.auth.GoogleAuthProvider(); auth.signInWithPopup(provider).catch(e => alert(e.message)); }
  function logoutUser(){ auth.signOut().catch(e => console.error(e)); }
  
  sidebarLoginLogoutBtn.addEventListener('click', () => { if(auth.currentUser) logoutUser(); else loginWithGoogle(); });
  
  auth.onAuthStateChanged(user => {
    if (user) {
      greeting.textContent = 'BALFOUR BEATTY';
      profileName.textContent = user.displayName || (user.email && user.email.split('@')[0]) || 'User';
      profileRole.textContent = 'Engineer';
      profilePic.src = user.photoURL || 'https://via.placeholder.com/80';
      sidebar.classList.add('active');
      sidebarLoginLogoutBtn.querySelector('.label').textContent = 'Logout';
    } else {
      greeting.textContent = 'BALFOUR BEATTY';
      profileName.textContent = 'Guest';
      profileRole.textContent = 'Visitor';
      profilePic.src = 'https://via.placeholder.com/80';
      sidebar.classList.remove('active');
      sidebarLoginLogoutBtn.querySelector('.label').textContent = 'Login with Google';
    }
  });
  
  sidebar.classList.remove('active'); // Remove this line to keep sidebar open by default for now
  
  // --- Page switching for Dashboard/Tickets/Requests/Notifications ---
  const dashboardContainer = document.querySelector('.dashboard-container');
  const ticketsPage = document.getElementById('ticketsPage');
  const requestsPage = document.getElementById('requestsPage');
  const notificationsPage = document.getElementById('notificationsPage');
  function showPage(page){
    // Hide all pages first
    if(dashboardContainer) dashboardContainer.style.display = 'none';
    if(ticketsPage) ticketsPage.style.display = 'none';
    if(requestsPage) requestsPage.style.display = 'none';
    if(notificationsPage) notificationsPage.style.display = 'none';
    
    const fabBtn = document.querySelector('.create-request-btn');
    
    if(page==='tickets'){
      if(ticketsPage) ticketsPage.style.display = '';
      if(typeof renderTickets==='function') renderTickets();
      if(fabBtn) fabBtn.style.display = 'none';
    }else if(page==='requests'){
      if(requestsPage) requestsPage.style.display = '';
      if(typeof renderRequests==='function') renderRequests();
      if(fabBtn) fabBtn.style.display = 'none';
    }else if(page==='notifications'){
      if(notificationsPage) notificationsPage.style.display = '';
      if(typeof renderNotifications==='function') renderNotifications();
      if(fabBtn) fabBtn.style.display = 'none';
    }else{
      // Dashboard
      if(dashboardContainer) dashboardContainer.style.display = '';
      window.scrollTo({top:0, behavior:'smooth'});
      if(fabBtn) fabBtn.style.display = '';
    }
  }
  
  // --- Tickets: storage helpers ---
  const TICKETS_KEY = 'bb_tickets_v1';
  function readTickets(){
    try{ return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'); }catch(_){ return []; }
  }
  function writeTickets(list){ localStorage.setItem(TICKETS_KEY, JSON.stringify(list)); }
  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function nowIso(){ return new Date().toISOString(); }
  
  // --- Tickets UI elements ---
  const ticketsTbody = document.getElementById('ticketsTbody');
  const ticketsEmpty = document.getElementById('ticketsEmpty');
  const ticketStatusFilter = document.getElementById('ticketStatusFilter');
  const ticketPriorityFilter = document.getElementById('ticketPriorityFilter');
  const ticketSearch = document.getElementById('ticketSearch');
  const newTicketBtn = document.getElementById('newTicketBtn');
  
  // --- Ticket Modal controls ---
  const ticketModal = document.getElementById('ticketModal');
  const ticketModalClose = document.getElementById('ticketModalClose');
  const ticketModalCancel = document.getElementById('ticketModalCancel');
  const ticketForm = document.getElementById('ticketForm');
  const ticketTitle = document.getElementById('ticketTitle');
  const ticketDescription = document.getElementById('ticketDescription');
  const ticketPriority = document.getElementById('ticketPriority');
  const ticketCategory = document.getElementById('ticketCategory');
  
  function openTicketModal(){
    if(!ticketModal) return;
    ticketForm.reset();
    ticketModal.style.display = 'flex';
    ticketModal.setAttribute('aria-hidden','false');
    if(ticketTitle) ticketTitle.focus();
  }
  function closeTicketModal(){
    if(!ticketModal) return;
    ticketModal.style.display = 'none';
    ticketModal.setAttribute('aria-hidden','true');
  }
  if(newTicketBtn) newTicketBtn.addEventListener('click', openTicketModal);
  if(ticketModalClose) ticketModalClose.addEventListener('click', closeTicketModal);
  if(ticketModalCancel) ticketModalCancel.addEventListener('click', closeTicketModal);
  if(ticketModal) ticketModal.addEventListener('click', (e)=>{ if(e.target===ticketModal) closeTicketModal(); });
  
  function formatDate(iso){
    const d = new Date(iso);
    return d.toLocaleString();
  }
  function statusBadgeClass(status){
    if(status==='open') return 'status-badge status-open';
    if(status==='inprogress') return 'status-badge status-inprogress';
    if(status==='resolved') return 'status-badge status-resolved';
    return 'status-badge status-closed';
  }
  function renderTickets(){
    if(!ticketsTbody) return;
    const list = readTickets();
    const s = (ticketStatusFilter && ticketStatusFilter.value) || 'all';
    const p = (ticketPriorityFilter && ticketPriorityFilter.value) || 'all';
    const q = (ticketSearch && ticketSearch.value.toLowerCase()) || '';
    const filtered = list.filter(t=>{
      const statusOk = s==='all' ? true : t.status===s;
      const priorityOk = p==='all' ? true : t.priority===p;
      const qOk = q ? (t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : true;
      return statusOk && priorityOk && qOk;
    });
    ticketsTbody.innerHTML = '';
    if(filtered.length===0){
      if(ticketsEmpty) ticketsEmpty.style.display = '';
      return;
    } else {
      if(ticketsEmpty) ticketsEmpty.style.display = 'none';
    }
    filtered.forEach(t=>{
      const tr = document.createElement('tr');
      const titleTd = document.createElement('td');
      titleTd.textContent = t.title;
      titleTd.setAttribute('data-label','Title');
      const statusTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = statusBadgeClass(t.status);
      badge.textContent = t.status === 'inprogress' ? 'In Progress' : t.status.charAt(0).toUpperCase() + t.status.slice(1);
      statusTd.appendChild(badge);
      statusTd.setAttribute('data-label','Status');
      const priorityTd = document.createElement('td');
      priorityTd.textContent = t.priority.charAt(0).toUpperCase() + t.priority.slice(1);
      priorityTd.className = `priority-${t.priority}`;
      priorityTd.setAttribute('data-label','Priority');
      const createdTd = document.createElement('td');
      createdTd.textContent = formatDate(t.createdAt);
      createdTd.setAttribute('data-label','Created');
      const updatedTd = document.createElement('td');
      updatedTd.textContent = formatDate(t.updatedAt);
      updatedTd.setAttribute('data-label','Updated');
      const actionsTd = document.createElement('td');
      actionsTd.className = 'ticket-actions';
      actionsTd.setAttribute('data-label','Actions');
  
      const statusSelect = document.createElement('select');
      ['open','inprogress','resolved','closed'].forEach(s=>{
        const opt = document.createElement('option');
        opt.value = s; opt.textContent = s==='inprogress'?'In Progress':(s.charAt(0).toUpperCase()+s.slice(1));
        if(s===t.status) opt.selected = true;
        statusSelect.appendChild(opt);
      });
      statusSelect.addEventListener('change', ()=>{
        updateTicketStatus(t.id, statusSelect.value);
      });
  
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-ghost';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', ()=>{
        deleteTicket(t.id);
      });
  
      actionsTd.appendChild(statusSelect);
      actionsTd.appendChild(delBtn);
  
      tr.appendChild(titleTd);
      tr.appendChild(statusTd);
      tr.appendChild(priorityTd);
      tr.appendChild(createdTd);
      tr.appendChild(updatedTd);
      tr.appendChild(actionsTd);
      ticketsTbody.appendChild(tr);
    });
  }
  
  function addTicket({title, description, priority, category}){
    const list = readTickets();
    const ticket = {
      id: uid(),
      title,
      description,
      priority,
      category: category || '',
      status: 'open',
      createdAt: nowIso(),
      updatedAt: nowIso()
    };
    list.unshift(ticket);
    writeTickets(list);
    renderTickets();
    updateOpenTicketCount();
  }
  function updateTicketStatus(id, status){
    const list = readTickets();
    const idx = list.findIndex(t=>t.id===id);
    if(idx>=0){
      list[idx].status = status;
      list[idx].updatedAt = nowIso();
      writeTickets(list);
      renderTickets();
      updateOpenTicketCount();
    }
  }
  function deleteTicket(id){
    const list = readTickets().filter(t=>t.id!==id);
    writeTickets(list);
    renderTickets();
    updateOpenTicketCount();
  }
  
  if(ticketForm){
    ticketForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const title = ticketTitle && ticketTitle.value.trim();
      const description = ticketDescription && ticketDescription.value.trim();
      const priority = ticketPriority && ticketPriority.value;
      const category = ticketCategory && ticketCategory.value.trim();
      if(!title || !description){ alert('Please enter title and description'); return; }
      addTicket({title, description, priority, category});
      closeTicketModal();
      ticketForm.reset();
    });
  }
  
  if(ticketStatusFilter) ticketStatusFilter.addEventListener('change', renderTickets);
  if(ticketPriorityFilter) ticketPriorityFilter.addEventListener('change', renderTickets);
  if(ticketSearch) ticketSearch.addEventListener('input', ()=>{ renderTickets(); });
  
  function updateOpenTicketCount(){
    const count = readTickets().filter(t=>t.status==='open' || t.status==='inprogress').length;
    const statCards = document.querySelectorAll('.stat-card .stat-title');
    statCards.forEach((el)=>{
      if(el.textContent && el.textContent.trim()==='Open Tickets'){
        const valueEl = el.parentElement && el.parentElement.querySelector('.stat-value');
        if(valueEl) valueEl.textContent = String(count);
      }
    });
  }
  updateOpenTicketCount();
  
  // --- Project Request Modal and FAB ---
  const fab = document.querySelector('.create-request-btn');
  document.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset || document.documentElement.scrollTop;
    if(fab) fab.style.bottom = `${Math.max(16, 24 - scrolled)}px`;
  });
  
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const projectForm = document.getElementById('projectForm');
  
  function openModal(){ if(!modal) return; modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false'); const first = modal.querySelector('input, textarea, select'); if(first) first.focus(); }
  function closeModal(){ if(!modal) return; modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); }
  
  if(document.querySelector('.create-request-btn')) document.querySelector('.create-request-btn').addEventListener('click', openModal);
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalCancel) modalCancel.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });
  
  // --- Requests: storage and rendering ---
  const REQUESTS_KEY = 'bb_requests_v1';
  function readRequests(){
    try{ return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]'); }catch(_){ return []; }
  }
  function writeRequests(list){ localStorage.setItem(REQUESTS_KEY, JSON.stringify(list)); }
  
  function renderRequests(){
    const list = readRequests();
    const currentUser = auth.currentUser;
    const userEmail = currentUser ? (currentUser.email || currentUser.uid) : null;
    
    // Filter requests by current user
    const userRequests = userEmail ? list.filter(r => r.userEmail === userEmail) : [];
    
    const tbody = document.getElementById('requestsTbody');
    const empty = document.getElementById('requestsEmpty');
    const table = document.getElementById('requestsTable');
    if(!tbody || !empty || !table) return;
    tbody.innerHTML = '';
    if(userRequests.length===0){
      empty.style.display = '';
      table.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    table.style.display = '';
    userRequests.forEach(r=>{
      const tr = document.createElement('tr');
      const nameTd = document.createElement('td');
      nameTd.textContent = r.projectName || 'Untitled';
      nameTd.setAttribute('data-label','Project Name');
      const numTd = document.createElement('td');
      numTd.textContent = r.projectNumber || '-';
      numTd.setAttribute('data-label','Project Number');
      const statusTd = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = 'status-badge status-open';
      badge.textContent = r.status || 'Pending';
      statusTd.appendChild(badge);
      statusTd.setAttribute('data-label','Status');
      const createdTd = document.createElement('td');
      createdTd.textContent = formatDate(r.createdAt || new Date().toISOString());
      createdTd.setAttribute('data-label','Created');
      const actionsTd = document.createElement('td');
      actionsTd.className = 'ticket-actions';
      actionsTd.setAttribute('data-label','Actions');
      const delBtn = document.createElement('button');
      delBtn.className = 'btn-ghost';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', ()=>{
        if(confirm('Delete this request?')){
          const currentUser = auth.currentUser;
          const userEmail = currentUser ? (currentUser.email || currentUser.uid) : null;
          if(!userEmail || r.userEmail !== userEmail){
            alert('You can only delete your own requests.');
            return;
          }
          const list = readRequests();
          writeRequests(list.filter(req=>req.id!==r.id));
          renderRequests();
        }
      });
      actionsTd.appendChild(delBtn);
      tr.appendChild(nameTd);
      tr.appendChild(numTd);
      tr.appendChild(statusTd);
      tr.appendChild(createdTd);
      tr.appendChild(actionsTd);
      tbody.appendChild(tr);
    });
  }
  
  function addRequest(data){
    const list = readRequests();
    const currentUser = auth.currentUser;
    const userEmail = currentUser ? (currentUser.email || currentUser.uid) : null;
    
    const request = {
      id: uid(),
      ...data,
      status: 'pending',
      createdAt: nowIso(),
      userEmail: userEmail // Store the user's email/UID
    };
    list.unshift(request);
    writeRequests(list);
    renderRequests();
    // Create notification
    addNotification({
      title: 'New Project Request',
      message: `Project "${data.projectName || 'Untitled'}" has been submitted successfully.`,
      type: 'success'
    });
  }
  
  // --- Notifications: storage and rendering ---
  const NOTIFICATIONS_KEY = 'bb_notifications_v1';
  function readNotifications(){
    try{ return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]'); }catch(_){ return []; }
  }
  function writeNotifications(list){ localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list)); }
  
  function renderNotifications(){
    const list = readNotifications();
    const container = document.getElementById('notificationsList');
    const empty = document.getElementById('notificationsEmpty');
    if(!container || !empty) return;
    container.innerHTML = '';
    if(list.length===0){
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    list.forEach(n=>{
      const item = document.createElement('div');
      item.className = `notification-item ${n.read ? '' : 'unread'}`;
      const icon = document.createElement('div');
      icon.className = 'notification-icon';
      icon.textContent = n.type === 'success' ? '✓' : n.type === 'error' ? '✕' : 'ℹ';
      const content = document.createElement('div');
      content.className = 'notification-content';
      const title = document.createElement('div');
      title.className = 'notification-title';
      title.textContent = n.title;
      const message = document.createElement('div');
      message.className = 'notification-message';
      message.textContent = n.message;
      const time = document.createElement('div');
      time.className = 'notification-time';
      time.textContent = formatDate(n.createdAt);
      content.appendChild(title);
      content.appendChild(message);
      content.appendChild(time);
      const actions = document.createElement('div');
      actions.className = 'notification-actions';
      if(!n.read){
        const markReadBtn = document.createElement('button');
        markReadBtn.textContent = 'Mark as Read';
        markReadBtn.addEventListener('click', ()=>{
          markNotificationRead(n.id);
        });
        actions.appendChild(markReadBtn);
      }
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', ()=>{
        deleteNotification(n.id);
      });
      actions.appendChild(delBtn);
      item.appendChild(icon);
      item.appendChild(content);
      item.appendChild(actions);
      container.appendChild(item);
    });
  }
  
  function addNotification({title, message, type='info'}){
    const list = readNotifications();
    const notification = {
      id: uid(),
      title,
      message,
      type,
      read: false,
      createdAt: nowIso()
    };
    list.unshift(notification);
    writeNotifications(list);
    renderNotifications();
  }
  
  function markNotificationRead(id){
    const list = readNotifications();
    const idx = list.findIndex(n=>n.id===id);
    if(idx>=0){
      list[idx].read = true;
      writeNotifications(list);
      renderNotifications();
    }
  }
  
  function markAllNotificationsRead(){
    const list = readNotifications();
    list.forEach(n=>{ n.read = true; });
    writeNotifications(list);
    renderNotifications();
  }
  
  function deleteNotification(id){
    const list = readNotifications();
    writeNotifications(list.filter(n=>n.id!==id));
    renderNotifications();
  }
  
  // Wire up request page buttons
  const newRequestBtn = document.getElementById('newRequestBtn');
  if(newRequestBtn) newRequestBtn.addEventListener('click', openModal);
  
  // Wire up notification page buttons
  const markAllReadBtn = document.getElementById('markAllReadBtn');
  if(markAllReadBtn) markAllReadBtn.addEventListener('click', markAllNotificationsRead);
  
  if(projectForm) projectForm.addEventListener('submit', (e)=>{
    e.preventDefault(); 
    const data = new FormData(projectForm); 
    const obj = {}; 
    data.forEach((v,k)=> {
      if(k==='documents'){
        const fileInput = document.getElementById('documents');
        const files = fileInput && fileInput.files ? Array.from(fileInput.files).map(f=>f.name) : [];
        obj[k] = files;
      } else {
        obj[k]=v;
      }
    }); 
    addRequest(obj);
    projectForm.reset();
    closeModal();
  });
  
  closeModal();