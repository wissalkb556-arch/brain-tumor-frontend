import jsPDF from "jspdf";

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function exportReportPDF(item) {
  const { file, result } = item;
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = margin;

  doc.setFont("courier", "bold");
  doc.setFontSize(15);
  doc.text("BrainScan — Rapport d'aide au diagnostic", margin, y);
  y += 26;

  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.text(`Fichier        : ${file.name}`, margin, y); y += 14;
  doc.text(`Date           : ${new Date().toLocaleString("fr-FR")}`, margin, y); y += 14;
  doc.text(`Classification : ${result.predicted_class.toUpperCase()}`, margin, y); y += 14;
  doc.text(`Confiance      : ${(result.confidence * 100).toFixed(1)}%`, margin, y); y += 28;

  try {
    const originalDataUrl = await fileToDataURL(file);
    const heatmapDataUrl = `data:image/png;base64,${result.heatmap_image_base64}`;
    const format = file.type.includes("png") ? "PNG" : "JPEG";
    const size = 230;
    doc.addImage(originalDataUrl, format, margin, y, size, size);
    doc.addImage(heatmapDataUrl, "PNG", margin + size + 20, y, size, size);
    doc.setFontSize(8);
    doc.text("IRM originale", margin, y + size + 12);
    doc.text("Carte Grad-CAM", margin + size + 20, y + size + 12);
    y += size + 30;
  } catch {
    // si l'image ne peut pas être intégrée, on continue sans bloquer le PDF
  }

  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.text("Rapport complet :", margin, y);
  y += 16;
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  const lines = doc.splitTextToSize(result.report, 515);
  doc.text(lines, margin, y);

  doc.save(`rapport_${file.name.replace(/\.[^.]+$/, "")}.pdf`);
}
