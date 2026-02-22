import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DualLanguageToggle = () => {
  const [language, setLanguage] = useState('en');

  return (
    <div className="relative flex w-40 h-10 bg-slate-background rounded-full p-1">
      <motion.div
        className="absolute top-1 left-1 w-1/2 h-8 bg-cobalt-blue rounded-full"
        animate={{ x: language === 'en' ? 0 : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      />
      <button
        onClick={() => setLanguage('am')}
        className={`relative z-10 w-1/2 h-full rounded-full text-sm font-medium ${language === 'am' ? 'text-white' : 'text-white/50'}`}>
        ARM
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`relative z-10 w-1/2 h-full rounded-full text-sm font-medium ${language === 'en' ? 'text-white' : 'text-white/50'}`}>
        ENG
      </button>
    </div>
  );
};

export default DualLanguageToggle;
