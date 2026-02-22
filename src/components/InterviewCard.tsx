import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InterviewCardProps {
  question: string;
  answer: string;
  codeSnippet?: string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({ question, answer, codeSnippet }) => {
  const [isAnswerVisible, setIsAnswerVisible] = React.useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">{question}</h3>
      <AnimatePresence>
        {isAnswerVisible ? (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <p className="text-white/80">{answer}</p>
            {codeSnippet && (
              <pre className="bg-slate-background p-4 rounded-md mt-4 text-white/90 overflow-x-auto">
                <code>{codeSnippet}</code>
              </pre>
            )}
          </motion.div>
        ) : (
          <motion.button
            onClick={() => setIsAnswerVisible(true)}
            className="relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-medium text-white transition duration-300 ease-out border-2 border-electric-emerald rounded-full shadow-md group"
            whileHover={{ scale: 1.05 }}
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-electric-emerald to-cobalt-blue opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative">Reveal Answer</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewCard;
