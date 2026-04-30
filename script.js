/* =========================================================
   Mishti Agrawal Portfolio — interactive script
========================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ===== Loader ===== */
window.addEventListener('load', () => {
  setTimeout(() => $('#loader').classList.add('hide'), 500);
});

/* ===== Year ===== */
$('#year').textContent = new Date().getFullYear();

/* ===== Custom cursor ===== */
const cursorDot = $('#cursor-dot');
const cursorRing = $('#cursor-ring');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
});
function animateRing() {
  ringX += (mouseX - ringX) * 0.18;
  ringY += (mouseY - ringY) * 0.18;
  cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
  requestAnimationFrame(animateRing);
}
animateRing();
$$('a, button, .skill-card, .project-card, input, textarea').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-grow'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-grow'));
});

/* ===== Scroll progress + sticky nav + active link ===== */
const navbar = $('#navbar');
const progress = $('#scroll-progress');
const sections = $$('section[id]');
const navLinks = $$('.nav-link');
const toTop = $('#to-top');

window.addEventListener('scroll', () => {
  const top = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = ((top / docHeight) * 100) + '%';

  if (top > 30) navbar.classList.add('scrolled'); else navbar.classList.remove('scrolled');

  // Active nav link based on which section is in view
  let current = '';
  sections.forEach((s) => {
    const r = s.getBoundingClientRect();
    if (r.top <= 120 && r.bottom >= 120) current = s.id;
  });
  if (current) {
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }

  if (top > 500) {
    toTop.style.opacity = '1';
    toTop.style.pointerEvents = 'auto';
  } else {
    toTop.style.opacity = '0';
    toTop.style.pointerEvents = 'none';
  }
});

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Mobile menu ===== */
const menuBtn = $('#menu-btn');
const mobileMenu = $('#mobile-menu');
menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
mobileMenu.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => mobileMenu.classList.add('hidden'))
);

/* ===== Theme toggle (dark / light) ===== */
const themeToggle = $('#theme-toggle');
const iconSun = $('#icon-sun');
const iconMoon = $('#icon-moon');
const setTheme = (mode) => {
  if (mode === 'dark') {
    document.documentElement.classList.add('dark');
    iconSun.classList.add('hidden');
    iconMoon.classList.remove('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    iconSun.classList.remove('hidden');
    iconMoon.classList.add('hidden');
  }
  localStorage.setItem('mishti-theme', mode);
};
const savedTheme = localStorage.getItem('mishti-theme') || 'light';
setTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

/* ===== Typing animation in hero ===== */
const typedEl = $('#typed');
const phrases = ['CSE Student.', 'Java Developer.', 'AI Explorer.', 'Curious Mind.'];
let pIdx = 0, cIdx = 0, isDeleting = false;
function type() {
  const word = phrases[pIdx];
  if (isDeleting) {
    typedEl.textContent = word.substring(0, cIdx--);
    if (cIdx < 0) { isDeleting = false; pIdx = (pIdx + 1) % phrases.length; cIdx = 0; setTimeout(type, 250); return; }
    setTimeout(type, 60);
  } else {
    typedEl.textContent = word.substring(0, cIdx++);
    if (cIdx > word.length) { isDeleting = true; setTimeout(type, 1400); return; }
    setTimeout(type, 110);
  }
}
type();

/* ===== Animated stat counters (supports decimals + suffix) ===== */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals || 0, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1400;
  const start = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const cur = target * eased;
    el.textContent = cur.toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(tick);
    else el.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(tick);
}

/* ===== Reveal on scroll ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const delay = parseFloat(e.target.dataset.revealDelay || 0) * 1000;
      setTimeout(() => e.target.classList.add('is-revealed'), delay);
      if (e.target.classList.contains('stat-num')) animateCounter(e.target);
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });

$$('[data-reveal]').forEach(el => io.observe(el));
$$('.stat-num').forEach(el => io.observe(el));

/* ===== GSAP smooth touches ===== */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  // Subtle parallax on hero image wrap
  gsap.to('.hero-image-wrap', {
    y: -30,
    scrollTrigger: { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true }
  });

  // Stagger reveal for skill cards once they enter
  ScrollTrigger.create({
    trigger: '#skills',
    start: 'top 70%',
    onEnter: () => {
      gsap.from('.skill-card', { opacity: 0, y: 40, duration: 0.7, stagger: 0.08, ease: 'power3.out' });
      // Animate skill bars from data-percent
      $$('.skill-card').forEach(card => {
        const fill = card.querySelector('.skill-bar-fill');
        const pct = card.dataset.percent;
        requestAnimationFrame(() => { fill.style.width = pct + '%'; });
      });
    },
    once: true
  });

  ScrollTrigger.create({
    trigger: '#projects',
    start: 'top 70%',
    onEnter: () => gsap.from('.project-card', { opacity: 0, y: 50, duration: 0.7, stagger: 0.1, ease: 'power3.out' }),
    once: true
  });
}

