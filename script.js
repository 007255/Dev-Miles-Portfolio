/* script.js
   - Three.js animated particle sphere background with parallax on mouse
   - Theme toggle saved to localStorage
   - IntersectionObserver for reveal and skill bar animation
   - Simple 3D tilt for elements with data-tilt
   - Contact form validation (client-side)
*/

/* ---------------------------
   Utilities & DOM elements
   --------------------------- */
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const yearEl = document.getElementById('year');
yearEl.textContent = new Date().getFullYear();

/* ---------------------------
   Theme toggle (dark/light)
   --------------------------- */
const THEME_KEY = 'portfolio_theme';
function applyTheme(theme){
  if(theme === 'light') body.classList.add('light');
  else body.classList.remove('light');
  themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
}
const savedTheme = localStorage.getItem(THEME_KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
applyTheme(savedTheme);
themeToggle.addEventListener('click', () => {
  const newTheme = body.classList.contains('light') ? 'dark' : 'light';
  applyTheme(newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
});

/* ---------------------------
   Smooth mobile menu (basic)
   --------------------------- */
document.querySelectorAll('.nav-links a').forEach(a=>{
  a.addEventListener('click', ()=> {
    // Close mobile menu logic could be added if a mobile menu is implemented
  });
});

/* ---------------------------
   Three.js background (particles sphere)
   --------------------------- */
(function initThree(){
  const canvas = document.getElementById('bgCanvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(50, 2, 0.1, 1000);
  camera.position.z = 25;

  // Create points on a sphere
  const radius = 12;
  const particles = 1400;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);

  for (let i = 0; i < particles; i++) {
    // Fibonacci sphere distribution for even spread
    const t = i + 0.5;
    const theta = Math.acos(1 - 2 * t / particles);
    const phi = Math.PI * (1 + Math.sqrt(5)) * t;
    const x = radius * Math.sin(theta) * Math.cos(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(theta);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    color: 0xffffff,
    opacity: 0.9,
    transparent: true,
    depthWrite: false
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // Resize handling
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // Parallax / mouse interactivity
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Animate
  function animate(t) {
    resize();
    const time = t * 0.0006;
    points.rotation.y = time * 0.8 + mouseX * 0.6;
    points.rotation.x = Math.sin(time * 0.6) * 0.2 + mouseY * 0.3;
    // Slight pulsation
    points.material.size = 0.11 + Math.sin(time * 2.3) * 0.02;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  // Ensure canvas fills hero
  function sizeCanvasToHero(){
    const hero = document.getElementById('hero');
    const rect = hero.getBoundingClientRect();
    canvas.style.height = rect.height + 'px';
    canvas.style.width = rect.width + 'px';
    renderer.setSize(rect.width, rect.height, false);
  }
  window.addEventListener('resize', sizeCanvasToHero);
  sizeCanvasToHero();
})();

/* ---------------------------
   IntersectionObserver: reveal & skill bars
   --------------------------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      // If it contains skill bars, animate
      entry.target.querySelectorAll('.skill-bar').forEach(bar => {
        const span = bar.querySelector('span');
        const percent = bar.getAttribute('data-percent') || '0';
        span.style.width = percent + '%';
      });
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ---------------------------
   Simple 3D tilt effect for elements with [data-tilt]
   (vanilla, lightweight)
   --------------------------- */
const tiltElements = document.querySelectorAll('[data-tilt]');
tiltElements.forEach(el => {
  el.addEventListener('mousemove', (e) => {
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateX = (py - 0.5) * -10; // rotateX rate
    const rotateY = (px - 0.5) * 12; // rotateY rate
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(6px)`;
  });
  el.addEventListener('mouseleave', () => {
    el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
  });
});

/* ---------------------------
   Contact form validation (client-side)
   --------------------------- */
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', function(e){
  e.preventDefault();
  formMsg.textContent = '';
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if(!name || !email || !message){
    formMsg.textContent = 'Veuillez remplir tous les champs.';
    formMsg.style.color = 'var(--accent2)';
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!emailRegex.test(email)){
    formMsg.textContent = 'Veuillez entrer une adresse email valide.';
    formMsg.style.color = 'var(--accent2)';
    return;
  }

  // Simulate success (no backend). Replace with fetch() to send data to server.
  formMsg.textContent = 'Message envoyé — merci ! (Simulation)';
  formMsg.style.color = 'lightgreen';
  form.reset();
});

/* ---------------------------
   Small accessibility: keyboard focus visible
   --------------------------- */
document.addEventListener('keydown', (e) => {
  if(e.key === 'Tab') document.body.classList.add('keyboard-nav');
});

/* Navbar scroll effect */
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if(window.scrollY > 50){
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* Active section link */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    const sectionHeight = section.offsetHeight;

    if (window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});
