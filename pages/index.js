import { useState, useRef, useCallback } from 'react';
import Head from 'next/head';

export default function Home() {
  const [state, setState] = useState('idle'); // idle | dragging | processing | done | error
  const [fileName, setFileName] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const processFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.docx')) {
      setErrorMsg('Please upload a .docx file (Microsoft Word format)');
      setState('error');
      return;
    }

    setFileName(file.name);
    setState('processing');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('docx', file);

      const res = await fetch('/api/convert', { method: 'POST', body: formData });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
        throw new Error(err.error || 'Conversion failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setState('done');
    } catch (e) {
      setErrorMsg(e.message);
      setState('error');
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setState('idle');
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setState('dragging'); };
  const handleDragLeave = () => setState('idle');
  const handleFileChange = (e) => processFile(e.target.files[0]);

  const reset = (e) => {
    e?.stopPropagation();
    setState('idle');
    setFileName('');
    setDownloadUrl('');
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isClickable = state === 'idle';

  return (
    <>
      <Head>
        <title>Aesthetic Notes Studio</title>
        <meta name="description" content="Transform plain .docx files into beautiful pastel-coloured, handwriting-style notes. Free, instant, no sign-up." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>✿</text></svg>" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Nunito:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>

      <div className="page">
        {/* Ambient background */}
        <div className="blob b1" />
        <div className="blob b2" />
        <div className="blob b3" />
        <div className="grain" />

        {/* Floating decorative elements */}
        <div className="float f1">✿</div>
        <div className="float f2">✦</div>
        <div className="float f3">❀</div>
        <div className="float f4">◆</div>
        <div className="float f5">✿</div>

        <main>
          {/* ── Hero ── */}
          <header>
            <div className="pill">✦ Free · No sign-up · Instant ✦</div>
            <h1>
              <span className="t1">Aesthetic</span>
              <span className="t2">Notes Studio</span>
            </h1>
            <p className="sub">
              Upload any .docx — get back gorgeous pastel-coloured notes<br />
              <em>with handwriting fonts, cute bullets &amp; colour-coded headings</em>
            </p>
          </header>

          {/* ── Upload zone ── */}
          <div className="zone-wrap">
            <div
              className={`zone z-${state}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => isClickable && fileInputRef.current?.click()}
              role={isClickable ? 'button' : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => e.key === 'Enter' && isClickable && fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".docx" onChange={handleFileChange} hidden aria-label="Upload docx file" />

              {state === 'idle' && <>
                <div className="big-icon">✿</div>
                <p className="zone-main">Drop your .docx here</p>
                <p className="zone-sub">or click to browse your files</p>
                <div className="zone-tag">.docx only · max 20 MB</div>
              </>}

              {state === 'dragging' && <>
                <div className="big-icon pulse">❀</div>
                <p className="zone-main">Release to transform~</p>
              </>}

              {state === 'processing' && <>
                <div className="spinner">✦</div>
                <p className="zone-main">Styling your notes…</p>
                <p className="zone-sub fname">{fileName}</p>
                <p className="zone-sub">Applying pastel magic ✨</p>
              </>}

              {state === 'done' && <>
                <div className="big-icon tada">✿</div>
                <p className="zone-main">Your notes are ready!</p>
                <p className="zone-sub fname">{fileName}</p>
                <a className="dl-btn" href={downloadUrl} download="aesthetic_notes.docx" onClick={(e) => e.stopPropagation()}>
                  ↓ Download aesthetic_notes.docx
                </a>
                <button className="link-btn" onClick={reset}>Convert another →</button>
              </>}

              {state === 'error' && <>
                <div className="big-icon">✗</div>
                <p className="zone-main">Oops!</p>
                <p className="zone-sub err">{errorMsg}</p>
                <button className="link-btn" onClick={reset}>Try again →</button>
              </>}
            </div>
          </div>

          {/* ── How it works ── */}
          <section className="steps">
            <h2>How it works</h2>
            <div className="sgrid">
              {[
                { n: '01', icon: '📄', accent: '#7C4DFF', bg: '#EDE7F6', title: 'Upload', text: 'Drop in any .docx — lecture notes, textbook chapters, study guides, anything.' },
                { n: '02', icon: '✦',  accent: '#E91E8C', bg: '#FCE4EC', title: 'Transform', text: 'We apply pastel backgrounds, handwriting fonts, cute symbols & colour-coded hierarchy.' },
                { n: '03', icon: '✿',  accent: '#0097A7', bg: '#E0F7FA', title: 'Download', text: 'Get your aesthetic .docx instantly, fully editable in Word or Google Docs.' },
              ].map(s => (
                <div className="scard" key={s.n} style={{ '--acc': s.accent, '--bg': s.bg }}>
                  <span className="sn">{s.n}</span>
                  <div className="sicon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── Style preview ── */}
          <section className="preview">
            <h2>Style preview</h2>
            <p className="prev-desc">Every heading level gets its own pastel colour &amp; symbol</p>
            <div className="chips">
              {[
                { color: '#7C4DFF', bg: '#EDE7F6', label: '✿  Chapter Title' },
                { color: '#E91E8C', bg: '#FCE4EC', label: '❀  Major Section' },
                { color: '#0097A7', bg: '#E0F7FA', label: '✦  Subsection' },
                { color: '#FF6F00', bg: '#FFF3E0', label: '◆  Sub-topic' },
                { color: '#2E7D32', bg: '#E8F5E9', label: '➤  Key Point' },
                { color: '#E65100', bg: '#FFF9C4', label: '📝  Note Box' },
              ].map(c => (
                <span className="chip" key={c.label} style={{ background: c.bg, color: c.color, borderColor: c.color + '55' }}>
                  {c.label}
                </span>
              ))}
            </div>
            <p className="prev-note">Segoe Script · pastel backgrounds · colour-coded 6-level hierarchy</p>
          </section>
        </main>

        <footer>
          <p>Made with ✿ — Aesthetic Notes Studio</p>
          <p className="fsub">Files are processed in memory and never stored on the server.</p>
        </footer>
      </div>

      {/* ─── Styles ─────────────────────────────────────────────────────── */}
      <style jsx global>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Nunito', sans-serif;
          background: #FFFBF5;
          color: #1A1A1A;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }
        a { text-decoration: none; }
        button { font-family: inherit; }
      `}</style>

      <style jsx>{`
        /* ── Page shell ── */
        .page {
          min-height: 100vh;
          position: relative;
        }

        /* ── Ambient blobs ── */
        .blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          opacity: 0.28;
          pointer-events: none;
          z-index: 0;
          animation: drift 10s ease-in-out infinite;
        }
        .b1 { width: 600px; height: 600px; background: #EDE7F6; top: -180px; left: -200px; }
        .b2 { width: 450px; height: 450px; background: #FCE4EC; bottom: 0; right: -120px; animation-delay: -4s; }
        .b3 { width: 350px; height: 350px; background: #E0F7FA; top: 45%; left: 55%; animation-delay: -7s; }
        @keyframes drift {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(24px,-18px) scale(1.06); }
        }

        /* ── Grain overlay ── */
        .grain {
          position: fixed; inset: 0; z-index: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          opacity: 0.5;
        }

        /* ── Floating symbols ── */
        .float {
          position: fixed;
          font-size: 18px;
          opacity: 0.12;
          pointer-events: none;
          z-index: 0;
          animation: floatUp 14s ease-in-out infinite;
        }
        .f1 { color: #7C4DFF; bottom: 15%; left: 4%;  animation-delay: 0s; }
        .f2 { color: #E91E8C; bottom: 35%; left: 92%; animation-delay: -3s; font-size: 14px; }
        .f3 { color: #0097A7; bottom: 65%; left: 2%;  animation-delay: -6s; }
        .f4 { color: #FF6F00; bottom: 55%; left: 94%; animation-delay: -9s; font-size: 14px; }
        .f5 { color: #E91E8C; bottom: 85%; left: 6%;  animation-delay: -11s; font-size: 22px; opacity: 0.08; }
        @keyframes floatUp {
          0%,100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(15deg); }
        }

        /* ── Main ── */
        main {
          position: relative; z-index: 1;
          max-width: 860px;
          margin: 0 auto;
          padding: 64px 24px 80px;
        }

        /* ── Header ── */
        header { text-align: center; margin-bottom: 56px; }

        .pill {
          display: inline-block;
          background: #EDE7F6;
          color: #7C4DFF;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.8px;
          text-transform: uppercase;
          padding: 6px 18px;
          border-radius: 100px;
          margin-bottom: 28px;
          border: 1px solid #D1C4E9;
        }

        h1 { margin-bottom: 20px; line-height: 1.02; }
        .t1 {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(58px, 9vw, 108px);
          font-weight: 400;
          font-style: italic;
          color: #7C4DFF;
          line-height: 1;
        }
        .t2 {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5.5vw, 60px);
          font-weight: 600;
          color: #1A1A1A;
        }

        .sub {
          font-size: 16px; font-weight: 300;
          color: #666; line-height: 1.75;
        }
        .sub em { color: #E91E8C; font-style: normal; font-weight: 500; }

        /* ── Upload zone ── */
        .zone-wrap {
          display: flex; justify-content: center;
          margin-bottom: 88px;
        }

        .zone {
          width: 100%; max-width: 580px;
          min-height: 290px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border: 2.5px dashed #CE93D8;
          border-radius: 28px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 10px;
          padding: 44px 36px;
          transition: all 0.3s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 8px 48px rgba(124,77,255,0.07), 0 2px 12px rgba(0,0,0,0.04);
          text-align: center;
        }
        .z-idle { cursor: pointer; }
        .z-idle:hover, .z-dragging {
          border-color: #7C4DFF;
          background: rgba(237,231,246,0.45);
          box-shadow: 0 14px 56px rgba(124,77,255,0.16);
          transform: translateY(-3px);
        }
        .z-processing, .z-done, .z-error { cursor: default; }
        .z-done { border-color: #0097A7; background: rgba(224,247,250,0.4); }
        .z-error { border-color: #E91E8C; background: rgba(252,228,236,0.3); }

        .big-icon {
          font-size: 60px; line-height: 1;
          transition: transform 0.3s;
        }
        .pulse { animation: pulse .85s ease-in-out infinite alternate; }
        .tada  { animation: tada .55s ease; }
        @keyframes pulse { to { transform: scale(1.22); } }
        @keyframes tada {
          0%   { transform: scale(1) rotate(0); }
          25%  { transform: scale(1.18) rotate(-6deg); }
          50%  { transform: scale(1.18) rotate(6deg); }
          75%  { transform: scale(1.08) rotate(-3deg); }
          100% { transform: scale(1) rotate(0); }
        }

        .spinner {
          font-size: 52px;
          animation: spin 1.4s linear infinite;
          color: #7C4DFF;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .zone-main {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px; font-weight: 600;
          color: #1A1A1A;
        }
        .zone-sub {
          font-size: 13px; color: #999; font-weight: 300;
          max-width: 320px;
        }
        .fname { color: #7C4DFF; font-weight: 500; word-break: break-all; }
        .err   { color: #E91E8C !important; font-weight: 400 !important; }

        .zone-tag {
          display: inline-block;
          background: #F5F0FF;
          color: #9E81E8;
          font-size: 11px; font-weight: 600;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px;
          margin-top: 4px;
        }

        .dl-btn {
          display: inline-block;
          margin-top: 6px;
          background: linear-gradient(135deg, #7C4DFF 0%, #E91E8C 100%);
          color: #fff;
          padding: 14px 34px;
          border-radius: 100px;
          font-weight: 600; font-size: 14px;
          letter-spacing: 0.3px;
          transition: all 0.2s;
          box-shadow: 0 4px 22px rgba(124,77,255,0.32);
        }
        .dl-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(124,77,255,0.42);
        }

        .link-btn {
          background: none; border: none;
          color: #AAA; font-size: 13px; cursor: pointer;
          padding: 4px 8px;
          transition: color 0.2s;
          font-weight: 400;
        }
        .link-btn:hover { color: #7C4DFF; }

        /* ── Steps ── */
        .steps { margin-bottom: 80px; }

        h2 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 5vw, 46px);
          font-weight: 600;
          text-align: center;
          margin-bottom: 40px;
          color: #1A1A1A;
        }

        .sgrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 620px) {
          .sgrid { grid-template-columns: 1fr; }
        }

        .scard {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(12px);
          border-radius: 22px;
          padding: 28px 24px 24px;
          position: relative; overflow: hidden;
          border-top: 3px solid var(--acc);
          box-shadow: 0 4px 24px rgba(0,0,0,0.05);
          transition: transform 0.25s cubic-bezier(.22,1,.36,1);
        }
        .scard:hover { transform: translateY(-5px); }
        .scard::before {
          content: '';
          position: absolute; inset: 0;
          background: var(--bg);
          opacity: 0.25;
          pointer-events: none;
        }

        .sn {
          position: absolute; top: 14px; right: 18px;
          font-family: 'Cormorant Garamond', serif;
          font-size: 52px; font-weight: 600;
          color: var(--acc); opacity: 0.1;
          line-height: 1;
          pointer-events: none;
        }
        .sicon { font-size: 34px; margin-bottom: 14px; position: relative; }
        .scard h3 {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px; font-weight: 600;
          margin-bottom: 8px;
          color: var(--acc);
          position: relative;
        }
        .scard p {
          font-size: 14px; line-height: 1.65;
          color: #666; font-weight: 300;
          position: relative;
        }

        /* ── Preview ── */
        .preview { text-align: center; margin-bottom: 80px; }

        .prev-desc { font-size: 15px; color: #888; font-weight: 300; margin-bottom: 24px; }
        .prev-note  { font-size: 12px; color: #BBB; font-weight: 300; margin-top: 16px; letter-spacing: 0.3px; }

        .chips {
          display: flex; flex-wrap: wrap;
          gap: 10px; justify-content: center;
          margin-bottom: 8px;
        }
        .chip {
          display: inline-block;
          padding: 9px 18px;
          border-radius: 100px;
          border: 1.5px solid;
          font-size: 13px; font-weight: 600;
          transition: transform 0.2s;
          cursor: default;
        }
        .chip:hover { transform: scale(1.06); }

        /* ── Footer ── */
        footer {
          position: relative; z-index: 1;
          text-align: center;
          padding: 28px 24px 36px;
          border-top: 1px solid rgba(206,147,216,0.2);
          font-size: 13px; color: #AAA; font-weight: 300;
        }
        .fsub { font-size: 11px; margin-top: 4px; }
      `}</style>
    </>
  );
}
