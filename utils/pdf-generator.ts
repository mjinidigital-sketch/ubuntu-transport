import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

async function renderElementToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  // Wait for images to load
  const images = element.querySelectorAll("img");
  const imagePromises = Array.from(images).map((img) => {
    if (img.complete) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // Continue even if image fails
    });
  });

  await Promise.all(imagePromises);

  // 1.5x scale produces crisp ~1200x1700px resolution without ballooning memory
  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  // Export as compressed JPEG to achieve < 200KB file size
  let quality = 0.75;
  let imgData = canvas.toDataURL("image/jpeg", quality);

  // Dynamically fine-tune quality if data URL exceeds ~175KB binary (240k base64 chars)
  while (imgData.length > 240000 && quality > 0.45) {
    quality -= 0.08;
    imgData = canvas.toDataURL("image/jpeg", quality);
  }

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = (pdfHeight - imgHeight * ratio) / 2;

  pdf.addImage(
    imgData,
    "JPEG",
    imgX,
    imgY,
    imgWidth * ratio,
    imgHeight * ratio,
    undefined,
    "FAST"
  );

  const cleanFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(cleanFilename);
}

export async function generateInvoicePDF(
  invoice: any,
  filename: string,
  target?: HTMLElement | string | null
): Promise<void> {
  const element =
    typeof target === "string"
      ? document.getElementById(target)
      : target || document.getElementById("invoice-document");
  if (!element) {
    throw new Error("Invoice document element not found");
  }
  await renderElementToPdf(element, filename);
}

export async function generateQuotationPDF(
  quotation: any,
  filename: string,
  target?: HTMLElement | string | null
): Promise<void> {
  const element =
    typeof target === "string"
      ? document.getElementById(target)
      : target || document.getElementById("quotation-document");
  if (!element) {
    throw new Error("Quotation document element not found");
  }
  await renderElementToPdf(element, filename);
}
