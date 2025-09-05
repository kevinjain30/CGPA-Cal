import React, { useState } from 'react';
import { motion } from 'framer-motion';
<<<<<<< HEAD
import { Download, Share2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
=======
import { Download, FileText, Image, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505

const ExportOptions = ({ semesters, cgpa, totalCredits }) => {
  const [isExporting, setIsExporting] = useState(false);

<<<<<<< HEAD
  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let cursorY = margin;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      const ddmmyyyy = `${pad(now.getDate())}:${pad(now.getMonth() + 1)}:${now.getFullYear()}`;
      const ddmmyyyyFile = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()}`;

      const addHeading = (text, size = 18) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(size);
        doc.text(text, margin, cursorY);
        cursorY += 24;
      };

      const addText = (text, size = 12, bold = false) => {
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(lines, margin, cursorY);
        cursorY += lines.length * (size + 4) * 0.9;
      };

      const addDivider = () => {
        doc.setDrawColor(200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 12;
      };

      // Header band
      doc.setFillColor(14, 165, 233);
      doc.roundedRect(0, 0, pageWidth, 70, 0, 0, 'F');
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(0, 66, pageWidth, 4, 0, 0, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('CGPA Report', margin, 44);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Generated: ${ddmmyyyy}`, pageWidth - margin - 140, 44);
      doc.setTextColor(0, 0, 0);
      cursorY = 100;
      addDivider();

      // Summary table block
      addHeading('Summary', 14);
      const rowH = 24;
      const colW = (pageWidth - margin * 2) / 4;
      const cells = [
        { label: 'Overall CGPA', value: String(cgpa) },
        { label: 'Total Credits', value: String(totalCredits) },
        { label: 'Semesters', value: String(semesters.length) },
      ];
      const avg = semesters.length > 0 ? (semesters.reduce((s, sem) => s + parseFloat(sem.sgpa || 0), 0) / semesters.length).toFixed(2) : '0.00';
      cells.push({ label: 'Average SGPA', value: String(avg) });

      doc.setFontSize(11);
      cells.forEach((c, i) => {
        const x = margin + i * colW;
        doc.setDrawColor(220);
        doc.roundedRect(x, cursorY, colW - 10, rowH, 6, 6);
        doc.setFont('helvetica', 'normal');
        doc.text(c.label, x + 10, cursorY + 14);
        doc.setFont('helvetica', 'bold');
        doc.text(c.value, x + 10, cursorY + 14 + 12);
      });
      cursorY += rowH + 18;
      addDivider();

      const subjectColWidth = 300;
      const gradeColWidth = 60;
      const creditsColWidth = 70;
      const pointsColWidth = 70;
      const colX = [
        margin,
        margin + subjectColWidth,
        margin + subjectColWidth + gradeColWidth,
        margin + subjectColWidth + gradeColWidth + creditsColWidth
      ];

      const drawHeaderRow = () => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Subject', colX[0], cursorY);
        doc.text('Grade', colX[1] + gradeColWidth - 4, cursorY, { align: 'right' });
        doc.text('Credits', colX[2] + creditsColWidth - 4, cursorY, { align: 'right' });
        doc.text('Points', colX[3] + pointsColWidth - 4, cursorY, { align: 'right' });
        cursorY += 12;
        doc.setDrawColor(200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 6;
        doc.setFont('helvetica', 'normal');
      };

      semesters.forEach((sem, si) => {
        if (cursorY > pageHeight - 140) {
          doc.addPage();
          cursorY = margin;
        }

        // Section divider between semesters
        if (si > 0) {
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.8);
          doc.line(margin, cursorY - 12, pageWidth - margin, cursorY - 12);
          doc.setLineWidth(0.2);
        }

        addHeading(`${sem.name}`, 13);
        addText(`SGPA: ${sem.sgpa}`);
        drawHeaderRow();

        sem.subjects.forEach((sub, idx) => {
          // Check for page break and redraw header
          if (cursorY > pageHeight - 80) {
            doc.addPage();
            cursorY = margin;
            drawHeaderRow();
          }

          const subjectText = doc.splitTextToSize(sub.name || '-', subjectColWidth - 10);
          const lineHeight = 14;
          const rowHeight = Math.max(lineHeight, subjectText.length * lineHeight);

          // zebra stripe full-width row area
          if (idx % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(margin - 4, cursorY - 10, pageWidth - margin * 2 + 8, rowHeight + 6, 'F');
          }

          // Subject left-aligned
          doc.text(subjectText, colX[0], cursorY);
          const grade = (sub.grade || '').toUpperCase();
          const gradePoints = { 'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0 };
          // Right-align numeric columns
          doc.text(grade || '-', colX[1] + gradeColWidth - 4, cursorY, { align: 'right' });
          doc.text(String(sub.credits || '-'), colX[2] + creditsColWidth - 4, cursorY, { align: 'right' });
          doc.text(String(gradePoints[grade] ?? '-'), colX[3] + pointsColWidth - 4, cursorY, { align: 'right' });

          cursorY += rowHeight;
        });

        cursorY += 10;
      });

      const fileName = `cgpa-report-${ddmmyyyyFile}.pdf`;

      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.requestPermissions();
        } catch {}
        const pdfArrayBuffer = doc.output('arraybuffer');
        const uint8Array = new Uint8Array(pdfArrayBuffer);
        let binary = '';
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        const base64 = btoa(binary);
        await Filesystem.writeFile({
          path: `CGPA Reports/${fileName}`,
          data: base64,
          directory: Directory.Documents,
          recursive: true,
        });
        alert(`Saved to Documents/CGPA Reports/${fileName}`);
      } else {
        doc.save(fileName);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
=======
  const exportToJSON = () => {
    const data = {
      exportDate: new Date().toISOString(),
      cgpa,
      totalCredits,
      semesters,
      summary: {
        totalSemesters: semesters.length,
        totalSubjects: semesters.reduce((sum, sem) => sum + sem.subjects.length, 0)
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cgpa-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    let csv = 'Semester,Subject,Credits,Grade,Grade Points\n';
    
    semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        const gradePoints = {
          'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 8,
          'C': 7, 'D': 6, 'E': 5, 'P': 4, 'F': 0
        };
        csv += `"${semester.name}","${subject.name}",${subject.credits},"${subject.grade}",${gradePoints[subject.grade.toUpperCase()] || 0}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cgpa-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('cgpa-dashboard');
      if (element) {
        const dataUrl = await htmlToImage.toPng(element, {
          quality: 1.0,
          pixelRatio: 2,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = `cgpa-dashboard-${new Date().toISOString().split('T')[0]}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error exporting image:', error);
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
    } finally {
      setIsExporting(false);
    }
  };

  const shareProgress = async () => {
    const shareText = `🎓 My Academic Progress Update!\n\n📊 Current CGPA: ${cgpa}\n📚 Total Credits: ${totalCredits}\n🎯 Semesters Completed: ${semesters.length}\n\n#AcademicProgress #CGPA #StudentLife`;
<<<<<<< HEAD

=======
    
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My CGPA Progress',
          text: shareText
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('Progress copied to clipboard!');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
<<<<<<< HEAD
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg">
=======
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
          <Download className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export & Share</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
<<<<<<< HEAD
          onClick={exportAsPDF}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          <span className="text-sm font-medium">
            {isExporting ? 'Exporting...' : 'PDF'}
=======
          onClick={exportToJSON}
          className="flex items-center gap-2 p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
        >
          <FileText size={18} />
          <span className="text-sm font-medium">JSON</span>
        </button>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
        >
          <FileText size={18} />
          <span className="text-sm font-medium">CSV</span>
        </button>

        <button
          onClick={exportAsImage}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors disabled:opacity-50"
        >
          <Image size={18} />
          <span className="text-sm font-medium">
            {isExporting ? 'Exporting...' : 'Image'}
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
          </span>
        </button>

        <button
          onClick={shareProgress}
<<<<<<< HEAD
          className="flex items-center gap-2 p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
=======
          className="flex items-center gap-2 p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ExportOptions;