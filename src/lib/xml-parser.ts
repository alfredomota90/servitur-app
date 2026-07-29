import { supabase } from '@/lib/supabase'
import { jsPDF } from 'jspdf'
import { fmtDate } from '@/lib/utils'

export interface ConceptoDetalle {
  claveProdServ: string
  cantidad: number
  claveUnidad: string
  unidad: string
  descripcion: string
  valorUnitario: number
  importe: number
  objetoImp: string
}

export interface Traslado {
  base: number
  impuesto: string
  tipoFactor: string
  tasaOCuota: number
  importe: number
}

export interface ExtractedInvoiceData {
  serie_folio: string
  rfc_receptor: string
  receptor_name: string
  invoice_description: string
  total_mxn: number
  certification_date: string
  xml_content: string
  emitter_name: string
  emitter_rfc: string
  fecha_emision: string
  lugar_expedicion: string
  forma_pago: string
  metodo_pago: string
  moneda: string
  tipo_cambio: string
  subtotal: number
  descuento: number
  exportacion: string
  regimen_fiscal_emisor: string
  domicilio_fiscal_receptor: string
  regimen_fiscal_receptor: string
  uso_cfdi: string
  uuid: string
  rfc_prov_certif: string
  no_certificado: string
  sello_cfd: string
  total_impuestos_trasladados: number
  conceptos: ConceptoDetalle[]
  traslados: Traslado[]
}

const FORMA_PAGO: Record<string, string> = {
  '01': 'Efectivo',
  '02': 'Cheque',
  '03': 'Transferencia',
  '04': 'Tarjeta crédito',
  '05': 'Monedero',
  '08': 'Dación en pago',
  '12': 'Dación en pago',
  '13': 'Pago por subrogación',
  '14': 'Pago por consignación',
  '15': 'Condonación',
  '17': 'Compensación',
  '23': 'Novación',
  '24': 'Confusión',
  '25': 'Remisión de deuda',
  '26': 'Prescripción o caducidad',
  '27': 'Satisfacción del acreedor',
  '28': 'Tarjeta débito',
  '29': 'Tarjeta servicios',
  '30': 'Aplicación de anticipos',
  '31': 'Intermediario pagos',
  '99': 'Otros',
}

const METODO_PAGO: Record<string, string> = {
  PUE: 'Pago en una sola exhibición',
  PPD: 'Pago en parcialidades',
}

const USO_CFDI: Record<string, string> = {
  G01: 'Adquisición de mercancías',
  G02: 'Devoluciones, descuentos o bonificaciones',
  G03: 'Gastos en general',
  I01: 'Construcciones',
  I02: 'Mobiliario y equipo de oficina',
  I03: 'Equipo de transporte',
  I04: 'Equipo de cómputo',
  I05: 'Dados, troqueles, moldes',
  I06: 'Comunicaciones telefónicas',
  I07: 'Comunicaciones satelitales',
  I08: 'Otra maquinaria y equipo',
  D01: 'Honorarios médicos',
  D02: 'Gastos médicos por incapacidad',
  D03: 'Gastos funerales',
  D04: 'Donativos',
  D05: 'Intereses reales',
  D06: 'Aportaciones voluntarias',
  D07: 'Primas seguros',
  D08: 'Gastos transportación escolar',
  D09: 'Depósitos en cuentas Afore',
  D10: 'Médicas dentales',
  S01: 'Sin efectos fiscales',
  CP01: 'Pagos',
}

