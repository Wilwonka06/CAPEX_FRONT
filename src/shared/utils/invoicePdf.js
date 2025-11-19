import { jsPDF } from 'jspdf'
import logoSrc from '../images/Logo.png'
import { companyInfo as defaultCompany } from '../config/companyInfo'

const toCurrency = (n) => {
  const v = parseFloat(n || 0)
  return new Intl.NumberFormat('es-CO').format(v)
}

const loadImageDataUrl = (src) => new Promise((resolve) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    resolve(canvas.toDataURL('image/png'))
  }
  img.onerror = () => resolve(null)
  img.src = src
})

export async function generateProductInvoicePDF({ sale, customer, company, theme, fileName }) {
  const primary = theme?.primary || '#9C5B2B'
  const accent = theme?.accent || '#FACC15'
  const doc = new jsPDF('p', 'mm', 'a4')

  const headerH = 28
  const footerH = 22
  const pageW = 210

  doc.setFillColor(primary)
  doc.rect(0, 0, pageW, headerH, 'F')

  const logoDataUrl = await loadImageDataUrl(theme?.logo || logoSrc)
  if (logoDataUrl) doc.addImage(logoDataUrl, 'PNG', 10, 3, 22, 22)

  const comp = company || defaultCompany
  doc.setTextColor('#ffffff')
  doc.setFontSize(16)
  doc.text(comp?.name || 'CAPEX', 36, 12)
  doc.setFontSize(10)
  doc.text(comp?.email || '', 36, 17)
  doc.text(comp?.phone || '', 36, 22)

  doc.setTextColor('#000000')
  doc.setFontSize(18)
  doc.text('FACTURA DE VENTA', pageW - 12, 12, { align: 'right' })
  doc.setFontSize(10)
  doc.text(`${sale?.numeroVenta || ''}`, pageW - 12, 17, { align: 'right' })
  doc.text(`${sale?.fecha || ''}`, pageW - 12, 22, { align: 'right' })

  doc.setDrawColor(accent)
  doc.setLineWidth(0.8)
  doc.line(10, headerH + 4, pageW - 10, headerH + 4)

  let y = headerH + 12
  doc.setFontSize(12)
  doc.text('Datos del Cliente', 10, y)
  doc.text('Datos de la Empresa', pageW / 2, y)
  y += 6
  doc.setFontSize(10)
  doc.text(`Nombre: ${customer?.nombre || ''}`, 10, y)
  doc.text(`Nombre: ${comp?.contactName || comp?.name || ''}`, pageW / 2, y)
  y += 5
  doc.text(`Documento: ${customer?.documentNumber || ''}`, 10, y)
  doc.text(`Dirección: ${comp?.address || ''}`, pageW / 2, y)
  y += 5
  doc.text(`Correo: ${customer?.email || ''}`, 10, y)
  doc.text(`Mail: ${comp?.email || ''}`, pageW / 2, y)
  y += 5
  doc.text(`Teléfono: ${customer?.phone || ''}`, 10, y)
  doc.text(`Teléfono: ${comp?.phone || ''}`, pageW / 2, y)

  y += 8
  doc.setFillColor('#f5f5f5')
  doc.rect(10, y, pageW - 20, 8, 'F')
  doc.setFontSize(11)
  doc.setTextColor('#333333')
  doc.text('Concepto', 12, y + 5)
  doc.text('Cantidad', pageW - 98, y + 5)
  doc.text('Precio', pageW - 62, y + 5)
  doc.text('Total', pageW - 26, y + 5)

  doc.setTextColor('#000000')
  doc.setFontSize(10)
  let iy = y + 13
  ;(sale?.productos || []).forEach((p, idx) => {
    const subtotal = (parseFloat(p.precio || 0)) * (parseInt(p.cantidad || 0))
    doc.text(`${p.nombre || 'Producto'}${p.codigo ? ` (${p.codigo})` : ''}`, 12, iy)
    doc.text(`${p.cantidad || 0}`, pageW - 98, iy)
    doc.text(`$ ${toCurrency(p.precio || 0)}`, pageW - 62, iy)
    doc.text(`$ ${toCurrency(subtotal)}`, pageW - 26, iy, { align: 'right' })
    iy += 6
  })

  iy += 4
  doc.setDrawColor('#dddddd')
  doc.line(10, iy, pageW - 10, iy)
  iy += 8

  doc.setFontSize(10)
  doc.text(`Forma de pago: ${sale?.metodoPago || 'No especificado'}`, 10, iy)

  const subtotal = (sale?.productos || []).reduce((s, p) => s + (parseFloat(p.precio || 0) * (parseInt(p.cantidad || 0))), 0)
  const total = parseFloat(sale?.valor || subtotal)

  doc.setFontSize(11)
  doc.text('Subtotal', pageW - 62, iy)
  doc.text(`$ ${toCurrency(subtotal)}`, pageW - 26, iy, { align: 'right' })
  iy += 6
  doc.text('Total', pageW - 62, iy)
  doc.setTextColor(accent)
  doc.setFontSize(12)
  doc.text(`$ ${toCurrency(total)}`, pageW - 26, iy, { align: 'right' })
  doc.setTextColor('#000000')

  doc.setFillColor(primary)
  doc.rect(0, 297 - footerH, pageW, footerH, 'F')
  doc.setTextColor('#ffffff')
  doc.setFontSize(9)
  doc.text(comp?.name || 'CAPEX', 10, 297 - footerH + 8)
  doc.text(comp?.website || '', 10, 297 - footerH + 13)
  doc.text('Gracias por su compra', pageW - 10, 297 - footerH + 13, { align: 'right' })

  doc.save(fileName || `factura_${sale?.numeroVenta || 'venta'}.pdf`)
}