*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:        #0a0a0b;
  --bg2:       #111113;
  --bg3:       #18181b;
  --border:    #27272a;
  --border2:   #3f3f46;
  --text:      #fafafa;
  --text2:     #a1a1aa;
  --text3:     #52525b;
  --green:     #22c55e;
  --green-bg:  rgba(34,197,94,0.1);
  --red:       #ef4444;
  --red-bg:    rgba(239,68,68,0.1);
  --amber:     #f59e0b;
  --amber-bg:  rgba(245,158,11,0.1);
  --blue:      #3b82f6;
  --blue-bg:   rgba(59,130,246,0.1);
  --font-head: 'Syne', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

html, body, #root {
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button {
  font-family: var(--font-body);
  cursor: pointer;
  border: none;
  outline: none;
}

::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }

@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
.fade-in { animation: fadeIn 0.35s ease forwards; }
