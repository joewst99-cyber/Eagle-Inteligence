.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--bg);
}

/* ── Sidebar ── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 0 0 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 16px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 12px;
}
.logo-eagle { font-size: 22px; }
.logo-title { font-family: var(--font-head); font-size: 16px; font-weight: 700; letter-spacing: 0.04em; }
.logo-sub   { font-size: 10px; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; }

.nav { display: flex; flex-direction: column; gap: 2px; padding: 0 8px 12px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
.nav-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 6px;
  font-size: 13px; color: var(--text2);
  background: transparent; text-align: left; width: 100%;
  transition: all 0.15s;
}
.nav-item:hover { background: var(--bg3); color: var(--text); }
.nav-item.active { background: var(--blue-bg); color: var(--blue); }
.nav-icon { font-size: 14px; width: 18px; text-align: center; }

.sidebar-section { padding: 0 12px 12px; border-bottom: 1px solid var(--border); margin-bottom: 12px; }
.sidebar-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text3); margin-bottom: 8px; }

.interval-group { display: flex; gap: 4px; }
.interval-btn {
  flex: 1; padding: 5px 0; border-radius: 5px; font-size: 11px;
  background: var(--bg3); color: var(--text2); border: 1px solid var(--border);
  transition: all 0.15s;
}
.interval-btn:hover { border-color: var(--border2); color: var(--text); }
.interval-btn.active { background: var(--blue-bg); color: var(--blue); border-color: var(--blue); }
.countdown { font-size: 11px; color: var(--text2); margin-top: 6px; font-family: var(--font-mono); text-align: center; animation: pulse 2s infinite; }

.watch-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 7px 8px; border-radius: 5px; width: 100%;
  background: transparent; text-align: left;
  transition: background 0.15s; margin-bottom: 1px;
}
.watch-item:hover { background: var(--bg3); }
.watch-item.active { background: var(--bg3); border-left: 2px solid var(--blue); padding-left: 6px; }
.watch-label { font-size: 12px; color: var(--text2); }
.watch-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.watch-price { font-size: 11px; color: var(--text); }
.watch-pct { font-size: 10px; }

.sidebar-footer { padding: 0 12px; margin-top: auto; }
.updated { font-size: 10px; color: var(--text3); }

/* ── Main ── */
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 16px 20px 12px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
  flex-shrink: 0;
}
.topbar-left { display: flex; flex-direction: column; gap: 6px; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

.page-title { font-family: var(--font-head); font-size: 20px; font-weight: 600; }
.regime-badge { font-size: 11px; color: var(--text2); max-width: 500px; line-height: 1.4; }

.sentiment-badge {
  font-size: 11px; padding: 5px 12px; border-radius: 20px;
  border: 1px solid; max-width: 360px; line-height: 1.4;
}

.refresh-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
  background: var(--blue-bg); color: var(--blue); border: 1px solid var(--blue);
  white-space: nowrap; transition: all 0.15s;
}
.refresh-btn:hover:not(:disabled) { background: var(--blue); color: #fff; }
.refresh-btn:disabled { opacity: 0.5; cursor: default; }
.spinning { display: inline-block; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.error-bar {
  margin: 10px 20px 0;
  padding: 10px 14px;
  background: var(--red-bg); border: 1px solid var(--red);
  border-radius: 6px; font-size: 13px; color: var(--red);
  flex-shrink: 0;
}

/* ── Asset strip ── */
.asset-strip {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 1fr));
  gap: 6px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.asset-card {
  background: var(--bg2); border: 1px solid var(--border);
  border-radius: 8px; padding: 9px 8px; cursor: pointer; text-align: left;
  transition: all 0.15s;
}
.asset-card:hover { border-color: var(--border2); background: var(--bg3); }
.asset-card.active { border-color: var(--blue); background: var(--blue-bg); }
.asset-label { font-size: 9px; color: var(--text2); margin-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
.asset-price { font-size: 12px; font-weight: 500; font-family: var(--font-mono); }
.asset-pct   { font-size: 10px; font-family: var(--font-mono); }
.asset-bias  { font-size: 9px; margin-top: 2px; font-weight: 600; letter-spacing: 0.04em; }
.asset-empty { font-size: 11px; color: var(--text3); padding: 6px 0; }

/* ── Content area ── */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.grid-3 {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 1fr);
  gap: 12px;
  align-items: start;
}

/* ── Panel ── */
.panel {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
}
.panel-title {
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text3); margin-bottom: 10px; font-weight: 600;
}
.panel-text { font-size: 12px; color: var(--text2); line-height: 1.6; }
.empty-state { font-size: 12px; color: var(--text3); text-align: center; padding: 24px 0; }