const REGIMEN_FISCAL: Record<string, string> = {
  '601': 'General de Ley Personas Morales',
  '603': 'Personas Morales con Fines no Lucrativos',
  '605': 'Sueldos y Salarios e Ingresos Asimilados',
  '606': 'Arrendamiento',
  '607': 'Régimen de Enajenación o Adquisición de Bienes',
  '608': 'Demás ingresos',
  '609': 'Consolidación',
  '610': 'Residentes en el Extranjero sin Establecimiento Permanente',
  '611': 'Dividendos',
  '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
  '613': 'Ingresos por Intereses',
  '614': 'Ingresos por arrendamiento',
  '615': 'Régimen de los ingresos por obtención de premios',
  '616': 'Sin obligaciones fiscales',
  '620': 'Sociedades Cooperativas de Producción',
  '621': 'Régimen de Incorporación Fiscal',
  '622': 'Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623': 'Opción para tributar por ingresos',
  '624': 'Régimen de los Coordinados',
  '625':
    'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626': 'Régimen Simplificado de Confianza',
}

const IMPUESTO: Record<string, string> = {
  '001': 'ISR',
  '002': 'IVA',
  '003': 'IEPS',
}

function lookup(val: string | undefined, map: Record<string, string>): string {
  if (!val) return '-'
  return map[val] || val
}

function fmt(n: number | undefined): string {
  if (n === undefined || isNaN(n)) return '-'
  return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 6 })
}

export function parseCFDIFromText(xmlText: string): ExtractedInvoiceData | null {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xmlText, 'text/xml')

    const namespaces = [
      { cfdi: 'http://www.sat.gob.mx/cfd/4', tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' },
      { cfdi: 'http://www.sat.gob.mx/cfd/3', tfd: 'http://www.sat.gob.mx/TimbreFiscalDigital' },
    ]

    let comprobante: Element | null = null
    let ns: { cfdi: string; tfd: string } = namespaces[0]
    for (const n of namespaces) {
      comprobante = doc.getElementsByTagNameNS(n.cfdi, 'Comprobante')[0]
      if (comprobante) {
        ns = n
        break
      }
    }
    if (!comprobante) return null

    const serie = comprobante.getAttribute('Serie') || ''
    const folio = comprobante.getAttribute('Folio') || ''
    const serie_folio = serie && folio ? `${serie}${folio}` : folio || serie || '-'
    const total = parseFloat(comprobante.getAttribute('Total') || '0')
    const fecha_emision = comprobante.getAttribute('Fecha') || ''
    const lugar_expedicion = comprobante.getAttribute('LugarExpedicion') || ''
    const forma_pago = comprobante.getAttribute('FormaPago') || ''
    const metodo_pago = comprobante.getAttribute('MetodoPago') || ''
    const moneda = comprobante.getAttribute('Moneda') || ''
    const tipo_cambio = comprobante.getAttribute('TipoCambio') || ''
    const subtotal = parseFloat(comprobante.getAttribute('SubTotal') || '0')
    const descuento = parseFloat(comprobante.getAttribute('Descuento') || '0')
    const exportacion = comprobante.getAttribute('Exportacion') || ''

    const emisor = doc.getElementsByTagNameNS(ns.cfdi, 'Emisor')[0]
    const emitter_rfc = emisor?.getAttribute('Rfc') || ''
    const emitter_name = emisor?.getAttribute('Nombre') || ''
    const regimen_fiscal_emisor = emisor?.getAttribute('RegimenFiscal') || ''

    const receptor = doc.getElementsByTagNameNS(ns.cfdi, 'Receptor')[0]
    const rfc_receptor = receptor?.getAttribute('Rfc') || ''
    const receptor_name = receptor?.getAttribute('Nombre') || ''
    const domicilio_fiscal_receptor =
      receptor?.getAttribute('DomicilioFiscalReceptor') ||
      receptor?.getAttribute('ResidenciaFiscal') ||
      ''
    const regimen_fiscal_receptor = receptor?.getAttribute('RegimenFiscalReceptor') || ''
    const uso_cfdi = receptor?.getAttribute('UsoCFDI') || ''

    const conceptos = doc.getElementsByTagNameNS(ns.cfdi, 'Concepto')
    const conceptosArr: ConceptoDetalle[] = []
    const descriptions: string[] = []
    for (let i = 0; i < conceptos.length; i++) {
      const c = conceptos[i]
      const desc = c.getAttribute('Descripcion') || ''
      if (desc) descriptions.push(desc)
      conceptosArr.push({
        claveProdServ: c.getAttribute('ClaveProdServ') || '',
        cantidad: parseFloat(c.getAttribute('Cantidad') || '0'),
        claveUnidad: c.getAttribute('ClaveUnidad') || '',
        unidad: c.getAttribute('Unidad') || '',
        descripcion: desc,
        valorUnitario: parseFloat(c.getAttribute('ValorUnitario') || '0'),
        importe: parseFloat(c.getAttribute('Importe') || '0'),
        objetoImp: c.getAttribute('ObjetoImp') || '',
      })
    }
    const invoice_description = descriptions.join('\n')

    const timbre = doc.getElementsByTagNameNS(ns.tfd, 'TimbreFiscalDigital')[0]
    const certification_date = timbre?.getAttribute('FechaTimbrado') || ''
    const uuid = timbre?.getAttribute('UUID') || ''
    const rfc_prov_certif = timbre?.getAttribute('RfcProvCertif') || ''
    const no_certificado = timbre?.getAttribute('NoCertificado') || ''
    const sello_cfd = timbre?.getAttribute('SelloCFD') || ''

    const impuestos = doc.getElementsByTagNameNS(ns.cfdi, 'Impuestos')[0]
    const total_impuestos_trasladados = parseFloat(
      impuestos?.getAttribute('TotalImpuestosTrasladados') || '0',
    )

    const trasladosArr: Traslado[] = []
    const traslados = impuestos?.getElementsByTagNameNS(ns.cfdi, 'Traslado')
    if (traslados) {
      for (let i = 0; i < traslados.length; i++) {
        const t = traslados[i]
        trasladosArr.push({
          base: parseFloat(t.getAttribute('Base') || '0'),
          impuesto: t.getAttribute('Impuesto') || '',
          tipoFactor: t.getAttribute('TipoFactor') || '',
          tasaOCuota: parseFloat(t.getAttribute('TasaOCuota') || '0'),
          importe: parseFloat(t.getAttribute('Importe') || '0'),
        })
      }
    }

    return {
      serie_folio,
      rfc_receptor,
      receptor_name,
      invoice_description,
      total_mxn: total,
      certification_date,
      xml_content: xmlText,
      emitter_name,
      emitter_rfc,
      fecha_emision,
      lugar_expedicion,
      forma_pago,
      metodo_pago,
      moneda,
      tipo_cambio,
      subtotal,
      descuento,
      exportacion,
      regimen_fiscal_emisor,
      domicilio_fiscal_receptor,
      regimen_fiscal_receptor,
      uso_cfdi,
      uuid,
      rfc_prov_certif,
      no_certificado,
      sello_cfd,
      total_impuestos_trasladados,
      conceptos: conceptosArr,
      traslados: trasladosArr,
    }
  } catch {
    return null
  }
}

