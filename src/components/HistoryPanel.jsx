import { useState } from "react";

export default function HistoryPanel({ history, onClear }) {
  const [selected, setSelected] = useState(null);

  if (history.length === 0) {
    return (
      <div className="empty-state">
        Aucune analyse enregistrée. L'historique se remplit automatiquement après chaque analyse.
      </div>
    );
  }

  return (
    <>
      <button className="btn" style={{ marginBottom: 16 }} onClick={onClear}>
        Effacer l'historique
      </button>

      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Fichier</th>
            <th>Classification</th>
            <th>Confiance</th>
          </tr>
        </thead>
        <tbody>
          {history.map((entry) => (
            <tr key={entry.id} onClick={() => setSelected(entry)}>
              <td className="mono">
                {new Date(entry.timestamp).toLocaleString("fr-FR")}
              </td>
              <td className="mono">{entry.filename}</td>
              <td>
                <span className={`tag ${entry.predicted_class}`}>
                  {entry.predicted_class}
                </span>
              </td>
              <td className="mono">{(entry.confidence * 100).toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className="findings-panel" style={{ marginTop: 24 }}>
          <p className="finding-label">Rapport — {selected.filename}</p>
          <div className="report-box" style={{ marginTop: 0, paddingTop: 0, borderTop: "none" }}>
            <div className="report-text">{selected.report}</div>
          </div>
          <button className="btn" style={{ marginTop: 12 }} onClick={() => setSelected(null)}>
            Fermer
          </button>
        </div>
      )}
    </>
  );
}
