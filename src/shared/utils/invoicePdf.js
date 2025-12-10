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
  const textMain = theme?.textMain || '#1E1E1E'
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
  // Tabla de productos: Código | Nombre/Descripción | Cantidad | Precio unitario | Subtotal
  const marginX = 10
  const tableX = marginX
  const tableW = pageW - marginX * 2
  const colW = { code: 24, name: 92, qty: 20, price: 28, subtotal: 26 }
  const theadH = 9
  const lineH = 5
  const pageH = 297
  const contentBottomY = pageH - footerH - 12

  // Encabezado de tabla
  doc.setFillColor(accent)
  doc.setDrawColor('#000000')
  doc.rect(tableX, y, tableW, theadH, 'FD')
  const colX = [
    tableX,
    tableX + colW.code,
    tableX + colW.code + colW.name,
    tableX + colW.code + colW.name + colW.qty,
    tableX + colW.code + colW.name + colW.qty + colW.price,
  ]
  doc.setTextColor(textMain)
  doc.setFontSize(10)
  const padX = 2
  doc.text('Código', colX[0] + padX, y + 6)
  doc.text('Producto', colX[1] + padX, y + 6)
  doc.text('Cantidad', colX[2] + colW.qty - padX, y + 6, { align: 'right' })
  doc.text('Precio Unitario', colX[3] + colW.price - padX, y + 6, { align: 'right' })
  doc.text('Subtotal', tableX + tableW - padX, y + 6, { align: 'right' })
  // Líneas verticales del encabezado
  doc.line(colX[1], y, colX[1], y + theadH)
  doc.line(colX[2], y, colX[2], y + theadH)
  doc.line(colX[3], y, colX[3], y + theadH)
  doc.line(colX[4], y, colX[4], y + theadH)

  // Filas de la tabla
  doc.setFontSize(10)
  doc.setTextColor(textMain)
  let iy = y + theadH
  ;(sale?.productos || []).forEach((p, idx) => {
    const codigo = p.codigo || ''
    const nombreDesc = [p.nombre, p.descripcion].filter(Boolean).join(' - ')
    const cantidad = parseInt(p.cantidad || 0)
    const precio = parseFloat(p.precio || 0)
    const subtotal = precio * cantidad
    const nameLines = doc.splitTextToSize(nombreDesc || 'Producto', colW.name - padX * 2)
    const rowHeight = Math.max(lineH, nameLines.length * 4 + 4)

    // Salto de página cuando excede el espacio
    if (iy + rowHeight > contentBottomY) {
      doc.addPage()
      // Redibujar encabezado de tabla en la nueva página
      iy = 20
      doc.setFillColor(accent)
      doc.setDrawColor('#000000')
      doc.rect(tableX, iy, tableW, theadH, 'FD')
      doc.setTextColor(textMain)
      doc.text('Código', colX[0] + padX, iy + 6)
      doc.text('Producto', colX[1] + padX, iy + 6)
      doc.text('Cantidad', colX[2] + colW.qty - padX, iy + 6, { align: 'right' })
      doc.text('Precio Unitario', colX[3] + colW.price - padX, iy + 6, { align: 'right' })
      doc.text('Subtotal', tableX + tableW - padX, iy + 6, { align: 'right' })
      doc.line(colX[1], iy, colX[1], iy + theadH)
      doc.line(colX[2], iy, colX[2], iy + theadH)
      doc.line(colX[3], iy, colX[3], iy + theadH)
      doc.line(colX[4], iy, colX[4], iy + theadH)
      iy += theadH
    }

    // Relleno alternado y bordes
    const isAlt = idx % 2 === 1
    if (isAlt) doc.setFillColor(255, 247, 209) // #FFF7D1
    else doc.setFillColor(255, 255, 255)
    doc.setDrawColor('#CCCCCC')
    doc.rect(tableX, iy, tableW, rowHeight, isAlt ? 'FD' : 'D')
    // Líneas verticales de la fila
    doc.line(colX[1], iy, colX[1], iy + rowHeight)
    doc.line(colX[2], iy, colX[2], iy + rowHeight)
    doc.line(colX[3], iy, colX[3], iy + rowHeight)
    doc.line(colX[4], iy, colX[4], iy + rowHeight)

    // Contenido de la fila
    doc.setTextColor(textMain)
    doc.text(codigo || '-', colX[0] + padX, iy + 4)
    doc.text(nameLines, colX[1] + padX, iy + 4)
    doc.text(`${cantidad}`, colX[2] + colW.qty - padX, iy + 4, { align: 'right' })
    doc.text(`$ ${toCurrency(precio)}`, colX[3] + colW.price - padX, iy + 4, { align: 'right' })
    doc.text(`$ ${toCurrency(subtotal)}`, tableX + tableW - padX, iy + 4, { align: 'right' })

    iy += rowHeight
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
  doc.setTextColor(textMain)
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
  const footerY = 297 - footerH
  const fiscalLine = [
    comp?.nit ? `NIT: ${comp.nit}` : null,
    comp?.regimen ? `Régimen: ${comp.regimen}` : null,
  ].filter(Boolean).join(' • ')
  const contactLine = [
    comp?.address ? `Dirección: ${comp.address}` : null,
    comp?.phone ? `Tel: ${comp.phone}` : null,
    comp?.email ? `Mail: ${comp.email}` : null,
  ].filter(Boolean).join(' • ')
  doc.text(comp?.name || 'CAPEX', 10, footerY + 7)
  if (fiscalLine) doc.text(fiscalLine, 10, footerY + 12)
  if (contactLine) doc.text(contactLine, 10, footerY + 17)
  if (comp?.website) doc.text(`${comp.website}`, 10, footerY + 21)
  doc.text('Gracias por su compra', pageW - 10, footerY + 12, { align: 'right' })

  doc.save(fileName || `factura_${sale?.numeroVenta || 'venta'}.pdf`)
}
