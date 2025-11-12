// Tickets page logic (storage + UI)
const TICKETS_KEY = 'bb_tickets_v1';
function readTickets(){
  try{ return JSON.parse(localStorage.getItem(TICKETS_KEY) || '[]'); }catch(_){ return []; }
}
function writeTickets(list){ localStorage.setItem(TICKETS_KEY, JSON.stringify(list)); }
function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
function nowIso(){ return new Date().toISOString(); }

const ticketsTbody = document.getElementById('ticketsTbody');
const ticketsEmpty = document.getElementById('ticketsEmpty');
const newTicketBtn = document.getElementById('newTicketBtn');
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
  if (ticketForm) ticketForm.reset();
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
  ticketsTbody.innerHTML = '';
  if(list.length===0){
    if(ticketsEmpty) ticketsEmpty.style.display = '';
    return;
  } else {
    if(ticketsEmpty) ticketsEmpty.style.display = 'none';
  }
  list.forEach(t=>{
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
}
function updateTicketStatus(id, status){
  const list = readTickets();
  const idx = list.findIndex(t=>t.id===id);
  if(idx>=0){
    list[idx].status = status;
    list[idx].updatedAt = nowIso();
    writeTickets(list);
    renderTickets();
  }
}
function deleteTicket(id){
  const list = readTickets().filter(t=>t.id!==id);
  writeTickets(list);
  renderTickets();
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


