import React from 'react';
import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, icon: Icon, gradient, delay = 0 }) => {
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
            <p className="text-sm font-medium opacity-90 uppercase tracking-wide">{title}</p>
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

export default StatsCard;