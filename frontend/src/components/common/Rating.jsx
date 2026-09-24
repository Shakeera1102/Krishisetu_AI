import React from 'react';
import { Star } from 'lucide-react';

export const Rating = ({ score = 4.5 }) => {
  return (
    <div className="flex items-center gap-1 text-amber-400 font-semibold text-xs">
      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      <span>{score.toFixed(1)}</span>
    </div>
  );
};

export default Rating;
