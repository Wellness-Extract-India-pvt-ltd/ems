import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTimeTrackingStatus } from '../../store/slices/timeTrackingSlice';
import { Clock } from 'lucide-react';

const HeaderTimer = () => {
  const dispatch = useDispatch();
  const { status, currentSession } = useSelector((state) => state.timeTracking);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    // Fetch initial status
    dispatch(getTimeTrackingStatus());
  }, [dispatch]);

  useEffect(() => {
    let interval;
    if (status === 'checked_in' && currentSession?.checkInTime) {
      const startTime = new Date(currentSession.checkInTime);
      
      const updateTimer = () => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status, currentSession?.checkInTime]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secondsRemainder = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondsRemainder.toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Don't show timer if not checked in
  if (status !== 'checked_in' || !currentSession) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-green-600" />
        <div className="text-sm">
          <div className="text-green-700 font-semibold">Current Session</div>
          <div className="text-green-600 text-xs">
            Started at {formatTime(currentSession.checkInTime)}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-mono font-bold text-green-800">
          {formatDuration(elapsedTime)}
        </div>
        <div className="text-xs text-green-600">Elapsed</div>
      </div>
    </div>
  );
};

export default HeaderTimer;
