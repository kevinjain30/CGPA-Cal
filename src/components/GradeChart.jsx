import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const GradeChart = ({ semesters }) => {
  const chartData = useMemo(() => {
    return semesters.map((sem, index) => ({
      semester: sem.name,
      sgpa: parseFloat(sem.sgpa),
      index
    }));
  }, [semesters]);

  const maxSGPA = 10;
  const minSGPA = Math.min(...chartData.map(d => d.sgpa), 0);

  if (chartData.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">SGPA Trend</h3>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid lines */}
          {[0, 2, 4, 6, 8, 10].map(value => (
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
          
          {/* Chart line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            d={`M ${chartData.map((point, index) => 
              `${50 + (index * (300 / Math.max(chartData.length - 1, 1)))},${180 - (point.sgpa / maxSGPA) * 160}`
            ).join(' L ')}`}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          
          {/* Data points */}
          {chartData.map((point, index) => (
            <motion.circle
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              cx={50 + (index * (300 / Math.max(chartData.length - 1, 1)))}
              cy={180 - (point.sgpa / maxSGPA) * 160}
              r="6"
              fill="url(#gradient)"
              className="drop-shadow-lg"
            />
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-4 px-12">
          {chartData.map((point, index) => (
            <span key={index} className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-left">
              {point.semester}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default GradeChart;