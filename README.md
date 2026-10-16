# Ghetto Lifestyle Receipt Studio

Static receipt generator. No database, account, API keys, or build step. Customer input stays in the current browser tab and clears on refresh. Transaction numbers use a timestamp prefix and random ID; they are editable and are not centrally sequential.

## Run

Open `index.html` in a browser, or serve this directory using a static HTTP server.

## Deploy on Vercel

Upload this folder to a GitHub repository, import that repository into Vercel, and choose **Other** as the framework. Leave build and install commands empty, and use `.` as the output directory. Deploy.

## Use

Enter customer details, products, whole-number quantities, and unit prices. Subtotal is the sum of item totals; total is subtotal minus discount (capped at subtotal). Enter the amount paid to calculate change or remaining balance. Select **Print / Save as PDF**, choose a printer or **Save as PDF**, and disable browser headers/footers. Enable background graphics for the receipt colors.

The header uses the original supplied logo (`logo.png`). Receipts use an A4 portrait print layout with 12 mm margins, repeating table headings, and signature areas. Long product lists can continue onto additional pages. Google Fonts are optional; system fonts are used offline.


Signatures: Draw customer and receiver signatures with mouse, pen, or touch in the Signatures section. Each pad has a Clear button. Signatures appear on the receipt and print/PDF; New receipt clears both pads. They remain only in the current browser tab.

Thermal printing: Select 80mm or 58mm in Paper / printer size and choose the same paper width in your printer settings. Use 100% scale and disable headers/footers. Thermal output is monochrome and compact; roll length is controlled by the printer driver. A4 remains available. Empty signature areas are omitted from print.
# ghettolifestyle
