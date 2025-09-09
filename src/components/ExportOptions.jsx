import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import { Capacitor } from "@capacitor/core";
import { Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Browser } from "@capacitor/browser";
import { Dialog } from "@capacitor/dialog";

const ExportOptions = ({ semesters, cgpa, totalCredits, userName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [reportName, setReportName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("cgpa_report_name") || "";
      if (stored) setReportName(stored);
    } catch {}
  }, []);

  const exportAsPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 40;
      let cursorY = margin;

      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      const ddmmyyyy = `${pad(now.getDate())}:${pad(
        now.getMonth() + 1
      )}:${now.getFullYear()}`;
      const ddmmyyyyFile = `${pad(now.getDate())}-${pad(
        now.getMonth() + 1
      )}-${now.getFullYear()}`;

      const addHeading = (text, size = 20) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(size);
        doc.text(text, margin, cursorY);
        cursorY += 26;
      };

      const addText = (text, size = 14, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(lines, margin, cursorY);
        cursorY += lines.length * (size + 4) * 0.9;
      };

      const addDivider = () => {
        doc.setDrawColor(200);
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        cursorY += 14;
      };

      // Header band
      doc.setFillColor(14, 165, 233);
      doc.roundedRect(0, 0, pageWidth, 70, 0, 0, "F");
      doc.setFillColor(79, 70, 229);
      doc.roundedRect(0, 66, pageWidth, 4, 0, 0, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CGPA Report", margin, 44);
      if (userName) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        const nameWidth = doc.getTextWidth(`Name: ${userName}`);
        doc.text(`Name: ${userName}`, pageWidth - margin - nameWidth, 44);
      }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      const headerRight = `Generated: ${ddmmyyyy}`;
      doc.text(
        headerRight,
        pageWidth - margin - doc.getTextWidth(headerRight),
        64
      );
      doc.setTextColor(0, 0, 0);
      cursorY = 100;
      addDivider();

      // Summary
      addHeading("Summary", 16);
      const rowH = 26;
      const colW = (pageWidth - margin * 2) / 4;
      const cells = [
        { label: "Overall CGPA", value: String(cgpa) },
        { label: "Total Credits", value: String(totalCredits) },
        { label: "Semesters", value: String(semesters.length) },
      ];
      const avg =
        semesters.length > 0
          ? (
              semesters.reduce((s, sem) => s + parseFloat(sem.sgpa || 0), 0) /
              semesters.length
            ).toFixed(2)
          : "0.00";
      cells.push({ label: "Average SGPA", value: String(avg) });

      doc.setFontSize(13);
      cells.forEach((c, i) => {
        const x = margin + i * colW;
        doc.setDrawColor(220);
        doc.roundedRect(x, cursorY, colW - 10, rowH, 6, 6);
        doc.setFont("helvetica", "normal");
        doc.text(c.label, x + 10, cursorY + 16);
        doc.setFont("helvetica", "bold");
        doc.text(c.value, x + 10, cursorY + 16 + 14);
      });
      cursorY += rowH + 20;
      addDivider();

      // Table layout
      const subjectColWidth = 300;
      const gradeColWidth = 60;
      const creditsColWidth = 70;
      const pointsColWidth = 70;
      const colX = [
        margin,
        margin + subjectColWidth,
        margin + subjectColWidth + gradeColWidth,
        margin + subjectColWidth + gradeColWidth + creditsColWidth,
      ];

      const drawHeaderRow = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.text("Subject", colX[0], cursorY);
        doc.text("Grade", colX[1] + gradeColWidth - 4, cursorY, {
          align: "right",
        });
        doc.text("Credits", colX[2] + creditsColWidth - 4, cursorY, {
          align: "right",
        });
        doc.text("Points", colX[3] + pointsColWidth - 4, cursorY, {
          align: "right",
        });
        cursorY += 14;
        doc.setDrawColor(200);
        // header bottom line
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
        // vertical guides for alignment
        doc.setDrawColor(230);
        [colX[1], colX[2], colX[3]].forEach((x) =>
          doc.line(x, cursorY - 14, x, pageHeight - margin)
        );
        cursorY += 8;
        doc.setFont("helvetica", "normal");
      };

      semesters.forEach((sem, si) => {
        if (cursorY > pageHeight - 140) {
          doc.addPage();
          cursorY = margin;
        }

        if (si > 0) {
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.8);
          doc.line(margin, cursorY - 14, pageWidth - margin, cursorY - 14);
          doc.setLineWidth(0.2);
        }

        addHeading(`${sem.name}`, 15);
        addText(`SGPA: ${sem.sgpa}`);
        drawHeaderRow();

        sem.subjects.forEach((sub, idx) => {
          if (cursorY > pageHeight - 80) {
            doc.addPage();
            cursorY = margin;
            drawHeaderRow();
          }
          const subjectText = doc.splitTextToSize(
            sub.name || "-",
            subjectColWidth - 10
          );
          const lineHeight = 16;
          const rowHeight = Math.max(
            lineHeight,
            subjectText.length * lineHeight
          );

          if (idx % 2 === 0) {
            doc.setFillColor(245, 247, 250);
            doc.rect(
              margin - 4,
              cursorY - 12,
              pageWidth - margin * 2 + 8,
              rowHeight + 8,
              "F"
            );
          }

          doc.text(subjectText, colX[0], cursorY);
          const grade = (sub.grade || "").toUpperCase();
          const gradePoints = { "A+": 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };
          doc.text(grade || "-", colX[1] + gradeColWidth - 4, cursorY, {
            align: "right",
          });
          doc.text(
            String(sub.credits || "-"),
            colX[2] + creditsColWidth - 4,
            cursorY,
            { align: "right" }
          );
          doc.text(
            String(gradePoints[grade] ?? "-"),
            colX[3] + pointsColWidth - 4,
            cursorY,
            { align: "right" }
          );

          // row baseline
          doc.setDrawColor(235);
          doc.line(
            margin,
            cursorY + rowHeight - (lineHeight - 2),
            pageWidth - margin,
            cursorY + rowHeight - (lineHeight - 2)
          );

          cursorY += rowHeight;
        });

        cursorY += 12;
      });

      const fileName = `cgpa-report-${ddmmyyyyFile}.pdf`;

      if (Capacitor?.isNativePlatform?.()) {
        const base64 = doc.output("dataurlstring").split(",")[1];
        try {
          await Filesystem.requestPermissions();
        } catch {}

        // Prefer Downloads on Android 11+; then Documents
        const targets = [
          {
            dir: "EXTERNAL_STORAGE",
            path: `Download/CGPA Reports/${fileName}`,
            msg: `Saved to Download/CGPA Reports/${fileName}`,
          },
          {
            dir: "DOCUMENTS",
            path: `CGPA Reports/${fileName}`,
            msg: `Saved to Documents/CGPA Reports/${fileName}`,
          },
        ];

        for (const t of targets) {
          try {
            await Filesystem.writeFile({
              path: t.path,
              data: base64,
              directory: t.dir,
              recursive: true,
            });
            alert(t.msg);
            return;
          } catch (e) {
            console.warn(`Save failed to ${t.dir}:${t.path}`, e);
          }
        }

        // 3) Fallback to Cache and open share sheet (or open in Browser)
        try {
          const cachePath = `cgpa/${fileName}`;
          await Filesystem.writeFile({
            path: cachePath,
            data: base64,
            directory: "CACHE",
            recursive: true,
          });
          const { uri } = await Filesystem.getUri({
            path: cachePath,
            directory: "CACHE",
          });
          try {
            await Share.share({
              title: "CGPA Report",
              text: "CGPA report PDF",
              url: uri,
              dialogTitle: "Share CGPA report",
            });
          } catch (shareErr) {
            // As last resort, open in Browser (system viewer) so user can choose an app to save
            try {
              await Browser.open({ url: uri });
            } catch (browserErr) {
              console.error("Browser open failed", browserErr);
              alert(
                "Unable to share or open the PDF. Please check app storage permissions."
              );
            }
          }
          return;
        } catch (errShare) {
          console.error("Cache share failed", errShare);
          alert(
            "Unable to save or share the PDF. Please check storage permissions."
          );
        }
      } else {
        doc.save(fileName);
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const shareProgress = async () => {
    const shareText = `🎓 My Academic Progress Update!\n\n📊 Current CGPA: ${cgpa}\n📚 Total Credits: ${totalCredits}\n🎯 Semesters Completed: ${semesters.length}\n\n#AcademicProgress #CGPA #StudentLife`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My CGPA Progress",
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Progress copied to clipboard!");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg">
          <Download className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Export & Share
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 flex items-center gap-2 mb-1">
          <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
            Report Name
          </label>
          <input
            value={reportName}
            onChange={(e) => {
              setReportName(e.target.value);
              try {
                localStorage.setItem("cgpa_report_name", e.target.value);
              } catch {}
            }}
            placeholder="e.g., John Doe"
            className="flex-1 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white"
          />
        </div>
        <button
          onClick={exportAsPDF}
          disabled={isExporting}
          className="flex items-center gap-2 p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          <span className="text-sm font-medium">
            {isExporting ? "Exporting..." : "PDF"}
          </span>
        </button>

        <button
          onClick={shareProgress}
          className="flex items-center gap-2 p-3 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-200 dark:hover:bg-cyan-900/50 transition-colors"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ExportOptions;
