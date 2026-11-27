// Builds the website: index.html (简体中文) and <lang>/index.html for every other language.
// Run from the repo root: node src/build.mjs
// Texts come from the App Store listing (src/listing.json, copied from xiaobandeng store/listing.json),
// the screenshot captions (src/cap.json, from xiaobandeng store/frame.mjs) and src/strings.json.
// Screenshots: img/shots/<lang>/N.webp, cropped from xiaobandeng store/final/<lang>/N.png.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

// When the app is live on the App Store, set LIVE = true and rebuild: the button becomes a link.
const LIVE = false
const STORE = 'https://apps.apple.com/app/id6838535341'
const BASE = 'https://kneehigh.uzumea.com/'
const MAIL = 'contact@uzumea.com'

const S = JSON.parse(readFileSync('src/strings.json', 'utf8'))
const L = JSON.parse(readFileSync('src/listing.json', 'utf8'))
const CAP = JSON.parse(readFileSync('src/cap.json', 'utf8'))
const PALS = JSON.parse(readFileSync('src/pals.json', 'utf8'))
const LANGS = Object.keys(S)
const PAL_ORDER = ['cn', 'jp', 'ko', 'vi', 'th', 'id', 'west', 'es', 'fr', 'de', 'it', 'br']

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const dir = (l) => (l === 'zh' ? '' : `${l}/`)
const up = (l) => (l === 'zh' ? '' : '../')
const privacyAnchor = (l) => (['zh', 'hant', 'ja', 'en'].includes(l) ? l : 'en')
const pal = (id, size, cls = '') => PALS[id].replace('width="160" height="160"', `width="${size}" height="${size}"`).replace('class="mascot wave"', `class="mascot wave ${cls}"`)

function parse(desc) {
  const parts = desc.split('\n\n')
  const sec = (p) => {
    const [head, ...rest] = p.split('\n')
    return { head, items: rest.map((x) => x.replace(/^[·•・]\s*/, '')) }
  }
  return { lede: parts[0], intro: parts[1], secs: parts.slice(2, 7).map(sec), close: parts[7].split('\n') }
}

const css = readFileSync('src/site.css', 'utf8')