export async function uploadXML(file: File, clientId: string): Promise<string | null> {
  const fileName = `${clientId}_${Date.now()}_${file.name}`

  const { data, error } = await supabase.storage.from('xmls').upload(fileName, file)

  if (error) {
    const msg =
      error instanceof Object && 'message' in error
        ? (error as { message: string }).message
        : String(error)
    throw new Error(msg)
  }

  return data.path
}

export function getDownloadUrl(path: string): string {
  const { data } = supabase.storage.from('xmls').getPublicUrl(path)
  return data.publicUrl
}

const MARGIN_L = 14
const MARGIN_R = 196
const CONTENT_W = MARGIN_R - MARGIN_L
const COLORS = {
  primary: [13, 28, 47] as [number, number, number],
  accent: [5, 150, 105] as [number, number, number],
  gray: [100, 100, 100] as [number, number, number],
  lightGray: [130, 130, 130] as [number, number, number],
  border: [210, 210, 210] as [number, number, number],
  darkBg: [240, 243, 247] as [number, number, number],
  red: [200, 50, 50] as [number, number, number],
}

function drawSectionLine(doc: jsPDF, y: number) {
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(MARGIN_L, y, MARGIN_R, y)
}

function drawSectionTitle(doc: jsPDF, y: number, title: string) {
  doc.setFontSize(9)
  doc.setTextColor(...COLORS.primary)
  doc.setFont('helvetica', 'bold')
  doc.text(title.toUpperCase(), MARGIN_L, y)
  drawSectionLine(doc, y + 1.5)
}

