// Responses (Project Requests) page logic
document.addEventListener('DOMContentLoaded', () => {

  const REQUESTS_KEY = 'bb_requests_v1';
  const NOTIFICATIONS_KEY = 'bb_notifications_v1';

  function readRequests(){
    try{ return JSON.parse(localStorage.getItem(REQUESTS_KEY) || '[]'); }catch(_){ return []; }
  }
  function writeRequests(list){ localStorage.setItem(REQUESTS_KEY, JSON.stringify(list)); }
  function readNotifications(){
    try{ return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]'); }catch(_){ return []; }
  }
  function writeNotifications(list){ localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list)); }
  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function nowIso(){ return new Date().toISOString(); }
  function formatDate(iso){
    const d = new Date(iso);
    return d.toLocaleString();
  }

  // EmailJS init
  emailjs.init("4sko7CJlXxvwGuQQ_"); // replace with your public key

  function sendEmail(params){
    emailjs.send("service_zpaoetg","template_btr5mds",params)
      .then(()=>console.log("Email sent ✅"))
      .catch(err=>console.error("Email failed ❌", err));
  }

  // Elements
  const newRequestBtn = document.getElementById('newRequestBtn');
  const fabCreateRequest = document.getElementById('fabCreateRequest');
  const modal = document.getElementById('projectModal');
  const modalClose = document.getElementById('modalClose');
  const modalCancel = document.getElementById('modalCancel');
  const projectForm = document.getElementById('projectForm');

  function openModal(){
    if(!modal) return;
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
    const first = modal.querySelector('input, textarea, select');
    if(first) first.focus();
  }
  function closeModal(){
    if(!modal) return;
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }
  if(newRequestBtn) newRequestBtn.addEventListener('click', openModal);
  if(fabCreateRequest) fabCreateRequest.addEventListener('click', openModal);
  if(modalClose) modalClose.addEventListener('click', closeModal);
  if(modalCancel) modalCancel.addEventListener('click', closeModal);
  if(modal) modal.addEventListener('click', (e)=>{ if(e.target===modal) closeModal(); });

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
  }

function renderRequests(){
  const list = readRequests();
  const tbody = document.getElementById('requestsTbody');
  const empty = document.getElementById('requestsEmpty');
  const table = document.getElementById('requestsTable');
  if(!tbody || !empty || !table) return;
  tbody.innerHTML = '';
  if(list.length===0){
    empty.style.display = '';
    table.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  table.style.display = '';
  list.forEach(r=>{
    const tr = document.createElement('tr');
    const nameTd = document.createElement('td');
    nameTd.textContent = r.projectName || 'Untitled';
    nameTd.setAttribute('data-label','Project Name');
    const numTd = document.createElement('td');
    numTd.textContent = r.projectNumber || '-';
    numTd.setAttribute('data-label','Project Number');
    const twRefTd = document.createElement('td');
    twRefTd.textContent = r.twRef || '-';
    twRefTd.setAttribute('data-label','TW Ref');
    const revisionTd = document.createElement('td');
    revisionTd.textContent = r.revision || '-';
    revisionTd.setAttribute('data-label','Revision');
    const locationTd = document.createElement('td');
    locationTd.textContent = r.location || '-';
    locationTd.setAttribute('data-label','Location');
    const clientTd = document.createElement('td');
    clientTd.textContent = r.client || '-';
    clientTd.setAttribute('data-label','Client');
    const sectorTd = document.createElement('td');
    sectorTd.textContent = r.sector || '-';
    sectorTd.setAttribute('data-label','Sector');
    const taskCodeTd = document.createElement('td');
    taskCodeTd.textContent = r.taskCode || '-';
    taskCodeTd.setAttribute('data-label','Task Code');
    const bbManagerTd = document.createElement('td');
    bbManagerTd.textContent = r.bbManager || '-';
    bbManagerTd.setAttribute('data-label','BB Manager');
    const siteContactTd = document.createElement('td');
    siteContactTd.textContent = r.siteContactName || '-';
    siteContactTd.setAttribute('data-label','Site Contact');
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
        const all = readRequests();
        writeRequests(all.filter(req=>req.id!==r.id));
        renderRequests();
      }
    });
    actionsTd.appendChild(delBtn);
    tr.appendChild(nameTd);
    tr.appendChild(numTd);
    tr.appendChild(twRefTd);
    tr.appendChild(revisionTd);
    tr.appendChild(locationTd);
    tr.appendChild(clientTd);
    tr.appendChild(sectorTd);
    tr.appendChild(taskCodeTd);
    tr.appendChild(bbManagerTd);
    tr.appendChild(siteContactTd);
    tr.appendChild(statusTd);
    tr.appendChild(createdTd);
    tr.appendChild(actionsTd);
    tbody.appendChild(tr);
  });
}

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
  
  const list = readRequests();
  const request = {
    id: uid(),
    ...obj,
    status: 'Pending',
    createdAt: nowIso(),
    userEmail: 'anonymous@example.com'
  };
  list.unshift(request);
  writeRequests(list);

  // Prepare EmailJS parameters
  const emailParams = {
    to_email: "grootwar8@gmail.com",
    from_name: obj.projectName || 'Anonymous',
    projectName: obj.projectName || '',
    projectNumber: obj.projectNumber || '',
    twRef: obj.twRef || '',
    revision: obj.revision || '',
    location: obj.location || '',
    client: obj.client || '',
    sector: obj.sector || '',
    taskCode: obj.taskCode || '',
    bbManager: obj.bbManager || '',
    siteContactName: obj.siteContactName || '',
    siteContactTel: obj.siteContactTel || '',
    purpose: obj.purpose || '',
    scope: obj.scope || '',
    deliverables: obj.deliverables || '',
    createdAt: new Date().toLocaleString()
  };

  sendEmail(emailParams);
  
  addNotification({
    title: 'New Project Request',
    message: `Project "${obj.projectName || 'Untitled'}" has been submitted successfully.`,
    type: 'success'
  });
  
  projectForm.reset();
  closeModal();
  renderRequests();
});

// initial render
renderRequests();

});


