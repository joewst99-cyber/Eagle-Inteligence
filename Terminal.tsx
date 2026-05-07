import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type Bias = "BULLISH" | "BEARISH" | "NEUTRAL";
type Impact = "HIGH" | "MEDIUM" | "LOW";
type Sentiment = "RISK-ON" | "RISK-OFF" | "NEUTRAL";

interface AssetData {
  price: number;
  changePercent: number;
  bias: Bias;
  note: string;
  keyLevel: string;
  correlation: string;
}

interface Headline {
  title: string;
  impact: Impact;
  assets: string[];
  direction: Bias | "MIXED";
  summary: string;
}

interface CalendarEvent {
  time: string;
  event: string;
  currency: string;
  importance: "HIGH" | "MEDIUM";
  context: string;
}

interface MarketData {
  sentiment: Sentiment;
  sentimentScore: number;
  sentimentReason: string;
  regime: string;
  assets: {
    gold: AssetData;
    sp500: AssetData;
    nasdaq: AssetData;
    us30: AssetData;
    dxy: AssetData;
    eurusd: AssetData;
    gbpusd: AssetData;
    gbpjpy: AssetData;
    usdjpy: AssetData;
  };
  headlines: Headline[];
  calendar: CalendarEvent[];
}

interface AssetMeta {
  key: keyof MarketData["assets"];
  label: string;
  decimals: number;
  correlated: Array<keyof MarketData["assets"]>;
}

type ViewType = "overview" | "deepdive" | "bias";

// ============================================================================
// CONSTANTS
// ============================================================================

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY || "";
const API_VERSION = "2023-06-01";
const MODEL = "claude-sonnet-4-20250514";
const MAX_TOKENS = 1500;

const ASSETS: AssetMeta[] = [
  { key: "gold", label: "XAU/USD", decimals: 2, correlated: ["dxy", "sp500"] },
  { key: "sp500", label: "S&P 500", decimals: 2, correlated: ["nasdaq", "us30"] },
  { key: "nasdaq", label: "Nasdaq", decimals: 2, correlated: ["sp500", "us30"] },
  { key: "us30", label: "US30", decimals: 2, correlated: ["sp500", "nasdaq"] },
  { key: "dxy", label: "DXY", decimals: 3, correlated: ["gold", "eurusd"] },
  { key: "eurusd", label: "EUR/USD", decimals: 4, correlated: ["dxy", "gbpusd"] },
  { key: "gbpusd", label: "GBP/USD", decimals: 4, correlated: ["eurusd", "gbpjpy"] },
  { key: "gbpjpy", label: "GBP/JPY", decimals: 3, correlated: ["gbpusd", "usdjpy"] },
  { key: "usdjpy", label: "USD/JPY", decimals: 3, correlated: ["dxy", "gbpjpy"] },
];

const INTERVALS = [
  { label: "Off", value: 0 },
  { label: "5m", value: 5 },
  { label: "10m", value: 10 },
  { label: "15m", value: 15 },
];

const PROMPT = `Search for current live financial market data right now and return ONLY a raw JSON object — no markdown, no code fences, no preamble, just the JSON.
{
  "sentiment": "RISK-ON or RISK-OFF or NEUTRAL",
  "sentimentScore": 0 to 100,
  "sentimentReason": "one sentence explanation",
  "regime": "one sentence describing current market regime",
  "assets": {
    "gold": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "one key support or resistance price level as string", "correlation": "one sentence on how it relates to DXY and equities right now" },
    "sp500": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "nasdaq": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "us30": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "dxy": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "eurusd": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "gbpusd": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "gbpjpy": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" },
    "usdjpy": { "price": number, "changePercent": number, "bias": "BULLISH or BEARISH or NEUTRAL", "note": "brief context", "keyLevel": "key level", "correlation": "correlation note" }
  },
  "headlines": [
    { "title": "headline", "impact": "HIGH or MEDIUM or LOW", "assets": ["Gold","USD"], "direction": "BULLISH or BEARISH or MIXED", "summary": "Two sentence AI analysis of market impact." }
  ],
  "calendar": [
    { "time": "HH:MM UTC", "event": "event name", "currency": "USD", "importance": "HIGH or MEDIUM", "context": "One sentence on why this matters." }
  ]
}`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const fmt = (n: number | null | undefined, d = 2): string =>
  n != null ? Number(n).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : "—";