/* ===== Skills data + render ===== */
const skills = [
  { name: 'Java',          icon: '☕', percent: 82, level: 'Advanced',   desc: 'My primary language for object-oriented programming and data structures. I enjoy writing clean, well-structured Java code.', tags: ['OOP', 'DSA', 'Core Java'] },
  { name: 'C++',           icon: '➕', percent: 75, level: 'Proficient', desc: 'I use C++ for competitive programming and DSA practice — STL, pointers, and algorithm design.', tags: ['STL', 'Algorithms', 'Pointers'] },
  { name: 'C',             icon: '🔧', percent: 72, level: 'Proficient', desc: 'Strong fundamentals in C — memory management, control flow, and writing low-level logic.', tags: ['Memory', 'Pointers', 'Basics'] },
  { name: 'Data Structures', icon: '🧠', percent: 78, level: 'Proficient', desc: 'Comfortable with arrays, linked lists, stacks, queues, trees, hashing, and basic graph problems.', tags: ['Trees', 'Hashing', 'Graphs'] },
  { name: 'OOP',           icon: '🧩', percent: 80, level: 'Advanced',   desc: 'Inheritance, polymorphism, encapsulation and abstraction — designing programs the OOP way.', tags: ['Classes', 'Inheritance', 'Design'] },
  { name: 'DBMS',          icon: '🗄️', percent: 65, level: 'Learning',   desc: 'Learning SQL, ER modeling, normalization, and the basics of relational database design.', tags: ['SQL', 'ER Models', 'Normalization'] },
  { name: 'HTML',          icon: '🧱', percent: 75, level: 'Proficient', desc: 'Building responsive static web pages with semantic, accessible markup.', tags: ['Semantics', 'Forms', 'Layouts'] },
  { name: 'CSS',           icon: '🎨', percent: 60, level: 'Learning',   desc: 'Styling layouts with Flexbox, Grid, and responsive design — currently leveling up with utility-first CSS.', tags: ['Flexbox', 'Grid', 'Responsive'] },
  { name: 'Generative AI', icon: '🤖', percent: 60, level: 'Learning',   desc: 'Foundational understanding of GenAI concepts and applications, picked up during my Tata Quality Internship.', tags: ['LLMs', 'Prompting', 'Ethics'] },
  { name: 'Cybersecurity', icon: '🛡️', percent: 60, level: 'Learning',   desc: 'Studying cybersecurity fundamentals — risk awareness, data protection, and ethical considerations.', tags: ['Risk', 'Privacy', 'Awareness'] },
  { name: 'Git & GitHub',  icon: '🌿', percent: 70, level: 'Proficient', desc: 'Using Git for version control and GitHub for project management on my web development work.', tags: ['Version Control', 'Branching', 'Collab'] },
  { name: 'Tools',         icon: '🛠️', percent: 78, level: 'Proficient', desc: 'Daily-driver tools: VS Code, IntelliJ IDEA, and GitHub. Comfortable jumping between editors.', tags: ['VS Code', 'IntelliJ', 'GitHub'] },
];

const skillsGrid = $('#skills-grid');
skills.forEach(s => {
  const el = document.createElement('div');
  el.className = 'skill-card';
  el.dataset.percent = s.percent;
  el.innerHTML = `
    <div class="skill-icon">${s.icon}</div>
    <h4>${s.name}</h4>
    <p>${s.desc.split('.').slice(0,1).join('.')}.</p>
    <div class="skill-bar"><div class="skill-bar-fill"></div></div>
    <span class="skill-percent">${s.percent}% · ${s.level}</span>
  `;
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
  });
  el.addEventListener('click', () => openSkillModal(s));
  skillsGrid.appendChild(el);
});

