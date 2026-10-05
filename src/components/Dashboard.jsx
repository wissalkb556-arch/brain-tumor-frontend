const CLASS_COLORS = {
  glioma: "#E2707A",
  meningioma: "#E8A33D",
  pituitary: "#E8A33D",
  notumor: "#4FD1C5",
};

function Donut({ segments, size = 140 }) {
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--bg-panel-raised)"
        strokeWidth="16"
      />
      {segments.map((seg, i) => {
        const fraction = seg.value / total;
        const dash = fraction * circumference;
        const circle = (
          <circle
            key={i}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth="16"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        offset += dash;
        return circle;
      })}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="IBM Plex Mono"
        fontSize="20"
        fill="var(--text-primary)"
      >
        {total}
      </text>
    </svg>
  );
}

function TrendLine({ values, width = 560, height = 90 }) {
  if (values.length < 2) {
    return <p className="mono" style={{ color: "var(--text-secondary)" }}>Pas assez de données pour une tendance.</p>;
  }
  const max = 1;
  const min = 0.5;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 20) + 10;
    const y = height - ((v - min) / (max - min)) * (height - 20) - 10;
    return `${x},${y}`;
  });

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <line x1="0" y1={height * 0.3} x2={width} y2={height * 0.3} stroke="var(--border)" strokeWidth="1" />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="var(--accent-teal)"
        strokeWidth="2"
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * (width - 20) + 10;
        const y = height - ((v - min) / (max - min)) * (height - 20) - 10;
        return <circle key={i} cx={x} cy={y} r="2.5" fill="var(--accent-teal)" />;
      })}
    </svg>
  );
}

export default function Dashboard({ history }) {
  if (history.length === 0) {
    return (
      <div className="empty-state">
        Aucune analyse pour l'instant. Va dans "Analyser" pour traiter ta première image.
      </div>
    );
  }

  const total = history.length;
  const avgConfidence = history.reduce((sum, h) => sum + h.confidence, 0) / total;
  const lowConfidenceCount = history.filter((h) => h.confidence < 0.7).length;
  const tumorCount = history.filter((h) => h.predicted_class !== "notumor").length;

  const counts = history.reduce((acc, h) => {
    acc[h.predicted_class] = (acc[h.predicted_class] || 0) + 1;
    return acc;
  }, {});
  const maxCount = Math.max(...Object.values(counts));

  const confidenceBuckets = [
    { label: "≥ 90%", value: history.filter((h) => h.confidence >= 0.9).length, color: "#4FD1C5" },
    { label: "70–90%", value: history.filter((h) => h.confidence >= 0.7 && h.confidence < 0.9).length, color: "#E8A33D" },
    { label: "< 70%", value: history.filter((h) => h.confidence < 0.7).length, color: "#E2707A" },
  ];

  const trendValues = [...history].reverse().slice(-20).map((h) => h.confidence);

  return (
    <>
      <div className="stat-grid">
        <div className="stat-card">
          <p className="stat-value">{total}</p>
          <p className="stat-label">Analyses réalisées</p>
        </div>
        <div className="stat-card">
          <p className="stat-value">{(avgConfidence * 100).toFixed(1)}%</p>
          <p className="stat-label">Confiance moyenne</p>
        </div>
        <div className="stat-card">
          <p className="stat-value" style={{ color: tumorCount > 0 ? "var(--accent-red)" : "var(--text-primary)" }}>
            {tumorCount}
          </p>
          <p className="stat-label">Cas suspects détectés</p>
        </div>
        <div className="stat-card">
          <p className="stat-value" style={{ color: lowConfidenceCount > 0 ? "var(--accent-amber)" : "var(--text-primary)" }}>
            {lowConfidenceCount}
          </p>
          <p className="stat-label">À faible confiance (&lt;70%)</p>
        </div>
      </div>

      <div className="chart-panel" style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "center" }}>
        <Donut segments={confidenceBuckets} />
        <div>
          <p className="chart-title" style={{ marginBottom: 12 }}>Répartition de la confiance</p>
          {confidenceBuckets.map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 13 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: b.color, display: "inline-block" }} />
              <span style={{ color: "var(--text-secondary)" }}>{b.label}</span>
              <span className="mono" style={{ marginLeft: "auto" }}>{b.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-panel">
        <p className="chart-title">Tendance de confiance (20 dernières analyses)</p>
        <TrendLine values={trendValues} />
      </div>

      <div className="chart-panel">
        <p className="chart-title">Répartition par classe</p>
        {Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .map(([cls, count]) => (
            <div className="bar-row" key={cls}>
              <span className="bar-name">{cls}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${(count / maxCount) * 100}%`,
                    background: CLASS_COLORS[cls] || "var(--accent-teal)",
                  }}
                />
              </div>
              <span className="bar-count">{count}</span>
            </div>
          ))}
      </div>
    </>
  );
}