const pctColor = (p: number): string =>
  p >= 0 ? "var(--color-text-success)" : "var(--color-text-danger)";

const pctBg = (p: number): string =>
  p >= 0 ? "var(--color-background-success)" : "var(--color-background-danger)";

const biasColor = (b: Bias | "MIXED"): string =>
  b === "BULLISH" ? "var(--color-text-success)" : b === "BEARISH" ? "var(--color-text-danger)" : "var(--color-text-secondary)";

const biasBg = (b: Bias | "MIXED"): string =>
  b === "BULLISH" ? "var(--color-background-success)" : b === "BEARISH" ? "var(--color-background-danger)" : "var(--color-background-secondary)";

const impactColor = (i: Impact): string =>
  i === "HIGH" ? "var(--color-text-danger)" : i === "MEDIUM" ? "var(--color-text-warning)" : "var(--color-text-secondary)";

const impactBg = (i: Impact): string =>
  i === "HIGH" ? "var(--color-background-danger)" : i === "MEDIUM" ? "var(--color-background-warning)" : "var(--color-background-secondary)";

// Validate the parsed JSON structure
const validateMarketData = (data: any): data is MarketData => {
  if (!data || typeof data !== "object") return false;
  if (!data.sentiment || !data.assets || !data.headlines || !data.calendar) return false;
  if (typeof data.sentimentScore !== "number") return false;
  if (!data.regime || !data.sentimentReason) return false;

  // Validate required asset keys
  const requiredAssets = ["gold", "sp500", "nasdaq", "us30", "dxy", "eurusd", "gbpusd", "gbpjpy", "usdjpy"];
  for (const asset of requiredAssets) {
    if (!data.assets[asset] || typeof data.assets[asset].price !== "number") return false;
  }

  return true;
};

// ============================================================================
// TAB COMPONENT (Memoized)
// ============================================================================

interface TabProps {
  id: ViewType;
  label: string;
  active: boolean;
  onClick: (id: ViewType) => void;
}

const Tab = memo<TabProps>(({ id, label, active, onClick }) => (
  <div
    onClick={() => onClick(id)}
    style={{
      fontSize: "12px",
      padding: "5px 12px",
      borderRadius: "var(--border-radius-md)",
      background: active ? "var(--color-background-info)" : "transparent",
      color: active ? "var(--color-text-info)" : "var(--color-text-secondary)",
      border: active ? "0.5px solid var(--color-border-info)" : "0.5px solid transparent",
      cursor: "pointer",
    }}
  >
    {label}
  </div>
));

