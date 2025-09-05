import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit, Save, X, Share2, Sun, Moon, ChevronDown, GraduationCap, BookOpen, TrendingUp, Award, Calculator } from 'lucide-react';

// Components
import AnimatedBackground from './components/AnimatedBackground';
import StatsCard from './components/StatsCard';
import GradeChart from './components/GradeChart';
import GradeDistribution from './components/GradeDistribution';
import GoalTracker from './components/GoalTracker';
import ExportOptions from './components/ExportOptions';
import QuickActions from './components/QuickActions';

// --- Grade to Point Mapping ---
const gradePoints = {
<<<<<<< HEAD
  'A+': 10, 'A': 9, 'B': 8, 'C': 7, 'D': 6, 'E': 5, 'F': 0, 'FAIL': 0,
=======
  'O': 10, 'A+': 10, 'A': 9, 'B+': 8, 'B': 8,
  'C': 7, 'D': 6, 'E': 5, 'P': 4, 'F': 0, 'FAIL': 0,
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{message.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">{message.body}</p>
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
  const [currentSemester, setCurrentSemester] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);
  const [theme, setTheme] = useState('light');
  const [openSemesterIndex, setOpenSemesterIndex] = useState(null);
<<<<<<< HEAD
  const [confirmState, setConfirmState] = useState({ show: false, title: '', body: '', onConfirm: null });
=======
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505

  // --- Data Persistence ---
  useEffect(() => {
    try {
      const storedSemesters = JSON.parse(localStorage.getItem('@semesters_data') || '[]');
      setSemesters(storedSemesters);
      const storedTheme = localStorage.getItem('theme') || 'light';
      setTheme(storedTheme);
    } catch (e) {
      console.error("Failed to load data from storage", e);
      setAlertMessage({ title: "Load Error", body: "Could not load your saved data." });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('@semesters_data', JSON.stringify(semesters));
    } catch (e) {
      console.error("Failed to save data to storage", e);
      setAlertMessage({ title: "Save Error", body: "Could not save your changes." });
    }
  }, [semesters]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // --- Calculation Logic ---
  const calculateSGPA = useCallback((subjects) => {
    if (!subjects || subjects.length === 0) return '0.00';
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach(subject => {
      const credits = parseFloat(subject.credits);
      const grade = subject.grade.toUpperCase().trim();
      const point = gradePoints[grade] !== undefined ? gradePoints[grade] : 0;
      if (!isNaN(credits) && credits > 0) {
        totalPoints += credits * point;
        totalCredits += credits;
      }
    });
    return totalCredits === 0 ? '0.00' : (totalPoints / totalCredits).toFixed(2);
  }, []);

  const calculateCGPA = useCallback(() => {
    let grandTotalPoints = 0;
    let grandTotalCredits = 0;
    semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        const credits = parseFloat(subject.credits);
        if (!isNaN(credits) && credits > 0) {
          const point = gradePoints[subject.grade.toUpperCase().trim()] || 0;
          grandTotalPoints += credits * point;
          grandTotalCredits += credits;
        }
      });
    });
    return grandTotalCredits === 0 ? '0.00' : (grandTotalPoints / grandTotalCredits).toFixed(2);
  }, [semesters]);

  const totalCreditsCompleted = useCallback(() => {
    return semesters.reduce((total, sem) =>
      total + sem.subjects.reduce((semTotal, sub) =>
        semTotal + (parseFloat(sub.credits) || 0), 0), 0);
  }, [semesters]);

  const averageSGPA = useCallback(() => {
    if (semesters.length === 0) return '0.00';
    const totalSGPA = semesters.reduce((sum, sem) => sum + parseFloat(sem.sgpa || 0), 0);
    return (totalSGPA / semesters.length).toFixed(2);
  }, [semesters]);

  // --- Handlers for Semester Operations ---
  const handleAddNewSemester = () => {
    setCurrentSemester({
      name: `Semester ${semesters.length + 1}`,
      subjects: [{ name: '', credits: '', grade: '' }],
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
    if (currentSemester.subjects.some(s => !s.name.trim() || !s.credits || !s.grade)) {
      setAlertMessage({ title: "Incomplete Fields", body: "Please fill all details for each subject." });
      return;
    }
    const sgpa = calculateSGPA(currentSemester.subjects);
    const updatedSemester = { ...currentSemester, sgpa };

    setSemesters(prev => isEditing ? prev.map((s, i) => i === editIndex ? updatedSemester : s) : [...prev, updatedSemester]);
    setModalVisible(false);
  };

  const handleDeleteSemester = (index) => {
    setConfirmState({
      show: true,
      title: 'Confirm delete?',
      body: 'This will remove the semester and its subjects. This action cannot be undone.',
      onConfirm: () => setSemesters(prev => prev.filter((_, i) => i !== index))
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
    setCurrentSemester(prev => ({...prev, subjects: [...prev.subjects, { name: '', credits: '', grade: '' }]}));
  };

  const handleDeleteSubject = (index) => {
    if (currentSemester.subjects.length <= 1) {
      setAlertMessage({ title: "Action Not Allowed", body: "A semester must have at least one subject." });
      return;
    }
    setConfirmState({
      show: true,
      title: 'Confirm delete?',
      body: 'Remove this subject from the semester? This action cannot be undone.',
      onConfirm: () => setCurrentSemester(prev => ({...prev, subjects: prev.subjects.filter((_, i) => i !== index)}))
    });
  };

  const handleShareCGPA = () => {
    const cgpa = calculateCGPA();
    const shareText = `🎓 My Academic Journey Update!\n\n📊 Current CGPA: ${cgpa}\n📚 Total Credits: ${totalCreditsCompleted()}\n🎯 Semesters: ${semesters.length}\n\nTracking my progress with CGPA Tracker! 📈`;
    
    if (navigator.share) {
      navigator.share({ title: 'My CGPA Progress', text: shareText }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setAlertMessage({ title: "Copied!", body: "Your progress has been copied to the clipboard." });
      }).catch(() => {
        setAlertMessage({ title: "Share", body: shareText });
      });
    }
  };

  // Quick Actions Handlers
  const handleCalculateRequired = () => {
    setAlertMessage({ 
      title: "Feature Coming Soon!", 
      body: "Grade calculator for target CGPA will be available in the next update." 
    });
  };

  const handleViewTrends = () => {
    setAlertMessage({ 
      title: "Trends Available!", 
      body: "Check out the SGPA trend chart and grade distribution below!" 
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
      body: `${achievement}\nCurrent CGPA: ${cgpa}` 
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
        Start Your Academic Journey
      </motion.h3>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto"
      >
        Track your grades, monitor your progress, and achieve your academic goals with our advanced CGPA tracker.
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
        Add Your First Semester
      </motion.button>
    </motion.div>
  );

  const modalInputStyle = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-900 dark:text-white";

  const cgpa = calculateCGPA();
  const totalCredits = totalCreditsCompleted();

  return (
    <>
      <AnimatedBackground />
<<<<<<< HEAD
      <div className="relative bg-transparent min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors duration-500">
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
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
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{confirmState.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">{confirmState.body}</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmState({ show: false, title: '', body: '', onConfirm: null })}
                    className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => { confirmState.onConfirm && confirmState.onConfirm(); setConfirmState({ show: false, title: '', body: '', onConfirm: null }); }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold py-2 px-4 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div id="cgpa-dashboard" className="container mx-auto p-4 sm:p-6 max-w-7xl pb-28">
=======
      <div className="relative bg-transparent min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors">
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
        
        <div id="cgpa-dashboard" className="container mx-auto p-4 sm:p-6 max-w-7xl">
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-center mb-8"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl">
                <GraduationCap className="text-white" size={32} />
              </div>
              <div>
<<<<<<< HEAD
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
=======
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                  CGPA Tracker
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Advanced Academic Performance Monitor</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                className="p-3 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 border border-white/20 dark:border-gray-700/50"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleShareCGPA}
                className="p-3 rounded-full bg-white/20 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/30 dark:hover:bg-gray-700/50 transition-all duration-300 border border-white/20 dark:border-gray-700/50"
              >
                <Share2 size={20} />
              </motion.button>
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
<<<<<<< HEAD
                  gradient="bg-gradient-to-br from-sky-500 to-indigo-600"
=======
                  gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                  delay={0}
                />
                <StatsCard
                  title="Total Credits"
                  value={totalCredits}
                  subtitle="Credits Completed"
                  icon={BookOpen}
<<<<<<< HEAD
                  gradient="bg-gradient-to-br from-indigo-500 to-violet-600"
=======
                  gradient="bg-gradient-to-br from-green-500 to-emerald-600"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                  delay={0.1}
                />
                <StatsCard
                  title="Semesters"
                  value={semesters.length}
                  subtitle="Completed"
                  icon={GraduationCap}
<<<<<<< HEAD
                  gradient="bg-gradient-to-br from-blue-600 to-indigo-700"
=======
                  gradient="bg-gradient-to-br from-purple-500 to-pink-600"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                  delay={0.2}
                />
                <StatsCard
                  title="Average SGPA"
                  value={averageSGPA()}
                  subtitle="Semester Average"
                  icon={Award}
<<<<<<< HEAD
                  gradient="bg-gradient-to-br from-violet-600 to-indigo-700"
=======
                  gradient="bg-gradient-to-br from-orange-500 to-red-600"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
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
                <GoalTracker currentCGPA={cgpa} />
                <ExportOptions semesters={semesters} cgpa={cgpa} totalCredits={totalCredits} />
                <QuickActions
                  onCalculateRequired={handleCalculateRequired}
                  onViewTrends={handleViewTrends}
                  onViewAchievements={handleViewAchievements}
                  onAddSemester={handleAddNewSemester}
                />
              </div>

              {/* Semesters List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="space-y-4"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Your Semesters</h2>
                {semesters.map((semester, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
<<<<<<< HEAD
                    className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/30 dark:border-slate-700/60"
=======
                    className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-white/20 dark:border-gray-700/50"
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                  >
                    <div
                      className="p-6 flex items-center gap-4 cursor-pointer"
                      onClick={() => handleToggleSemester(index)}
                    >
                      <div className="flex-grow">
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{semester.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {semester.subjects.reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0)} Credits • {semester.subjects.length} Subjects
                        </p>
                      </div>
                      <div className="text-center">
<<<<<<< HEAD
                        <p className="font-bold text-3xl bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
=======
                        <p className="font-bold text-3xl bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                          {semester.sgpa}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">SGPA</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleEditSemester(index); }}
                          className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          <Edit size={18} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => { e.stopPropagation(); handleDeleteSemester(index); }}
                          className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          <Trash2 size={18} />
                        </motion.button>
                        <motion.div
                          animate={{ rotate: openSemesterIndex === index ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown size={20} />
                        </motion.div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {openSemesterIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
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
                                  transition={{ duration: 0.3, delay: sIndex * 0.05 }}
                                  className="grid grid-cols-3 gap-4 text-sm items-center py-3 px-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                  <div className="font-medium text-gray-800 dark:text-gray-200">{subject.name}</div>
                                  <div className="text-center text-gray-600 dark:text-gray-300 font-semibold">{subject.credits}</div>
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

        {/* Modal */}
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
                className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md flex flex-col border border-white/20 dark:border-gray-700/50"
                style={{maxHeight: '90vh'}}
              >
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <input
                    type="text"
                    className="text-xl font-bold bg-transparent focus:outline-none w-full text-gray-900 dark:text-white"
                    value={currentSemester?.name}
                    onChange={(e) => setCurrentSemester(prev => ({...prev, name: e.target.value}))}
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

                <div className="p-6 flex-grow overflow-y-auto space-y-4">
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
                            onChange={e => handleSubjectChange(index, 'name', e.target.value)}
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
                              onChange={e => handleSubjectChange(index, 'credits', e.target.value)}
                              className={`${modalInputStyle} text-center`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                              Grade
                            </label>
<<<<<<< HEAD
                            <select
                              value={subject.grade}
                              onChange={e => handleSubjectChange(index, 'grade', e.target.value)}
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
=======
                            <input
                              type="text"
                              placeholder="A+"
                              value={subject.grade}
                              onChange={e => handleSubjectChange(index, 'grade', e.target.value)}
                              className={`${modalInputStyle} text-center uppercase`}
                            />
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
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
                    {isEditing ? 'Update Semester' : 'Save Semester'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

<<<<<<< HEAD
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
=======
        {/* Floating Action Button */}
        {semesters.length > 0 && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddNewSemester}
            className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 z-30 border-4 border-white/20"
          >
            <Plus size={28} />
          </motion.button>
>>>>>>> e03a9f28181cb340a9c14168af2227a872cb5505
        )}
      </div>
    </>
  );
}