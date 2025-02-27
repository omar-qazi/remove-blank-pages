const removeBlankPages = require('./remove-blank-pages');

async function removeBlankPagesFromPDFs() {
  const fs = require('fs');
  const path = require('path');
  const pdfFolder = './pdfs/input';
  const pdfFiles = fs.readdirSync(pdfFolder).filter(file => path.extname(file) === '.pdf');
  

  for (let i=0; i< pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i];
    try {
      console.log(`\n[Remove Blank Pages]: Processing ${pdfFile}`)
      const result = await removeBlankPages(
        `./pdfs/input/${pdfFiles[i]}`,
        `./pdfs/output/${pdfFiles[i]}`,
        {
          textThreshold: 5,     // Consider pages with less than 5 characters empty
          debug: false
        }
      );
      
      console.log(`[Remove Blank Pages]: Processed ${result.totalPages} pages`);
      console.log(`[Remove Blank Pages]: Removed ${result.removedPages.length} empty pages: ${result.removedPages.join(', ')}`);
      console.log(`[Remove Blank Pages]: New PDF has ${result.keptPages} pages`);
      console.log(`[Remove Blank Pages]: Done processing ${pdfFile}`)
    } catch (error) {
      console.error('[Remove Blank Pages]: Failed to process PDF:', error.message);
    }
  }
}
  
removeBlankPagesFromPDFs()