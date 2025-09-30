import React from 'react';

const SummaryCard = ({ title, value, icon, label, breakdowns = [], color }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color.bg} group-hover:scale-110 transition-transform duration-200`}>
          {React.cloneElement(icon, { size: 24, className: 'text-white' })}
        </div>
        {label && (
          <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold">
            {label}
          </span>
        )}
      </div>

      <div className="mt-6">
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        <p className="text-sm font-medium text-gray-600 mb-4">{title}</p>

        {breakdowns.length > 0 && (
          <div className="space-y-2">
            {breakdowns.map((b, i) => (
              <div key={i} className={`flex items-center gap-2 text-sm ${b.color}`}>
                <span className={`w-2 h-2 rounded-full ${b.dot}`}></span>
                <span className="font-medium">{b.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;
