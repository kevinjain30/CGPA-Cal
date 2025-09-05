import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const GradeDistribution = ({ semesters }) => {
  const gradeDistribution = useMemo(() => {
    const distribution = {};
    const gradeColors = {
      'O': '#10B981', 'A+': '#059669', 'A': '#3B82F6',
      'B+': '#6366F1', 'B': '#8B5CF6', 'C': '#EC4899',
      'D': '#F59E0B', 'E': '#EF4444', 'P': '#6B7280', 'F': '#374151'
    };
    
    semesters.forEach(semester => {
      semester.subjects.forEach(subject => {
        const grade = subject.grade.toUpperCase();
        distribution[grade] = (distribution[grade] || 0) + 1;
      });
    });
    
    return Object.entries(distribution)
      .map(([grade, count]) => ({
        grade,
        count,
        color: gradeColors[grade] || '#6B7280'
      }))
      .sort((a, b) => b.count - a.count);
  }, [semesters]);

  const totalSubjects = gradeDistribution.reduce((sum, item) => sum + item.count, 0);

  if (totalSubjects === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Grade Distribution</h3>
      
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
                  {item.count} subject{item.count !== 1 ? 's' : ''}
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

export default GradeDistribution;