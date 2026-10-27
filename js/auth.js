(() => {
  const USERS_KEY = 'qirqim.users';
  const SESSION_KEY = 'qirqim.session';
  const form = document.querySelector('#auth-form');
  const errorBox = document.querySelector('#auth-error');
  const nameField = document.querySelector('#name-field');
  const tabs = [...document.querySelectorAll('.auth-tab')];
  const submit = document.querySelector('.auth-submit');
  const password = form.elements.password;
  let mode = 'login';

  try {
    if (localStorage.getItem(SESSION_KEY)) location.replace('Index.html');
  } catch { showError('Brauzer xotirasiga kirib bo‘lmadi. Maxfiy ko‘rish rejimini tekshiring.'); }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  function setMode(nextMode) {
    mode = nextMode;
    const registering = mode === 'register';
    nameField.hidden = !registering;
    nameField.querySelector('input').required = registering;
    password.autocomplete = registering ? 'new-password' : 'current-password';
    submit.firstChild.textContent = registering ? 'Hisob yaratish ' : 'Kirish ';
    errorBox.hidden = true;
    tabs.forEach(tab => {
      const active = tab.dataset.mode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));
  document.querySelector('.password-toggle').addEventListener('click', event => {
    const visible = password.type === 'text';
    password.type = visible ? 'password' : 'text';
    event.currentTarget.textContent = visible ? 'Ko‘rsatish' : 'Yashirish';
    event.currentTarget.setAttribute('aria-label', visible ? 'Parolni ko‘rsatish' : 'Parolni yashirish');
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    errorBox.hidden = true;
    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim().toLowerCase();
    const pass = password.value;
    if (mode === 'register' && !name) return showError('Ismingizni kiriting.');
    if (!email) return showError('Email manzilingizni kiriting.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError('Email manzili formati noto‘g‘ri.');
    if (pass.length < 6) return showError('Parol kamida 6 belgidan iborat bo‘lishi kerak.');

    try {
      const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
      let user;
      if (mode === 'register') {
        if (users.some(item => item.email === email)) return showError('Bu email bilan hisob allaqachon mavjud. Kirish bo‘limidan foydalaning.');
        user = { name, email, password: pass };
        users.push(user);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      } else {
        user = users.find(item => item.email === email && item.password === pass);
        if (!user) return showError('Email yoki parol mos kelmadi.');
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
      location.replace('Index.html');
    } catch {
      showError('Ma’lumotlarni saqlab bo‘lmadi. Brauzer xotirasi yoqilganini tekshiring.');
    }
  });
})();