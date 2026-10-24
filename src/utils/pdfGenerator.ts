import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppConfig, Transaction } from '../types';
import { formatDateIndo, formatDateShort, formatRupiah, terbilang } from './formatters';
import { getLogoDataUrl } from './logo';

interface GeneratePdfReportParams {
  transactions: Transaction[];
  config: AppConfig;
  periodLabel: string;
  fundTypeLabel: string;
  startDate?: string;
  endDate?: string;
  printDate?: string;
}

export const generateKasPdfReport = async ({
  transactions,
  config,
  periodLabel,
  fundTypeLabel,
  printDate,
}: GeneratePdfReportParams): Promise<jsPDF> => {
  // Sort transactions chronologically
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalIncome = 0;
  let totalExpense = 0;

  sorted.forEach((t) => {
    if (t.type === 'in') totalIncome += t.amount;
    else totalExpense += t.amount;
  });

  const finalBalance = totalIncome - totalExpense;

  // Create jsPDF instance (A4 portrait)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // 1. Get Logo Data URL
  let logoDataUrl = config.customLogoUrl;
  if (!logoDataUrl) {
    logoDataUrl = await getLogoDataUrl();
  }

  // 2. Render Kop Surat (Official Mosque Header)
  // Logo on Left
  try {
    doc.addImage(logoDataUrl, 'PNG', margin, 10, 24, 24);
  } catch (err) {
    console.warn('Could not add image logo to PDF:', err);
  }

  // Kop Text (Centered in remaining width or page)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(6, 78, 59); // Emerald-800
  doc.text(config.mosqueName.toUpperCase(), pageWidth / 2 + 8, 15, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`${config.addressLine}, ${config.village}`, pageWidth / 2 + 8, 20.5, { align: 'center' });
  doc.text(`${config.district}, ${config.regency} - ${config.province} ${config.postalCode}`, pageWidth / 2 + 8, 25.5, { align: 'center' });

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Kontak Pengurus: ${config.phone || '082323080878'} | Dusun Pokek RW 004 Kawunganten`, pageWidth / 2 + 8, 30, { align: 'center' });

  // Double decorative header rule
  doc.setDrawColor(6, 95, 70); // Deep emerald
  doc.setLineWidth(1.0);
  doc.line(margin, 36, pageWidth - margin, 36);

  doc.setDrawColor(217, 119, 6); // Gold accent
  doc.setLineWidth(0.3);
  doc.line(margin, 37.5, pageWidth - margin, 37.5);

  // 3. Document Title & Period
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN KAS & PERTANGGUNGJAWABAN KEUANGAN', pageWidth / 2, 45, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Periode: ${periodLabel}   |   Klasifikasi Dana: ${fundTypeLabel}`, pageWidth / 2, 50, { align: 'center' });

  // 4. Summary Executive Box
  const boxY = 54;
  const boxHeight = 16;
  const colWidth = (pageWidth - margin * 2) / 3;

  // Box 1: Total Pemasukan
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, boxY, colWidth - 2, boxHeight, 2, 2, 'FD');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52);
  doc.text('TOTAL PEMASUKAN (+)', margin + (colWidth - 2) / 2, boxY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(formatRupiah(totalIncome), margin + (colWidth - 2) / 2, boxY + 12, { align: 'center' });

  // Box 2: Total Pengeluaran
  doc.setFillColor(254, 242, 242); // red-50
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(margin + colWidth + 1, boxY, colWidth - 2, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(153, 27, 27);
  doc.text('TOTAL PENGELUARAN (-)', margin + colWidth + 1 + (colWidth - 2) / 2, boxY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text(formatRupiah(totalExpense), margin + colWidth + 1 + (colWidth - 2) / 2, boxY + 12, { align: 'center' });

  // Box 3: Saldo Akhir
  doc.setFillColor(240, 249, 255); // sky-50
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(margin + colWidth * 2 + 2, boxY, colWidth - 2, boxHeight, 2, 2, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(7, 89, 133);
  doc.text('SISA SALDO KAS (=)', margin + colWidth * 2 + 2 + (colWidth - 2) / 2, boxY + 5.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(finalBalance >= 0 ? 4 : 185, finalBalance >= 0 ? 120 : 28, finalBalance >= 0 ? 87 : 28);
  doc.text(formatRupiah(finalBalance), margin + colWidth * 2 + 2 + (colWidth - 2) / 2, boxY + 12, { align: 'center' });

  // 5. Build Table Rows with running cumulative balance
  let runningBalance = 0;
  const tableData = sorted.map((item, index) => {
    if (item.type === 'in') runningBalance += item.amount;
    else runningBalance -= item.amount;

    return [
      String(index + 1),
      formatDateShort(item.date),
      item.receiptNumber || '-',
      item.description + (item.donorName && item.donorName !== '-' ? `\n(Oleh: ${item.donorName})` : ''),
      item.category,
      item.fundType === 'pembangunan' ? 'Pembangunan' : item.fundType === 'sosial' ? 'Sosial' : 'Operasional',
      item.type === 'in' ? formatRupiah(item.amount) : '-',
      item.type === 'out' ? formatRupiah(item.amount) : '-',
      formatRupiah(runningBalance),
    ];
  });

  // 6. Draw Table
  autoTable(doc, {
    startY: 74,
    head: [[
      'No',
      'Tanggal',
      'No. Bukti',
      'Uraian & Keterangan Transaksi',
      'Kategori',
      'Kas',
      'Masuk (Rp)',
      'Keluar (Rp)',
      'Saldo (Rp)',
    ]],
    body: tableData,
    foot: [[
      { content: 'TOTAL KESELURUHAN', colSpan: 6, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatRupiah(totalIncome), styles: { halign: 'right', fontStyle: 'bold', textColor: [6, 95, 70] } },
      { content: formatRupiah(totalExpense), styles: { halign: 'right', fontStyle: 'bold', textColor: [185, 28, 28] } },
      { content: formatRupiah(finalBalance), styles: { halign: 'right', fontStyle: 'bold', textColor: [15, 23, 42] } },
    ]],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [6, 95, 70], // Emerald dark
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 8,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      lineWidth: 0.25,
      lineColor: [203, 213, 225],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18, halign: 'center' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 'auto', halign: 'left' },
      4: { cellWidth: 26, halign: 'left' },
      5: { cellWidth: 19, halign: 'center' },
      6: { cellWidth: 22, halign: 'right' },
      7: { cellWidth: 22, halign: 'right' },
      8: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin, bottom: 42 },
    didDrawPage: (data) => {
      // Footer page numbers on each page
      const pageStr = `Halaman ${data.pageNumber} dari ${(doc as any).internal.getNumberOfPages()}`;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Sistem Informasi Kas DKM Al-Ikhlas Dusun Pokek RW 004 Desa Kawunganten Kec. Cikaum Subang`,
        margin,
        pageHeight - 8
      );
      doc.text(pageStr, pageWidth - margin, pageHeight - 8, { align: 'right' });
    },
  });

  // 7. Signature Block on Last Page
  // Check if we need a new page for signatures
  const finalY = (doc as any).lastAutoTable?.finalY || 100;
  let signatureY = finalY + 12;

  if (signatureY + 40 > pageHeight - 15) {
    doc.addPage();
    signatureY = 25;
  }

  const effectivePrintDate = printDate || new Date().toISOString().slice(0, 10);
  const currentDateIndo = formatDateIndo(effectivePrintDate);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);

  // Left Signer: Bendahara Kas
  doc.text(`Kawunganten, ${currentDateIndo}`, pageWidth - margin - 60, signatureY, { align: 'center' });
  doc.text('Dibuat oleh,', pageWidth - margin - 60, signatureY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Bendahara DKM Al-Ikhlas', pageWidth - margin - 60, signatureY + 9, { align: 'center' });

  // Right/Center Signer: Ketua DKM
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui / Mengesahkan,', margin + 60, signatureY + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text('Ketua DKM Al-Ikhlas', margin + 60, signatureY + 9, { align: 'center' });

  // Signature lines & Names
  const signSpaceY = signatureY + 28;

  // Ketua DKM
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${config.ketuaDkm} )`, margin + 60, signSpaceY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DKM Al-Ikhlas RW 004', margin + 60, signSpaceY + 4, { align: 'center' });

  // Bendahara
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${config.bendahara} )`, pageWidth - margin - 60, signSpaceY, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Pengurus Kas Masjid', pageWidth - margin - 60, signSpaceY + 4, { align: 'center' });

  return doc;
};

/**
 * Generates an official single receipt (Kwitansi Kas) in PDF
 */
export const generateSingleReceiptPdf = async (
  transaction: Transaction,
  config: AppConfig
): Promise<jsPDF> => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a5',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  let logoDataUrl = config.customLogoUrl;
  if (!logoDataUrl) {
    logoDataUrl = await getLogoDataUrl();
  }

  // Border Outer Frame
  doc.setDrawColor(6, 95, 70);
  doc.setLineWidth(0.8);
  doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.3);
  doc.rect(margin + 1.5, margin + 1.5, pageWidth - margin * 2 - 3, pageHeight - margin * 2 - 3);

  // Logo
  try {
    doc.addImage(logoDataUrl, 'PNG', margin + 4, margin + 4, 18, 18);
  } catch (err) {
    console.warn(err);
  }

  // Header Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(6, 78, 59);
  doc.text(config.mosqueName, margin + 26, margin + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${config.addressLine}, ${config.village}, ${config.district}, ${config.regency}`, margin + 26, margin + 14);

  // Title Box
  const isIncome = transaction.type === 'in';
  const voucherTitle = isIncome ? 'BUKTI PENERIMAAN KAS (KWITANSI)' : 'BUKTI PENGELUARAN KAS';

  doc.setFillColor(isIncome ? 236 : 254, isIncome ? 253 : 242, isIncome ? 245 : 242);
  doc.roundedRect(pageWidth - margin - 75, margin + 4, 71, 14, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(isIncome ? 6 : 185, isIncome ? 95 : 28, isIncome ? 70 : 28);
  doc.text(voucherTitle, pageWidth - margin - 39.5, margin + 9.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`No: ${transaction.receiptNumber}`, pageWidth - margin - 39.5, margin + 15, { align: 'center' });

  // Divider
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(margin + 4, margin + 24, pageWidth - margin - 4, margin + 24);

  // Details
  const startY = margin + 31;
  const labelX = margin + 8;
  const valX = margin + 48;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const rows = [
    { label: isIncome ? 'Telah Diterima Dari' : 'Dibayarkan Kepada', value: transaction.donorName || (isIncome ? 'Jamaah Dusun Pokek' : 'Pihak Terkait'), isTerbilang: false },
    { label: 'Uang Sejumlah', value: `# ${terbilang(transaction.amount)} #`, bold: true, isTerbilang: true },
    { label: 'Untuk Keperluan', value: transaction.description, isTerbilang: false },
    { label: 'Kategori Kas', value: `${transaction.category} (${transaction.fundType.toUpperCase()})`, isTerbilang: false },
    { label: 'Tanggal Transaksi', value: formatDateIndo(transaction.date), isTerbilang: false },
  ];

  let curY = startY;
  rows.forEach((r) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(r.label, labelX, curY);
    doc.text(':', labelX + 35, curY);

    if (r.isTerbilang) {
      const splitText = doc.splitTextToSize(r.value, 96);
      const boxH = Math.max(7, splitText.length * 4.2 + 2.5);
      doc.setFillColor(240, 253, 244);
      doc.setDrawColor(167, 243, 208);
      doc.roundedRect(valX - 2, curY - 3.8, 100, boxH, 1, 1, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(6, 78, 59);
      doc.text(splitText, valX, curY);
      curY += boxH + 2;
    } else {
      doc.setFont('helvetica', r.bold ? 'bold' : 'normal');
      doc.setTextColor(15, 23, 42);
      const splitText = doc.splitTextToSize(r.value, 96);
      doc.text(splitText, valX, curY);
      curY += Math.max(6, splitText.length * 4.5);
    }
  });

  // Amount badge Box
  doc.setFillColor(6, 95, 70);
  doc.roundedRect(labelX, curY + 2, 55, 12, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(formatRupiah(transaction.amount), labelX + 27.5, curY + 9.5, { align: 'center' });

  // Signatures on right
  const signX = pageWidth - margin - 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Kawunganten, ${formatDateIndo(transaction.date)}`, signX, curY - 2, { align: 'center' });
  doc.text(isIncome ? 'Penerima Kas,' : 'Petugas Kas,', signX, curY + 2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(config.bendahara, signX, curY + 16, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('DKM Al-Ikhlas Pokek', signX, curY + 19.5, { align: 'center' });

  return doc;
};
