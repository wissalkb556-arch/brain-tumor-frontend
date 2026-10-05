import { useEffect, useState } from "react";
import AnalyzePanel from "./components/AnalyzePanel";
import Dashboard from "./components/Dashboard";
import HistoryPanel from "./components/HistoryPanel";
import { checkHealth } from "./api";
import { loadHistory, saveEntry, clearHistory } from "./history";

const TABS = [
  { id: "analyze", label: "Analyser" },
  { id: "dashboard", label: "Tableau de bord" },
  { id: "history", label: "Historique" },
];

export default function App() {
  const [tab, setTab] = useState("analyze");
  const [history, setHistory] = useState([]);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    checkHealth().then(setOnline);
    const interval = setInterval(() => checkHealth().then(setOnline), 15000);
    return () => clearInterval(interval);
  }, []);

  function handleResult(entry) {
    setHistory(saveEntry(entry));
  }

  function handleClear() {
    setHistory(clearHistory());
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="sidebar-title">
          Brain<span>Scan</span>
        </p>
        <p className="sidebar-status">
          <span className={`status-dot ${online ? "online" : ""}`} />
          {online ? "API connectée" : "API hors ligne"}
        </p>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`nav-item ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </aside>

      <main className="main">
        {tab === "analyze" && (
          <>
            <h1 className="page-title">Analyser une IRM</h1>
            <p className="page-subtitle">
              Détection de glioma, méningiome et adénome pituitaire — avec carte d'explicabilité Grad-CAM.
            </p>
            <AnalyzePanel onResult={handleResult} />
          </>
        )}
        {tab === "dashboard" && (
          <>
            <h1 className="page-title">Tableau de bord</h1>
            <p className="page-subtitle">Vue d'ensemble des analyses réalisées sur cette session.</p>
            <Dashboard history={history} />
          </>
        )}
        {tab === "history" && (
          <>
            <h1 className="page-title">Historique</h1>
            <p className="page-subtitle">Toutes les analyses passées, stockées localement dans ton navigateur.</p>
            <HistoryPanel history={history} onClear={handleClear} />
          </>
        )}
      </main>
    </div>
  );
}