Tab.displayName = "Tab";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Terminal() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [selected, setSelected] = useState<keyof MarketData["assets"]>("gold");
  const [view, setView] = useState<ViewType>("overview");
  const [refreshInterval, setRefreshInterval] = useState(0);
  const [countdown, setCountdown] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // API FETCH WITH PROPER AUTHENTICATION & ERROR HANDLING
  // ============================================================================

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Validate API key
    if (!API_KEY) {
      setError("API key missing. Set REACT_APP_ANTHROPIC_API_KEY in your environment.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
          "anthropic-version": API_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: PROMPT }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API Error (${res.status}): ${errorText || res.statusText}`);
      }

      const result = await res.json();

      // Extract text content
      const textBlocks = (result.content || []).filter((b: any) => b.type === "text");
      if (textBlocks.length === 0) {
        throw new Error("No text content in API response");
      }

      const text = textBlocks.map((b: any) => b.text).join("");

      // Extract JSON with improved regex
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("Could not find JSON in response. API may have returned plain text.");
      }

      // Parse and validate
      let parsed: any;
      try {
        parsed = JSON.parse(match[0]);
      } catch (parseErr) {
        throw new Error(`JSON parsing failed: ${parseErr instanceof Error ? parseErr.message : String(parseErr)}`);
      }

      // Validate structure
      if (!validateMarketData(parsed)) {
        throw new Error("Invalid response structure. Missing required fields (sentiment, assets, headlines, etc.)");
      }

      setData(parsed);
      setUpdated(new Date());
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Refresh error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // AUTO-REFRESH INTERVAL
  // ============================================================================

  useEffect(() => {
    // Clear existing timers
    if (timerRef.current) clearInterval(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);

    if (refreshInterval === 0) {
      setCountdown(0);
      return;
    }

    // Initial fetch when interval is set
    refresh();
    setCountdown(refreshInterval * 60);

    // Set up recurring refresh
    timerRef.current = setInterval(() => {
      refresh();
      setCountdown(refreshInterval * 60);
    }, refreshInterval * 60 * 1000);

    // Countdown timer
    countRef.current = setInterval(() => {
      setCountdown((c) => Math.max(0, c - 1));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (countRef.current) clearInterval(countRef.current);
    };
  }, [refreshInterval, refresh]);

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const a = data?.assets;
  const sel = a?.[selected];
  const selMeta = ASSETS.find((x) => x.key === selected);

  const score = Math.min(100, Math.max(0, data?.sentimentScore ?? 50));

  const sentTxt =
    data?.sentiment === "RISK-ON"
      ? "var(--color-text-success)"
      : data?.sentiment === "RISK-OFF"
      ? "var(--color-text-danger)"
      : "var(--color-text-secondary)";

  const sentBg =
    data?.sentiment === "RISK-ON"
      ? "var(--color-background-success)"
      : data?.sentiment === "RISK-OFF"
      ? "var(--color-background-danger)"
      : "var(--color-background-secondary)";

  // Memoize filtered headlines for selected asset
  const relevantHeadlines = useMemo(() => {
    if (!data?.headlines || !selMeta) return [];

    const assetLabel = selMeta.label.toLowerCase().split("/")[0];
    const filtered = data.headlines.filter((h) =>
      h.assets?.some(
        (asset) =>
          asset.toLowerCase().includes(assetLabel) ||
          asset.toLowerCase().includes("usd")
      )
    );

    // Return filtered headlines if any, otherwise top 2
    return filtered.length > 0 ? filtered : data.headlines.slice(0, 2);
  }, [data?.headlines, selMeta]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "24px" }}>Eagle Intelligence</h1>
          {data && (
            <span
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "4px 10px",
                borderRadius: "var(--border-radius-md)",
                background: sentBg,
                color: sentTxt,
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {data.sentiment}
            </span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
            {updated ? `Updated ${updated.toLocaleTimeString()}` : "Press refresh to load live intelligence"}
            {refreshInterval > 0 && countdown > 0 && ` · next in ${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`}
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            {INTERVALS.map((iv) => (
              <button
                key={iv.value}
                onClick={() => setRefreshInterval(iv.value)}
                style={{
                  fontSize: "11px",
                  padding: "5px 9px",
                  background: refreshInterval === iv.value ? "var(--color-background-info)" : "transparent",
                  color: refreshInterval === iv.value ? "var(--color-text-info)" : "var(--color-text-secondary)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {iv.label}
              </button>
            ))}
          </div>
          <button
            onClick={refresh}
            disabled={loading}
            style={{
              padding: "8px 16px",
              background: "var(--color-background-info)",
              color: "var(--color-text-info)",
              border: "none",
              borderRadius: "var(--border-radius-md)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Loading..." : "↗ Refresh"}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "var(--color-background-danger)",
            color: "var(--color-text-danger)",
            borderRadius: "var(--border-radius-md)",
            border: "0.5px solid var(--color-border-danger)",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Asset Strip */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", overflowX: "auto" }}>
        {ASSETS.map(({ key, label, decimals }) => (
          <div
            key={key}
            onClick={() => {
              setSelected(key);
              setView("deepdive");
            }}
            style={{
              background: selected === key && view === "deepdive" ? "var(--color-background-info)" : "var(--color-background-secondary)",
              border: `0.5px solid ${selected === key && view === "deepdive" ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`,
              borderRadius: "var(--border-radius-md)",
              padding: "8px 7px",
              cursor: "pointer",
              minWidth: "90px",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>{label}</div>
            {a?.[key] ? (
              <>
                <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "2px" }}>{fmt(a[key].price, decimals)}</div>
                <div style={{ fontSize: "11px", color: pctColor(a[key].changePercent) }}>
                  {a[key].changePercent >= 0 ? "+" : ""}
                  {fmt(a[key].changePercent)}%
                </div>
              </>
            ) : (
              <div style={{ fontSize: "14px", color: "var(--color-text-tertiary)" }}>—</div>
            )}
          </div>
        ))}
      </div>

      {/* Regime bar */}
      {data?.regime && (
        <div
          style={{
            padding: "10px 14px",
            background: "var(--color-background-secondary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: "var(--border-radius-md)",
            marginBottom: "16px",
            fontSize: "13px",
          }}
        >
          <strong>Regime</strong> · {data.regime}
        </div>
      )}

      {/* View tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <Tab id="overview" label="Overview" active={view === "overview"} onClick={setView} />
        <Tab id="deepdive" label="Deep Dive" active={view === "deepdive"} onClick={setView} />
        <Tab id="bias" label="Bias Table" active={view === "bias"} onClick={setView} />
      </div>

      {/* OVERVIEW */}
      {view === "overview" && (
        <div>
          {/* Sentiment */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>Sentiment</h2>
            {data ? (
              <>
                <div
                  style={{
                    height: "30px",
                    background: "linear-gradient(90deg, var(--color-background-danger) 0%, var(--color-background-secondary) 50%, var(--color-background-success) 100%)",
                    borderRadius: "var(--border-radius-md)",
                    position: "relative",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: `${score}%`,
                      top: "-5px",
                      width: "4px",
                      height: "40px",
                      background: "var(--color-text-primary)",
                      transform: "translateX(-50%)",
                    }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "8px" }}>
                  <span>Risk-Off</span>
                  <span>Risk-On</span>
                </div>
                <div style={{ fontSize: "13px" }}>{data.sentimentReason}</div>
              </>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Loads on refresh</div>
            )}
          </div>

          {/* Headlines */}
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>AI News Intelligence</h2>
            {data?.headlines?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.headlines.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 14px",
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "6px" }}>
                      <strong style={{ fontSize: "14px" }}>{h.title}</strong>
                      <span
                        style={{
                          fontSize: "10px",
                          padding: "3px 8px",
                          borderRadius: "var(--border-radius-sm)",
                          background: impactBg(h.impact),
                          color: impactColor(h.impact),
                          marginLeft: "8px",
                        }}
                      >
                        {h.impact}
                      </span>
                    </div>
                    <div style={{ fontSize: "13px", marginBottom: "8px" }}>{h.summary}</div>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "var(--border-radius-sm)",
                          background: biasBg(h.direction),
                          color: biasColor(h.direction),
                        }}
                      >
                        {h.direction}
                      </span>
                      {h.assets?.map((asset, j) => (
                        <span
                          key={j}
                          style={{
                            fontSize: "11px",
                            padding: "3px 8px",
                            background: "var(--color-background-tertiary)",
                            color: "var(--color-text-secondary)",
                            borderRadius: "var(--border-radius-sm)",
                          }}
                        >
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Press refresh to load live news analysis</div>
            )}
          </div>

          {/* Calendar */}
          <div>
            <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>Economic Calendar</h2>
            {data?.calendar?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {data.calendar.map((ev, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "10px 12px",
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                    }}
                  >
                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>
                      {ev.time} {ev.currency} · {ev.importance}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>{ev.event}</div>
                    <div style={{ fontSize: "12px" }}>{ev.context}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Calendar loads on refresh</div>
            )}
          </div>
        </div>
      )}

      {/* DEEP DIVE */}
      {view === "deepdive" && (
        <div>
          {/* Main card */}
          <div style={{ marginBottom: "20px", padding: "16px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)" }}>
            {sel ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h2 style={{ fontSize: "20px", margin: 0 }}>{selMeta?.label}</h2>
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 12px",
                      borderRadius: "var(--border-radius-md)",
                      background: biasBg(sel.bias),
                      color: biasColor(sel.bias),
                      fontWeight: 600,
                    }}
                  >
                    {sel.bias}
                  </span>
                </div>
                <div style={{ fontSize: "28px", fontWeight: 700, marginBottom: "4px" }}>{fmt(sel.price, selMeta?.decimals)}</div>
                <div style={{ fontSize: "14px", color: pctColor(sel.changePercent), marginBottom: "12px" }}>
                  {sel.changePercent >= 0 ? "+" : ""}
                  {fmt(sel.changePercent)}% today
                </div>
                {sel.keyLevel && (
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", color: "var(--color-text-secondary)", marginBottom: "4px" }}>Key Level</div>
                    <div style={{ fontSize: "16px", fontWeight: 600 }}>{sel.keyLevel}</div>
                  </div>
                )}
                {sel.note && <div style={{ fontSize: "13px", padding: "10px", background: "var(--color-background-tertiary)", borderRadius: "var(--border-radius-sm)" }}>{sel.note}</div>}
              </>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Refresh to load data</div>
            )}
          </div>

          {/* Correlation */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Correlation context</h3>
            {sel?.correlation ? (
              <div style={{ fontSize: "13px", padding: "12px", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)" }}>{sel.correlation}</div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>—</div>
            )}
          </div>

          {/* Related assets */}
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Related assets</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {selMeta?.correlated.map((key) => {
                const m = ASSETS.find((x) => x.key === key);
                const asset = a?.[key];
                return (
                  <div
                    key={key}
                    onClick={() => setSelected(key)}
                    style={{
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                      padding: "9px 11px",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>{m?.label}</span>
                    {asset ? (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600 }}>{fmt(asset.price, m?.decimals)}</div>
                        <div style={{ fontSize: "12px", color: pctColor(asset.changePercent) }}>
                          {asset.changePercent >= 0 ? "+" : ""}
                          {fmt(asset.changePercent)}%
                        </div>
                      </div>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Relevant news (using memoized filter) */}
          <div>
            <h3 style={{ fontSize: "14px", marginBottom: "10px" }}>Relevant headlines</h3>
            {relevantHeadlines.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {relevantHeadlines.map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px",
                      background: "var(--color-background-secondary)",
                      border: "0.5px solid var(--color-border-tertiary)",
                      borderRadius: "var(--border-radius-md)",
                    }}
                  >
                    <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "6px" }}>{h.title}</div>
                    <div style={{ fontSize: "13px" }}>{h.summary}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "var(--color-text-tertiary)" }}>Refresh to load</div>
            )}
          </div>
        </div>
      )}

      {/* BIAS TABLE */}
      {view === "bias" && (
        <div>
          <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>All assets — bias snapshot</h2>
          <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", overflow: "hidden" }}>
            {/* Header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1.5fr",
                padding: "10px 14px",
                background: "var(--color-background-tertiary)",
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div>Asset</div>
              <div>Price</div>
              <div>Change</div>
              <div>Bias</div>
              <div>Context</div>
            </div>
            {/* Rows */}
            {ASSETS.map(({ key, label, decimals }, i) => {
              const asset = a?.[key];
              return (
                <div
                  key={key}
                  onClick={() => {
                    setSelected(key);
                    setView("deepdive");
                  }}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1.5fr",
                    padding: "11px 14px",
                    borderBottom: i < ASSETS.length - 1 ? "0.5px solid var(--color-border-tertiary)" : "none",
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-background-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: "13px" }}>{asset ? fmt(asset.price, decimals) : "—"}</div>
                  <div style={{ fontSize: "13px", color: asset ? pctColor(asset.changePercent) : "inherit" }}>
                    {asset ? `${asset.changePercent >= 0 ? "+" : ""}${fmt(asset.changePercent)}%` : "—"}
                  </div>
                  <div>
                    {asset ? (
                      <span
                        style={{
                          fontSize: "11px",
                          padding: "3px 8px",
                          borderRadius: "var(--border-radius-sm)",
                          background: biasBg(asset.bias),
                          color: biasColor(asset.bias),
                        }}
                      >
                        {asset.bias}
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{asset?.note || "—"}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 16px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
            borderRadius: "var(--border-radius-md)",
            fontSize: "13px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          }}
        >
          Searching live markets · generating AI intelligence...
        </div>
      )}
    </div>
  );
}
