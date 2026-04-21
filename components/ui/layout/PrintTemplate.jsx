// components/ui/layout/PrintTemplate.jsx
'use client'
import { useRef } from 'react'
import Button from '@/components/ui/button/Button'

export const PrintTemplate = ({
  children,
  title    = 'Dokumen',
  showControls = true,
  className = '',
}) => {
  const ref = useRef(null)

  const handlePrint = () => {
    const content = ref.current?.innerHTML
    if (!content) return
    const win = window.open('', '_blank')
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <meta charset="UTF-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <div className={['print-wrapper', className].filter(Boolean).join(' ')}>
      {showControls && (
        <div className="print-controls no-print">
          <Button
            size="sm"
            variant="primary"
            leftIcon={<i className="fa-solid fa-print" />}
            onClick={handlePrint}
          >
            Cetak
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<i className="fa-solid fa-download" />}
            onClick={handlePrint}
          >
            Simpan PDF
          </Button>
        </div>
      )}
      <div ref={ref} className="print-document">
        {children}
      </div>
    </div>
  )
}

// ── Struk / Receipt ──────────────────────────────────────────────
export const Receipt = ({
  storeName   = 'TokoKu',
  storeAddress,
  storePhone,
  receiptNo,
  date,
  cashier,
  items       = [], // [{ name, qty, price, total }]
  subtotal,
  discount,
  tax,
  total,
  paid,
  change,
  note,
  footer      = 'Terima kasih telah berbelanja!',
}) => (
  <div className="receipt">
    {/* header */}
    <div className="receipt-header">
      <div className="receipt-store-name">{storeName}</div>
      {storeAddress && <div className="receipt-store-info">{storeAddress}</div>}
      {storePhone   && <div className="receipt-store-info">Telp: {storePhone}</div>}
    </div>

    <div className="receipt-divider-dashed" />

    {/* meta */}
    <div className="receipt-meta">
      {receiptNo && <div className="receipt-meta-row"><span>No. Struk</span><span>{receiptNo}</span></div>}
      {date      && <div className="receipt-meta-row"><span>Tanggal</span><span>{date}</span></div>}
      {cashier   && <div className="receipt-meta-row"><span>Kasir</span><span>{cashier}</span></div>}
    </div>

    <div className="receipt-divider-dashed" />

    {/* items */}
    <table className="receipt-items">
      <tbody>
        {items.map((item, i) => (
          <tr key={i} className="receipt-item">
            <td className="receipt-item-name" colSpan={2}>{item.name}</td>
          </tr>
        ))}
        {items.map((item, i) => (
          <tr key={`d${i}`} className="receipt-item-detail">
            <td className="receipt-item-qty">{item.qty} x {item.price}</td>
            <td className="receipt-item-total">{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="receipt-divider-dashed" />

    {/* summary */}
    <div className="receipt-summary">
      {subtotal  && <div className="receipt-summary-row"><span>Subtotal</span><span>{subtotal}</span></div>}
      {discount  && <div className="receipt-summary-row"><span>Diskon</span><span>- {discount}</span></div>}
      {tax       && <div className="receipt-summary-row"><span>Pajak</span><span>{tax}</span></div>}
    </div>

    <div className="receipt-divider-solid" />

    <div className="receipt-total-row">
      <span>TOTAL</span>
      <span>{total}</span>
    </div>

    <div className="receipt-divider-dashed" />

    <div className="receipt-summary">
      {paid   && <div className="receipt-summary-row"><span>Bayar</span><span>{paid}</span></div>}
      {change && <div className="receipt-summary-row"><span>Kembalian</span><span>{change}</span></div>}
    </div>

    {note && (
      <>
        <div className="receipt-divider-dashed" />
        <div className="receipt-note">{note}</div>
      </>
    )}

    <div className="receipt-divider-dashed" />
    <div className="receipt-footer">{footer}</div>
  </div>
)

// ── Invoice ──────────────────────────────────────────────────────
export const Invoice = ({
  storeName,
  storeAddress,
  storePhone,
  storeEmail,
  invoiceNo,
  date,
  dueDate,
  customer,      // { name, address, phone }
  items    = [], // [{ desc, qty, unit, price, total }]
  subtotal,
  discount,
  tax,
  total,
  note,
  bankInfo,      // { bank, account, holder }
}) => (
  <div className="invoice">
    {/* header */}
    <div className="invoice-header">
      <div className="invoice-brand">
        <div className="invoice-brand-name">{storeName}</div>
        {storeAddress && <div className="invoice-brand-info">{storeAddress}</div>}
        {storePhone   && <div className="invoice-brand-info">Telp: {storePhone}</div>}
        {storeEmail   && <div className="invoice-brand-info">{storeEmail}</div>}
      </div>
      <div className="invoice-title-block">
        <div className="invoice-title">INVOICE</div>
        {invoiceNo && <div className="invoice-no">{invoiceNo}</div>}
      </div>
    </div>

    <div className="invoice-divider" />

    {/* meta */}
    <div className="invoice-meta">
      <div className="invoice-customer">
        <div className="invoice-section-label">Tagihan Kepada:</div>
        <div className="invoice-customer-name">{customer?.name}</div>
        {customer?.address && <div className="invoice-customer-info">{customer.address}</div>}
        {customer?.phone   && <div className="invoice-customer-info">Telp: {customer.phone}</div>}
      </div>
      <div className="invoice-dates">
        {date    && <div className="invoice-date-row"><span>Tanggal</span><span>{date}</span></div>}
        {dueDate && <div className="invoice-date-row"><span>Jatuh Tempo</span><span>{dueDate}</span></div>}
      </div>
    </div>

    {/* items table */}
    <table className="invoice-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Deskripsi</th>
          <th>Qty</th>
          <th>Satuan</th>
          <th>Harga</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{item.desc}</td>
            <td style={{ textAlign: 'center' }}>{item.qty}</td>
            <td>{item.unit}</td>
            <td style={{ textAlign: 'right' }}>{item.price}</td>
            <td style={{ textAlign: 'right' }}>{item.total}</td>
          </tr>
        ))}
      </tbody>
    </table>

    {/* totals */}
    <div className="invoice-totals">
      {subtotal && <div className="invoice-total-row"><span>Subtotal</span><span>{subtotal}</span></div>}
      {discount && <div className="invoice-total-row"><span>Diskon</span><span>- {discount}</span></div>}
      {tax      && <div className="invoice-total-row"><span>Pajak</span><span>{tax}</span></div>}
      <div className="invoice-total-row invoice-grand-total">
        <span>Total</span>
        <span>{total}</span>
      </div>
    </div>

    {/* bank info */}
    {bankInfo && (
      <div className="invoice-bank">
        <div className="invoice-section-label">Informasi Pembayaran:</div>
        <div className="invoice-bank-info">{bankInfo.bank} — {bankInfo.account} a/n {bankInfo.holder}</div>
      </div>
    )}

    {/* note */}
    {note && (
      <div className="invoice-note">
        <div className="invoice-section-label">Catatan:</div>
        <div>{note}</div>
      </div>
    )}
  </div>
)

export default PrintTemplate