/* ── Gauge ── */
.gauge-labels { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 6px; }
.gauge-track { height: 5px; background: var(--bg3); border-radius: 3px; position: relative; margin-bottom: 10px; }
.gauge-fill { position: absolute; left: 0; top: 0; height: 100%; border-radius: 3px; opacity: 0.5; transition: width 0.6s ease; }
.gauge-dot { position: absolute; top: 50%; transform: translate(-50%, -50%); width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--bg); transition: left 0.6s ease; }

/* ── Cards ── */
.card-list { display: flex; flex-direction: column; gap: 7px; }

.news-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
.news-header { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 5px; align-items: flex-start; }
.news-title { font-size: 12px; font-weight: 500; line-height: 1.4; flex: 1; }
.news-summary { font-size: 11px; color: var(--text2); line-height: 1.55; margin-bottom: 6px; }
.news-footer { display: flex; gap: 5px; flex-wrap: wrap; align-items: center; }
.impact-badge { font-size: 9px; font-weight: 600; padding: 2px 6px; border-radius: 4px; white-space: nowrap; flex-shrink: 0; }
.asset-tag { font-size: 10px; color: var(--text2); background: var(--bg); padding: 1px 5px; border-radius: 3px; border: 1px solid var(--border); }

.cal-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; }
.cal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.cal-time { font-size: 10px; font-family: var(--font-mono); color: var(--text2); }
.cal-event { font-size: 12px; font-weight: 500; margin-bottom: 4px; }

/* ── Deep Dive ── */
.dd-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.dd-name { font-family: var(--font-head); font-size: 17px; font-weight: 600; }
.bias-pill { font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.04em; }
.dd-price { font-family: var(--font-mono); font-size: 34px; font-weight: 500; letter-spacing: -0.02em; }
.dd-pct { font-family: var(--font-mono); font-size: 14px; margin-bottom: 14px; }
.key-level { background: var(--bg3); border: 1px solid var(--border); border-radius: 7px; padding: 9px 12px; }
.key-level-label { font-size: 10px; color: var(--text3); margin-bottom: 2px; text-transform: uppercase; letter-spacing: 0.06em; }
.key-level-value { font-family: var(--font-mono); font-size: 15px; font-weight: 500; color: var(--amber); }

.related-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 11px; border-radius: 7px;
  background: var(--bg3); border: 1px solid var(--border);
  width: 100%; text-align: left; cursor: pointer; transition: all 0.15s;
}
.related-card:hover { border-color: var(--border2); }
.related-label { font-size: 13px; }
.related-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }

/* ── Bias Table ── */
.table-head {
  display: grid; grid-template-columns: 1.2fr 1.4fr 0.8fr 1fr 2fr;
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.07em;
  color: var(--text3); font-weight: 600;
}
.table-row {
  display: grid; grid-template-columns: 1.2fr 1.4fr 0.8fr 1fr 2fr;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
  align-items: center; cursor: pointer; transition: background 0.12s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: var(--bg3); }
.table-name { font-size: 13px; font-weight: 500; }
.table-note { font-size: 11px; color: var(--text2); line-height: 1.4; }
