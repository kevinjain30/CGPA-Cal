import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Share2 } from 'lucide-react';
import * as htmlToImage from 'html-to-image';

const ExportOptions = ({ semesters, cgpa, totalCredits }) => {
  const [isExporting, setIsExporting] = useState(false);

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
    } finally {
      setIsExporting(false);
    }
  };

  const shareProgress = async () => {
    const shareText = `🎓 My Academic Progress Update!\n\n📊 Current CGPA: ${cgpa}\n📚 Total Credits: ${totalCredits}\n🎯 Semesters Completed: ${semesters.length}\n\n#AcademicProgress #CGPA #StudentLife`;
    
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
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
          <Download className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Export & Share</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
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
          </span>
        </button>

        <button
          onClick={shareProgress}
          className="flex items-center gap-2 p-3 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ExportOptions;