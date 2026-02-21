import React from 'react';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  color?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({ label, onClick, color = 'purple' }) => {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 rounded-full font-bold text-white shadow ${
        color === 'purple' ? 'bg-purple-500 hover:bg-purple-600' : ''
      } transition`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
