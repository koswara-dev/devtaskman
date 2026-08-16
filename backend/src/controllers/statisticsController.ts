import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { AuthenticatedRequest } from '../middlewares/auth';
import { computeStatistics } from '../services/statisticsService';

export const getStatistics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await computeStatistics(req.query.dueSoonDays);
    return res.json(stats);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat data statistik.' });
  }
};

export const generateReportPdf = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const stats = await computeStatistics(req.query.dueSoonDays);
    const generatedAt = new Date();
    const dateStamp = generatedAt.toISOString().split('T')[0];

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="devtaskman-report-${dateStamp}.pdf"`);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    doc.fontSize(20).text('DevTaskMan — Laporan Statistik Tugas', { align: 'left' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor('#555').text(`Dibuat: ${generatedAt.toLocaleString('id-ID')}`);
    doc.moveDown(1);

    doc.fillColor('#000').fontSize(14).text('Ringkasan');
    doc.moveDown(0.3);
    doc.fontSize(11).text(`Total Tugas: ${stats.totalTasks}`);
    doc.text(`Tugas Jatuh Tempo dalam ${stats.dueSoonDays} Hari (belum Done): ${stats.dueSoonCount}`);
    doc.moveDown(1);

    const renderCountTable = (title: string, counts: Record<string, number>) => {
      doc.fontSize(14).text(title);
      doc.moveDown(0.3);
      const entries = Object.entries(counts);
      if (entries.length === 0) {
        doc.fontSize(11).fillColor('#777').text('Tidak ada data.');
        doc.fillColor('#000');
      } else {
        for (const [label, count] of entries) {
          doc.fontSize(11).text(`${label}: ${count}`);
        }
      }
      doc.moveDown(1);
    };

    renderCountTable('Distribusi Status Tugas', stats.statusCounts);
    renderCountTable('Rasio Prioritas', stats.priorityCounts);

    doc.fontSize(14).text('Beban Kerja Anggota Tim');
    doc.moveDown(0.3);
    if (stats.assigneeBreakdown.length === 0) {
      doc.fontSize(11).fillColor('#777').text('Tidak ada tugas yang ditugaskan.');
      doc.fillColor('#000');
    } else {
      for (const a of stats.assigneeBreakdown) {
        doc.fontSize(11).text(`${a.userName}: ${a.completed}/${a.total} selesai`);
      }
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Gagal membuat laporan PDF.' });
    } else {
      res.end();
    }
  }
};
