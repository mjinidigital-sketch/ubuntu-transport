"use client";

/**
 * Production-grade PDF exporter using html2pdf.js.
 *
 * Unlike the complex DOM cloning approach, this implementation writes the HTML
 * to a new window (similar to the print function), which avoids all issues with
 * modern CSS color functions (lab, oklch, etc.) since the new window processes
 * the HTML fresh without the complex Tailwind v4 setup.
 */

export async function exportElementToPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  if (typeof window === "undefined" || !element) {
    throw new Error("PDF export requires a browser environment.");
  }

  // --- 1. Write HTML to a new window (like print function) ---
  const printContents = element.innerHTML;
  const pdfFrame = window.open("", "_blank", "width=900,height=1100");

  if (!pdfFrame) {
    throw new Error("Could not open PDF window. Please allow popups.");
  }

  const cleanFilename = filename.endsWith(".pdf")
    ? filename
    : `${filename}.pdf`;

  // Return a promise that resolves when PDF is generated
  return new Promise((resolve, reject) => {
    // Set up message listener for success/failure from the new window
    const messageHandler = (event: MessageEvent) => {
      if (event.data.type === 'PDF_SUCCESS') {
        window.removeEventListener('message', messageHandler);
        resolve();
      } else if (event.data.type === 'PDF_ERROR') {
        window.removeEventListener('message', messageHandler);
        reject(new Error(event.data.message || 'PDF generation failed'));
      }
    };

    window.addEventListener('message', messageHandler);

    // Cleanup if window is closed without message
    const checkClosed = setInterval(() => {
      if (pdfFrame.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('PDF window was closed'));
      }
    }, 500);

    pdfFrame.document.open();
    pdfFrame.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cleanFilename}</title>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              background-color: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: 'Inter', sans-serif;
            }
            #pdf-container {
              width: 210mm;
              min-height: 297mm;
              padding: 16mm;
              box-sizing: border-box;
              background: #ffffff !important;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <div id="pdf-container">
            ${printContents}
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          <script>
            window.onload = function() {
              setTimeout(function() {
                const element = document.getElementById('pdf-container');
                html2pdf()
                  .set({
                    margin: 0,
                    filename: '${cleanFilename}',
                    image: { type: 'jpeg', quality: 0.85 },
                    html2canvas: {
                      scale: 1.5,
                      useCORS: true,
                      allowTaint: true,
                      logging: false,
                      backgroundColor: '#ffffff',
                      width: 794,
                      height: 1123,
                    },
                    jsPDF: {
                      unit: 'mm',
                      format: 'a4',
                      orientation: 'portrait',
                      compress: true,
                    },
                    pagebreak: {
                      mode: ['avoid-all', 'css', 'legacy'],
                    },
                  })
                  .from(element)
                  .save()
                  .then(function() {
                    window.opener.postMessage({ type: 'PDF_SUCCESS' }, '*');
                    window.close();
                  })
                  .catch(function(err) {
                    console.error('PDF generation failed:', err);
                    window.opener.postMessage({ type: 'PDF_ERROR', message: err.message || 'PDF generation failed' }, '*');
                    window.close();
                  });
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    pdfFrame.document.close();
  });
}