function drawField(
  doc: jsPDF,
  y: number,
  label: string,
  value: string,
  x = MARGIN_L,
  labelW = 35,
  fontSize = 7.5,
) {
  doc.setFontSize(fontSize)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.lightGray)
  doc.text(label + ':', x, y, { maxWidth: labelW })
  const labelEnd = x + labelW + 1
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  doc.text(value || '-', labelEnd, y, { maxWidth: CONTENT_W - (labelEnd - MARGIN_L) })
}

async function generatePDFFromXML(
  xmlPath: string,
): Promise<{ parsed: ExtractedInvoiceData; doc: jsPDF }> {
  const { data, error } = await supabase.storage.from('xmls').download(xmlPath)

  if (error) throw new Error(error.message)

  const xmlText = await data.text()
  const parsed = parseCFDIFromText(xmlText)
  if (!parsed) throw new Error('No se pudo parsear el XML')

  const doc = new jsPDF()
  let y = 20

  // ── TITLE ──
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('COMPROBANTE FISCAL DIGITAL', MARGIN_L, y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.lightGray)
  doc.text('CFDI ' + (parsed.certification_date ? '4.0' : '3.3'), MARGIN_L, y + 5)
  y += 10

  // ── TWO-COLUMN HEADER: EMISOR | FOLIO FISCAL ──
  const colMid = MARGIN_L + CONTENT_W / 2
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN_L, y, CONTENT_W, 36)
  doc.line(colMid, y, colMid, y + 36)

  // Left column - Emisor
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('EMISOR', MARGIN_L + 3, y + 5)
  drawField(doc, y + 10, 'RFC', parsed.emitter_rfc, MARGIN_L + 3, 28)
  drawField(doc, y + 15, 'Nombre', parsed.emitter_name, MARGIN_L + 3, 28)
  drawField(
    doc,
    y + 20,
    'Régimen Fiscal',
    `${parsed.regimen_fiscal_emisor} ${lookup(parsed.regimen_fiscal_emisor, REGIMEN_FISCAL)}`,
    MARGIN_L + 3,
    28,
  )
  drawField(doc, y + 25, 'Lugar Expedición', parsed.lugar_expedicion, MARGIN_L + 3, 28)

  // Right column - Folio Fiscal / Info
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('FOLIO FISCAL', colMid + 3, y + 5)
  doc.setFontSize(9)
  doc.setFont('courier', 'bold')
  doc.setTextColor(...COLORS.accent)
  doc.text(parsed.uuid || '-', colMid + 3, y + 12, { maxWidth: CONTENT_W / 2 - 6 })
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(30, 30, 30)
  drawField(doc, y + 18, 'Serie/Folio', parsed.serie_folio, colMid + 3, 28)
  drawField(doc, y + 23, 'Fecha Emisión', fmtDate(parsed.fecha_emision), colMid + 3, 28)
  drawField(doc, y + 28, 'Fecha Timbrado', fmtDate(parsed.certification_date), colMid + 3, 28)
  y += 40

  // ── RECEPTOR ──
  if (parsed.rfc_receptor || parsed.receptor_name) {
    drawSectionTitle(doc, y, 'RECEPTOR')
    y += 5
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.3)
    doc.rect(MARGIN_L, y, CONTENT_W, parsed.domicilio_fiscal_receptor ? 24 : 18)
    drawField(doc, y + 4, 'RFC', parsed.rfc_receptor)
    drawField(doc, y + 9, 'Nombre', parsed.receptor_name)
    drawField(doc, y + 14, 'Uso CFDI', `${parsed.uso_cfdi} ${lookup(parsed.uso_cfdi, USO_CFDI)}`)
    if (parsed.domicilio_fiscal_receptor) {
      drawField(doc, y + 19, 'Domicilio Fiscal', parsed.domicilio_fiscal_receptor)
      y += 28
    } else {
      y += 22
    }
  }

  // ── CONCEPTOS TABLE ──
  if (parsed.conceptos.length > 0) {
    drawSectionTitle(doc, y, 'CONCEPTOS')
    y += 5

    const tableLeft = MARGIN_L
    const tableW = CONTENT_W
    const colW = {
      clave: 22,
      cant: 14,
      unidad: 16,
      desc: 78,
      vUnitario: 26,
      importe: tableW - 22 - 14 - 16 - 78 - 26,
    }

    // Header
    doc.setFillColor(...COLORS.darkBg)
    doc.rect(tableLeft, y, tableW, 5, 'F')
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    let hx = tableLeft + 1
    doc.text('Clave', hx, y + 3.5)
    hx += colW.clave
    doc.text('Cant', hx, y + 3.5)
    hx += colW.cant
    doc.text('Unidad', hx, y + 3.5)
    hx += colW.unidad
    doc.text('Descripción', hx, y + 3.5)
    hx += colW.desc
    doc.text('V.Unitario', hx, y + 3.5)
    hx += colW.vUnitario
    doc.text('Importe', hx, y + 3.5)
    y += 7

    // Rows
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)

    for (let i = 0; i < parsed.conceptos.length; i++) {
      const c = parsed.conceptos[i]
      const rowH = 6
      if (y + rowH > 285) {
        doc.addPage()
        y = 20
      }

      // Alternate bg
      if (i % 2 === 0) {
        doc.setFillColor(248, 249, 250)
        doc.rect(tableLeft, y, tableW, rowH, 'F')
      }

      let cx = tableLeft + 1
      doc.text(c.claveProdServ, cx, y + 3.5, { maxWidth: colW.clave - 1 })
      cx += colW.clave
      doc.text(String(c.cantidad), cx, y + 3.5, { maxWidth: colW.cant - 1 })
      cx += colW.cant
      doc.text(c.unidad || c.claveUnidad, cx, y + 3.5, { maxWidth: colW.unidad - 1 })
      cx += colW.unidad
      doc.text(c.descripcion, cx, y + 3.5, { maxWidth: colW.desc - 1 })
      cx += colW.desc
      doc.text(`$${fmt(c.valorUnitario)}`, cx, y + 3.5, { maxWidth: colW.vUnitario - 1 })
      cx += colW.vUnitario
      doc.text(`$${fmt(c.importe)}`, cx, y + 3.5, { maxWidth: colW.importe - 1 })

      y += rowH
    }

    // Total line
    y += 1
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.3)
    doc.line(tableLeft, y, tableLeft + CONTENT_W - colW.importe, y)
    y += 2
    doc.setFontSize(7)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...COLORS.primary)
    doc.text('Subtotal', tableLeft, y)
    doc.text('$' + fmt(parsed.subtotal), tableLeft + CONTENT_W - colW.importe, y)
    y += 4
  }

  // ── TOTALS + PAYMENT INFO ──
  y += 2
  if (y + 60 > 285) {
    doc.addPage()
    y = 20
  }

  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN_L, y, CONTENT_W, 48)

  // Left: Payment info
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('INFORMACIÓN DE PAGO', MARGIN_L + 3, y + 5)
  drawField(
    doc,
    y + 10,
    'Forma Pago',
    `${parsed.forma_pago} ${lookup(parsed.forma_pago, FORMA_PAGO)}`,
    MARGIN_L + 3,
    30,
  )
  drawField(
    doc,
    y + 15,
    'Método Pago',
    `${parsed.metodo_pago} ${lookup(parsed.metodo_pago, METODO_PAGO)}`,
    MARGIN_L + 3,
    30,
  )
  drawField(doc, y + 20, 'Moneda', parsed.moneda, MARGIN_L + 3, 30)
  if (parsed.tipo_cambio) {
    drawField(doc, y + 25, 'Tipo Cambio', parsed.tipo_cambio, MARGIN_L + 3, 30)
  }
  if (parsed.exportacion) {
    drawField(doc, y + 30, 'Exportación', parsed.exportacion, MARGIN_L + 3, 30)
  }

  // Right: Totals
  const totalsX = MARGIN_L + CONTENT_W - 85
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('RESUMEN', totalsX, y + 5)

  let ty = y + 10
  const drawTotal = (label: string, val: string, isBold = false, color = 'normal') => {
    doc.setFontSize(isBold ? 9 : 7.5)
    doc.setFont('helvetica', isBold ? 'bold' : 'normal')
    if (color === 'red') doc.setTextColor(...COLORS.red)
    else if (color === 'green') doc.setTextColor(...COLORS.accent)
    else doc.setTextColor(30, 30, 30)
    doc.text(label, totalsX, ty)
    doc.text(val, MARGIN_R - 3, ty, { align: 'right' })
    ty += isBold ? 6 : 4.5
  }

  drawTotal('Subtotal', '$' + fmt(parsed.subtotal))
  if (parsed.descuento > 0) {
    drawTotal('Descuento', '-$' + fmt(parsed.descuento), false, 'red')
  }
  for (const t of parsed.traslados) {
    const label = `${lookup(t.impuesto, IMPUESTO)} (${fmt(t.tasaOCuota * 100)}%)`
    drawTotal(label, '$' + fmt(t.importe))
  }
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.line(totalsX, ty, MARGIN_R - 3, ty)
  ty += 2
  drawTotal('TOTAL', '$' + fmt(parsed.total_mxn), true, 'green')
  if (
    parsed.total_mxn !==
    parsed.subtotal - parsed.descuento + parsed.traslados.reduce((s, t) => s + t.importe, 0)
  ) {
    ty += 2
    drawTotal('Total', '$' + fmt(parsed.total_mxn), false, 'green')
  }

  y += 52

  // ── TIMBRE ──
  if (parsed.uuid) {
    y += 3
    drawSectionTitle(doc, y, 'TIMBRE FISCAL DIGITAL')
    y += 5
    doc.setDrawColor(...COLORS.border)
    doc.setLineWidth(0.3)

    const timbreH = 26
    doc.rect(MARGIN_L, y, CONTENT_W, timbreH)
    drawField(doc, y + 4, 'UUID', parsed.uuid)
    drawField(doc, y + 9, 'RFC Prov. Certif.', parsed.rfc_prov_certif)
    drawField(doc, y + 14, 'No. Serie CSD', parsed.no_certificado || '-')
    drawField(doc, y + 19, 'Fecha Timbrado', fmtDate(parsed.certification_date))
    y += timbreH + 3
  }

  // ── SELLO DIGITAL ──
  if (parsed.sello_cfd) {
    y += 1
    doc.setFontSize(6)
    doc.setFont('courier', 'normal')
    doc.setTextColor(...COLORS.lightGray)

    const lines: string[] = []
    let remaining = parsed.sello_cfd
    while (remaining.length > 0) {
      lines.push(remaining.slice(0, 100))
      remaining = remaining.slice(100)
    }

    const maxSelloY = 288
    for (const line of lines) {
      if (y > maxSelloY) break
      doc.text(line, MARGIN_L, y, { maxWidth: CONTENT_W })
      y += 2.8
    }
  }

  // ── FOOTER ──
  y = Math.max(y, 280)
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.lightGray)
  drawSectionLine(doc, y)
  doc.text(
    'Este documento es una representación impresa del CFDI generado a partir del archivo XML original.',
    MARGIN_L,
    y + 4,
    { maxWidth: CONTENT_W },
  )
  doc.text('Cadena original del complemento de certificación digital del SAT.', MARGIN_L, y + 8, {
    maxWidth: CONTENT_W,
  })

  return { parsed, doc }
}

