import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit, Save, X, Share2, Sun, Moon, ChevronDown } from 'lucide-react';

// --- Grade to Point Mapping (CORRECTED) ---
const gradePoints = {
  'O': 10,
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 8,
  'C': 7,
  'D': 6, // Added D grade
  'E': 5, // Added E grade
  'P': 5,
  'F': 0,
  'FAIL': 0,
};

// --- Custom Alert Component ---
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl w-full max-w-sm text-center transform transition-all duration-300 scale-100"
      >
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{message.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 mb-6">{message.body}</p>
        <button onClick={onClose} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg w-full hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
          OK
        </button>
      </div>
    </div>
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
      const grade = subject.grade.toUpperCase();
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
          const point = gradePoints[subject.grade.toUpperCase()] || 0;
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
    setSemesters(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleToggleSemester = (index) => {
    setOpenSemesterIndex(openSemesterIndex === index ? null : index);
  };


  // --- Handlers for Subject Operations within the Modal ---
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...currentSemester.subjects];
    newSubjects[index][field] = value;
    setCurrentSemester({ ...currentSemester, subjects: newSubjects });
  };

  const handleAddSubject = () => {
    setCurrentSemester(prev => ({...prev, subjects: [...prev.subjects, { name: '', credits: '', grade: '' }]}));
  };

  const handleDeleteSubject = (index) => {
    if (currentSemester.subjects.length > 1) {
      setCurrentSemester(prev => ({...prev, subjects: prev.subjects.filter((_, i) => i !== index)}));
    } else {
      setAlertMessage({ title: "Action Not Allowed", body: "A semester must have at least one subject." });
    }
  };

  const handleShareCGPA = () => {
    const cgpa = calculateCGPA();
    const shareText = `Hey! I'm tracking my academic progress and my current CGPA is ${cgpa}.`;
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

  const EmptyState = () => (
    <div className="text-center py-20 px-6">
       <svg className="mx-auto h-24 w-24 text-gray-300 dark:text-gray-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm3-1a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V6a1 1 0 00-1-1H6zm1.5 8.707a.5.5 0 01.707 0L9.5 15.086l2.793-2.793a.5.5 0 01.707 0l3.5 3.5a.5.5 0 01-.707.707L13 13.586l-2.793 2.793a.5.5 0 01-.707 0L7.207 14.5a.5.5 0 010-.707z" clipRule="evenodd" />
      </svg>
      <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">No Semesters Added</h3>
      <p className="mt-2 text-md text-gray-500 dark:text-gray-400">Get started by adding your first semester's results.</p>
      <button onClick={handleAddNewSemester} className="mt-6 inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400">
        <Plus size={20} /> Add First Semester
      </button>
    </div>
  );

  const modalInputStyle = "w-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-900 dark:text-white";

  return (
    <>
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen font-sans text-gray-800 dark:text-gray-200 transition-colors">
        <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
        <div className="container mx-auto p-4 sm:p-6 max-w-4xl">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">CGPA Tracker</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
               <button onClick={handleShareCGPA} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Share2 size={20} /></button>
            </div>
          </header>

          <div
            className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg text-white mb-6 transform transition-all duration-300"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80 uppercase font-semibold">Overall CGPA</p>
                <p className="text-5xl font-bold tracking-tight">{calculateCGPA()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80 uppercase font-semibold">Total Credits</p>
                <p className="text-3xl font-bold">{totalCreditsCompleted()}</p>
              </div>
            </div>
          </div>

          {semesters.length > 0 ? (
            <div className="space-y-4">
                {semesters.map((semester, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-all duration-300">
                    <div
                      className="p-5 flex items-center gap-4 cursor-pointer"
                      onClick={() => handleToggleSemester(index)}
                    >
                      <div className="flex-grow">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{semester.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {semester.subjects.reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0)} Credits
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-2xl text-indigo-500 dark:text-indigo-400">{semester.sgpa}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">SGPA</p>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button onClick={(e) => { e.stopPropagation(); handleEditSemester(index); }} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><Edit size={18} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteSemester(index); }} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"><Trash2 size={18} /></button>
                        <ChevronDown className={`transform transition-transform duration-300 ${openSemesterIndex === index ? 'rotate-180' : ''}`} size={20} />
                      </div>
                    </div>
                    {openSemesterIndex === index && (
                      <div className="px-5 pb-5">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 px-2">
                            <div className="col-span-1">Subject</div>
                            <div className="text-center">Credits</div>
                            <div className="text-center">Grade</div>
                          </div>
                          {semester.subjects.map((subject, sIndex) => (
                            <div key={sIndex} className="grid grid-cols-3 gap-2 text-sm items-center py-2 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <div className="col-span-1 font-medium text-gray-800 dark:text-gray-200">{subject.name}</div>
                              <div className="text-center text-gray-600 dark:text-gray-300">{subject.credits}</div>
                              <div className="text-center font-semibold text-indigo-500 dark:text-indigo-400">{subject.grade.toUpperCase()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

          {modalVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
              <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md flex flex-col transform transition-all duration-300"
                style={{maxHeight: '90vh'}}
              >
                <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <input
                    type="text"
                    className="text-lg font-bold bg-transparent focus:outline-none w-full text-gray-900 dark:text-white"
                    value={currentSemester?.name}
                    onChange={(e) => setCurrentSemester(prev => ({...prev, name: e.target.value}))}
                  />
                  <button onClick={() => setModalVisible(false)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"><X size={20} /></button>
                </div>

                <div className="p-5 flex-grow overflow-y-auto space-y-4">
                    {currentSemester?.subjects.map((subject, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg relative transform transition-all duration-300"
                      >
                         <button onClick={() => handleDeleteSubject(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <div className="space-y-3">
                          <div>
                             <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Subject Name</label>
                             <input type="text" placeholder="e.g., Physics" value={subject.name} onChange={e => handleSubjectChange(index, 'name', e.target.value)} className={modalInputStyle} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                             <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Credits</label>
                                <input type="number" placeholder="e.g., 4" value={subject.credits} onChange={e => handleSubjectChange(index, 'credits', e.target.value)} className={`${modalInputStyle} text-center`} />
                             </div>
                             <div>
                                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Grade</label>
                                <input type="text" placeholder="e.g., A+" value={subject.grade} onChange={e => handleSubjectChange(index, 'grade', e.target.value)} className={`${modalInputStyle} text-center uppercase`} />
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                <div className="p-5 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <button onClick={handleAddSubject} className="w-full text-center py-2.5 bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 font-semibold rounded-lg transition-colors text-sm">
                    + Add Another Subject
                  </button>
                  <button onClick={handleSaveSemester} className="w-full text-center py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Save size={18} /> {isEditing ? 'Update Semester' : 'Save Semester'}
                  </button>
                </div>
              </div>
            </div>
          )}

        {semesters.length > 0 && (
           <button
            onClick={handleAddNewSemester}
            className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 z-30"
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </>
  );
}

