const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

/**
 * Removes blank pages from a PDF file
 * @param {string} inputPath - Path to the input PDF file
 * @param {string} outputPath - Path where the output PDF file will be saved
 * @param {Object} options - Optional parameters
 * @param {number} options.textThreshold - Minimum amount of text to consider a page non-empty (default: 5 characters)
 * @param {boolean} options.debug - Print debug information (default: false)
 * @returns {Promise<{totalPages: number, removedPages: number[]}>} Information about the processing
 */
async function removeBlankPages(inputPath, outputPath, options = {}) {
  const textThreshold = options.textThreshold || 5;
  const debug = options.debug || false;

  try {
    const pdfBuffer = await fs.readFile(inputPath);

    await pdfParse(pdfBuffer);

    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    const renderOptions = {
      pageTexts: [],
      pageIndex: 0,
      renderHandler: renderInfo => {
        const text = renderInfo.text || '';

        if (!renderOptions.pageTexts[renderOptions.pageIndex]) {
          renderOptions.pageTexts[renderOptions.pageIndex] = '';
        }
        renderOptions.pageTexts[renderOptions.pageIndex] += text;
      }
    };

    await pdfParse(pdfBuffer, {
      pagerender: async pageData => {
        const currentPage = renderOptions.pageIndex;
        renderOptions.pageIndex++;

        await pageData.getTextContent().then(textContent => {
          let pageText = '';
          for (const item of textContent.items) {
            pageText += item.str + ' ';
          }
          renderOptions.pageTexts[currentPage] = pageText.trim();
        });

        return Promise.resolve();
      }
    });

    const blankPages = [];
    const pagesToKeep = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageText = renderOptions.pageTexts[i] || '';

      const isBlank = pageText.length < textThreshold;

      if (isBlank) {
        blankPages.push(i + 1);
        if (debug)
          console.log(
            `[Remove Blank Pages]: Page ${
              i + 1
            } is considered blank: text="${pageText}"`
          );
      } else {
        pagesToKeep.push(i);
        if (debug)
          console.log(
            `[Remove Blank Pages]: Page ${
              i + 1
            } has content and will be kept: text="${pageText.substring(
              0,
              50
            )}..."`
          );
      }
    }

    if (blankPages.length === 0) {
      if (debug)
        console.log(
          '[Remove Blank Pages]: No blank pages found, copying original PDF'
        );
      await fs.copyFile(inputPath, outputPath);
      return {
        totalPages: pages.length,
        removedPages: [],
        keptPages: pages.length
      };
    }

    const newPdfDoc = await PDFDocument.create();

    if (pagesToKeep.length === 0) {
      console.warn(
        '[Remove Blank Pages]: All pages appear to be blank. Creating PDF with first page to avoid error.'
      );
      pagesToKeep.push(0);
    }

    const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToKeep);
    copiedPages.forEach(page => newPdfDoc.addPage(page));

    const newPdfBytes = await newPdfDoc.save();
    await fs.writeFile(outputPath, newPdfBytes);

    return {
      totalPages: pages.length,
      removedPages: blankPages,
      keptPages: pagesToKeep.length
    };
  } catch (error) {
    console.error('[Remove Blank Pages]: Error processing PDF:', error.message);
    throw error;
  }
}

module.exports = removeBlankPages;
