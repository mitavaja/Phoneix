import moment from "moment";
import puppeteer from "puppeteer";
import User from "../models/User.js";
import Shipment from "../models/Shipment.js";
import { generateLogisticsInvoiceHTML } from "../helpers/invoice.js";

export const generateInvoicePDF = async (req, res) => {
    let browser = null;

    try {
        const userId = req.user._id;

        // Accept custom date ranges from frontend, otherwise default to Current Month
        let { fromDate, toDate } = req.query;

        if (!fromDate || !toDate) {
            fromDate = moment().startOf('month').toDate();
            toDate = moment().endOf('month').toDate();
        } else {
            // Parse custom dates and span entire days
            fromDate = moment(fromDate).startOf('day').toDate();
            toDate = moment(toDate).endOf('day').toDate();
        }

        // 1. Fetch User Data
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Fetch Delivered Shipments in Date Range
        const shipments = await Shipment.find({
            user: userId,
            status: "Delivered",
            updatedAt: { $gte: fromDate,$lte: toDate }
        }).sort({ updatedAt: 1 });

        if (!shipments || shipments.length === 0) {
            return res.status(404).json({
                message: `No delivered shipments found between ${moment(fromDate).format("DD MMM YYYY")} and ${moment(toDate).format("DD MMM YYYY")}.`
            });
        }

        // 3. Process Data and Calculate Totals
        let subTotal = 0;
        let totalGst = 0;
        let grandTotal = 0;

        const productRows = shipments.map(sh => {
            const base = sh.shippingCharge || 0;
            const gst = sh.gstAmount || 0;
            const total = sh.invoiceTotal || 0;

            subTotal += base;
            totalGst += gst;
            grandTotal += total;

            const destination = `${sh.receiverCity || ""}, ${sh.receiverCountry || ""}`.replace(/^, | , $/g, '').trim() || sh.to;

            return `
                <tr>
                    <td>${moment(sh.updatedAt).format("DD/MM/YYYY")}</td>
                    <td><strong>${sh.courierTrackingNumber || sh.shipmentId}</strong><br><span style="font-size:8px; color:#666;">${sh.courierName}</span></td>
                    <td>${destination}</td>
                    <td class="text-center">${sh.chargeableWeight || sh.weight} kg</td>
                    <td class="text-right">₹${base.toFixed(2)}</td>
                    <td class="text-right">₹${gst.toFixed(2)}</td>
                    <td class="text-right"><strong>₹${total.toFixed(2)}</strong></td>
                </tr>
            `;
        }).join("");

        // 4. Compile HTML
        const htmlContent = generateLogisticsInvoiceHTML({
            user,
            fromDate: moment(fromDate).format("DD MMM YYYY"),
            toDate: moment(toDate).format("DD MMM YYYY"),
            invoiceDate: moment().format("DD MMM YYYY"),
            invoiceNumber: `INV-${moment().format("YYMM")}-${Math.floor(1000 + Math.random() * 9000)}`,
            productRows,
            subTotal,
            totalGst,
            grandTotal
        });

        // 5. Generate PDF natively with Puppeteer
        browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            // Uncomment the line below ONLY if it still fails to find Chromium
            // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        });

        const page = await browser.newPage();

        // Load the HTML content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        // Convert page to PDF buffer
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" }
        });

        await browser.close();

        // 6. Send Response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Phoenix_Invoice_${moment(fromDate).format("MMM_YYYY")}.pdf`);
        res.setHeader('Content-Length', pdfBuffer.length);

        res.send(Buffer.from(pdfBuffer));

    } catch (error) {
        console.error("Invoice Error:", error);

        if (browser) {
            await browser.close().catch(console.error);
        }

        res.status(500).json({
            message: "Internal server error during invoice generation.",
            error: error.message
        });
    }
};