import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Clock, MapPin, CheckCircle, XCircle, Play, Square, Pause } from 'lucide-react';
import { checkIn, checkOut, getTimeTrackingStatus } from '../../store/slices/timeTrackingSlice';
import { trackBiometricActivity } from '../../utils/activityTracker';

const TimeTracker = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { status, currentSession, todayHours, loading, error } = useSelector(state => state.timeTracking);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [notes, setNotes] = useState('');
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  // Load initial status
  useEffect(() => {
    dispatch(getTimeTrackingStatus());
  }, [dispatch]);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDuration = (hours) => {
    if (!hours) return '00:00:00';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    const s = Math.floor(((hours - h) * 60 - m) * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const calculateElapsedTime = () => {
    if (!currentSession?.checkInTime) return 0;
    const checkInTime = new Date(currentSession.checkInTime);
    const now = new Date();
    return (now - checkInTime) / (1000 * 60 * 60); // Convert to hours
  };

  const handleCheckIn = async () => {
    setIsCheckingIn(true);
    try {
      console.log('Check-in data being sent:', {
        location,
        notes: notes.trim() || null,
        hasLocation: !!location,
        locationType: typeof location,
        locationKeys: location ? Object.keys(location) : 'null',
        user: user,
        userEmployeeId: user?.employee_id,
        userRole: user?.role
      });
      
      // First try the test endpoint to see if the issue is with validation
      try {
        const testResponse = await fetch('/api/v1/time-tracking/test-checkin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({})
        });
        
        if (testResponse.ok) {
          console.log('Test check-in successful');
        } else {
          console.error('Test check-in failed:', await testResponse.text());
        }
      } catch (testError) {
        console.error('Test check-in error:', testError);
      }
      
      const result = await dispatch(checkIn({
        location,
        notes: notes.trim() || null,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }));

      if (result.type === 'timeTracking/checkIn/fulfilled') {
        // Track activity
        await trackBiometricActivity.checkin(user.employee_id, user.email);
        setNotes('');
      }
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setIsCheckingOut(true);
    try {
      const result = await dispatch(checkOut({
        location,
        notes: notes.trim() || null
      }));

      if (result.type === 'timeTracking/checkOut/fulfilled') {
        // Track activity
        await trackBiometricActivity.checkout(user.employee_id, user.email);
        setNotes('');
      }
    } catch (error) {
      console.error('Check-out failed:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checked_in': return 'text-green-600';
      case 'checked_out': return 'text-red-600';
      case 'on_break': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'checked_in': return <CheckCircle className="h-5 w-5" />;
      case 'checked_out': return <XCircle className="h-5 w-5" />;
      case 'on_break': return <Pause className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checked_in': return 'Checked In';
      case 'checked_out': return 'Checked Out';
      case 'on_break': return 'On Break';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 w-80">
      {/* Header */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-gray-900">Time Tracker</h2>
            <p className="text-xs text-gray-600">Track your work hours</p>
          </div>
          <button
            onClick={status === 'checked_out' ? handleCheckIn : handleCheckOut}
            disabled={isCheckingIn || isCheckingOut}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all duration-200 ${
              status === 'checked_in' 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : status === 'checked_out'
                ? 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isCheckingIn ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : isCheckingOut ? (
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            ) : status === 'checked_in' ? (
              <Square className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
            {isCheckingIn ? 'Checking In...' : isCheckingOut ? 'Checking Out...' : status === 'checked_in' ? 'Check Out' : 'Check In'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2">


        {/* Today's Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded p-1.5 border border-gray-200">
          <div className="grid grid-cols-2 gap-1">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-900">
                {formatDuration(todayHours)}
              </div>
              <div className="text-xs text-gray-600">Today's Hours</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-bold text-orange-600">
                {currentSession?.overtimeHours ? formatDuration(currentSession.overtimeHours) : '00:00:00'}
              </div>
              <div className="text-xs text-gray-600">Overtime</div>
            </div>
          </div>
        </div>



        {/* Error Display */}
        {error && (
          <div className="mt-1 p-1 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center gap-1">
              <XCircle className="h-3 w-3 text-red-600" />
              <div className="text-xs text-red-700 font-medium">{error}</div>
            </div>
          </div>
        )}

        {/* Location Warning */}
        {!location && !locationError && (
          <div className="mt-1 p-1 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-yellow-600" />
              <div className="text-xs text-yellow-700 font-medium">
                Getting location...
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;
