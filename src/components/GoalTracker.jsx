import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Award } from 'lucide-react';

const GoalTracker = ({ currentCGPA }) => {
  const [targetCGPA, setTargetCGPA] = useState('');
  const [savedGoal, setSavedGoal] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('cgpa_goal');
    if (saved) {
      setSavedGoal(parseFloat(saved));
      setTargetCGPA(saved);
    }
  }, []);

  const handleSaveGoal = () => {
    const goal = parseFloat(targetCGPA);
    if (goal >= 0 && goal <= 10) {
      setSavedGoal(goal);
      localStorage.setItem('cgpa_goal', goal.toString());
    }
  };

  const progress = savedGoal ? Math.min((parseFloat(currentCGPA) / savedGoal) * 100, 100) : 0;
  const isGoalAchieved = savedGoal && parseFloat(currentCGPA) >= savedGoal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
          <Target className="text-white" size={20} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">CGPA Goal</h3>
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
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleSaveGoal}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium"
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
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}
              />
            </div>

            {isGoalAchieved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"
              >
                <Award className="text-green-600 dark:text-green-400" size={20} />
                <span className="text-green-800 dark:text-green-300 font-medium">
                  🎉 Goal Achieved! Congratulations!
                </span>
              </motion.div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <TrendingUp size={16} />
              <span>
                {savedGoal > parseFloat(currentCGPA) 
                  ? `${(savedGoal - parseFloat(currentCGPA)).toFixed(2)} points to go!`
                  : 'You\'ve exceeded your goal!'
                }
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default GoalTracker;