function page(l) {
  const s = S[l]
  const d = parse(L[l].description)
  const cap = CAP[l]
  const u = up(l)
  const shot = (n, alt, eager) =>
    `<img class="shot" src="${u}img/shots/${l}/${n}.webp" width="500" height="1064" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'}>`
  // description section → screenshot / caption: record 5, issues 2, tree 3, together 4, Plus 6
  const order = [[0, 5, 4], [1, 2, 1], [2, 3, 2], [3, 4, 3], [4, 6, 5]]
  const sections = order
    .map(([i, n, c], k) => {
      const sec = d.secs[i]
      return `<section class="feat${k % 2 ? ' flip' : ''}${i === 4 ? ' plus' : ''}">
  <div class="txt">
    <p class="eyebrow"><span class="no">${String(k + 1).padStart(2, '0')}</span>${esc(sec.head)}</p>
    <h2>${esc(cap[c][0])}</h2>
    <p class="sub">${esc(cap[c][1])}</p>
    <ul>${sec.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
  </div>
  <div class="pic">${shot(n, cap[c][0] + ' ' + cap[c][1])}</div>
</section>`
    })
    .join('\n')
  const btn = LIVE
    ? `<a class="store" href="${STORE}">${appleMark}<span>${esc(s.get)}</span></a>`
    : `<span class="store soon">${appleMark}<span>${esc(s.soon)}</span></span>`
  const alternates = LANGS.map((x) => `<link rel="alternate" hreflang="${S[x].html}" href="${BASE}${dir(x)}">`).join('\n')
  const menu = LANGS.map((x) => `<a href="${u}${dir(x)}" hreflang="${S[x].html}" lang="${S[x].html}" data-l="${x}"${x === l ? ' aria-current="page"' : ''}>${esc(S[x].own)}</a>`).join('')
  const title = `${L[l].name} — ${L[l].subtitle}`
  const redirect =
    l === 'zh'
      ? `<script>(function(){try{if(localStorage.getItem('kh-lang'))return}catch(e){}var a=(navigator.languages||[navigator.language||'']);for(var i=0;i<a.length;i++){var t=(a[i]||'').toLowerCase();if(!t)continue;var p=t.split('-')[0];if(p==='zh'){if(/hant|tw|hk|mo/.test(t))location.replace('hant/');return}if(${JSON.stringify(LANGS.filter((x) => !['zh', 'hant'].includes(x)))}.indexOf(p)>=0){location.replace(p+'/');return}}if(a.length)location.replace('en/')})()</script>`
      : ''
  return `<!doctype html>
<html lang="${s.html}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(L[l].promotionalText)}">
<meta name="theme-color" content="#f5eee2" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#1d1814" media="(prefers-color-scheme: dark)">
<meta name="apple-itunes-app" content="app-id=6838535341">
<meta property="og:title" content="${esc(L[l].name)}">
<meta property="og:description" content="${esc(L[l].promotionalText)}">
<meta property="og:image" content="${BASE}img/og.png">
<meta property="og:type" content="website">
<link rel="canonical" href="${BASE}${dir(l)}">
${alternates}
<link rel="alternate" hreflang="x-default" href="${BASE}en/">
<link rel="icon" href="${u}favicon.png">
<link rel="apple-touch-icon" href="${u}img/apple-touch-icon.png">
${redirect}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${s.font}:wght@500;700&display=swap">
<style>:root{--serif:${s.fam}}
${css}</style>
</head>
<body class="l-${l}">
<header class="top">
  <a class="mark" href="${u}${dir(l)}"><img src="${u}img/icon-256.webp" width="32" height="32" alt=""><span>${esc(L[l].name)}</span></a>
  <details class="langs"><summary aria-label="${esc(s.lang)}">${globe}<span>${esc(s.own)}</span></summary><nav>${menu}</nav></details>
</header>
<main>
<section class="hero">
  <div class="txt">
    ${pal(s.pal, 96, 'hero-pal')}
    <h1>${esc(s.brand)}</h1>
    <p class="tag">${esc(L[l].subtitle)}</p>
    <p class="lede">${esc(d.lede)}</p>
    ${btn}
    <p class="note">${esc(s.note)}</p>
  </div>
  <div class="pic">${shot(1, cap[0][0] + ' ' + cap[0][1], true)}</div>
</section>
<p class="intro">${esc(d.intro)}</p>
${sections}
<section class="own">
  <div class="pic">${shot(7, cap[6][0])}</div>
  <div class="txt">
    <h2>${esc(cap[6][0])}</h2>
    ${d.close.map((x) => `<p>${esc(x)}</p>`).join('')}
  </div>
</section>
<section class="pals">
  <h2>${esc(s.pals)}</h2>
  <p class="sub">${esc(s.palsSub)}</p>
  <div class="row">${PAL_ORDER.map((p, i) => `<span style="--d:${(i * 0.13).toFixed(2)}s">${pal(p, 76)}</span>`).join('')}</div>
</section>
<section class="end">
  ${btn}
  <p class="note">${esc(s.note)}</p>
</section>
</main>
<footer>
  <p>${esc(s.write)} <a href="mailto:${MAIL}">${MAIL}</a></p>
  <p><a href="${u}privacy.html#${privacyAnchor(l)}">${esc(s.privacy)}</a> · <span>© 2026 小板凳 Kneehigh</span></p>
  <nav class="flat">${menu}</nav>
</footer>
<script>document.querySelectorAll('[data-l]').forEach(function(a){a.addEventListener('click',function(){try{localStorage.setItem('kh-lang',a.dataset.l)}catch(e){}})})</script>
</body>
</html>
`
}

const appleMark = `<svg class="apple" viewBox="0 0 384 512" width="18" height="22" aria-hidden="true"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>`
const globe = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`

for (const l of LANGS) {
  if (l !== 'zh') mkdirSync(l, { recursive: true })
  writeFileSync(`${dir(l)}index.html`, page(l))
}
console.log('built', LANGS.length, 'pages')
