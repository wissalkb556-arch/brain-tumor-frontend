import { useRef, useState } from "react";
import { analyzeImage } from "../api";
import { exportReportPDF } from "../pdfExport";

const CLASS_LABELS = {
  glioma: "Glioma",
  meningioma: "Méningiome",
  pituitary: "Adénome pituitaire",
  notumor: "Aucune tumeur détectée",
};

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `item-${Date.now()}-${idCounter}`;
}

export default function AnalyzePanel({ onResult }) {
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [running, setRunning] = useState(false);
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef(null);

  const active = items.find((i) => i.id === activeId) || null;
  const pendingCount = items.filter((i) => i.status === "pending").length;

  function addFiles(fileList) {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;
    const newItems = files.map((file) => ({
      id: nextId(),
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
      result: null,
      error: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setActiveId(newItems[0].id);
  }

  async function runQueue() {
    setRunning(true);
    const queue = items.filter((i) => i.status === "pending").map((i) => i.id);
    for (const id of queue) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "analyzing" } : i))
      );
      const target = items.find((i) => i.id === id);
      try {
        const data = await analyzeImage(target.file);
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, status: "done", result: data } : i))
        );
        onResult({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          filename: target.file.name,
          ...data,
        });
      } catch {
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: "error", error: "Échec de l'analyse — API injoignable." }
              : i
          )
        );
      }
    }
    setRunning(false);
  }

  async function handleExport() {
    if (!active || active.status !== "done") return;
    setExporting(true);
    try {
      await exportReportPDF(active);
    } finally {
      setExporting(false);
    }
  }

  function resetAll() {
    setItems([]);
    setActiveId(null);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    addFiles(e.dataTransfer.files);
  }

  const lowConfidence = active?.result && active.result.confidence < 0.7;

  return (
    <>
      {items.length > 0 && (
        <div className="thumb-strip">
          {items.map((item) => (
            <button
              key={item.id}
              className={`thumb ${item.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(item.id)}
              title={item.file.name}
            >
              <img src={item.previewUrl} alt={item.file.name} />
              <span className={`thumb-status ${item.status}`} />
            </button>
          ))}
          <button className="thumb thumb-add" onClick={() => inputRef.current?.click()}>
            +
          </button>
        </div>
      )}

      <div className="analyze-grid">
        <div
          className={`viewer-panel ${dragActive ? "drag-active" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
        >
          {!active && (
            <div className="dropzone" onClick={() => inputRef.current?.click()}>
              <span>Glisse une ou plusieurs IRM ici, ou clique pour sélectionner</span>
              <span className="mono">JPG, PNG — coupe axiale</span>
            </div>
          )}
          {active && active.status !== "done" && (
            <div style={{ position: "relative", width: "100%", height: "100%" }}>
              <img
                src={active.previewUrl}
                alt="IRM sélectionnée"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
              {active.status === "analyzing" && (
                <div className="scan-overlay">
                  <div className="spinner" />
                  <span className="mono">Analyse en cours…</span>
                </div>
              )}
            </div>
          )}
          {active && active.status === "done" && (
            <div className="image-compare fade-in">
              <div className="col">
                <span className="image-label">ORIGINAL</span>
                <img src={active.previewUrl} alt="IRM originale" />
              </div>
              <div className="col">
                <span className="image-label">GRAD-CAM</span>
                <img
                  src={`data:image/png;base64,${active.result.heatmap_image_base64}`}
                  alt="Carte d'activation"
                />
              </div>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => addFiles(e.target.files)}
          />
        </div>

        <div className="findings-panel">
          {items.length === 0 && (
            <>
              <p className="finding-label">Statut</p>
              <p className="finding-value" style={{ fontSize: 15, color: "var(--text-secondary)" }}>
                Aucune image sélectionnée
              </p>
            </>
          )}

          {items.length > 0 && pendingCount > 0 && (
            <button
              className="btn primary"
              disabled={running}
              onClick={runQueue}
              style={{ width: "100%", marginBottom: 16 }}
            >
              {running
                ? "Analyse en cours…"
                : `Lancer l'analyse (${pendingCount} image${pendingCount > 1 ? "s" : ""})`}
            </button>
          )}

          {active?.status === "error" && <div className="error-box">{active.error}</div>}

          {active?.status === "done" && (
            <div className="fade-in">
              {lowConfidence && (
                <div className="alert-banner">
                  Confiance faible — validation par un radiologue recommandée.
                </div>
              )}
              <p className="finding-label">Classification</p>
              <p className={`finding-value ${active.result.predicted_class}`}>
                {CLASS_LABELS[active.result.predicted_class] || active.result.predicted_class}
              </p>

              <p className="finding-label">Confiance du modèle</p>
              <div className="confidence-track">
                <div
                  className={`confidence-fill ${lowConfidence ? "low" : ""}`}
                  style={{ width: `${active.result.confidence * 100}%` }}
                />
              </div>
              <p className="confidence-readout">{(active.result.confidence * 100).toFixed(1)}%</p>

              <p className="finding-label">Probabilités par classe</p>
              {Object.entries(active.result.all_probabilities)
                .sort((a, b) => b[1] - a[1])
                .map(([cls, prob]) => (
                  <div className="prob-row" key={cls}>
                    <span style={{ textTransform: "capitalize" }}>{cls}</span>
                    <span className="prob-value">{(prob * 100).toFixed(1)}%</span>
                  </div>
                ))}

              <div className="report-box">
                <p className="finding-label">Rapport généré</p>
                <div className="report-text">{active.result.report}</div>
              </div>

              <button className="btn primary" style={{ width: "100%", marginTop: 16 }} onClick={handleExport} disabled={exporting}>
                {exporting ? "Génération du PDF…" : "Exporter en PDF"}
              </button>
            </div>
          )}

          {items.length > 0 && (
            <button className="btn" style={{ width: "100%", marginTop: 12 }} onClick={resetAll}>
              Tout effacer
            </button>
          )}
        </div>
      </div>
    </>
  );
}
