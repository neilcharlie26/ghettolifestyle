# ghettolifestyle

Static receipt generator for Ghetto Lifestyle. HTML, CSS, and JavaScript only; no database or build step.

## Features

- Responsive layout from 300px upward.
- Products, quantity, price, subtotal, discount, total, payment, and change.
- Full payment required before print/PDF.
- Editable transaction number; required reference for electronic payments.
- Cash, e-wallet, banking, card, remittance, and custom payment options.
- Optional receiver signature using mouse, pen, or touch.
- A4 portrait layout with up to 20 items per page, repeated transaction details, and final totals on the last page. Long descriptions may need additional space.
- New receipt confirmation modal.

## Run

Open index.html or serve this directory with any static HTTP server. Receipt data and signatures stay in the current tab and clear on refresh. Transaction IDs are random, not centrally sequential.

## Deploy to Vercel

Import this repository, select Other as the framework preset, leave install/build commands empty, and set the output directory to a single dot (.). Deploy.

## Print / PDF

Enter the receipt and full payment, then select Print / Save as PDF. Choose your printer or Save as PDF, A4 portrait, 100% scale, and disable headers/footers. For thermal printing, use A4 thermal paper and select A4 in the printer driver. Actual printer output depends on driver settings.

The supplied logo is included as logo.png. Google Fonts are optional; system fonts are used offline.

