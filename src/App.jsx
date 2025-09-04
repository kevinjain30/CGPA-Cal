import React, { useState, useEffect, useCallback } from 'react';

// --- Grade to Point Mapping ---
const gradePoints = {
  'O': 10,
  'A+': 10,
  'A': 9,
  'B+': 8,
  'B': 7,
  'C': 6,
  'P': 5,
  'F': 0,
  'Fail': 0,
};

// --- Helper Functions ---
const getRandomColor = () => {
    const colors = ['#4A90E2', '#50E3C2', '#B8E986', '#F5A623', '#F8E71C', '#E57373', '#BA68C8'];
    return colors[Math.floor(Math.random() * colors.length)];
};

// --- Custom Alert Component ---
const CustomAlert = ({ message, onClose }) => {
  if (!message) return null;
  return (
    <div style={styles.alertOverlay}>
      <div style={styles.alertBox}>
        <p style={styles.alertMessage}>{message.title}</p>
        <p style={styles.alertSubMessage}>{message.body}</p>
        <button onClick={onClose} style={styles.alertButton}>OK</button>
      </div>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [semesters, setSemesters] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSemester, setCurrentSemester] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [alertMessage, setAlertMessage] = useState(null);

  // --- Data Persistence ---
  useEffect(() => {
    try {
      const jsonValue = localStorage.getItem('@semesters_data');
      if (jsonValue !== null) {
        setSemesters(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Failed to load data from storage", e);
    }
  }, []);

  useEffect(() => {
    try {
      if (semesters.length > 0) { // Only save if there's data
          const jsonValue = JSON.stringify(semesters);
          localStorage.setItem('@semesters_data', jsonValue);
      } else { // If semesters are cleared, clear storage too
          const storedData = localStorage.getItem('@semesters_data');
          if(storedData) localStorage.removeItem('@semesters_data');
      }
    } catch (e) {
      console.error("Failed to save data to storage", e);
    }
  }, [semesters]);

  // --- Calculation Logic ---
  const calculateSGPA = useCallback((subjects) => {
    if (!subjects || subjects.length === 0) return '0.00';
    let totalPoints = 0;
    let totalCredits = 0;
    subjects.forEach(subject => {
      const credits = parseFloat(subject.credits);
      const grade = subject.grade.toUpperCase();
      const point = gradePoints[grade] || 0;
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
        const point = gradePoints[subject.grade.toUpperCase()] || 0;
        if (!isNaN(credits) && credits > 0) {
          grandTotalPoints += credits * point;
          grandTotalCredits += credits;
        }
      });
    });
    return grandTotalCredits === 0 ? '0.00' : (grandTotalPoints / grandTotalCredits).toFixed(2);
  }, [semesters]);

  // --- Handlers for Semester Operations ---
  const handleAddNewSemester = () => {
    setCurrentSemester({
      name: `Semester ${semesters.length + 1}`,
      subjects: [{ name: '', credits: '', grade: '' }],
      sgpa: '0.00',
      color: getRandomColor(),
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleEditSemester = (index) => {
    setCurrentSemester(JSON.parse(JSON.stringify(semesters[index]))); // Deep copy
    setIsEditing(true);
    setEditIndex(index);
    setModalVisible(true);
  };

  const handleSaveSemester = () => {
    if (currentSemester.subjects.some(s => !s.name || !s.credits || !s.grade)) {
      setAlertMessage({title: "Incomplete Fields", body: "Please fill in all details for each subject."});
      return;
    }
    
    const updatedSemester = { ...currentSemester, sgpa: calculateSGPA(currentSemester.subjects) };

    let newSemesters;
    if (isEditing) {
      newSemesters = [...semesters];
      newSemesters[editIndex] = updatedSemester;
    } else {
      newSemesters = [...semesters, updatedSemester];
    }
    
    setSemesters(newSemesters);
    setModalVisible(false);
    setCurrentSemester(null);
    setEditIndex(null);
  };
  
  const handleDeleteSemester = (index) => {
    if (window.confirm(`Are you sure you want to delete ${semesters[index].name}? This action cannot be undone.`)) {
        const newSemesters = semesters.filter((_, i) => i !== index);
        setSemesters(newSemesters);
    }
  };
  
  // --- Handlers for Subject Operations within the Modal ---
  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...currentSemester.subjects];
    newSubjects[index][field] = value;
    setCurrentSemester({ ...currentSemester, subjects: newSubjects });
  };
  
  const handleAddSubject = () => {
    const newSubjects = [...currentSemester.subjects, { name: '', credits: '', grade: '' }];
    setCurrentSemester({ ...currentSemester, subjects: newSubjects });
  };
  
  const handleDeleteSubject = (index) => {
    if (currentSemester.subjects.length > 1) {
      const newSubjects = currentSemester.subjects.filter((_, i) => i !== index);
      setCurrentSemester({ ...currentSemester, subjects: newSubjects });
    } else {
      setAlertMessage({title: "Cannot Delete", body: "You must have at least one subject."});
    }
  };

  // --- Render Functions ---
  const renderSemesterList = () => (
    <div style={styles.semesterList}>
      {semesters.map((semester, index) => (
        <div key={index} style={{ ...styles.semesterCard, borderLeft: `5px solid ${semester.color}` }}>
          <div style={styles.semesterInfo}>
            <p style={styles.semesterTitle}>{semester.name}</p>
            <p style={styles.semesterCredits}>
              {semester.subjects.reduce((acc, s) => acc + (parseFloat(s.credits) || 0), 0)} Credits
            </p>
          </div>
          <div style={styles.semesterSGPAContainer}>
            <p style={styles.sgpaValue}>{semester.sgpa}</p>
            <p style={styles.sgpaLabel}>SGPA</p>
          </div>
          <div style={styles.semesterActions}>
            <button onClick={() => handleEditSemester(index)} style={styles.actionButton}>
              <span style={styles.actionButtonText}>EDIT</span>
            </button>
            <button onClick={() => handleDeleteSemester(index)} style={styles.actionButton}>
              <span style={{...styles.actionButtonText, ...styles.deleteButtonText}}>DELETE</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderModal = () => {
    if (!modalVisible) return null;
    return (
      <div style={styles.centeredView}>
        <div style={styles.modalView}>
          <input
              type="text"
              style={styles.modalTitle}
              value={currentSemester?.name}
              onChange={(e) => setCurrentSemester({...currentSemester, name: e.target.value})}
          />
          <div style={styles.subjectHeader}>
            <p style={{ ...styles.headerText, flex: 3 }}>Subject Name</p>
            <p style={{ ...styles.headerText, flex: 1.5, textAlign: 'center' }}>Credits</p>
            <p style={{ ...styles.headerText, flex: 1.5, textAlign: 'center' }}>Grade</p>
            <div style={{width: 30}} />
          </div>
          <div style={styles.modalScrollView}>
            {currentSemester?.subjects.map((subject, index) => (
              <div key={index} style={styles.subjectRow}>
                <input
                  style={{...styles.input, flex: 3}}
                  placeholder="e.g., Data Structures"
                  value={subject.name}
                  onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                />
                <input
                  style={{...styles.input, flex: 1.5, textAlign: 'center'}}
                  placeholder="e.g., 4"
                  type="number"
                  value={String(subject.credits)}
                  onChange={(e) => handleSubjectChange(index, 'credits', e.target.value)}
                />
                <input
                  style={{...styles.input, flex: 1.5, textAlign: 'center', textTransform: 'uppercase'}}
                  placeholder="e.g., A+"
                  value={subject.grade}
                  onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                />
                <button onClick={() => handleDeleteSubject(index)} style={styles.deleteSubjectButton}>
                    <span style={styles.deleteSubjectText}>✕</span>
                </button>
              </div>
            ))}
          </div>
          <button style={styles.addButton} onClick={handleAddSubject}>
            <span style={styles.addButtonText}>+ Add Subject</span>
          </button>
          <div style={styles.modalActions}>
            <button
              style={{...styles.button, ...styles.buttonClose}}
              onClick={() => setModalVisible(false)}
            >
              <span style={styles.textStyle}>Cancel</span>
            </button>
            <button
              style={{...styles.button, ...styles.buttonSave}}
              onClick={handleSaveSemester}
            >
              <span style={styles.textStyle}>Save</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <CustomAlert message={alertMessage} onClose={() => setAlertMessage(null)} />
      {renderModal()}
      <header style={styles.header}>
        <h1 style={styles.title}>CGPA Tracker</h1>
        <div style={styles.cgpaContainer}>
          <p style={styles.cgpaValue}>{calculateCGPA()}</p>
          <p style={styles.cgpaLabel}>Overall CGPA</p>
        </div>
      </header>
      <main style={{flex: 1, overflowY: 'auto'}}>
          {semesters.length > 0 ? (
            renderSemesterList()
          ) : (
            <div style={styles.emptyStateContainer}>
                <p style={styles.emptyStateText}>No semesters yet.</p>
                <p style={styles.emptyStateSubText}>Tap the '+' button to add your first semester!</p>
            </div>
          )}
      </main>
      <button style={styles.fab} onClick={handleAddNewSemester}>
        <span style={styles.fabIcon}>+</span>
      </button>
    </div>
  );
};

// --- Styles (as a JS object for inline styling) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#121212',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    padding: '30px 20px 20px 20px',
    backgroundColor: '#1e1e1e',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  cgpaContainer: {
    textAlign: 'center',
    backgroundColor: '#4A90E2',
    padding: '8px 15px',
    borderRadius: 12,
  },
  cgpaValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  cgpaLabel: {
    fontSize: 12,
    color: '#e0e0e0',
    fontWeight: '600',
    margin: 0,
  },
  semesterList: {
    padding: 15,
  },
  semesterCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  semesterInfo: {
    flex: 1,
  },
  semesterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    margin: 0,
  },
  semesterCredits: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
    margin: 0,
  },
  semesterSGPAContainer: {
    textAlign: 'center',
    padding: '0 20px',
  },
  sgpaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#50E3C2',
    margin: 0,
  },
  sgpaLabel: {
    fontSize: 12,
    color: '#aaa',
    margin: 0,
  },
  semesterActions: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10,
  },
  actionButton: {
    padding: '5px 0',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  deleteButtonText: {
    color: '#E57373',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#4A90E2',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    border: 'none',
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    cursor: 'pointer',
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    lineHeight: '30px',
  },
  emptyStateContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    textAlign: 'center'
  },
  emptyStateText: {
    fontSize: 18,
    color: '#aaa',
    margin: 0,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    margin: 0,
  },
  // Modal styles
  centeredView: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
  },
  modalView: {
    width: '100%',
    maxWidth: '600px', // Max-width for larger screens
    height: '85%',
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  modalScrollView: {
    flex: 1,
    overflowY: 'auto',
    margin: '10px 0'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    border: 'none',
    background: 'none',
    borderBottom: '1px solid #444',
    paddingBottom: 10,
    marginBottom: 20,
    width: '100%',
  },
  subjectHeader: {
    display: 'flex',
    marginBottom: 10,
    padding: '0 5px',
  },
  headerText: {
    color: '#aaa',
    fontWeight: 'bold',
    margin: 0,
  },
  subjectRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    borderRadius: 8,
    padding: '12px 15px',
    marginRight: 8,
    fontSize: 16,
    border: '1px solid #555',
  },
  deleteSubjectButton: {
    width: 30,
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  },
  deleteSubjectText: {
    color: '#E57373',
    fontSize: 22,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: 'rgba(74, 144, 226, 0.2)',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    border: '1px dashed #4A90E2',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box'
  },
  addButtonText: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  button: {
    borderRadius: 10,
    padding: 12,
    flex: 1,
    textAlign: 'center',
    border: 'none',
    cursor: 'pointer',
  },
  buttonSave: {
    backgroundColor: '#4A90E2',
    marginLeft: 10,
  },
  buttonClose: {
    backgroundColor: '#555',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Custom Alert Styles
  alertOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  alertBox: {
    backgroundColor: '#2a2a2a',
    padding: '20px 30px',
    borderRadius: 12,
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    textAlign: 'center',
    maxWidth: '80%',
    border: '1px solid #444',
  },
  alertMessage: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  alertSubMessage: {
    margin: '10px 0 20px 0',
    fontSize: '14px',
    color: '#ccc',
  },
  alertButton: {
    backgroundColor: '#4A90E2',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 25px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
};

export default App;

