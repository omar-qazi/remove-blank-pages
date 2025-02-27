# Remove Blank Pages from PDFs

A node.js module to remove blank pages from PDF documents.


## Features
- Detects and removes blank pages from PDF files
- Customizable text content threshold to determine blank pages
- Preserves original structure and content of non-blank pages
- Batch processing of multiple PDF files
- Debug mode for detailed processing information

## Installation

1. Clone project `git clone https://github.com/omar-qazi/remove-blank-pages.git`

2. Install dependencies: `npm  install`

##  Usage

Basic  Example

```javascript
const removeBlankPages = require('./remove-blank-pages');

async function processPDF() {
  try {
    const result = await removeBlankPages('./input.pdf', './output.pdf', {
      textThreshold: 5,     // Pages with < 5 characters are considered blank
      debug: true           // Show processing details
    });

    console.log(`Removed ${result.removedPages.length} blank pages`);

    console.log(
      `Original: ${result.totalPages} pages, New: ${result.keptPages} pages`
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
}

processPDF();
```

## API Reference
### `removeBlankPages(inputPath, outputPath, options)`

**Parameters**
-   `inputPath`  (String): Path to source PDF file
-   `outputPath`  (String): Path to save processed PDF
-   `options`  (Object):
    -   `textThreshold`  (Number): Minimum text characters to consider page non-blank (default: 5)
    -   `debug`  (Boolean): Show debug information (default: false)
        

**Returns**
-   `Promise<Object>`  containing:
    -   `totalPages`: Original page count
    -   `removedPages`: Array of removed page numbers
    -   `keptPages`: Final page count



## File Structure
```
project-root/
├── pdfs/
│   ├── input/      # Source PDFs
│   └── output/     # Processed PDFs
├── remove-blank-pages.js
└── index.js
```

## Limitations
-   Only detects text content (pages with images may be considered blank)
-   PDFs with complex formatting might require threshold adjustments
-   Requires sufficient memory for large PDF files
    