export function generatePDFFromInvoiceData(data: {
  serieFolio?: string
  rfcReceptor?: string
  receptorName?: string
  invoiceDescription?: string
  totalMxn?: number
  total?: number
  certificationDate?: string
  tripDate?: string
  fromLocation?: string
  toLocation?: string
  clientName?: string
}): jsPDF {
  const doc = new jsPDF()
  const total = data.totalMxn ?? data.total ?? 0

  let y = 20

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('FACTURA', MARGIN_L, y)
  y += 10

  // Info box
  doc.setDrawColor(...COLORS.border)
  doc.setLineWidth(0.3)
  doc.rect(MARGIN_L, y, CONTENT_W, 12)
  drawField(doc, y + 4, 'Cliente', data.clientName || '-')
  drawField(doc, y + 9, 'Serie/Folio', data.serieFolio || '-')
  y += 17

  // RFC / Date
  doc.rect(MARGIN_L, y, CONTENT_W, 12)
  drawField(doc, y + 4, 'RFC Receptor', data.rfcReceptor || '-')
  drawField(doc, y + 9, 'Receptor', data.receptorName || '-')
  y += 17

  // Trip info
  if (data.fromLocation || data.toLocation || data.tripDate) {
    doc.rect(MARGIN_L, y, CONTENT_W, 12)
    drawField(doc, y + 4, 'Origen', data.fromLocation || '-')
    drawField(doc, y + 9, 'Destino', data.toLocation || '-')
    y += 17
  }

  // Date
  if (data.certificationDate || data.tripDate) {
    doc.rect(MARGIN_L, y, CONTENT_W, 8)
    drawField(doc, y + 4, 'Fecha', (data.certificationDate || data.tripDate || '').split('T')[0])
    y += 13
  }

  // Description
  if (data.invoiceDescription) {
    drawSectionTitle(doc, y, 'DESCRIPCIÓN')
    y += 6
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(30, 30, 30)
    const lines = doc.splitTextToSize(data.invoiceDescription, CONTENT_W)
    for (const line of lines) {
      if (y > 275) {
        doc.addPage()
        y = 20
      }
      doc.text(line, MARGIN_L, y)
      y += 4
    }
    y += 5
  }

  // Total
  if (y + 20 > 285) {
    doc.addPage()
    y = 20
  }
  drawSectionLine(doc, y)
  y += 3
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.primary)
  doc.text('TOTAL', MARGIN_L, y)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...COLORS.accent)
  doc.text(`$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`, MARGIN_R, y, {
    align: 'right',
  })
  y += 12

  // Footer
  doc.setFontSize(6.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...COLORS.lightGray)
  drawSectionLine(doc, y)
  doc.text('Documento generado a partir de los datos registrados en el sistema.', MARGIN_L, y + 4)

  return doc
}

export async function downloadXMLAsPDF(xmlPath: string): Promise<void> {
  const { parsed, doc } = await generatePDFFromXML(xmlPath)
  doc.save(`CFDI_${parsed.serie_folio || 'factura'}.pdf`)
}

export async function previewXMLAsPDF(xmlPath: string): Promise<string | null> {
  const { doc } = await generatePDFFromXML(xmlPath)
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)
}

export function previewPDFFromInvoiceData(data: {
  serieFolio?: string
  rfcReceptor?: string
  receptorName?: string
  invoiceDescription?: string
  totalMxn?: number
  total?: number
  certificationDate?: string
  tripDate?: string
  fromLocation?: string
  toLocation?: string
  clientName?: string
}): string {
  const doc = generatePDFFromInvoiceData(data)
  const blob = doc.output('blob')
  return URL.createObjectURL(blob)
}
