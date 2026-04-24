import { jsPDF } from "jspdf";

// ─── config — edit these to match your business ───────────────────────────────
const COMPANY = {
  name: "Garment Bulan Bali",
  address: "Jl. Siulan No. 161 Denpasar, Bali, Indonesia",
  bank: {
    holder: "Ida Ayu Made Suryani",
    name: "BCA - Bank Central Asia",
    account: "4350129281",
    swift: "CENAIDJA",
  },
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const fmtDateLong = (str) => {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const mmToPt = (mm) => mm * 2.8346;

// ─── color palette (matching the invoice's warm beige/brown theme) ────────────
const C = {
  black: [30, 30, 30],
  gray: [120, 120, 120],
  lightGray: [200, 200, 200],
  tableHead: [214, 185, 166], // warm beige header
  tableBorder: [190, 160, 140], // border color
  accent: [160, 110, 80], // brown accent
  white: [255, 255, 255],
  bgLight: [250, 245, 240], // very light warm bg
};

function setColor(doc, rgb, type = "text") {
  if (type === "text") doc.setTextColor(...rgb);
  if (type === "fill") doc.setFillColor(...rgb);
  if (type === "draw") doc.setDrawColor(...rgb);
}

// ─── main export ──────────────────────────────────────────────────────────────
export function printInvoice(order) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  const PW = 210; // page width
  const PH = 297; // page height
  const ML = 20; // margin left
  const MR = 20; // margin right
  const CW = PW - ML - MR; // content width
  let y = 0;

  // ── decorative corner triangles (top-right, bottom-left) ──────────────────
  // top-right warm triangle
  setColor(doc, [214, 185, 166], "fill");
  doc.triangle(PW - 45, 0, PW, 0, PW, 45, "F");
  setColor(doc, [190, 160, 140], "fill");
  doc.triangle(PW - 25, 0, PW, 0, PW, 25, "F");

  // bottom-left warm triangle
  setColor(doc, [214, 185, 166], "fill");
  doc.triangle(0, PH - 45, 45, PH, 0, PH, "F");
  setColor(doc, [190, 160, 140], "fill");
  doc.triangle(0, PH - 25, 25, PH, 0, PH, "F");

  // ── header ─────────────────────────────────────────────────────────────────
  y = 22;

  // Company name (left)
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(COMPANY.name, ML, y);

  // INVOICE title (right)
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("INVOICE", PW - MR, y, { align: "right" });

  y += 5;
  // Company address (left)
  setColor(doc, C.gray, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(COMPANY.address, ML, y);

  // ── To block + invoice meta ─────────────────────────────────────────────────
  y += 18;

  // "To :" label
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("To :", ML, y);

  y += 5;
  // Customer name (bold)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  const customerName = order.customer?.name ?? "-";
  const nameLines = doc.splitTextToSize(customerName, 80);
  doc.text(nameLines, ML, y);
  y += nameLines.length * 4.5;

  // Customer address if present
  if (order.customer?.address) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, C.gray, "text");
    const addrLines = doc.splitTextToSize(order.customer.address, 80);
    doc.text(addrLines, ML, y);
    y += addrLines.length * 4;
  }

  // Customer phone/email
  if (order.customer?.phone) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setColor(doc, C.gray, "text");
    doc.text(order.customer.phone, ML, y);
    y += 4;
  }

  // Invoice meta block (right side) — aligned with "To" block top
  const metaY = y - nameLines.length * 4.5 - 5 - 5; // back to where To: was
  const metaX1 = PW / 2 + 10;
  const metaX2 = PW - MR;
  let mY = metaY;

  const metaRow = (label, value, bold = false) => {
    setColor(doc, C.black, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label, metaX1, mY);
    doc.text(":", metaX1 + 28, mY);
    if (bold) doc.setFont("helvetica", "bold");
    doc.text(value, metaX1 + 32, mY);
    doc.setFont("helvetica", "normal");
    mY += 5.5;
  };

  // generate invoice number from order code
  const invoiceNo = `INV-${order.code}`;
  metaRow("Invoice No.", invoiceNo, true);
  metaRow("Date", fmtDateLong(order.createdAt));
  metaRow("Currency", "IDR (Indonesian Rupiah)");

  // ── items table ────────────────────────────────────────────────────────────
  // ensure y is below the To block
  y = Math.max(y, mY) + 8;

  const cols = {
    desc: { x: ML, w: 85 },
    qty: { x: ML + 85, w: 25 },
    price: { x: ML + 85 + 25, w: 35 },
    amt: { x: ML + 85 + 25 + 35, w: CW - 85 - 25 - 35 },
  };

  const tableRight = ML + CW;
  const rowH = 8;
  const headH = 9;

  // table header background
  setColor(doc, C.tableHead, "fill");
  setColor(doc, C.tableBorder, "draw");
  doc.setLineWidth(0.3);
  doc.rect(ML, y, CW, headH, "FD");

  // header text
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  const hY = y + headH / 2 + 2.5;
  doc.text("DESCRIPTION", cols.desc.x + 3, hY);
  doc.text("QTY", cols.qty.x + cols.qty.w / 2, hY, { align: "center" });
  doc.text("UNIT PRICE", cols.price.x + cols.price.w / 2, hY, {
    align: "center",
  });
  doc.text("AMOUNT", tableRight - 3, hY, { align: "right" });

  y += headH;

  // column dividers in header (draw after header rect)
  setColor(doc, C.tableBorder, "draw");
  doc.line(cols.qty.x, y - headH, cols.qty.x, y);
  doc.line(cols.price.x, y - headH, cols.price.x, y);
  doc.line(cols.amt.x, y - headH, cols.amt.x, y);

  // item rows
  const items = order.items ?? [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const label = item.description || item.style_name || "Item";
    const detail = [
      item.size_marker,
      item.colorway,
      item.colour_fabric,
      item.weight,
    ]
      .filter(Boolean)
      .join(", ");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    const labelLines = doc.splitTextToSize(label, cols.desc.w - 6);
    const detailLines = detail
      ? doc.splitTextToSize(detail, cols.desc.w - 6)
      : [];
    const totalLines = labelLines.length + detailLines.length;
    const cellH = Math.max(rowH, totalLines * 4 + 4);

    // alternating row bg
    if (i % 2 === 1) {
      setColor(doc, C.bgLight, "fill");
      doc.rect(ML, y, CW, cellH, "F");
    }

    // row border
    setColor(doc, C.lightGray, "draw");
    doc.setLineWidth(0.2);
    doc.rect(ML, y, CW, cellH, "S");

    // column dividers
    doc.line(cols.qty.x, y, cols.qty.x, y + cellH);
    doc.line(cols.price.x, y, cols.price.x, y + cellH);
    doc.line(cols.amt.x, y, cols.amt.x, y + cellH);

    const textY = y + 5;
    setColor(doc, C.black, "text");

    // description
    doc.setFont("helvetica", "normal");
    doc.text(labelLines, cols.desc.x + 3, textY);
    if (detailLines.length > 0) {
      setColor(doc, C.gray, "text");
      doc.setFontSize(7);
      doc.text(detailLines, cols.desc.x + 3, textY + labelLines.length * 4);
      setColor(doc, C.black, "text");
      doc.setFontSize(8);
    }

    // qty
    const qtyStr = `${item.qty} pcs`;
    doc.text(qtyStr, cols.qty.x + cols.qty.w / 2, textY, { align: "center" });

    // unit price
    doc.text(fmt(item.invoice_price), cols.price.x + cols.price.w / 2, textY, {
      align: "center",
    });

    // amount
    doc.setFont("helvetica", "bold");
    doc.text(fmt((item.invoice_price || 0) * item.qty), tableRight - 3, textY, {
      align: "right",
    });

    y += cellH;
  }

  // bottom border of table
  setColor(doc, C.tableBorder, "draw");
  doc.setLineWidth(0.3);
  doc.line(ML, y, tableRight, y);

  // ── totals section ─────────────────────────────────────────────────────────
  y += 10;

  const totX1 = PW / 2 + 5; // label column
  const totX2 = tableRight; // value column

  const totRow = (label, value, bold = false, colorRgb = C.black) => {
    setColor(doc, C.gray, "text");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label, totX1, y);
    setColor(doc, colorRgb, "text");
    if (bold) doc.setFont("helvetica", "bold");
    doc.text(value, totX2, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    y += 5.5;
  };

  const subtotal = order.subtotal ?? order.finalTotal ?? 0;
  const amountPaid = order.amountPaid ?? 0;
  const finalTotal = order.finalTotal ?? 0;
  const discount = order.discount ?? 0;
  const balanceDue = finalTotal - amountPaid;

  totRow("SUBTOTAL", fmt(subtotal));
  if (discount > 0) {
    totRow("LESS : DISCOUNT", `- ${fmt(discount)}`, false, C.accent);
  }
  if (amountPaid > 0) {
    totRow("LESS : DEPOSIT", `- ${fmt(amountPaid)}`, false, C.accent);
  }

  // divider before balance
  y += 1;
  setColor(doc, C.lightGray, "draw");
  doc.setLineWidth(0.3);
  doc.line(totX1, y, totX2, y);
  y += 4;

  // BALANCE DUE
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("BALANCE DUE", totX1, y);
  doc.setFontSize(10);
  doc.text(fmt(balanceDue), totX2, y, { align: "right" });

  // ── payment details ────────────────────────────────────────────────────────
  y += 20;

  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Payment Details", ML, y);
  y += 6;

  const payRows = [
    ["Account Holder", COMPANY.bank.holder],
    ["Bank", COMPANY.bank.name],
    ["Account No.", COMPANY.bank.account],
    ["Swift Code", COMPANY.bank.swift],
  ];

  for (const [label, value] of payRows) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    setColor(doc, C.gray, "text");
    doc.text(label, ML, y);
    doc.text(":", ML + 28, y);
    setColor(doc, C.black, "text");
    doc.text(value, ML + 32, y);
    y += 5;
  }

  // ── thank you (bottom right) ───────────────────────────────────────────────
  // position near bottom
  const tyY = PH - 30;
  setColor(doc, C.black, "text");
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(16);
  doc.text("Thank You", PW - MR - 5, tyY, { align: "right" });

  // simple decorative underline curve simulation
  setColor(doc, C.black, "draw");
  doc.setLineWidth(0.4);
  doc.line(PW - MR - 38, tyY + 3, PW - MR - 5, tyY + 3);

  // ── open in new tab ────────────────────────────────────────────────────────
  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}
