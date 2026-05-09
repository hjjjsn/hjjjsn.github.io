/* hjjjsn artist page — vertical scroll, paper with windows */
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dataSource from './data.js';

/* ─────────────────────────────────────────
   Hand-drawn path generators
   ───────────────────────────────────────── */
function seededRand(seed) {
  let s = seed | 0;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}
function wobblyRect(x, y, w, h, jitter, seed) {
  const rand = seededRand(seed);
  const r = () => (rand() - 0.5) * jitter * 2;
  const segs = 6, pts = [];
  for (let i = 0; i <= segs; i++) pts.push([x + (w * i) / segs + r(), y + r()]);
  for (let i = 1; i <= segs; i++) pts.push([x + w + r(), y + (h * i) / segs + r()]);
  for (let i = 1; i <= segs; i++) pts.push([x + w - (w * i) / segs + r(), y + h + r()]);
  for (let i = 1; i < segs; i++)  pts.push([x + r(), y + h - (h * i) / segs + r()]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
  return d + ' Z';
}
function wobblyCircle(cx, cy, r, jitter, seed) {
  const rand = seededRand(seed);
  const segs = 32; let d = '';
  for (let i = 0; i <= segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const rr = r + (rand() - 0.5) * jitter * 2;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    d += (i === 0 ? 'M' : 'L') + ` ${x} ${y}`;
  }
  return d + ' Z';
}
function wobblyLine(x1, y1, x2, y2, jitter, seed) {
  const rand = seededRand(seed);
  const segs = 14;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= segs; i++) {
    const t = i / segs;
    const x = x1 + (x2 - x1) * t + (rand() - 0.5) * jitter * 2;
    const y = y1 + (y2 - y1) * t + (rand() - 0.5) * jitter * 2;
    d += ` L ${x} ${y}`;
  }
  return d;
}

/* ─────────────────────────────────────────
   Window — paper hole that shows bg through
   ───────────────────────────────────────── */
