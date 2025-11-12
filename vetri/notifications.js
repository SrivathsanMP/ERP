// Notifications page logic
const NOTIFICATIONS_KEY = 'bb_notifications_v1';
function readNotifications(){
  try{ return JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '[]'); }catch(_){ return []; }
}
function writeNotifications(list){ localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list)); }
function nowIso(){ return new Date().toISOString(); }
function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

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

function markNotificationRead(id){
  const list = readNotifications();
  const idx = list.findIndex(n=>n.id===id);
  if(idx>=0){
    list[idx].read = true;
    writeNotifications(list);
    renderNotifications();
  }
}
function deleteNotification(id){
  const list = readNotifications().filter(n=>n.id!==id);
  writeNotifications(list);
  renderNotifications();
}
function markAllNotificationsRead(){
  const list = readNotifications();
  list.forEach(n=>{ n.read = true; });
  writeNotifications(list);
  renderNotifications();
}

const markAllReadBtn = document.getElementById('markAllReadBtn');
if(markAllReadBtn) markAllReadBtn.addEventListener('click', markAllNotificationsRead);


