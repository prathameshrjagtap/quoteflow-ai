/**
 * QuoteFlow AI — PDF generation utility
 * Uses html2canvas to capture a DOM element and jsPDF to produce a downloadable PDF.
 * Works on all platforms including iOS Safari.
 */
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Captures a DOM element and downloads it as a PDF file.
 *
 * @param {HTMLElement} element  - The element to capture (should be white background)
 * @param {string}      filename - Output filename without extension
 */
export async function downloadPDF(element, filename = "quotation") {
  if (!element) throw new Error("No element provided to downloadPDF");

  // Temporarily make the element visible if hidden, capture, then restore
  const wasHidden = element.style.display === "none" || element.classList.contains("hidden");

  if (wasHidden) {
    element.classList.remove("hidden");
    element.style.visibility = "hidden"; // invisible but takes up space for layout
  }

  // Wait one frame for layout to settle
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const canvas = await html2canvas(element, {
    scale: 2,           // 2x for retina-quality output
    useCORS: true,      // allow cross-origin images (logo)
    backgroundColor: "#ffffff",
    logging: false,
  });

  if (wasHidden) {
    element.classList.add("hidden");
    element.style.visibility = "";
  }

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth  = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Scale image to fit A4 width, paginate if taller than one page
  const imgWidth   = pageWidth;
  const imgHeight  = (canvas.height * pageWidth) / canvas.width;

  let yOffset = 0;
  let remaining = imgHeight;

  while (remaining > 0) {
    pdf.addImage(imgData, "PNG", 0, -yOffset, imgWidth, imgHeight);
    remaining -= pageHeight;
    yOffset   += pageHeight;
    if (remaining > 0) pdf.addPage();
  }

  pdf.save(`${filename}.pdf`);
}