function Hole({ children, seed = 1, ratio, className = "", style = {}, label, labelEn }) {
  /* `ratio` is unused at present; size is set by parent CSS */
  return (
    <div className={`hole ${className}`} style={style}>
      <div className="hole-inner">
        <svg className="hole-frame" viewBox="0 0 200 200" preserveAspectRatio="none">
          <path d={wobblyRect(3, 3, 194, 194, 1.6, seed)}
                fill="none" stroke="#1A1A1A" strokeWidth="1.6"
                vectorEffect="non-scaling-stroke" strokeLinejoin="round"/>
          <path d={wobblyRect(7, 7, 186, 186, 1.0, seed + 11)}
                fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.4"
                vectorEffect="non-scaling-stroke"/>
        </svg>
        <div className="hole-content">{children}</div>
        {label && (
          <span className="hole-label">
            <span className="hole-label-ja">{label}</span>
            {labelEn && <span className="hole-label-en">— {labelEn}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SVG global defs
   ───────────────────────────────────────── */
function GlobalDefs() {
  return (
    <svg width="0" height="0" style={{position:'absolute'}} aria-hidden="true">
      <defs>
        <filter id="inkstamp" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <filter id="paperWobble" x="-2%" y="-2%" width="104%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    </svg>
  );
}

/* Reveal-on-scroll wrapper */
function Reveal({ children, className = "", delay = 0, idx, label, labelEn }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setVis(true); });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <section ref={ref}
             className={`section ${className} ${vis ? 'is-vis' : ''}`}
             style={{ '--reveal-delay': `${delay}ms` }}
             data-section-idx={idx}
             data-screen-label={label ? `${String(idx).padStart(2,'0')} ${labelEn || label}` : undefined}>
      {children}
    </section>
  );
}

/* ─────────────────────────────────────────
   Atoms
   ───────────────────────────────────────── */
function Stamp({ ja, en, color = "#5A7A4A", rotate = -6, className = "" }) {
  return (
    <div className={`stamp ${className}`} style={{ '--stamp-color': color, transform: `rotate(${rotate}deg)` }}>
      <span className="stamp-ja">{ja}</span>
      {en && <span className="stamp-en">{en}</span>}
    </div>
  );
}

function HandCircle({ size = 100, color = "#5A7A4A", seed = 1, double = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{display:'block'}}>
      <path d={wobblyCircle(50, 50, 42, 1.8, seed)}
            fill="none" stroke={color} strokeWidth="2.4" strokeLinejoin="round"/>
      {double && <path d={wobblyCircle(50, 50, 36, 1.2, seed + 11)}
            fill="none" stroke={color} strokeWidth="0.8" opacity="0.5"/>}
    </svg>
  );
}

function HandUnderline({ width = 200, color = "#5A7A4A", seed = 5 }) {
  return (
    <svg width={width} height="14" viewBox={`0 0 ${width} 14`} style={{display:'block'}}>
      <path d={wobblyLine(2, 8, width - 2, 8, 1.8, seed)}
            fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d={wobblyLine(8, 12, width - 14, 12, 1.2, seed + 5)}
            fill="none" stroke={color} strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
    </svg>
  );
}

function Doodle({ kind, x, y, rotate = 0, color = "#1A1A1A", scale = 1 }) {
  const transforms = `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
  const styles = { position: 'absolute', transform: transforms, transformOrigin: 'center', pointerEvents: 'none' };
  if (kind === 'star')   return <svg style={styles} width="24" height="24" viewBox="-12 -12 24 24"><path d="M 0 -10 L 3 -3 L 10 -3 L 4 2 L 7 10 L 0 5 L -7 10 L -4 2 L -10 -3 L -3 -3 Z" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (kind === 'sparkle')return <svg style={styles} width="20" height="20" viewBox="-10 -10 20 20"><path d="M 0 -8 L 0 8 M -8 0 L 8 0" stroke={color} strokeWidth="1.6" strokeLinecap="round"/></svg>;
  if (kind === 'note')   return <svg style={styles} width="38" height="44" viewBox="-4 -42 26 50"><path d="M 0 0 L 0 -34 L 18 -38 L 18 -8" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><ellipse cx="-4" cy="0" rx="8" ry="5" fill={color}/><ellipse cx="14" cy="-8" rx="8" ry="5" fill={color}/></svg>;
  if (kind === 'heart')  return <svg style={styles} width="28" height="28" viewBox="-16 -2 32 28"><path d="M 0 0 C -8 -8 -16 -2 -16 6 C -16 14 0 22 0 22 C 0 22 16 14 16 6 C 16 -2 8 -8 0 0 Z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/></svg>;
  if (kind === 'arrow')  return <svg style={styles} width="80" height="20" viewBox="0 -10 80 20"><path d="M 0 0 Q 30 -10 60 0" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round"/><path d="M 52 -6 L 60 0 L 52 6" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round" strokeLinecap="round"/></svg>;
  if (kind === 'leaf')   return <svg style={styles} width="40" height="60" viewBox="-20 -30 40 60"><path d="M 0 -28 Q 18 -10 0 28 Q -18 -10 0 -28 Z" stroke={color} strokeWidth="1.6" fill="none"/><path d="M 0 -22 L 0 24" stroke={color} strokeWidth="1" opacity="0.6"/></svg>;
  if (kind === 'swirl')  return <svg style={styles} width="40" height="40" viewBox="-20 -20 40 40"><path d="M 0 0 Q 6 -8 14 -4 Q 22 0 18 8 Q 14 16 4 14 Q -6 12 -8 4" stroke={color} strokeWidth="1.6" fill="none" strokeLinecap="round"/></svg>;
  return null;
}

function PageHead({ ja, en, idx, stamp, stampEn, stampColor = "#5A7A4A", stampRotate = -5 }) {
  return (
    <div className="page-head">
      <div className="page-head-text">
        <span className="page-head-no">— ch. {String(idx).padStart(2,'0')} —</span>
        <span className="page-head-en">{en}</span>
        <h2 className="page-head-ja">{ja}</h2>
        <HandUnderline width={Math.max(180, ja.length * 36)} seed={idx * 17 + 41}/>
      </div>
      {stamp && <Stamp ja={stamp} en={stampEn} color={stampColor} rotate={stampRotate}/>}
    </div>
  );
}

/* ─────────────────────────────────────────
   Hero (cover) — big window with name overlay
   ───────────────────────────────────────── */
function HeroSection({ data }) {
  return (
    <Reveal idx={0} label="表紙" labelEn="cover" className="hero-section">
      <div className="hero-grid">
        <div className="hero-left">
          <div className="hero-icon">
            <svg viewBox="0 0 200 200" width="170" height="170">
              <path d={wobblyCircle(100, 100, 86, 2.2, 999)} fill="none" stroke="#1A1A1A" strokeWidth="2.4"/>
              <path d={wobblyCircle(100, 100, 92, 1.6, 1234)} fill="none" stroke="#1A1A1A" strokeWidth="0.8" opacity="0.4"/>
              <path d={wobblyCircle(100, 100, 78, 1.2, 5555)} fill="#F5F1E6"/>
            </svg>
            {data.channel.iconImage ? (
              <img className="hero-icon-img" src={data.channel.iconImage} alt="" />
            ) : (
              <span className="hero-icon-text">{data.channel.iconText}</span>
            )}
            <Doodle kind="sparkle" x={-12} y={20} color="#5A7A4A" scale={0.7}/>
            <Doodle kind="sparkle" x={156} y={140} color="#5A7A4A" scale={0.5}/>
          </div>
          <span className="hero-tagline-en">— {data.channel.tagline} —</span>

          <div className="hero-meta">
            <span className="hero-meta-row"><span className="hero-meta-label">since</span><span className="hero-meta-val">{data.bio.since}</span></span>
            <span className="hero-meta-row"><span className="hero-meta-label">based in</span><span className="hero-meta-val">{data.bio.place}</span></span>
            <span className="hero-meta-row"><span className="hero-meta-label">kana</span><span className="hero-meta-val">{data.channel.nameKana}</span></span>
          </div>
        </div>

        <div className="hero-right">
          <Hole seed={42} className="hole-hero" labelEn={`window — ${data.channel.tagline}`}>
            <h1 className="hero-name">{data.channel.nameJa}</h1>
          </Hole>
        </div>

        <Stamp ja="アーティスト" en="artist page" rotate={-5} className="stamp-hero"/>
        <Doodle kind="star"  x={-30} y={-20} color="#1A1A1A"/>
        <Doodle kind="swirl" x={40}  y={20}  color="#1A1A1A"/>
      </div>

      <div className="hero-bio">
        <p className="hero-bio-line">{data.bio.primary}</p>
        <p className="hero-bio-line hero-bio-sub">{data.bio.secondary}</p>
        <div className="hero-tags">
          <span className="tag">音楽</span>
          <span className="tag">文章</span>
          <span className="tag">道具づくり</span>
          <span className="tag tag-en">music · words · tools</span>
        </div>
      </div>

      <div className="scroll-cue">
        <span>scroll</span>
        <Doodle kind="arrow" x={0} y={4} rotate={90} color="#5A7A4A" scale={0.6}/>
      </div>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Activities
   ───────────────────────────────────────── */
function ActivitiesSection({ data }) {
  return (
    <Reveal idx={1} label="活動" labelEn="activities">
      <PageHead idx={1} ja="活動内容" en="what i do —" stamp="制作中" stampEn="in progress" stampRotate={4}/>

      <div className="activities-row">
        <div className="activities-grid">
          {data.activities.map((a, i) => (
            <div className={`activity-card activity-card-${i}`} key={a.ja}>
              <div className="activity-mark">
                <HandCircle size={86} seed={i * 17 + 3}/>
                <span className="activity-mark-text">{a.mark}</span>
              </div>
              <div className="activity-text">
                <span className="activity-no">No.0{i+1}</span>
                <h3 className="activity-ja">{a.ja}</h3>
                <span className="activity-en">— {a.en}</span>
              </div>
            </div>
          ))}
        </div>

        <Hole seed={88} className="hole-activities" labelEn="window — daily">
          <span className="hole-overlay-text">日々の<br/>道具</span>
        </Hole>
      </div>

      <p className="section-note">
        <span className="note-mark">※</span>
        その時々で、できることを少しずつ。
      </p>

      <Doodle kind="note" x={40}  y={20}  color="#1A1A1A" rotate={-10}/>
      <Doodle kind="heart" x={-40} y={40} color="#5A7A4A" scale={0.8}/>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Songs — interactive preview, with right-side window
   ───────────────────────────────────────── */
function SongsSection({ data }) {
  const [openIdx, setOpenIdx] = useState(null);
  const [progress, setProgress] = useState(0);
  const audioCtxRef = useRef(null);
  const stopRef = useRef(null);

  function ensureCtx() {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current;
  }
  function stopPreview() {
    if (stopRef.current) { stopRef.current(); stopRef.current = null; }
    setProgress(0);
  }
  function playPreview(idx) {
    stopPreview();
    const ctx = ensureCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const song = data.songs[idx];
    const tones = song.tone || [262, 330, 392];
    const now = ctx.currentTime;
    const dur = 6;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.16, now + 0.4);
    master.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    master.connect(ctx.destination);
    const oscs = tones.map((f, j) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = j === 0 ? 'sine' : 'triangle';
      o.frequency.value = f;
      g.gain.value = j === 0 ? 0.7 : 0.35;
      o.connect(g); g.connect(master);
      o.start(now + j * 0.18);
      o.stop(now + dur);
      return o;
    });
    const start = performance.now();
    let raf;
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const p = Math.min(elapsed / dur, 1);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else { setOpenIdx(null); setProgress(0); }
    };
    raf = requestAnimationFrame(tick);
    stopRef.current = () => {
      cancelAnimationFrame(raf);
      try { oscs.forEach(o => o.stop()); } catch (e) {}
    };
  }
  function toggle(idx) {
    if (openIdx === idx) { stopPreview(); setOpenIdx(null); }
    else { setOpenIdx(idx); playPreview(idx); }
  }
  useEffect(() => () => stopPreview(), []);

  return (
    <Reveal idx={2} label="楽曲" labelEn="songs">
      <PageHead idx={2} ja="最新作品 / 楽曲リスト" en="discography —" stamp="七曲" stampEn="7 songs" stampRotate={-5}/>

      <div className="songs-row">
        <div className="songs-list">
          <div className="songs-head-row">
            <span className="sh-no">no.</span>
            <span className="sh-title">title</span>
            <span className="sh-year">year</span>
            <span className="sh-tag">tag</span>
            <span className="sh-play">listen</span>
          </div>
          {data.songs.map((s, i) => {
            const isOpen = openIdx === i;
            return (
              <div className={`song-row ${isOpen ? 'is-open' : ''}`} key={s.no}>
                <button className="song-main" onClick={() => toggle(i)}>
                  <span className="song-no">{s.no}</span>
                  <span className="song-title-block">
                    <span className="song-title-ja">{s.title}</span>
                    <span className="song-title-en">— {s.titleEn}</span>
                  </span>
                  <span className="song-year">{s.year}</span>
                  <span className={`song-tag ${s.tag === 'original' ? 'tag-orig' : 'tag-cover'}`}>{s.tag}</span>
                  <span className="song-play">
                    <span className="play-icon" aria-hidden="true">{isOpen ? '■' : '▶'}</span>
                    <span className="play-label">{isOpen ? 'stop' : 'preview'}</span>
                  </span>
                </button>
                {isOpen && (
                  <div className="song-expanded">
                    <div className="song-bar-wrap">
                      <div className="song-bar-track"/>
                      <div className="song-bar-fill" style={{width:`${progress*100}%`}}/>
                      <span className="song-bar-text">∼ プレビュー再生中（合成音）∼</span>
                    </div>
                    <div className="song-links">
                      {s.youtube && <a href={s.youtube} target="_blank" rel="noopener" className="song-link">YouTube ↗</a>}
                      {s.spotify && <a href={s.spotify} target="_blank" rel="noopener" className="song-link">Spotify ↗</a>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="songs-side">
          <Hole seed={123} className="hole-songs hole-songs-1" labelEn="now"/>
          <Hole seed={456} className="hole-songs hole-songs-2" labelEn="then"/>
        </div>
      </div>

      <p className="section-note">
        ※ プレビューは雰囲気を伝えるための合成音です。フルバージョンは各リンクから。
      </p>

      <Doodle kind="note" x={40} y={-20} color="#1A1A1A" rotate={-12}/>
      <Doodle kind="star" x={-40} y={20} color="#5A7A4A" scale={0.8}/>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Links
   ───────────────────────────────────────── */
function LinksSection({ data }) {
  return (
    <Reveal idx={3} label="リンク" labelEn="links">
      <PageHead idx={3} ja="リンク集" en="links / find me here —" stamp="連絡先" stampEn="follow" stampRotate={5}/>

      <div className="links-row">
        <div className="links-grid">
          {data.links.map((l, i) => (
            <a className={`link-card link-card-${i % 3}`} href={l.url} target="_blank" rel="noopener" key={l.key}>
              <div className="link-mark">
                <HandCircle size={64} seed={i * 31 + 7} color="#5A7A4A"/>
                <span className="link-mark-text">{l.mark}</span>
              </div>
              <div className="link-text">
                <span className="link-label">{l.label}</span>
                <span className="link-handle">{l.handle}</span>
                <span className="link-url">{l.url.replace(/^https?:\/\//, '').replace(/\?.*$/, '').slice(0, 38)}{l.url.length > 50 ? '…' : ''}</span>
              </div>
              <span className="link-arrow">↗</span>
            </a>
          ))}
        </div>

        <Hole seed={222} className="hole-links" labelEn="window — outside">
          <span className="hole-overlay-text">外の<br/>けしき</span>
        </Hole>
      </div>

      <Doodle kind="leaf" x={-30} y={40} color="#5A7A4A" rotate={20} scale={0.8}/>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Fanart — 6 windows = polaroid gallery
   ───────────────────────────────────────── */
function FanartSection({ data }) {
  const slots = Array.from({ length: data.fanart.placeholders });
  return (
    <Reveal idx={4} label="ファンアート / グッズ" labelEn="fanart and goods">
      <PageHead idx={4} ja="ファンアート" en="fanart corner —" stamp="ありがとう" stampEn="with love" stampRotate={-4}/>

      <div className="fa-tag-block">
        <p className="fa-tag-line">
          <span className="fa-hash">#</span>
          <span className="fa-tag">{data.fanart.tag.replace(/^#/, '')}</span>
        </p>
        <p className="fa-note">{data.fanart.note}</p>
      </div>

      <div className="fa-thumbs">
        {slots.map((_, i) => (
          <div className={`fa-thumb fa-thumb-${i}`} key={i} style={{ '--r': `${(i*7)%5 - 2}deg` }}>
            <Hole seed={i * 41 + 9} labelEn={`@user_${i+1}`}/>
            <span className="fa-thumb-pin"/>
          </div>
        ))}
      </div>

      <div className="goods-block">
        <h3 className="goods-title">
          <span className="page-head-en">goods —</span>
          グッズ
        </h3>
        <ul className="goods-list">
          {data.goods.map((g, i) => (
            <li className="goods-item" key={g.name}>
              <div className="goods-mark">
                <svg viewBox="0 0 60 60" width="60" height="60">
                  <path d={wobblyRect(6, 6, 48, 48, 1.6, i * 13 + 5)} fill="#EFE9D8" stroke="#1A1A1A" strokeWidth="1.6"/>
                  <text x="30" y="38" fontFamily="Shippori Mincho, serif" fontSize="22" fontWeight="800" fill="#5A7A4A" textAnchor="middle">
                    {['歌','◆','草'][i] || '・'}
                  </text>
                </svg>
              </div>
              <div className="goods-text">
                <span className="goods-name">{g.name}</span>
                <span className="goods-status">{g.status}</span>
              </div>
              <span className="goods-price">{g.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <Doodle kind="heart" x={40} y={-30} color="#5A7A4A" scale={0.9}/>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Contact
   ───────────────────────────────────────── */
function ContactSection({ data }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const email = data.contact.email.replace('[at]', '@');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  }
  return (
    <Reveal idx={5} label="コンタクト" labelEn="contact">
      <PageHead idx={5} ja="お問い合わせ" en="contact —" stamp="お気軽に" stampEn="say hi" stampRotate={4}/>

      <div className="contact-row">
        <div className="contact-left">
          <p className="contact-note">{data.contact.note}</p>

          <div className="contact-card">
            <span className="contact-card-label">e-mail</span>
            <span className="contact-card-value">{data.contact.email}</span>
            <button className="contact-copy" onClick={copy}>{copied ? '✓ copied' : 'copy'}</button>
          </div>

          <p className="contact-response">
            <span className="note-mark">※</span>
            {data.contact.response}
          </p>
        </div>

        <Hole seed={555} className="hole-contact" labelEn="window — sky">
          <div className="signoff-overlay">
            <p className="signoff-text">最後まで見てくれて<br/>ありがとうございました。</p>
            <span className="signoff-en">— thank you for visiting —</span>
            <span className="signoff-sign">— hjjjsn</span>
          </div>
        </Hole>
      </div>

      <Doodle kind="leaf" x={-30} y={40} color="#5A7A4A" rotate={-15}/>
      <Doodle kind="sparkle" x={40} y={-30} color="#5A7A4A"/>
    </Reveal>
  );
}

/* ─────────────────────────────────────────
   Top header / Side index
   ───────────────────────────────────────── */
function TopHeader({ data }) {
  return (
    <header className="top-header">
      <div className="th-left">
        <div className="th-icon">
          <svg viewBox="0 0 60 60" width="40" height="40">
            <path d={wobblyCircle(30, 30, 24, 1.4, 99)} fill="#F5F1E6" stroke="#1A1A1A" strokeWidth="1.8"/>
          </svg>
          {data.channel.iconImage ? (
            <img className="th-icon-img" src={data.channel.iconImage} alt="" />
          ) : (
            <span className="th-icon-text">{data.channel.iconText}</span>
          )}
        </div>
        <div className="th-text">
          <span className="th-name">{data.channel.nameJa}</span>
          <span className="th-tag">— {data.channel.tagline}</span>
        </div>
      </div>
      <span className="th-right">artist · since {data.bio.since}</span>
    </header>
  );
}

function SideIndex({ active, onJump }) {
  const items = [
    { id: 0, ja: "表紙",       en: "cover" },
    { id: 1, ja: "活動",       en: "activities" },
    { id: 2, ja: "楽曲",       en: "songs" },
    { id: 3, ja: "リンク",     en: "links" },
    { id: 4, ja: "アート",     en: "fanart" },
    { id: 5, ja: "連絡",       en: "contact" }
  ];
  return (
    <nav className="side-index" aria-label="page index">
      <span className="side-index-title">— index —</span>
      <ul>
        {items.map(it => (
          <li key={it.id} className={active === it.id ? 'is-active' : ''}>
            <button onClick={() => onJump(it.id)}>
              <span className="si-no">{String(it.id).padStart(2,'0')}</span>
              <span className="si-ja">{it.ja}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─────────────────────────────────────────
   Background controls (drop-zone + tweaks)
   ───────────────────────────────────────── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "bgImage": "",
  "bgGrayscale": 1,
  "bgBrightness": 0.85,
  "bgContrast": 1.05
}/*EDITMODE-END*/;

function BgControls({ tweaks, setTweak }) {
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef(null);

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setTweak('bgImage', e.target.result);
    reader.readAsDataURL(file);
  }

  return (
    <>
      <button className={`bg-pill ${open ? 'is-open' : ''}`} onClick={() => setOpen(o => !o)}>
        <span className="bg-pill-icon">▢</span>
        <span className="bg-pill-text">背景</span>
      </button>
      {open && (
        <div className="bg-panel">
          <div className="bg-panel-head">
            <span>背景画像 / background</span>
            <button className="bg-panel-close" onClick={() => setOpen(false)}>×</button>
          </div>
          <p className="bg-panel-hint">
            ドラッグ&ドロップ または<br/>下のボタンから画像を選んでください
          </p>
          <div className="bg-panel-buttons">
            <button className="bg-btn" onClick={() => fileInputRef.current?.click()}>
              ファイルを選ぶ
            </button>
            <button className="bg-btn bg-btn-clear" onClick={() => setTweak('bgImage', '')}>
              クリア
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{display:'none'}}
            onChange={e => loadFile(e.target.files?.[0])}
          />
          <div className="bg-panel-section">
            <label className="bg-slider">
              <span className="bg-slider-label">モノクロ</span>
              <input type="range" min="0" max="1" step="0.05"
                     value={tweaks.bgGrayscale}
                     onChange={e => setTweak('bgGrayscale', parseFloat(e.target.value))}/>
              <span className="bg-slider-val">{Math.round(tweaks.bgGrayscale * 100)}%</span>
            </label>
            <label className="bg-slider">
              <span className="bg-slider-label">明るさ</span>
              <input type="range" min="0.3" max="1.4" step="0.05"
                     value={tweaks.bgBrightness}
                     onChange={e => setTweak('bgBrightness', parseFloat(e.target.value))}/>
              <span className="bg-slider-val">{Math.round(tweaks.bgBrightness * 100)}%</span>
            </label>
            <label className="bg-slider">
              <span className="bg-slider-label">コントラスト</span>
              <input type="range" min="0.6" max="1.6" step="0.05"
                     value={tweaks.bgContrast}
                     onChange={e => setTweak('bgContrast', parseFloat(e.target.value))}/>
              <span className="bg-slider-val">{Math.round(tweaks.bgContrast * 100)}%</span>
            </label>
          </div>
          <p className="bg-panel-foot">
            ※ 画像はブラウザ内のみで保持。リロードするとリセットされます。
          </p>
        </div>
      )}
    </>
  );
}

/* persist tweaks to localStorage so reloads keep the bg */
function useLocalTweaks() {
  const [tweaks, setTweaks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('hj_tweaks') || 'null');
      if (saved) {
        const restored = { ...TWEAK_DEFAULTS, ...saved };
        if (restored.bgImage && !String(restored.bgImage).startsWith('data:image/')) {
          restored.bgImage = "";
        }
        return restored;
      }
    } catch (e) {}
    return TWEAK_DEFAULTS;
  });
  useEffect(() => {
    try { localStorage.setItem('hj_tweaks', JSON.stringify(tweaks)); } catch (e) {}
  }, [tweaks]);
  const setTweak = useCallback((k, v) => {
    setTweaks(prev => typeof k === 'object' ? { ...prev, ...k } : { ...prev, [k]: v });
  }, []);
  return [tweaks, setTweak];
}

/* ─────────────────────────────────────────
   Main App
   ───────────────────────────────────────── */
function App() {
  const data = dataSource;
  const [tweaks, setTweak] = useLocalTweaks();
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);

  /* observe sections */
  useEffect(() => {
    const els = document.querySelectorAll('.section');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && e.intersectionRatio > 0.3) {
          const idx = parseInt(e.target.dataset.sectionIdx || '0', 10);
          setActive(idx);
        }
      });
    }, { threshold: [0.3, 0.5, 0.7] });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  function jump(idx) {
    const el = document.querySelector(`.section[data-section-idx="${idx}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* drag-drop image */
  useEffect(() => {
    let depth = 0;
    function onDragEnter(e) { e.preventDefault(); depth++; setDragging(true); }
    function onDragLeave(e) { e.preventDefault(); depth--; if (depth <= 0) { depth = 0; setDragging(false); } }
    function onDragOver(e)  { e.preventDefault(); }
    function onDrop(e) {
      e.preventDefault(); depth = 0; setDragging(false);
      const f = e.dataTransfer?.files?.[0];
      if (f && f.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setTweak('bgImage', ev.target.result);
        reader.readAsDataURL(f);
      }
    }
    window.addEventListener('dragenter', onDragEnter);
    window.addEventListener('dragleave', onDragLeave);
    window.addEventListener('dragover', onDragOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onDragEnter);
      window.removeEventListener('dragleave', onDragLeave);
      window.removeEventListener('dragover', onDragOver);
      window.removeEventListener('drop', onDrop);
    };
  }, [setTweak]);

  /* propagate bg vars to :root so .hole-inner can read them too */
  useEffect(() => {
    const r = document.documentElement.style;
    const defaultBg = new URL('assets/background.jpg', window.location.href).href;
    r.setProperty('--bg-image', `url("${tweaks.bgImage || defaultBg}")`);
    r.setProperty('--bg-grayscale', tweaks.bgGrayscale);
    r.setProperty('--bg-brightness', tweaks.bgBrightness);
    r.setProperty('--bg-contrast', tweaks.bgContrast);
  }, [tweaks]);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    let currentAspect = 4 / 3;
    const bgUrl = tweaks.bgImage || new URL('assets/background.jpg', window.location.href).href;

    function applyHoleBackgrounds() {
      if (cancelled) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const coverW = Math.max(vw, vh * currentAspect);
      const coverH = coverW / currentAspect;
      const left = (vw - coverW) / 2;
      const top = (vh - coverH) / 2;

      document.querySelectorAll('.hole-inner').forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--hole-bg-size', `${coverW}px ${coverH}px`);
        el.style.setProperty('--hole-bg-position', `${left - rect.left}px ${top - rect.top}px`);
      });
    }

    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(applyHoleBackgrounds);
    }

    const img = new Image();
    img.onload = () => {
      currentAspect = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 4 / 3;
      schedule();
    };
    img.onerror = schedule;
    img.src = bgUrl;

    const fallback = () => schedule();
    window.addEventListener('scroll', fallback, { passive: true });
    window.addEventListener('resize', fallback);
    schedule();
    const timers = [120, 480, 960].map((delay) => setTimeout(schedule, delay));

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      window.removeEventListener('scroll', fallback);
      window.removeEventListener('resize', fallback);
    };
  }, [tweaks.bgImage]);

  return (
    <>
      <div className="bg-layer"/>
      <div className="bg-tint"/>
      <div className={`dropzone ${dragging ? 'is-active' : ''}`}>
        画像をドロップして背景に
      </div>

      <GlobalDefs/>
      <TopHeader data={data}/>
      <SideIndex active={active} onJump={jump}/>
      <BgControls tweaks={tweaks} setTweak={setTweak}/>

      <main className="paper">
        <div className="paper-bg"/>
        <HeroSection data={data}/>
        <ActivitiesSection data={data}/>
        <SongsSection data={data}/>
        <LinksSection data={data}/>
        <FanartSection data={data}/>
        <ContactSection data={data}/>
        <footer className="paper-footer">
          <span>— end —</span>
          <span className="paper-footer-sub">© hjjjsn · この紙は紙ではありません</span>
        </footer>
      </main>

      {!tweaks.bgImage && (
        <span className="bg-empty-hint">
          ▢ 背景は assets/background.jpg。差し替えは右下の「背景」ボタンから
        </span>
      )}
    </>
  );
}

export default App;
