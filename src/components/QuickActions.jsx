import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Award, BookOpen } from 'lucide-react';

const QuickActions = ({ onCalculateRequired, onViewTrends, onViewAchievements, onAddSemester }) => {
  const actions = [
    {
      icon: Calculator,
      label: 'Calculate Required',
      description: 'Find grades needed for target CGPA',
      color: 'from-blue-500 to-cyan-500',
      onClick: onCalculateRequired
    },
    {
      icon: TrendingUp,
      label: 'View Trends',
      description: 'Analyze your performance',
      color: 'from-green-500 to-emerald-500',
      onClick: onViewTrends
    },
    {
      icon: Award,
      label: 'Achievements',
      description: 'View your milestones',
      color: 'from-yellow-500 to-orange-500',
      onClick: onViewAchievements
    },
    {
      icon: BookOpen,
      label: 'Add Semester',
      description: 'Record new semester',
      color: 'from-purple-500 to-pink-500',
      onClick: onAddSemester
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h3>
      
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
              <action.icon size={24} className="group-hover:scale-110 transition-transform duration-300" />
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

export default QuickActions;