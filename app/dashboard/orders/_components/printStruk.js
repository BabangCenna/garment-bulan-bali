import { jsPDF } from "jspdf";

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID");

const fmtDate = (str) => {
  if (!str) return "-";
  return new Date(str).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function printStruk(order) {
  // Start with a tall page, we'll crop at the end via internal height
  const W = 80;
  const margin = 5;
  const contentW = W - margin * 2;
  const lineH = 4.5;
  const small = 7;
  const normal = 8;
  const medium = 9;

  // First pass: calculate total height needed
  let y = estimateHeight(
    order,
    W,
    margin,
    contentW,
    lineH,
    small,
    normal,
    medium,
  );
  const pageH = y + 12;

  // Second pass: actually render
  const doc = new jsPDF({
    unit: "mm",
    format: [W, pageH],
    orientation: "portrait",
  });

  renderStruk(doc, order, W, margin, contentW, lineH, small, normal, medium);

  doc.autoPrint();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

// ─── shared helpers ───────────────────────────────────────────────────────────
function setupBold(doc, size) {
  doc.setFontSize(size);
  doc.setFont("helvetica", "bold");
}
function setupRegular(doc, size) {
  doc.setFontSize(size);
  doc.setFont("helvetica", "normal");
}
function drawDivider(doc, W, margin, yPos, dashed = false) {
  doc.setLineDashPattern(dashed ? [1, 1] : [], 0);
  doc.setLineWidth(0.2);
  doc.setDrawColor(180);
  doc.line(margin, yPos, W - margin, yPos);
  doc.setLineDashPattern([], 0);
}
function row2col(
  doc,
  W,
  margin,
  left,
  right,
  yPos,
  leftSize,
  rightSize,
  boldRight = false,
) {
  setupRegular(doc, leftSize);
  doc.text(left, margin, yPos);
  if (boldRight) setupBold(doc, rightSize);
  else setupRegular(doc, rightSize);
  doc.text(right, W - margin, yPos, { align: "right" });
}

// ─── estimate total height without rendering ──────────────────────────────────
function estimateHeight(
  order,
  W,
  margin,
  contentW,
  lineH,
  small,
  normal,
  medium,
) {
  // We use a dummy doc just for splitTextToSize
  const dummy = new jsPDF({
    unit: "mm",
    format: [W, 500],
    orientation: "portrait",
  });
  dummy.setFont("helvetica", "normal");

  let y = 10; // header start
  y += 5 + 4 + 2 + 6; // title + code + date + divider gap

  // customer block
  y += lineH + lineH + 2 + 6;

  // items label
  y += lineH;

  for (const item of order.items ?? []) {
    const label = item.description || item.style_name || "Item";
    const detail = [item.size_marker, item.colorway, item.colour_fabric]
      .filter(Boolean)
      .join(" · ");

    dummy.setFontSize(normal);
    const lines = dummy.splitTextToSize(label, contentW - 20);
    y += lines.length * lineH;
    if (detail) y += lineH - 0.5;
    y += lineH + 1; // qty row
  }

  // totals
  y += 5; // divider gap
  y += lineH; // subtotal
  if ((order.discount ?? 0) > 0) y += lineH;
  y += 5 + lineH + 1; // divider + total
  y += lineH + lineH; // method + status
  if ((order.amountPaid ?? 0) > 0) {
    y += lineH;
    const sisa = (order.finalTotal ?? 0) - (order.amountPaid ?? 0);
    if (sisa > 0) y += lineH;
  }

  // footer
  y += 2 + 6 + lineH * 3;

  return y;
}

// ─── actual render ────────────────────────────────────────────────────────────
function renderStruk(
  doc,
  order,
  W,
  margin,
  contentW,
  lineH,
  small,
  normal,
  medium,
) {
  let y = 10;

  // ── header ──────────────────────────────────────────────────────────────────
  setupBold(doc, 11);
  doc.text("NOTA PESANAN", W / 2, y, { align: "center" });

  y += 5;
  setupRegular(doc, small);
  doc.text(order.code, W / 2, y, { align: "center" });

  y += 4;
  setupRegular(doc, small);
  doc.text(fmtDate(order.createdAt), W / 2, y, { align: "center" });

  y += 2;
  drawDivider(doc, W, margin, y + 2);
  y += 6;

  // ── customer ─────────────────────────────────────────────────────────────────
  setupBold(doc, small);
  doc.text("PELANGGAN", margin, y);
  y += lineH;
  setupRegular(doc, normal);
  doc.text(order.customer?.name ?? "-", margin, y);
  y += lineH;
  setupRegular(doc, small);
  doc.text(order.customer?.phone ?? "", margin, y);
  if (order.cashier) {
    doc.text(`Kasir: ${order.cashier}`, W - margin, y, { align: "right" });
  }

  y += 2;
  drawDivider(doc, W, margin, y + 2, true);
  y += 6;

  // ── items ─────────────────────────────────────────────────────────────────────
  setupBold(doc, small);
  doc.text("ITEM", margin, y);
  y += lineH;

  for (const item of order.items ?? []) {
    const label = item.description || item.style_name || "Item";
    const detail = [item.size_marker, item.colorway, item.colour_fabric]
      .filter(Boolean)
      .join(" · ");

    setupRegular(doc, normal);
    const lines = doc.splitTextToSize(label, contentW - 20);
    for (const line of lines) {
      doc.text(line, margin, y);
      y += lineH;
    }

    if (detail) {
      setupRegular(doc, small);
      doc.setTextColor(120);
      doc.text(detail, margin, y);
      doc.setTextColor(0);
      y += lineH - 0.5;
    }

    setupRegular(doc, small);
    const qtyStr = `${item.qty} pcs × ${fmt(item.invoice_price)}`;
    const totalStr = fmt((item.invoice_price || 0) * item.qty);
    doc.text(qtyStr, margin, y);
    setupBold(doc, small);
    doc.text(totalStr, W - margin, y, { align: "right" });
    y += lineH + 1;
  }

  drawDivider(doc, W, margin, y, true);
  y += 5;

  // ── totals ────────────────────────────────────────────────────────────────────
  row2col(
    doc,
    W,
    margin,
    "Subtotal",
    fmt(order.subtotal ?? order.finalTotal),
    y,
    small,
    small,
  );
  y += lineH;

  if ((order.discount ?? 0) > 0) {
    setupRegular(doc, small);
    doc.setTextColor(40, 167, 69);
    row2col(
      doc,
      W,
      margin,
      "Diskon",
      `- ${fmt(order.discount)}`,
      y,
      small,
      small,
    );
    doc.setTextColor(0);
    y += lineH;
  }

  drawDivider(doc, W, margin, y);
  y += 5;

  setupBold(doc, medium);
  doc.text("TOTAL", margin, y);
  setupBold(doc, medium);
  doc.text(fmt(order.finalTotal), W - margin, y, { align: "right" });
  y += lineH + 1;

  // ── payment ───────────────────────────────────────────────────────────────────
  const payMethodLabel =
    { cash: "Tunai", transfer: "Transfer", qris: "QRIS", cod: "COD" }[
      order.paymentMethod
    ] ??
    order.paymentMethod ??
    "-";

  const payStatusLabel =
    { unpaid: "Belum Bayar", deposit: "Deposit", paid: "Lunas" }[
      order.paymentStatus
    ] ??
    order.paymentStatus ??
    "-";

  row2col(doc, W, margin, "Metode", payMethodLabel, y, small, small);
  y += lineH;
  row2col(doc, W, margin, "Status", payStatusLabel, y, small, small, true);
  y += lineH;

  if ((order.amountPaid ?? 0) > 0) {
    row2col(doc, W, margin, "Terbayar", fmt(order.amountPaid), y, small, small);
    y += lineH;
    const sisa = (order.finalTotal ?? 0) - (order.amountPaid ?? 0);
    if (sisa > 0) {
      doc.setTextColor(220, 53, 69);
      row2col(doc, W, margin, "Sisa", fmt(sisa), y, small, small, true);
      doc.setTextColor(0);
      y += lineH;
    }
  }

  y += 2;
  drawDivider(doc, W, margin, y);
  y += 6;

  // ── footer ────────────────────────────────────────────────────────────────────
  setupRegular(doc, small);
  doc.setTextColor(120);
  doc.text("Terima kasih atas kepercayaan Anda.", W / 2, y, {
    align: "center",
  });
  y += lineH;
  doc.text("Barang yang sudah dibeli tidak dapat", W / 2, y, {
    align: "center",
  });
  y += lineH;
  doc.text("dikembalikan.", W / 2, y, { align: "center" });
  doc.setTextColor(0);
}
