import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Share2,
  Sun,
  Moon,
  ChevronDown,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  User,
  Target,
  Download,
  Calculator,
  Percent,
  PlusCircle,
  BarChart, // Added for the new Standing feature icon
} from "lucide-react";

// --- Libraries from CDN ---
const { jsPDF } = window.jspdf;
const { Capacitor } = window;
const { Filesystem, Directory } = window.Capacitor.Plugins;

// --- AnimatedBackground Component ---
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-indigo-50 to-violet-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 transition-all duration-1000" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-sky-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-indigo-400/15 to-violet-400/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400/15 to-sky-400/15 rounded-full blur-3xl animate-pulse delay-2000" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.04%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] dark:opacity-30" />
    </div>
  );
};

// --- StatsCard Component ---
const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-xl ${gradient} transform hover:scale-105 transition-all duration-300`}
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-4xl font-bold mt-2 tracking-tight">{value}</p>
            {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
          </div>
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Icon size={24} />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
};

// --- GradeChart Component ---
const GradeChart = ({ semesters }) => {
  const chartData = React.useMemo(() => {
    return semesters.map((sem) => ({
      semester: sem.name,
      sgpa: parseFloat(sem.sgpa),
    }));
  }, [semesters]);

  const maxSGPA = 10;

  if (chartData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        SGPA Trend
      </h3>

      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Gradient definition first to ensure availability */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0EA5E9" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10].map((value) => (
            <g key={value}>
              <line
                x1="40"
                y1={180 - (value / maxSGPA) * 160}
                x2="380"
                y2={180 - (value / maxSGPA) * 160}
                stroke="currentColor"
                strokeWidth="1"
                className="text-gray-200 dark:text-gray-700"
                strokeDasharray="2,2"
              />
              <text
                x="30"
                y={185 - (value / maxSGPA) * 160}
                className="text-xs fill-gray-500 dark:fill-gray-400"
                textAnchor="end"
              >
                {value}
              </text>
            </g>
          ))}

          {/* Chart line - connect only valid points */}
          {(() => {
            const step = 300 / Math.max(chartData.length - 1, 1);
            let d = "";
            let started = false;
            chartData.forEach((point, index) => {
              const sg = Number(point.sgpa);
              const x = 50 + index * step;
              const y = 180 - (sg / maxSGPA) * 160;
              if (Number.isFinite(sg)) {
                if (!started) {
                  d += `M ${x},${y}`;
                  started = true;
                } else {
                  d += ` L ${x},${y}`;
                }
              } else {
                started = false;
              }
            });
            return d && d.includes("L") ? (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={d}
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : null;
          })()}

          {/* Data points */}
          {chartData.map((point, index) => {
            const sg = Number(point.sgpa);
            if (!Number.isFinite(sg)) return null;
            return (
              <motion.circle
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                cx={50 + index * (300 / Math.max(chartData.length - 1, 1))}
                cy={180 - (sg / maxSGPA) * 160}
                r="6"
                fill="url(#gradient)"
                className="drop-shadow-lg"
              />
            );
          })}
        </svg>

        {/* X-axis labels */}
        <div className="flex justify-between mt-4 px-12">
          {chartData.map((point, index) => (
            <span
              key={index}
              className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-left"
            >
              {point.semester}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- GradeDistribution Component ---
const GradeDistribution = ({ semesters }) => {
  const gradeDistribution = React.useMemo(() => {
    const distribution = {};
    const gradeColors = {
      "A+": "#059669",
      A: "#3B82F6",
      B: "#8B5CF6",
      C: "#EC4899",
      D: "#F59E0B",
      E: "#EF4444",
      F: "#374151",
    };
    const gradePoints = { "A+": 10, A: 9, B: 8, C: 7, D: 6, E: 5, F: 0 };

    semesters.forEach((semester) => {
      semester.subjects.forEach((subject) => {
        const grade = subject.grade.toUpperCase();
        distribution[grade] = (distribution[grade] || 0) + 1;
      });
    });

    return Object.entries(distribution)
      .map(([grade, count]) => ({
        grade,
        count,
        color: gradeColors[grade] || "#6B7280",
        points: gradePoints[grade] ?? -1,
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.count !== a.count) return b.count - a.count;
        return a.grade.localeCompare(b.grade);
      });
  }, [semesters]);

  const totalSubjects = gradeDistribution.reduce(
    (sum, item) => sum + item.count,
    0
  );

  if (totalSubjects === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Grade Distribution
      </h3>

      <div className="space-y-4">
        {gradeDistribution.map((item, index) => (
          <motion.div
            key={item.grade}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="flex items-center gap-4"
          >
            <div className="w-12 text-center">
              <span className="font-bold text-lg" style={{ color: item.color }}>
                {item.grade}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.count} subject{item.count !== 1 ? "s" : ""}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {((item.count / totalSubjects) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / totalSubjects) * 100}%` }}
                  transition={{ duration: 1, delay: 0.2 + index * 0.1 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// --- GoalTracker Component ---
const GoalTracker = ({ currentCGPA, isGuestMode }) => {
  const [targetCGPA, setTargetCGPA] = useState("");
  const [savedGoal, setSavedGoal] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("cgpa_goal");
    if (saved) {
      setSavedGoal(parseFloat(saved));
      setTargetCGPA(saved);
    }
  }, []);

  if (isGuestMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60 flex flex-col items-center justify-center text-center h-full"
      >
        <User className="text-gray-400 dark:text-gray-500 mb-4" size={40} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Guest Mode Active
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Goal tracking is disabled in Guest Mode.
        </p>
      </motion.div>
    );
  }

  const handleSaveGoal = () => {
    const goal = parseFloat(targetCGPA);
    if (goal >= 0 && goal <= 10) {
      setSavedGoal(goal);
      localStorage.setItem("cgpa_goal", goal.toString());
    }
  };

  const progress = savedGoal
    ? Math.min((parseFloat(currentCGPA) / savedGoal) * 100, 100)
    : 0;
  const isGoalAchieved = savedGoal && parseFloat(currentCGPA) >= savedGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 dark:border-slate-700/60"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-lg">
          <Target className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          CGPA Goal
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            max="10"
            step="0.01"
            value={targetCGPA}
            onChange={(e) => setTargetCGPA(e.target.value)}
            placeholder="Set your target CGPA"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSaveGoal}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-lg hover:from-sky-600 hover:to-indigo-700 transition-all duration-300 font-medium"
          >
            Set Goal
          </button>
        </div>

        {savedGoal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Current: {currentCGPA} / Target: {savedGoal}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {progress.toFixed(1)}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`h-3 rounded-full ${
                  isGoalAchieved
                    ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                    : "bg-gradient-to-r from-sky-500 to-indigo-600"
                }`}
              />
            </div>

            {isGoalAchieved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg"
              >
                <Award
                  className="text-emerald-600 dark:text-emerald-400"
                  size={20}
                />
                <span className="text-emerald-800 dark:text-emerald-300 font-medium">
                  🎉 Goal Achieved! Congratulations!
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp size={16} />
              <span>
                {savedGoal > parseFloat(currentCGPA)
                  ? `${(savedGoal - parseFloat(currentCGPA)).toFixed(
                      2
                    )} points to go!`
                  : "You've exceeded your goal!"}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// --- ExportOptions Component ---
const ExportOptions = ({ semesters, cgpa, totalCredits, userName }) => {
  const [isExporting, setIsExporting] = useState(false);

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

      // Summary table block
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
        doc.line(margin, cursorY, pageWidth - margin, cursorY);
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

          cursorY += rowHeight;
        });

        cursorY += 12;
      });

      const fileName = `cgpa-report-${ddmmyyyyFile}.pdf`;

      if (Capacitor?.isNativePlatform?.()) {
        try {
          await Filesystem.requestPermissions();
        } catch (e) {
          console.error("Error requesting permissions", e);
        }
        const base64 = doc.output("dataurlstring").split(",")[1];
        await Filesystem.writeFile({
          path: `CGPA Reports/${fileName}`,
          data: base64,
          directory: "DOCUMENTS",
          recursive: true,
        });
        alert(`Saved to Documents/CGPA Reports/${fileName}`);
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

// --- QuickActions Component ---
const QuickActions = ({
  onCalculateRequired,
  onViewTrends,
  onViewAchievements,
  onAddSemester,
}) => {
  const actions = [
    {
      icon: PlusCircle,
      label: "Add Semester",
      description: "Log a new semester",
      color: "from-green-500 to-emerald-600",
      onClick: onAddSemester,
    },
    {
      icon: TrendingUp,
      label: "View Trends",
      description: "Analyze performance",
      color: "from-indigo-500 to-violet-600",
      onClick: onViewTrends,
    },
    {
      icon: Award,
      label: "Achievements",
      description: "View milestones",
      color: "from-blue-600 to-indigo-700",
      onClick: onViewAchievements,
    },
    {
      icon: Calculator,
      label: "Target Calculator",
      description: "Plan your future CGPA",
      color: "from-sky-500 to-indigo-600",
      onClick: onCalculateRequired,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={action.onClick}
            className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300 group`}
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <action.icon
                size={24}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              <div>
                <p className="font-semibold text-sm">{action.label}</p>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// --- Grade to Point Mapping ---
const gradePoints = {
  "A+": 10,
  A: 9,
  B: 8,
  C: 7,
  D: 6,
  E: 5,
  F: 0,
  FAIL: 0,
};

// --- Custom Alert Component ---
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center border border-white/20 dark:border-gray-700/50"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {message.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6 whitespace-pre-wrap">
            {message.body}
          </p>
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-2 px-6 rounded-lg w-full hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
          >
            OK
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- Main App Component ---
export default function App() {
  const [semesters, setSemesters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [reqModalVisible, setReqModalVisible] = useState(false);
  const [targetCgpaForCalc, setTargetCgpaForCalc] = useState("");
  const [remainingCreditsForCalc, setRemainingCreditsForCalc] = useState("");
  const [currentSemester, setCurrentSemester] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [theme, setTheme] = useState("light");
  const [openSemesterIndex, setOpenSemesterIndex] = useState(null);
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: "",
    body: "",
    onConfirm: null,
  });
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [userName, setUserName] = useState("");

  // --- Data Persistence ---
  useEffect(() => {
    try {
      const storedSemesters = JSON.parse(
        localStorage.getItem("@semesters_data") || "[]"
      );
      setSemesters(storedSemesters);
      const storedTheme = localStorage.getItem("theme") || "light";
      setTheme(storedTheme);
      const normalizeCap = (s) =>
        s
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(" ");
      const storedName = normalizeCap(
        (localStorage.getItem("user_name") || "").trim()
      );
      if (storedName) {
        setUserName(storedName);
      } else {
        const entered =
          (typeof window !== "undefined"
            ? window.prompt("Please enter your name:", "")
            : "") || "";
        const safe = normalizeCap(entered.trim() || "User");
        setUserName(safe);
        try {
          localStorage.setItem("user_name", safe);
          localStorage.setItem("cgpa_report_name", safe);
        } catch {}
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
      setAlertMessage({
        title: "Load Error",
        body: "Could not load your saved data.",
      });
    }
  }, []);

  useEffect(() => {
    if (!isGuestMode) {
      try {
        localStorage.setItem("@semesters_data", JSON.stringify(semesters));
      } catch (e) {
        console.error("Failed to save data to storage", e);
        setAlertMessage({
          title: "Save Error",
          body: "Could not save your changes.",
        });
      }
    }
  }, [semesters, isGuestMode]);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // --- Guest Mode Handlers ---
  const handleToggleGuestMode = () => {
    if (isGuestMode) {
      handleExitGuestMode();
    } else {
      handleEnterGuestMode();
    }
  };

  const handleEnterGuestMode = () => {
    setConfirmState({
      show: true,
      title: "Enter Guest Mode?",
      body: "This will start a temporary session. Your current data will be hidden but not deleted. Do you want to continue?",
      onConfirm: () => {
        setIsGuestMode(true);
        setSemesters([]);
        setOpenSemesterIndex(null);
        const entered =
          (typeof window !== "undefined"
            ? window.prompt("Enter your name (Guest):", "")
            : "") || "";
        const normalizeCap = (s) =>
          s
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(" ");
        const safe = normalizeCap((entered || "User").trim() || "User");
        setUserName(safe);
      },
    });
  };

  const handleExitGuestMode = () => {
    setIsGuestMode(false);
    try {
      const storedSemesters = JSON.parse(
        localStorage.getItem("@semesters_data") || "[]"
      );
      setSemesters(storedSemesters);
    } catch (e) {
      console.error("Failed to load data from storage", e);
      setAlertMessage({
        title: "Load Error",
        body: "Could not load your saved data.",
      });
      setSemesters([]);
    }
  };

  // --- Calculation Logic ---
  const calculateSGPA = useCallback((subjects) => {
    if (!subjects || subjects.length === 0) return "0.00";
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach((subject) => {
      const credits = parseFloat(subject.credits);
      const grade = subject.grade.toUpperCase().trim();
      const point = gradePoints[grade] !== undefined ? gradePoints[grade] : 0;
      if (!isNaN(credits) && credits > 0) {
        totalPoints += credits * point;
        totalCredits += credits;
      }
    });
    return totalCredits === 0
      ? "0.00"
      : (totalPoints / totalCredits).toFixed(2);
  }, []);

  const calculateCGPA = useCallback(() => {
    let grandTotalPoints = 0;
    let grandTotalCredits = 0;
    semesters.forEach((semester) => {
      semester.subjects.forEach((subject) => {
        const credits = parseFloat(subject.credits);
        if (!isNaN(credits) && credits > 0) {
          const point = gradePoints[subject.grade.toUpperCase().trim()] || 0;
          grandTotalPoints += credits * point;
          grandTotalCredits += credits;
        }
      });
    });
    return grandTotalCredits === 0
      ? "0.00"
      : (grandTotalPoints / grandTotalCredits).toFixed(2);
  }, [semesters]);

  // ***** NEW FUNCTION *****
  const getSemesterStanding = (sgpa) => {
    const sg = parseFloat(sgpa);
    if (isNaN(sg) || sg === 0)
      return { text: "N/A", color: "from-gray-500 to-gray-600" };
    if (sg >= 9.5)
      return { text: "Outstanding", color: "from-amber-400 to-yellow-500" };
    if (sg >= 9.0)
      return { text: "Excellent", color: "from-green-500 to-emerald-500" };
    if (sg >= 8.0)
      return { text: "Very Good", color: "from-sky-500 to-blue-500" };
    if (sg >= 7.0)
      return { text: "Good", color: "from-indigo-500 to-violet-500" };
    if (sg >= 6.0)
      return { text: "Average", color: "from-slate-500 to-gray-600" };
    return { text: "Needs Improvement", color: "from-red-500 to-rose-500" };
  };

  const calculateSemesterAttendance = (attended, held) => {
    const attendedNum = parseInt(attended, 10);
    const heldNum = parseInt(held, 10);
    if (
      isNaN(attendedNum) ||
      isNaN(heldNum) ||
      heldNum === 0 ||
      attendedNum < 0 ||
      heldNum < 0
    ) {
      return "N/A";
    }
    return `${((attendedNum / heldNum) * 100).toFixed(1)}%`;
  };

  const calculateTotalOverallAttendance = useCallback(() => {
    let totalAttended = 0;
    let totalHeld = 0;
    semesters.forEach((semester) => {
      const attended = parseInt(semester.attended, 10);
      const held = parseInt(semester.held, 10);
      if (!isNaN(attended) && !isNaN(held) && held > 0) {
        totalAttended += attended;
        totalHeld += held;
      }
    });
    if (totalHeld === 0) return "0.00%";
    return `${((totalAttended / totalHeld) * 100).toFixed(2)}%`;
  }, [semesters]);

  const totalCreditsCompleted = useCallback(() => {
    return semesters.reduce(
      (total, sem) =>
        total +
        sem.subjects.reduce(
          (semTotal, sub) => semTotal + (parseFloat(sub.credits) || 0),
          0
        ),
      0
    );
  }, [semesters]);

  const handleCalculateRequiredCgpa = () => {
    const currentCgpa = parseFloat(calculateCGPA());
    const currentTotalCredits = totalCreditsCompleted();
    const targetCgpa = parseFloat(targetCgpaForCalc);
    const remainingCredits = parseFloat(remainingCreditsForCalc);

    if (
      isNaN(targetCgpa) ||
      isNaN(remainingCredits) ||
      targetCgpa <= 0 ||
      remainingCredits <= 0
    ) {
      setAlertMessage({
        title: "Invalid Input",
        body: "Please enter valid numbers for target CGPA and remaining credits.",
      });
      return;
    }
    if (targetCgpa > 10) {
      setAlertMessage({
        title: "Invalid Target",
        body: "Target CGPA cannot be greater than 10.",
      });
      return;
    }

    const currentTotalPoints = currentCgpa * currentTotalCredits;
    const requiredTotalPoints =
      targetCgpa * (currentTotalCredits + remainingCredits);
    const neededPoints = requiredTotalPoints - currentTotalPoints;
    const requiredAverageSgpa = neededPoints / remainingCredits;

    let resultMessage = `To achieve a CGPA of ${targetCgpa.toFixed(
      2
    )},\nyou need to score an average SGPA of:\n\n${requiredAverageSgpa.toFixed(
      2
    )}`;

    if (requiredAverageSgpa > 10) {
      resultMessage +=
        "\n\nThis target seems impossible. Please double-check your values.";
    } else if (requiredAverageSgpa < 0) {
      resultMessage +=
        "\n\nThis target is easily achievable based on your current grades!";
    }

    setAlertMessage({ title: "Target Calculation", body: resultMessage });
    setReqModalVisible(false);
    setTargetCgpaForCalc("");
    setRemainingCreditsForCalc("");
  };

  // --- Handlers for Semester Operations ---
  const handleAddNewSemester = () => {
    setCurrentSemester({
      name: `Semester ${semesters.length + 1}`,
      subjects: [{ name: "", credits: "", grade: "" }],
      attended: "",
      held: "",
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleEditSemester = (index) => {
    setCurrentSemester(JSON.parse(JSON.stringify(semesters[index])));
    setIsEditing(true);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleSaveSemester = () => {
    if (
      currentSemester.subjects.some(
        (s) => !s.name.trim() || !s.credits || !s.grade
      )
    ) {
      setAlertMessage({
        title: "Incomplete Fields",
        body: "Please fill all grade details for each subject.",
      });
      return;
    }
    const sgpa = calculateSGPA(currentSemester.subjects);
    const updatedSemester = { ...currentSemester, sgpa };

    setSemesters((prev) =>
      isEditing
        ? prev.map((s, i) => (i === editIndex ? updatedSemester : s))
        : [...prev, updatedSemester]
    );
    setModalVisible(false);
  };

  const handleDeleteSemester = (index) => {
    setConfirmState({
      show: true,
      title: "Confirm delete?",
      body: "This will remove the semester and its subjects. This action cannot be undone.",
      onConfirm: () =>
        setSemesters((prev) => prev.filter((_, i) => i !== index)),
    });
  };

  const handleToggleSemester = (index) => {
    setOpenSemesterIndex(openSemesterIndex === index ? null : index);
  };

  // --- Handlers for Subject Operations ---
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...currentSemester.subjects];
    newSubjects[index][field] = value;
    setCurrentSemester({ ...currentSemester, subjects: newSubjects });
  };

  const handleAddSubject = () => {
    setCurrentSemester((prev) => ({
      ...prev,
      subjects: [...prev.subjects, { name: "", credits: "", grade: "" }],
    }));
  };

  const handleDeleteSubject = (index) => {
    if (currentSemester.subjects.length <= 1) {
      setAlertMessage({
        title: "Action Not Allowed",
        body: "A semester must have at least one subject.",
      });
      return;
    }
    setConfirmState({
      show: true,
      title: "Confirm delete?",
      body: "Remove this subject from the semester? This action cannot be undone.",
      onConfirm: () =>
        setCurrentSemester((prev) => ({
          ...prev,
          subjects: prev.subjects.filter((_, i) => i !== index),
        })),
    });
  };

  const handleShareCGPA = () => {
    const cgpa = calculateCGPA();
    const shareText = `🎓 My Academic Journey Update!\n\n📊 Current CGPA: ${cgpa}\n📚 Total Credits: ${totalCreditsCompleted()}\n🎯 Semesters: ${
      semesters.length
    }\n\nTracking my progress with CGPA Tracker! 📈`;

    if (navigator.share) {
      navigator
        .share({ title: "My CGPA Progress", text: shareText })
        .catch(console.error);
    } else {
      navigator.clipboard
        .writeText(shareText)
        .then(() => {
          setAlertMessage({
            title: "Copied!",
            body: "Your progress has been copied to the clipboard.",
          });
        })
        .catch(() => {
          setAlertMessage({ title: "Share", body: shareText });
        });
    }
  };

  // Quick Actions Handlers
  const handleViewTrends = () => {
    setAlertMessage({
      title: "Trends Available!",
      body: "Check out the SGPA trend chart and grade distribution below!",
    });
  };

  const handleViewAchievements = () => {
    const cgpa = parseFloat(calculateCGPA());
    let achievement = "Keep going! 💪";

    if (cgpa >= 9.5) achievement = "Outstanding Performance! 🏆";
    else if (cgpa >= 9.0) achievement = "Excellent Work! 🌟";
    else if (cgpa >= 8.5) achievement = "Great Job! 🎯";
    else if (cgpa >= 8.0) achievement = "Good Progress! 👍";
    else if (cgpa >= 7.0) achievement = "Steady Improvement! 📈";

    setAlertMessage({
      title: "Your Achievement",
      body: `${achievement}\nCurrent CGPA: ${cgpa}`,
    });
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="text-center py-20 px-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mx-auto h-32 w-32 text-gray-300 dark:text-gray-600 mb-8"
      >
        <GraduationCap size={128} />
      </motion.div>
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4"
      >
        {isGuestMode ? "Guest Calculator" : "Start Your Academic Journey"}
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto"
      >
        {isGuestMode
          ? "Add semesters and subjects to calculate CGPA. This data is temporary and won't be saved."
          : "Track your grades, monitor your progress, and achieve your academic goals with our advanced CGPA tracker."}
      </motion.p>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleAddNewSemester}
        className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <Plus size={24} />
        Add First Semester
      </motion.button>
    </motion.div>
  );

  const modalInputStyle =
    "w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-900 dark:text-white";

  const cgpa = calculateCGPA();
  const totalCredits = totalCreditsCompleted();
  const overallAttendance = calculateTotalOverallAttendance();

  return (
    <>
      <AnimatedBackground />
      <div className="relative bg-transparent min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-500">
        <CustomAlert
          message={alertMessage}
          onClose={() => setAlertMessage(null)}
        />
        <AnimatePresence>
          {confirmState.show && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl w-full max-w-sm text-center border border-white/20 dark:border-gray-700/50"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {confirmState.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">
                  {confirmState.body}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setConfirmState({
                        show: false,
                        title: "",
                        body: "",
                        onConfirm: null,
                      })
                    }
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      confirmState.onConfirm && confirmState.onConfirm();
                      setConfirmState({
                        show: false,
                        title: "",
                        body: "",
                        onConfirm: null,
                      });
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    {confirmState.title.toLowerCase().includes("delete")
                      ? "Delete"
                      : "Confirm"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isGuestMode && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="sticky top-0 left-0 right-0 z-40 bg-yellow-400/90 dark:bg-yellow-600/90 backdrop-blur-sm p-2 text-center shadow-lg"
            >
              <div className="container mx-auto flex justify-center items-center gap-4">
                <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-50">
                  Guest Mode is ON. Data will not be saved.
                </p>
                <button
                  onClick={handleExitGuestMode}
                  className="bg-white/50 dark:bg-black/20 text-yellow-900 dark:text-white font-bold py-1 px-3 rounded-full text-xs hover:bg-white/70 dark:hover:bg-black/40 transition-all"
                >
                  Exit
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          id="cgpa-dashboard"
          className="container mx-auto p-4 sm:p-6 max-w-7xl pb-28"
        >
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                  <GraduationCap className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    CGPA Tracker
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">
                    Welcome{" "}
                    {userName && userName.trim().length > 0 ? userName : "User"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-start sm:justify-end">
              <div className="flex items-center gap-4 p-2 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 pl-2">
                    GUEST
                  </span>
                  <div
                    onClick={handleToggleGuestMode}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      isGuestMode
                        ? "bg-green-500"
                        : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      layout
                      transition={{
                        type: "spring",
                        stiffness: 700,
                        damping: 30,
                      }}
                      animate={{ x: isGuestMode ? 22 : 0 }}
                    />
                  </div>
                </div>
                <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    setTheme((t) => (t === "light" ? "dark" : "light"))
                  }
                  className="p-2 rounded-full hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all"
                >
                  {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShareCGPA}
                  className="p-2 rounded-full hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all"
                >
                  <Share2 size={20} />
                </motion.button>
              </div>
            </div>
          </motion.header>

          {semesters.length > 0 ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                  title="Overall CGPA"
                  value={cgpa}
                  subtitle="Current Performance"
                  icon={TrendingUp}
                  gradient="bg-gradient-to-br from-sky-500 to-indigo-600"
                  delay={0}
                />
                <StatsCard
                  title="Attendance"
                  value={overallAttendance}
                  subtitle="Overall"
                  icon={Percent}
                  gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                  delay={0.1}
                />
                <StatsCard
                  title="Total Credits"
                  value={totalCredits}
                  subtitle="Credits Completed"
                  icon={BookOpen}
                  gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
                  delay={0.2}
                />
                <StatsCard
                  title="Semesters"
                  value={semesters.length}
                  subtitle="Completed"
                  icon={GraduationCap}
                  gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
                  delay={0.3}
                />
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <GradeChart semesters={semesters} />
                <GradeDistribution semesters={semesters} />
              </div>

              {/* Goal Tracker and Export Options */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <GoalTracker currentCGPA={cgpa} isGuestMode={isGuestMode} />
                <ExportOptions
                  semesters={semesters}
                  cgpa={cgpa}
                  totalCredits={totalCredits}
                  userName={userName}
                />
                <QuickActions
                  onAddSemester={handleAddNewSemester}
                  onCalculateRequired={() => setReqModalVisible(true)}
                  onViewTrends={handleViewTrends}
                  onViewAchievements={handleViewAchievements}
                />
              </div>

              {/* Semesters List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Your Semesters
                </h2>
                {semesters.map((semester, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/30 dark:border-slate-700/60"
                  >
                    <div
                      className="p-6 cursor-pointer"
                      onClick={() => handleToggleSemester(index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate pr-4">
                            {semester.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {semester.subjects.reduce(
                              (acc, s) => acc + (parseFloat(s.credits) || 0),
                              0
                            )}{" "}
                            Credits • {semester.subjects.length} Subjects
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditSemester(index);
                            }}
                            className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <Edit size={18} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSemester(index);
                            }}
                            className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                          <motion.div
                            animate={{
                              rotate: openSemesterIndex === index ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronDown size={20} />
                          </motion.div>
                        </div>
                      </div>
                      {/* ***** MODIFIED SECTION ***** */}
                      <div className="mt-4 flex items-center justify-between gap-6 pt-4 border-t border-gray-200 dark:border-gray-700/50">
                        <div className="text-left">
                          <p className="font-bold text-2xl bg-gradient-to-r from-emerald-500 to-green-600 bg-clip-text text-transparent">
                            {calculateSemesterAttendance(
                              semester.attended,
                              semester.held
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                            ATTENDANCE
                          </p>
                        </div>
                        <div className="text-left">
                          <p
                            className={`font-bold text-2xl bg-gradient-to-r ${
                              getSemesterStanding(semester.sgpa).color
                            } bg-clip-text text-transparent`}
                          >
                            {getSemesterStanding(semester.sgpa).text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                            STANDING
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-2xl bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                            {semester.sgpa}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">
                            SGPA
                          </p>
                        </div>
                      </div>
                      {/* ***** END MODIFIED SECTION ***** */}
                    </div>

                    <AnimatePresence>
                      {openSemesterIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6">
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                              <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 px-4">
                                <div>Subject</div>
                                <div className="text-center">Credits</div>
                                <div className="text-center">Grade</div>
                              </div>
                              {semester.subjects.map((subject, sIndex) => (
                                <motion.div
                                  key={sIndex}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    delay: sIndex * 0.05,
                                  }}
                                  className="grid grid-cols-3 gap-4 text-sm items-center py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                    {subject.name}
                                  </div>
                                  <div className="text-center text-gray-600 dark:text-gray-300 font-semibold">
                                    {subject.credits}
                                  </div>
                                  <div className="text-center">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                                      {subject.grade.toUpperCase()}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Semester Modal */}
        <AnimatePresence>
          {modalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border border-white/20 dark:border-gray-700/50"
                style={{ maxHeight: "90vh" }}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                  <input
                    type="text"
                    className="text-xl font-bold bg-transparent focus:outline-none w-full text-gray-900 dark:text-white"
                    value={currentSemester?.name}
                    onChange={(e) =>
                      setCurrentSemester((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setModalVisible(false)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div className="p-6 flex-grow overflow-y-auto">
                  {/* Attendance Section */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4 border border-gray-200 dark:border-gray-600">
                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 text-center">
                      Semester Attendance
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide min-h-10 flex items-center justify-center text-center">
                          Classes Attended
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 200"
                          value={currentSemester?.attended}
                          onChange={(e) =>
                            setCurrentSemester((prev) => ({
                              ...prev,
                              attended: e.target.value,
                            }))
                          }
                          className={`${modalInputStyle} text-center`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide min-h-10 flex items-center justify-center text-center">
                          Classes Held
                        </label>
                        <input
                          type="number"
                          placeholder="e.g., 300"
                          value={currentSemester?.held}
                          onChange={(e) =>
                            setCurrentSemester((prev) => ({
                              ...prev,
                              held: e.target.value,
                            }))
                          }
                          className={`${modalInputStyle} text-center`}
                        />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-6 mb-2">
                    Subjects & Grades
                  </h4>
                  <div className="space-y-4">
                    {currentSemester?.subjects.map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl relative backdrop-blur-sm border border-gray-200 dark:border-gray-600"
                      >
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteSubject(index)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                              Subject Name
                            </label>
                            <input
                              type="text"
                              placeholder="e.g., Advanced Mathematics"
                              value={subject.name}
                              onChange={(e) =>
                                handleSubjectChange(
                                  index,
                                  "name",
                                  e.target.value
                                )
                              }
                              className={modalInputStyle}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Credits
                              </label>
                              <input
                                type="number"
                                placeholder="4"
                                value={subject.credits}
                                onChange={(e) =>
                                  handleSubjectChange(
                                    index,
                                    "credits",
                                    e.target.value
                                  )
                                }
                                className={`${modalInputStyle} text-center`}
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Grade
                              </label>
                              <select
                                value={subject.grade}
                                onChange={(e) =>
                                  handleSubjectChange(
                                    index,
                                    "grade",
                                    e.target.value
                                  )
                                }
                                className={`${modalInputStyle} text-center uppercase`}
                              >
                                <option value="">Select</option>
                                <option value="A+">A+</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                                <option value="E">E</option>
                                <option value="F">F</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3 flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAddSubject}
                    className="w-full text-center py-3 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold rounded-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
                  >
                    + Add Another Subject
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveSemester}
                    className="w-full text-center py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Save size={20} />
                    {isEditing ? "Update Semester" : "Save Semester"}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Required CGPA Modal */}
        <AnimatePresence>
          {reqModalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border border-white/20 dark:border-gray-700/50"
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Target CGPA Calculator
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setReqModalVisible(false)}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Target CGPA
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 8.5"
                      value={targetCgpaForCalc}
                      onChange={(e) => setTargetCgpaForCalc(e.target.value)}
                      className={modalInputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Total Remaining Credits
                    </label>
                    <input
                      type="number"
                      placeholder="e.g., 48"
                      value={remainingCreditsForCalc}
                      onChange={(e) =>
                        setRemainingCreditsForCalc(e.target.value)
                      }
                      className={modalInputStyle}
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCalculateRequiredCgpa}
                    className="w-full text-center py-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                  >
                    <Calculator size={20} />
                    Calculate
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button - centered and non-overlapping */}
        {semesters.length > 0 && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="fixed inset-x-0 bottom-6 flex justify-center pointer-events-none z-30"
          >
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleAddNewSemester}
              className="pointer-events-auto bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 border-4 border-white/20"
            >
              <Plus size={28} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </>
  );
}
