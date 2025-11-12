// Firebase and global UI (sidebar/auth) shared across pages
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

// Sidebar and topbar elements may not exist on every page; guard accesses
const sidebar = document.getElementById('sidebar');
const menuBtn = document.getElementById('menuBtn');
const greeting = document.getElementById('greeting');
const profileName = document.getElementById('profileName');
const profileRole = document.getElementById('profileRole');
const profilePic = document.getElementById('profilePic');
const sidebarLoginLogoutBtn = document.getElementById('sidebarLoginLogoutBtn');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => { sidebar.classList.toggle('active'); });
}

function loginWithGoogle(){
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider).catch(e => alert(e.message));
}
function logoutUser(){
  auth.signOut().catch(e => console.error(e));
}
if (sidebarLoginLogoutBtn) {
  sidebarLoginLogoutBtn.addEventListener('click', () => { if(auth.currentUser) logoutUser(); else loginWithGoogle(); });
}

auth.onAuthStateChanged(user => {
  if (greeting) greeting.textContent = 'BALFOUR BEATTY';
  if (user) {
    if (profileName) profileName.textContent = user.displayName || (user.email && user.email.split('@')[0]) || 'User';
    if (profileRole) profileRole.textContent = 'Engineer';
    if (profilePic) profilePic.src = user.photoURL || 'https://via.placeholder.com/80';
    if (sidebar) sidebar.classList.add('active');
    if (sidebarLoginLogoutBtn) {
      const lbl = sidebarLoginLogoutBtn.querySelector('.label');
      if (lbl) lbl.textContent = 'Logout';
    }
  } else {
    if (profileName) profileName.textContent = 'Guest';
    if (profileRole) profileRole.textContent = 'Visitor';
    if (profilePic) profilePic.src = 'https://via.placeholder.com/80';
    if (sidebar) sidebar.classList.remove('active');
    if (sidebarLoginLogoutBtn) {
      const lbl = sidebarLoginLogoutBtn.querySelector('.label');
      if (lbl) lbl.textContent = 'Login with Google';
    }
  }
});

// Highlight active nav based on current page
function setActiveNav() {
  const path = (location.pathname || '').toLowerCase();
  const map = [
    { id: 'navDashboard', match: 'dashboard.html' },
    { id: 'navResponse', match: 'responses.html' },
    { id: 'navNotification', match: 'notifications.html' },
    { id: 'navTicket', match: 'tickets.html' }
  ];
  map.forEach(item => {
    const el = document.getElementById(item.id);
    if (!el) return;
    if (path.endsWith(item.match)) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}
setActiveNav();


