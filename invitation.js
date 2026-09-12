const intro = document.getElementById('intro');
const enterButton = document.getElementById('enterInvitation');
const main = document.getElementById('main');
const header = document.getElementById('siteHeader');
const dock = document.querySelector('.guest-dock');
const toast = document.getElementById('toast');
const motionButton = document.getElementById('motionButton');
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
const weddingDate = new Date('2026-11-26T20:32:00+05:30');
let opened = false;
let paused = motionQuery.matches;
let toastTimer;

// A fixed number of leaves keeps the animation lightweight on phones.
function decorateLeaves(container, count) {
  for (let index = 0; index < count; index++) {
    const leaf = document.createElement('i');
    leaf.className = 'drifting-leaf';
    leaf.style.left = (index * 100 / count + Math.random() * 4) + '%';
    leaf.style.setProperty('--duration', (12 + Math.random() * 7) + 's');
    leaf.style.setProperty('--delay', (-Math.random() * 19) + 's');
    leaf.style.setProperty('--drift', (Math.random() * 90 - 45) + 'px');
    leaf.style.setProperty('--size', (6 + Math.random() * 5) + 'px');
    container.appendChild(leaf);
  }
}
decorateLeaves(document.getElementById('introLeaves'), 9);
decorateLeaves(document.getElementById('sceneLeaves'), 12);

function updateMotion() {
  document.body.classList.toggle('motion-paused', paused || document.hidden);
  motionButton.textContent = paused ? '▶' : 'Ⅱ';
  motionButton.setAttribute('aria-label', paused ? 'Play animations' : 'Pause animations');
  motionButton.setAttribute('aria-pressed', String(paused));
}
motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
const syncMotionPreference = () => { paused = motionQuery.matches; updateMotion(); };
if (motionQuery.addEventListener) motionQuery.addEventListener('change', syncMotionPreference);
else motionQuery.addListener(syncMotionPreference);
document.addEventListener('visibilitychange', updateMotion);
updateMotion();

// Keep keyboard and screen-reader navigation inside the cover until it opens.
[main, header, dock, document.querySelector('footer')].forEach(element => element.inert = true);
enterButton.focus({ preventScroll: true });
intro.addEventListener('keydown', event => {
  if (event.key === 'Tab') { event.preventDefault(); enterButton.focus(); }
  if (event.key === 'Escape') openInvitation();
});
function openInvitation() {
  if (opened) return;
  opened = true;
  window.scrollTo({ top: 0, behavior: 'auto' });
  [main, header, dock, document.querySelector('footer')].forEach(element => element.inert = false);
  document.body.classList.add('opened');
  document.body.classList.remove('no-scroll');
  intro.classList.add('hidden');
  intro.inert = true;
  document.getElementById('heroTitle').focus({ preventScroll: true });
  setTimeout(() => intro.remove(), motionQuery.matches ? 0 : 1050);
}
enterButton.addEventListener('click', openInvitation);
document.querySelector('.skip-link').addEventListener('click', openInvitation);

function updateScroll() {
  header.classList.toggle('scrolled', scrollY > 45);
  const length = document.documentElement.scrollHeight - innerHeight;
  document.documentElement.style.setProperty('--progress', length > 0 ? Math.min(1, scrollY / length) : 0);
}
let scrollQueued = false;
addEventListener('scroll', () => {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => { updateScroll(); scrollQueued = false; });
}, { passive: true });
addEventListener('resize', updateScroll);
updateScroll();

if ('IntersectionObserver' in window && !motionQuery.matches) {
  document.body.classList.add('js-motion');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

function updateCountdown() {
  const remaining = weddingDate.getTime() - Date.now();
  const countdown = document.getElementById('countdown');
  if (remaining <= 0) {
    const sameDay = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) === '2026-11-26';
    countdown.innerHTML = '<div style="grid-column:1/-1"><strong>' + (sameDay ? 'Our day is here' : 'Forever has begun') + '</strong><span>Thank you for your love & blessings</span></div>';
    return;
  }
  const day = 86400000;
  document.getElementById('days').textContent = String(Math.floor(remaining / day)).padStart(2, '0');
  document.getElementById('hours').textContent = String(Math.floor(remaining % day / 3600000)).padStart(2, '0');
  document.getElementById('minutes').textContent = String(Math.floor(remaining % 3600000 / 60000)).padStart(2, '0');
  document.getElementById('seconds').textContent = String(Math.floor(remaining % 60000 / 1000)).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

function notifyGuest(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}
const calendarText = text => text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
function downloadCalendar(event) {
  event.preventDefault();
  const location = 'T.T.D. Kalyanamandapam, M.V.P. Double Road, near M.V.P. Rythu Bazar, Visakhapatnam 530017';
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  // Separate start times preserve both confirmed timings without inventing an end time.
  const lines = ['BEGIN:VCALENDAR','VERSION:2.0','CALSCALE:GREGORIAN','PRODID:-//Tarun and Madhurya//Wedding//EN'];
  [
    ['dinner', '20261126T140000Z', 'Wedding dinner — Sai Tarun & Madhurya'],
    ['ceremony', '20261126T150200Z', 'Sumuhurtham — Sai Tarun & Sai Durga Madhurya']
  ].forEach(([id, start, title]) => {
    lines.push('BEGIN:VEVENT','UID:tarun-madhurya-20261126-' + id, 'DTSTAMP:' + stamp,
      'DTSTART:' + start, 'SUMMARY:' + calendarText(title), 'LOCATION:' + calendarText(location),
      'DESCRIPTION:' + calendarText('Thursday, 26 November 2026. Dinner: 7:30 p.m. IST. Sumuhurtham: 8:32 p.m. IST.'),
      'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  // Fold lines at UTF-8 byte boundaries for calendar-app compatibility.
  const encoder = new TextEncoder();
  const folded = lines.map(line => {
    let result = '', size = 0;
    for (const character of line) {
      const bytes = encoder.encode(character).length;
      if (size + bytes > 74) { result += '\r\n '; size = 1; }
      result += character; size += bytes;
    }
    return result;
  }).join('\r\n') + '\r\n';
  const url = URL.createObjectURL(new Blob([folded], { type: 'text/calendar;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Tarun-Madhurya-Wedding.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  notifyGuest('Calendar downloaded · dinner & ceremony included');
}
document.querySelectorAll('[data-calendar]').forEach(button => button.addEventListener('click', downloadCalendar));
document.getElementById('shareButton').addEventListener('click', async () => {
  const title = 'Sai Tarun & Sai Durga Madhurya — Wedding Invitation';
  const text = 'You’re invited! 26 November 2026, T.T.D. Kalyanamandapam, MVP Colony, Visakhapatnam. Dinner 7:30 p.m. · Sumuhurtham 8:32 p.m. IST.';
  const shareable = /^https?:$/.test(location.protocol) && !['localhost', '127.0.0.1'].includes(location.hostname);
  const data = shareable ? { title, text, url: location.href } : { title, text };
  try {
    if (navigator.share) await navigator.share(data);
    else if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareable ? text + '\n' + location.href : text);
      notifyGuest(shareable ? 'Invitation details and link copied' : 'Wedding details copied');
    } else window.prompt('Copy the invitation details:', shareable ? text + '\n' + location.href : text);
  } catch (error) {
    if (error.name !== 'AbortError') notifyGuest('Sharing was unavailable. Please try again.');
  }
});
