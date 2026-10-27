(() => {
  const SESSION_KEY = 'qirqim.session';
  const POSTS_KEY = 'qirqim.posts';
  const THEME_KEY = 'qirqim.theme';
  const categories = ['Barchasi', 'Fade', 'Undercut', 'Klassik', 'Soqol', 'Bolalar uchun'];
  const seedPosts = [
    { id: 'demo-1', title: 'Low Fade + Texture', category: 'Fade', author: 'Azizbek Karimov', avatar: 'A', time: '2 soat oldin', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=85', likes: ['demo@qirqim.uz', 'guest@qirqim.uz', 'style@qirqim.uz'], comments: [] },
    { id: 'demo-2', title: 'Klassik taper', category: 'Klassik', author: 'Jasur Olimov', avatar: 'J', time: '5 soat oldin', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85', likes: ['guest@qirqim.uz', 'style@qirqim.uz'], comments: [] },
    { id: 'demo-3', title: 'Sharp undercut', category: 'Undercut', author: 'Bekzod Rahimov', avatar: 'B', time: 'Kecha', image: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=85', likes: ['demo@qirqim.uz', 'style@qirqim.uz'], comments: [] },
    { id: 'demo-4', title: 'Soqol konturi', category: 'Soqol', author: 'Azizbek Karimov', avatar: 'A', time: 'Kecha', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=85', likes: ['guest@qirqim.uz'], comments: [] },
    { id: 'demo-5', title: 'Modern pompadour', category: 'Klassik', author: 'Jasur Olimov', avatar: 'J', time: '2 kun oldin', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=85', likes: ['demo@qirqim.uz', 'guest@qirqim.uz', 'style@qirqim.uz', 'hello@qirqim.uz'], comments: [] },
    { id: 'demo-6', title: 'Skin fade', category: 'Fade', author: 'Bekzod Rahimov', avatar: 'B', time: '3 kun oldin', image: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=900&q=85', likes: ['demo@qirqim.uz', 'guest@qirqim.uz'], comments: [] },
    { id: 'demo-7', title: 'Kichik gentleman', category: 'Bolalar uchun', author: 'Azizbek Karimov', avatar: 'A', time: '4 kun oldin', image: 'https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=900&q=85', likes: ['style@qirqim.uz'], comments: [] },
    { id: 'demo-8', title: 'Beard & detail', category: 'Soqol', author: 'Jasur Olimov', avatar: 'J', time: '5 kun oldin', image: 'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=900&q=85', likes: ['demo@qirqim.uz', 'guest@qirqim.uz', 'style@qirqim.uz'], comments: [] }
  ];
  const session = getSession();
  const shell = document.querySelector('.app-shell');
  if (!session) {
    location.replace('login.html');
    return;
  }
  shell.hidden = false;

  const postGrid = document.querySelector('#post-grid');
  const savedGrid = document.querySelector('#saved-grid');
  const searchInput = document.querySelector('#search-input');
  const categoryFilters = document.querySelector('#category-filters');
  const toastRegion = document.querySelector('#toast-region');
  const postModal = document.querySelector('#post-modal');
  const lightbox = document.querySelector('#lightbox');
  let currentCategory = 'Barchasi';
  let selectedImage = '';
  let observer;
  let posts = readPosts();

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }
    catch { return null; }
  }
  function readPosts() {
    try {
      const stored = JSON.parse(localStorage.getItem(POSTS_KEY) || 'null');
      return Array.isArray(stored) ? stored : seedPosts;
    } catch { return seedPosts; }
  }
  function persistPosts() {
    try { localStorage.setItem(POSTS_KEY, JSON.stringify(posts)); }
    catch { notify('Saqlash uchun brauzer xotirasi yetarli emas.', true); }
  }
  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function notify(message, error = false) {
    const toast = element('div', `toast${error ? ' is-error' : ''}`, message);
    toastRegion.append(toast);
    window.setTimeout(() => toast.remove(), 3400);
  }
  function saveState() {
    persistPosts();
    render();
  }
  function createFilters() {
    categories.forEach(category => {
      const button = element('button', `filter-button${category === currentCategory ? ' is-active' : ''}`, category);
      button.type = 'button';
      button.addEventListener('click', () => {
        currentCategory = category;
        categoryFilters.querySelectorAll('.filter-button').forEach(item => item.classList.toggle('is-active', item.textContent === category));
        render();
      });
      categoryFilters.append(button);
    });
  }
  function buildComment(comment, post) {
    const row = element('div', 'comment-item');
    const meta = element('span', 'comment-meta', comment.author);
    const time = element('span', 'comment-time', comment.time);
    const text = element('p', '', comment.text);
    row.append(meta, time, text);
    if (comment.email === session.email) {
      const remove = element('button', 'comment-delete', 'O‘chirish');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'O‘z izohingizni o‘chirish');
      remove.addEventListener('click', () => {
        post.comments = post.comments.filter(item => item.id !== comment.id);
        saveState();
      });
      row.append(remove);
    }
    return row;
  }
  function buildPost(post, savedOnly = false) {
    const card = element('article', 'post-card');
    const media = element('div', 'post-media');
    media.dataset.postId = post.id;
    media.tabIndex = 0;
    media.setAttribute('role', 'button');
    media.setAttribute('aria-label', `${post.title} rasmini kattalashtirish`);
    const image = document.createElement('img');
    image.src = post.image;
    image.alt = `${post.title} — ${post.category} uslubidagi sartarosh ishi`;
    image.loading = 'lazy';
    image.addEventListener('error', () => { image.alt = `${post.title} rasmi yuklanmadi`; media.classList.add('image-unavailable'); });
    const tag = element('span', 'post-category', post.category);
    const burst = element('span', 'double-like', '♥');
    burst.setAttribute('aria-hidden', 'true');
    media.append(image, tag, burst);
    const openImage = () => {
      document.querySelector('#lightbox-image').src = post.image;
      document.querySelector('#lightbox-image').alt = image.alt;
      lightbox.showModal();
    };
    let imageClickTimer;
    media.addEventListener('click', event => {
      if (event.detail > 1) {
        window.clearTimeout(imageClickTimer);
        if (event.detail === 2) toggleLike(post, burst);
      } else {
        imageClickTimer = window.setTimeout(openImage, 240);
      }
    });
    media.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openImage(); } });

    const details = element('div', 'post-details');
    const titleRow = element('div', 'post-title-row');
    titleRow.append(element('h3', 'post-title', post.title));
    const isSaved = (post.savedBy || []).includes(session.email);
    const saveButton = element('button', `save-button${isSaved ? ' is-saved' : ''}`, isSaved ? '▣' : '♧');
    saveButton.type = 'button';
    saveButton.setAttribute('aria-label', isSaved ? 'Saqlanganlardan olib tashlash' : 'Saqlash');
    saveButton.addEventListener('click', () => {
      post.savedBy ||= [];
      post.savedBy = isSaved ? post.savedBy.filter(email => email !== session.email) : [...post.savedBy, session.email];
      saveState();
      notify(isSaved ? 'Saqlanganlardan olib tashlandi.' : 'Saqlanganlarga qo‘shildi.');
    });
    titleRow.append(saveButton);
    const authorLine = element('div', 'post-author');
    authorLine.append(element('span', 'author-avatar', post.avatar || post.author.charAt(0).toUpperCase()), element('span', '', post.author), element('span', 'post-date', post.time));
    const actions = element('div', 'post-actions');
    const liked = (post.likes || []).includes(session.email);
    const like = element('button', `like-button${liked ? ' is-liked' : ''}`);
    like.type = 'button';
    like.setAttribute('aria-label', liked ? 'Yoqtirishni bekor qilish' : 'Yoqtirish');
    like.append(element('span', '', liked ? '♥' : '♡'), element('span', 'like-count', String((post.likes || []).length)));
    like.addEventListener('click', () => toggleLike(post));
    const commentToggle = element('button', 'comment-toggle', `Izohlar · ${(post.comments || []).length}`);
    commentToggle.type = 'button';
    actions.append(like, commentToggle);
    const comments = element('div', 'comments-panel');
    comments.hidden = true;
    const list = element('div', 'comment-list');
    (post.comments || []).forEach(comment => list.append(buildComment(comment, post)));
    const commentForm = element('form', 'comment-form');
    const commentInput = document.createElement('input');
    commentInput.name = 'comment';
    commentInput.maxLength = 240;
    commentInput.placeholder = 'Izoh yozing...';
    commentInput.setAttribute('aria-label', 'Izoh yozing');
    commentInput.required = true;
    const send = element('button', '', 'Yuborish');
    send.type = 'submit';
    commentForm.append(commentInput, send);
    commentForm.addEventListener('submit', event => {
      event.preventDefault();
      const text = commentInput.value.trim();
      if (!text) return;
      post.comments ||= [];
      post.comments.push({ id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()), author: session.name, email: session.email, text, time: 'hozir' });
      saveState();
      notify('Izohingiz qo‘shildi.');
    });
    commentToggle.addEventListener('click', () => { comments.hidden = !comments.hidden; });
    comments.append(list, commentForm);
    details.append(titleRow, authorLine, actions, comments);
    card.append(media, details);
    if (observer) observer.observe(card); else card.classList.add('is-visible');
    return card;
  }
  function toggleLike(post, burst) {
    post.likes ||= [];
    const liked = post.likes.includes(session.email);
    post.likes = liked ? post.likes.filter(email => email !== session.email) : [...post.likes, session.email];
    saveState();
    if (!liked && burst) {
      const burstNode = document.querySelector(`[data-post-id="${CSS.escape(post.id)}"] .double-like`);
      if (burstNode) { burstNode.classList.remove('pop'); void burstNode.offsetWidth; burstNode.classList.add('pop'); }
    }
  }
  function render() {
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      }), { threshold: .12 });
    }
    const query = searchInput.value.trim().toLocaleLowerCase();
    const sort = document.querySelector('#sort-select').value;
    let visiblePosts = posts.filter(post => (currentCategory === 'Barchasi' || post.category === currentCategory) && `${post.title} ${post.author} ${post.category}`.toLocaleLowerCase().includes(query));
    if (sort === 'popular') visiblePosts.sort((a, b) => b.likes.length - a.likes.length);
    postGrid.replaceChildren(...visiblePosts.map(post => buildPost(post)));
    document.querySelector('#empty-state').hidden = visiblePosts.length > 0;
    const saved = posts.filter(post => (post.savedBy || []).includes(session.email));
    savedGrid.replaceChildren(...saved.map(post => buildPost(post, true)));
    document.querySelector('#saved-empty').hidden = saved.length > 0;
  }
  function activateView(name) {
    document.querySelectorAll('.page-view').forEach(view => { view.hidden = view.id !== `view-${name}`; });
    document.querySelectorAll('.dock-link[data-view]').forEach(button => {
      const active = button.dataset.view === name;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  createFilters();
  document.querySelectorAll('.dock-link[data-view]').forEach(button => button.addEventListener('click', () => activateView(button.dataset.view)));
  document.querySelectorAll('.create-post-open').forEach(button => button.addEventListener('click', () => postModal.showModal()));
  document.querySelector('.modal-close').addEventListener('click', () => postModal.close());
  document.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  searchInput.addEventListener('input', render);
  document.querySelector('#sort-select').addEventListener('change', render);
  document.querySelector('#profile-button').textContent = (session.name || session.email).charAt(0).toUpperCase();
  document.querySelector('#profile-button').addEventListener('click', () => {
    if (confirm('Qirqim hisobingizdan chiqasizmi?')) {
      localStorage.removeItem(SESSION_KEY);
      location.replace('login.html');
    }
  });
  const themeToggle = document.querySelector('#theme-toggle');
  if (localStorage.getItem(THEME_KEY) === 'light') document.body.classList.add('light-theme');
  themeToggle.textContent = document.body.classList.contains('light-theme') ? '☾' : '☼';
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const light = document.body.classList.contains('light-theme');
    themeToggle.textContent = light ? '☾' : '☼';
    localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
  });
  document.querySelector('#booking-form').elements.date.min = new Date().toISOString().slice(0, 10);
  document.querySelector('#booking-form').addEventListener('submit', event => {
    event.preventDefault();
    const details = new FormData(event.currentTarget);
    notify(`${details.get('date')} kuni ${details.get('time')} ga navbat so‘rovi qabul qilindi.`);
    event.currentTarget.reset();
  });
  const imageInput = document.querySelector('#post-image');
  imageInput.addEventListener('change', () => {
    const file = imageInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Faqat rasm faylini tanlang.', true); imageInput.value = ''; return; }
    if (file.size > 2_500_000) { notify('Rasm 2.5 MB dan kichik bo‘lishi kerak.', true); imageInput.value = ''; return; }
    const reader = new FileReader();
    reader.onload = () => {
      selectedImage = String(reader.result);
      const preview = document.querySelector('#image-preview');
      preview.src = selectedImage;
      preview.hidden = false;
    };
    reader.readAsDataURL(file);
  });
  document.querySelector('#post-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    const title = form.elements.title.value.trim();
    const category = form.elements.category.value;
    if (!selectedImage || !title || !category) return notify('Rasm, sarlavha va kategoriyani to‘ldiring.', true);
    posts.unshift({ id: `post-${Date.now()}`, title, category, author: session.name, avatar: session.name.charAt(0).toUpperCase(), time: 'hozir', image: selectedImage, likes: [], comments: [], savedBy: [] });
    persistPosts();
    form.reset();
    selectedImage = '';
    document.querySelector('#image-preview').hidden = true;
    postModal.close();
    activateView('feed');
    render();
    notify('Yangi postingiz ulashildi.');
  });

  const staff = [
    ['A', 'Azizbek Karimov', 'Senior barber · 8 yil tajriba', 'Fade va zamonaviy tekstura'],
    ['J', 'Jasur Olimov', 'Master barber · 6 yil tajriba', 'Klassik qirqim va soqol'],
    ['B', 'Bekzod Rahimov', 'Barber · 5 yil tajriba', 'Skin fade va undercut']
  ];
  const teamGrid = document.querySelector('#team-grid');
  staff.forEach(([initial, name, role, specialty]) => {
    const card = element('article', 'team-card');
    card.append(element('span', 'team-portrait', initial), element('h3', '', name), element('p', '', role), element('p', 'team-rating', `✦  ${specialty}`));
    teamGrid.append(card);
  });
  render();
})();