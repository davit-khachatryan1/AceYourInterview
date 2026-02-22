import React from 'react';
import { Aperture, Code, GitBranch } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-white/5 backdrop-blur-lg p-4">
      <h2 className="text-2xl font-bold text-white mb-8">Topics</h2>
      <nav>
        <ul>
          <li className="mb-4">
            <a href="#" className="flex items-center text-white/80 hover:text-white transition-colors duration-200">
              <Aperture className="mr-3" />
              React
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center text-white/80 hover:text-white transition-colors duration-200">
              <Code className="mr-3" />
              JavaScript
            </a>
          </li>
          <li className="mb-4">
            <a href="#" className="flex items-center text-white/80 hover:text-white transition-colors duration-200">
              <GitBranch className="mr-3" />
              System Design
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
