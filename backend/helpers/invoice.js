import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getLogoDataUri = () => {
    try {
        const candidateLogoPaths = [
            path.join(__dirname, "../public/logo/phreights.png"),
            path.join(process.cwd(), "public/logo/phreights.png"),
            path.join(process.cwd(), "backend/public/logo/phreights.png"),
            path.join(__dirname, "../../public/logo/phreights.png")
        ];
        const logoPath = candidateLogoPaths.find((p) => fs.existsSync(p));
        if (logoPath) {
            const buf = fs.readFileSync(logoPath);
            return `data:image/png;base64,${buf.toString("base64")}`;
        }
    } catch (err) {
        console.error("Error reading logo file for invoice:", err);
    }
    return `${process.env.APP_URL || "http://localhost:9000"}/public/logo/phreights.png`;
};

export const generateInvoiceHTML = (invoice) => {
    const logoURL = getLogoDataUri();
    return `
			<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <title>Invoice - Phoenix Commerce</title>
      <style>
         body{
         font-family: Arial, Helvetica, sans-serif;
         margin:0;
         padding:60px 35px;
         color:#000;
         }
         /* TOP RIGHT LOGO */
         .header{
         text-align:right;
         }
         .logo-box{
         display:inline-block;
         background-color: #0A1F44;
         padding: 8px 16px;
         border-radius: 8px;
         margin-bottom: 10px;
         }
         .logo-box img{
         max-height: 52px;
         width: auto;
         display:block;
         }
         /* TITLE */
         .invoice-title{
         font-size: 28px;
         font-weight:100;
         }
         .customer-details{
         margin-top:10px;
         font-size:13px;
         letter-spacing:0.5px;
         margin-left: 100px;
         }
         /* META SECTION */
         .meta-wrapper{
         display:flex;
         justify-content:space-between;
         margin-top:20px;
         }
         .meta-left{
         width:45%;
         font-size:12px;
         }
         .meta-right{
         display: flex;
         gap: 50px;
         font-size:10px;
         text-align:left;
         margin-right: 50px;
         }
         .meta-row{
         margin-bottom:10px;
         }
         .meta-row strong{
         display:block;
         font-weight:bold;
         margin-bottom:2px;
         }
         /* TABLE */
         table{
         width:100%;
         border-collapse:collapse;
         margin-top:60px;
         }
         th{
         text-align:left;
         font-size:12px;
         padding:10px 6px;
         border-bottom:0.3px solid #000;
         }
         td{
         font-size:11px;
         padding:12px 6px;
         border-bottom:1px solid #ddd;
         }
         .td-text-right{
         text-align:right;
         }
         .text-center{ text-align:center; }
         .text-right{ text-align:right; }
         /* TOTALS */
         .totals{
         width:320px;
         margin-left:auto;
         margin-top:20px;
         font-size:12px;
         }
         .totals-top {
         width: 161px;
    		 margin-left: auto;
         }
         .custom-total{
         padding: 0px !important;
    		 width: 161px;
    		 margin-left: auto;
         }
         .total-row{
         display:flex;
         justify-content:space-between;
         padding:6px 0;
         }
         .total-divider{
         border-top:0.3px solid #000;
         margin-top:8px;
         }
         /* PAYMENT */
         .payment{
         margin-top:60px;
         font-size:12px;
         }
         .payment p{
         margin:3px 0;
         }
         /* TERMS */
         .terms{
         margin-top:20px;
         font-size:10px;
         line-height:1.5;
         padding-left:15px;
         }
         .terms li{
         margin-bottom:4px;
         }
         /* CARDS */
         .cards{
         margin-top:25px;
         }
         .cards img{
         height:30px;
         margin-right:10px;
         }
         .pay-link{
         display:block;
         margin-top:8px;
         font-size:12px;
         color:#0066cc;
         text-decoration:underline;
         cursor:pointer;
         }
      </style>
   </head>
   <body>
      <div class="header">
         <div class="logo-box">
            <img src="${logoURL}" alt="logo">
         </div>
      </div>
      <div class="meta-wrapper">
         <div class="meta-left">
            <div class="invoice-title">${invoiceTitle}</div>
            <div class="customer-details">
            <p>${invoice?.buyer?.company || ""}</p>
            <p>${invoice?.customer_name ? (invoice.customer_name || "") : ((invoice?.buyer?.firstname || "") + " " + (invoice?.buyer?.lastname || ""))}</p>
            <p>${invoice?.buyer?.shipping_details?.address || ""}</p>
            <p>${invoice?.buyer?.suburb || ""},${invoice.buyer?.postcode || ""}</p>
            <p>${invoice?.buyer?.phone || ""}</p>
            <p>${invoice?.buyer?.email || ""}</p>
            <p>${invoice?.buyer?.ABN || ""}</p>
            </div>
         </div>
         <div class="meta-right">
            <div>
               <div class="meta-row">
                  <strong>Invoice Date</strong>
                  ${dateInvoice}
               </div>
               <div class="meta-row">
                  <strong>Invoice Number</strong>
                  ${invoice?.invoice_number}
               </div>
               <div class="meta-row">
                  <strong>Reference</strong>
                  ${invoice?.reference || "Loose Diamond"}
               </div>
               <div class="meta-row">
                  <strong>GSTIN</strong>
                  24DYHPA2082J1ZL
               </div>
            </div>
            <div>
               <strong>PHOENIX COMMERCE</strong><br>
               2051, INTERNATIONAL FASHION MARKET (IFM)<br>
               OPP. RAAJMAHAL AC MALL, SITANAGAR SURAT 395010<br>
               GST: 24DYHPA2082J1ZL
            </div>
         </div>
      </div>
      <table>
         <thead>
            <tr>
               <th style="width:50%">Description</th>
               <th class="text-center">Quantity</th>
               <th class="text-right">Unit Price</th>
               <th class="text-right">GST</th>
               <th class="text-right">Amount AUD</th>
            </tr>
         </thead>
         <tbody>
            ${productRows}
         </tbody>
      </table>
      <div class="totals">
     		 <div class="totals-top">
          	 <div class="total-row">
            		<span>Subtotal</span>
            		<span>$${invoice?.cost?.sub_total?.toFixed(2)}</span>
         		</div>
         		<div class="total-row">
           		 	<span>Shipping Charges:</span>
            	  <span>$${(invoice?.cost?.shipping_charges_amt || 0).toFixed(2)}</span>
         		</div>
         		<div class="total-row">
            		<span>Total GST(AUD)</span>
            		<span>${invoice?.amount_are === "no_tax" ? "No Tax" : `$${gstCount?.toFixed(2)}`}</span>
         		</div>
				 </div>
         <div class="total-row total-divider"></div>
         <div class="total-row custom-total">
            <span>TOTAL AUD</span>
            <span>$${invoice?.cost?.final_amount?.toFixed(2)}</span>
				 </div>
      </div>
      <div class="payment">
         <p><strong>Due Date: ${duedateInvoice}</strong></p>
         <p><strong>BANK ACCOUNT DETAILS (Kotak Current A/c):</strong></p>
         <p>Name: Phoenix Commerce</p>
         <p>Bank Name: Kotak Bank</p>
         <p>A/c Type: Current</p>
         <p>A/C number: 5949289868</p>
         <p>IFSC code: KKBK0002887</p>
      </div>
      <ul class="terms">
         <li>All payments for this invoice must be made to Phoenix Commerce by the due date stated on the invoice.</li>
         <li>Please always mention the invoice number(s) as the payment reference.</li>
         <li>This is a computer-generated tax invoice by Phoenix Commerce and does not require a physical signature.</li>
      </ul>
   </body>
</html>
`;
}


