export const generateInvoiceHTML = (invoice) => {
    const logoURL = `${process.env.APP_URL}/public/logo/phreights.jpeg`;
    return `
			<!DOCTYPE html>
<html>
   <head>
      <meta charset="utf-8">
      <title>Invoice - Blumoon</title>
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
         .logo-box img{
         background:#0b1f3a;
         padding:8px 12px;
         display:inline-block;
         margin-bottom:10px;
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
                  <strong>ABN</strong>
                  38 617 722 595
               </div>
            </div>
            <div>
               <strong>Blumoon Pty Ltd</strong><br>
               ABN: 38 617 722 595<br>
               ACN: 617 722 595
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
         <p>ACCOUNT DETAILS:</p>
         <p>BANK NAME : ANZ</p>
         <p>SWIFT CODE : ANZBAU3M</p>
         <p>NAME : BLUMOON PTY LTD.</p>
         <p>BSB : 013352 ACCOUNT NO : 464195678</p>
      </div>
      <ul class="terms">
         <li>All payments for this invoice must be made to Blumoon Pty Ltd by the due date stated on the invoice.</li>
         <li>Please always mention the invoice number(s) as the payment reference.</li>
         <li>Payments are accepted in AUD only.</li>
         <li>Goods sold are final and cannot be returned or exchanged under any circumstances.</li>
         <li>Any diamonds or jewellery provided on an approval basis must be returned to the Blumoon office by the due date stated in the quote or invoice, in the same condition as received, including all original certificates and documentation. Failure to return the goods by the due date will result in the items being invoiced to you and deemed sold.</li>
         <li>For full details of our Terms & Conditions and Privacy Policy, please visit www.blumoon.com.au</li>
      </ul>
   </body>
</html>
`;
}


export const generateLogisticsInvoiceHTML = (data) => {
    // You can replace this with your actual hosted logo URL or base64 string
    const logoURL = `${process.env.APP_URL}/public/logo/phreights.jpeg`;

    return `
    <!DOCTYPE html>
    <html>
       <head>
          <meta charset="utf-8">
          <title>Tax Invoice - Phoenix Aggregator</title>
          <style>
             body {
                 font-family: Arial, Helvetica, sans-serif;
                 margin: 0;
                 padding: 40px 35px;
                 color: #333;
             }
             .header {
                 display: flex;
                 justify-content: space-between;
                 align-items: flex-start;
                 border-bottom: 2px solid #FF6A00;
                 padding-bottom: 20px;
             }
             .logo-box img {
                 max-height: 60px;
                 border-radius: 8px;
             }
             .company-details {
                 text-align: right;
                 font-size: 11px;
                 line-height: 1.4;
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
                 margin-top: 40px;
                 font-size: 11px;
                 background: #f8f9fa;
                 padding: 15px;
                 border-radius: 8px;
             }
             .payment p { margin: 4px 0; }
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
                <img src="${logoURL}" alt="Phoenix Aggregator">
             </div>
             <div class="company-details">
                 <strong>Phoenix Aggregator Pvt. Ltd.</strong><br>
                 Warehouse 42, Logistics Park<br>
                 Surat, Gujarat, 395010, IN<br>
                 GSTIN: 24AAACP1234Q1Z5<br>
                 support@phoenixaggregator.com
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
             <p><strong>BANK ACCOUNT DETAILS FOR NEFT/RTGS:</strong></p>
             <p>Bank Name: HDFC Bank Ltd</p>
             <p>Account Name: Phoenix Aggregator Pvt Ltd</p>
             <p>Account Number: 50200012345678</p>
             <p>IFSC Code: HDFC0001234</p>
          </div>

          <ul class="terms">
             <li>All payments for this invoice must be cleared within 7 days of the invoice generation date to avoid late payment penalties.</li>
             <li>Please mention the Invoice Number as the payment reference during bank transfers.</li>
             <li>Any discrepancies regarding weights or dimensions must be raised within 48 hours of shipment delivery.</li>
             <li>This is a computer-generated invoice and does not require a physical signature.</li>
          </ul>
       </body>
    </html>
    `;
};