/* ===== Skill modal ===== */
const modal = $('#skill-modal');
function openSkillModal(s) {
  $('#modal-icon').textContent = s.icon;
  $('#modal-title').textContent = s.name;
  $('#modal-level').textContent = s.level + ' · ' + s.percent + '%';
  $('#modal-desc').textContent = s.desc;
  const tagsWrap = $('#modal-tags');
  tagsWrap.innerHTML = '';
  s.tags.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'inline-block bg-rose-100 dark:bg-rose-300/15 text-rose-500 dark:text-rose-300 text-xs font-medium px-3 py-1 rounded-full';
    tag.textContent = t;
    tagsWrap.appendChild(tag);
  });
  modal.classList.add('show');
  requestAnimationFrame(() => {
    $('#modal-bar').style.width = s.percent + '%';
  });
}
$('#close-modal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
function closeModal() { modal.classList.remove('show'); $('#modal-bar').style.width = '0%'; }

/* ===== Projects data + render ===== */
const projects = [
  {
    title: 'Front-End Web Pages',
    desc: 'A series of responsive static web pages built with HTML & CSS — clean layouts, structured navigation, and version-controlled with Git.',
    tags: ['HTML', 'CSS', 'GitHub'],
    cat: 'web',
    emoji: '🌐',
    c1: '#ffe5df', c2: '#f6a89a',
  },
  {
    title: 'Personal Portfolio Website',
    desc: 'This very portfolio — designed and coded with HTML, Tailwind CSS, and vanilla JavaScript, featuring smooth animations and a dark mode.',
    tags: ['HTML', 'Tailwind', 'JavaScript'],
    cat: 'web',
    emoji: '✨',
    c1: '#ffd9d0', c2: '#ee8576',
  },
  {
    title: 'Tata Internship — GenAI Notes',
    desc: 'Notes, demos, and exploratory work from my Tata Quality Internship on Generative AI applications and ethical considerations.',
    tags: ['GenAI', 'LLMs', 'Ethics'],
    cat: 'ai',
    emoji: '🤖',
    c1: '#e7d6f5', c2: '#c9a8e6',
  },
  {
    title: 'Cybersecurity Fundamentals',
    desc: 'A self-study project on cybersecurity awareness — covering risk, data protection, and best practices learned during the Tata internship.',
    tags: ['Security', 'Privacy', 'Risk'],
    cat: 'ai',
    emoji: '🛡️',
    c1: '#dde7ff', c2: '#9bb4f5',
  },
  {
    title: 'IEEE Research Conclave Project',
    desc: 'Collaborative research-based project that secured the 2nd position at the IEEE Research Conclave — focused on analytical findings and structured presentation.',
    tags: ['Research', 'IEEE', 'Analysis'],
    cat: 'research',
    emoji: '🏆',
    c1: '#fff0d6', c2: '#f6c98c',
  },
  {
    title: 'Academic Mini Projects',
    desc: 'Research-oriented academic mini-projects involving data collection, structured documentation, and presentation of findings.',
    tags: ['Research', 'Documentation', 'Reports'],
    cat: 'research',
    emoji: '📚',
    c1: '#dff5e3', c2: '#9fd9a8',
  },
];

const projectsGrid = $('#projects-grid');
function renderProjects(filter = 'all') {
  projectsGrid.innerHTML = '';
  projects.filter(p => filter === 'all' || p.cat === filter).forEach(p => {
    const el = document.createElement('article');
    el.className = 'project-card';
    el.innerHTML = `
      <div class="project-thumb">
        <div class="project-img" style="--c1:${p.c1};--c2:${p.c2}">${p.emoji}</div>
        <div class="project-overlay">
          <a href="#"><span>Live demo</span></a>
          <a href="https://github.com/" target="_blank" rel="noopener"><span>GitHub</span></a>
        </div>
      </div>
      <div class="project-body">
        <h4>${p.title}</h4>
        <p>${p.desc}</p>
        <div class="project-tags">${p.tags.map(t => `<span>${t}</span>`).join('')}</div>
      </div>
    `;

    // 3D tilt on hover
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });

    projectsGrid.appendChild(el);
  });
}
renderProjects();

$$('.filter-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    $$('.filter-chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    renderProjects(chip.dataset.filter);
    if (window.gsap) gsap.from('.project-card', { opacity: 0, y: 30, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
  });
});

/* ===== Contact form ===== */
$('#contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const status = $('#form-status');
  status.classList.remove('hidden');
  e.target.reset();
  setTimeout(() => status.classList.add('hidden'), 4000);
});
