// =============================================
//  LOGIN · FUT 7 EL JAGUAR
// =============================================

const usuarios = [
  { usuario: "Rosalia",   password: "cha30lia1025*" },
  { usuario: "Rosario",   password: "cha31ris1025*" },
  { usuario: "Guadalupe", password: "gua01da1125*"  }
];

const form   = document.getElementById('loginForm');
const pwEl   = document.getElementById('password');
const eyeBtn = document.getElementById('eyeBtn');
const msgEl  = document.getElementById('msgEl');
const msgTxt = document.getElementById('msgTxt');

// Toggle contraseña
eyeBtn.addEventListener('click', () => {
  const show = pwEl.type === 'password';
  pwEl.type  = show ? 'text' : 'password';
  eyeBtn.textContent = show ? '🙈' : '👁️';
});

// Mostrar error
function showErr(texto) {
  msgTxt.textContent = texto;
  msgEl.classList.add('show');
  setTimeout(() => msgEl.classList.remove('show'), 4000);
}

// Submit
form.addEventListener('submit', e => {
  e.preventDefault();
  const u = document.getElementById('usuario').value.trim();
  const p = pwEl.value;

  if (!u || !p) { showErr('Completa usuario y contraseña'); return; }

  const ok = usuarios.find(x => x.usuario === u && x.password === p);

  if (ok) {
    window.location.href = '../menu/menu.html';
  } else {
    showErr('Usuario o contraseña incorrectos');
    document.getElementById('usuario').value = '';
    pwEl.value = '';
    document.getElementById('usuario').focus();
  }
});