export const generateLogisticsInvoiceHTML = (data) => {
    const logoURL = getLogoDataUri();

    return `
    <!DOCTYPE html>
    <html>
       <head>
          <meta charset="utf-8">
          <title>Tax Invoice - Phoenix Commerce</title>
          <style>
             html, body {
                 background-color: #ffffff;
             }
             body {
                 font-family: Arial, Helvetica, sans-serif;
                 margin: 0;
                 padding: 40px 35px;
                 color: #1e293b;
                 background-color: #ffffff;
             }
             .header {
                 display: flex;
                 justify-content: space-between;
                 align-items: center;
                 border-bottom: 2px solid #FF6A00;
                 padding-bottom: 20px;
             }
             .logo-box {
                 display: inline-flex;
                 align-items: center;
                 background-color: #0A1F44;
                 padding: 8px 18px;
                 border-radius: 8px;
             }
             .logo-box img {
                 max-height: 52px;
                 width: auto;
                 display: block;
                 object-fit: contain;
             }
             .company-details {
                 text-align: right;
                 font-size: 11px;
                 line-height: 1.5;
             }
             .company-details strong.company-name {
                 font-size: 15px;
                 color: #0A1F44;
                 letter-spacing: 0.5px;
                 display: inline-block;
                 margin-bottom: 2px;
             }
             .invoice-title {
                 font-size: 24px;
                 font-weight: bold;
                 color: #0A1F44;
                 margin-top: 20px;
                 text-transform: uppercase;
                 letter-spacing: 1px;
             }
             .meta-wrapper {
                 display: flex;
                 justify-content: space-between;
                 margin-top: 30px;
             }
             .meta-left {
                 width: 50%;
                 font-size: 12px;
                 line-height: 1.5;
             }
             .meta-left h4 {
                 margin: 0 0 5px 0;
                 color: #0A1F44;
                 font-size: 14px;
             }
             .meta-right {
                 width: 40%;
                 font-size: 11px;
                 background: #f8f9fa;
                 padding: 15px;
                 border-radius: 8px;
                 border: 1px solid #eee;
             }
             .meta-row {
                 display: flex;
                 justify-content: space-between;
                 margin-bottom: 8px;
             }
             .meta-row strong {
                 color: #0A1F44;
             }
             table {
                 width: 100%;
                 border-collapse: collapse;
                 margin-top: 40px;
             }
             th {
                 background-color: #0A1F44;
                 color: white;
                 text-align: left;
                 font-size: 11px;
                 padding: 12px 8px;
                 border: 1px solid #0A1F44;
             }
             td {
                 font-size: 10px;
                 padding: 10px 8px;
                 border-bottom: 1px solid #ddd;
                 border-left: 1px solid #eee;
                 border-right: 1px solid #eee;
             }
             tr:nth-child(even) {
                 background-color: #fcfcfc;
             }
             .text-center { text-align: center; }
             .text-right { text-align: right; }
             
             .totals-wrapper {
                 display: flex;
                 justify-content: flex-end;
                 margin-top: 20px;
             }
             .totals {
                 width: 300px;
                 font-size: 12px;
             }
             .total-row {
                 display: flex;
                 justify-content: space-between;
                 padding: 8px 10px;
                 border-bottom: 1px solid #eee;
             }
             .custom-total {
                 background-color: #FF6A00;
                 color: white;
                 font-weight: bold;
                 font-size: 14px;
                 border-radius: 4px;
                 margin-top: 5px;
             }
             .payment {
                 margin-top: 35px;
                 font-size: 11px;
                 background: #f8fafc;
                 padding: 16px 20px;
                 border-radius: 8px;
                 border: 1px solid #e2e8f0;
             }
             .payment p { margin: 5px 0; color: #334155; }
             .payment p strong { color: #0A1F44; display: inline-block; min-width: 110px; }
             .terms {
                 margin-top: 30px;
                 font-size: 9px;
                 line-height: 1.5;
                 color: #666;
                 padding-left: 15px;
             }
             .terms li { margin-bottom: 5px; }
          </style>
       </head>
       <body>
          <div class="header">
             <div class="logo-box">
                <img src="${logoURL}" alt="Phreights by Phoenix Commerce">
             </div>
             <div class="company-details">
                 <strong class="company-name">PHOENIX COMMERCE</strong><br>
                 2051, INTERNATIONAL FASHION MARKET (IFM),<br>
                 OPP. RAAJMAHAL AC MALL, SITANAGAR SURAT 395010<br>
                 <strong>GST:</strong> 24DYHPA2082J1ZL<br>
                 <strong>Email:</strong> phoenixfreights@gmail.com
             </div>
          </div>
          
          <div class="invoice-title">Tax Invoice</div>

          <div class="meta-wrapper">
             <div class="meta-left">
                <h4>BILLED TO:</h4>
                <strong>${data.user.companyName || data.user.name}</strong><br>
                Contact: ${data.user.name} (${data.user.mobileNumber})<br>
                Email: ${data.user.email}<br>
                GSTIN: ${data.user.gstType === "GST Registered" ? "[GSTIN Omitted]" : "Unregistered"}
             </div>
             <div class="meta-right">
                <div class="meta-row">
                   <strong>Invoice No:</strong>
                   <span>${data.invoiceNumber}</span>
                </div>
                <div class="meta-row">
                   <strong>Invoice Date:</strong>
                   <span>${data.invoiceDate}</span>
                </div>
                <div class="meta-row">
                   <strong>Billing Period:</strong>
                   <span>${data.fromDate} - ${data.toDate}</span>
                </div>
             </div>
          </div>

          <table>
             <thead>
                <tr>
                   <th style="width:12%">Date</th>
                   <th style="width:20%">AWB / Tracking</th>
                   <th style="width:28%">Destination</th>
                   <th class="text-center" style="width:10%">Weight</th>
                   <th class="text-right" style="width:10%">Base (₹)</th>
                   <th class="text-right" style="width:10%">GST (₹)</th>
                   <th class="text-right" style="width:10%">Total (₹)</th>
                </tr>
             </thead>
             <tbody>
                ${data.productRows}
             </tbody>
          </table>

          <div class="totals-wrapper">
              <div class="totals">
                 <div class="total-row">
                       <span>Freight Subtotal</span>
                       <span>₹${data.subTotal.toFixed(2)}</span>
                 </div>
                 <div class="total-row">
                       <span>Total GST (18%)</span>
                       <span>₹${data.totalGst.toFixed(2)}</span>
                 </div>
                 <div class="total-row custom-total">
                    <span>TOTAL PAYABLE</span>
                    <span>₹${data.grandTotal.toFixed(2)}</span>
                 </div>
              </div>
          </div>

          <div class="payment">
             <p style="font-size: 12px; font-weight: bold; color: #0A1F44; margin-bottom: 8px;">BANK ACCOUNT DETAILS FOR NEFT / RTGS / IMPS:</p>
             <p><strong>Kotak Current A/c</strong></p>
             <p><strong>Name:</strong> Phoenix Commerce</p>
             <p><strong>Bank Name:</strong> Kotak Bank</p>
             <p><strong>A/c Type:</strong> Current</p>
             <p><strong>A/C number:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 12px; color: #0A1F44;">5949289868</span></p>
             <p><strong>IFSC code:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 12px; color: #FF6A00;">KKBK0002887</span></p>
          </div>

          <ul class="terms">
             <li>All payments for this invoice must be cleared within 7 days of the invoice generation date to avoid late payment penalties.</li>
             <li>Please mention the Invoice Number as the payment reference during bank transfers.</li>
             <li>Any discrepancies regarding weights or dimensions must be raised within 48 hours of shipment delivery.</li>
             <li>This is a computer-generated tax invoice by Phoenix Commerce and does not require a physical signature.</li>
          </ul>
       </body>
    </html>
    `;
};