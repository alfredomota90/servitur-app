import { jsPDF } from 'jspdf'

import { formatDate } from '@/lib/utils'

export const svgToPng = async (url: string): Promise<string> => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  const data = await new Promise<string>((resolve, reject) => {
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = img.naturalWidth
      c.height = img.naturalHeight
      c.getContext('2d')!.drawImage(img, 0, 0)
      resolve(c.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
  return data
}

export const setupPDFHeader = async (doc: jsPDF, titulo: string, clientName: string) => {
  const logo = await svgToPng(`${import.meta.env.BASE_URL}serviturlogo.png`)
  doc.addImage(logo, 'PNG', 14, 8, 35, 29)

  const letter = await svgToPng(`${import.meta.env.BASE_URL}letter_soft.png`)
  const letterAspect = 729 / 160
  const letterHeight = 8
  const letterWidth = letterHeight * letterAspect
  doc.addImage(letter, 'PNG', (210 - letterWidth) / 2, 8, letterWidth, letterHeight)

  doc.setFontSize(20)
  doc.setTextColor(100)
  const s2 = 'Luis Alonso Flores González'
  doc.text(s2, (210 - doc.getTextWidth(s2)) / 2, 24)

  doc.setFontSize(15)
  doc.setTextColor(0)
  doc.text(titulo, (210 - doc.getTextWidth(titulo)) / 2, 44)

  doc.setFontSize(12)
  const cliente = `Cliente: ${clientName}`
  doc.text(cliente, 14, 52)
  const fecha = `Fecha de emisión: ${formatDate(new Date())}`
  doc.text(fecha, 210 - 14 - doc.getTextWidth(fecha), 52)

  return 62
}
