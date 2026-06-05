import { useState, useEffect, useRef, useCallback } from 'react';

export function useOTP({
  length = 6,
  initialTimerSeconds = 30,
  onComplete,
} = {}) {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const [activeInput, setActiveInput] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(initialTimerSeconds);
  const [canResend, setCanResend] = useState(false);
  const timerRef = useRef(null);
  const inputRefs = useRef([]);

  const startTimer = useCallback(() => {
    setTimerSeconds(initialTimerSeconds);
    setCanResend(false);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialTimerSeconds]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleResend = useCallback(() => {
    if (!canResend) return;
    setOtp(Array(length).fill(''));
    setActiveInput(0);
    startTimer();
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [canResend, length, startTimer]);

  const changeValueAt = (index, val) => {
    const sanitizedVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = sanitizedVal;
    setOtp(newOtp);

    const completeOtp = newOtp.join('');
    if (completeOtp.length === length && onComplete) {
      onComplete(completeOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index] !== '') {
        changeValueAt(index, '');
      } else if (index > 0) {
        changeValueAt(index - 1, '');
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (index > 0) {
        setActiveInput(index - 1);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (index < length - 1) {
        setActiveInput(index + 1);
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleChange = (index, value) => {
    changeValueAt(index, value);

    if (value !== '' && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, length);
    
    if (pastedData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < length; i++) {
      if (pastedData[i]) {
        newOtp[i] = pastedData[i];
      }
    }
    setOtp(newOtp);

    const completeOtp = newOtp.join('');
    if (completeOtp.length === length) {
      if (onComplete) {
        onComplete(completeOtp);
      }
      setActiveInput(length - 1);
      inputRefs.current[length - 1]?.focus();
    } else {
      const nextIndex = Math.min(pastedData.length, length - 1);
      setActiveInput(nextIndex);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const resetOtp = () => {
    setOtp(Array(length).fill(''));
    setActiveInput(0);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  };

  return {
    otp,
    activeInput,
    setActiveInput,
    timerSeconds,
    canResend,
    inputRefs,
    handleKeyDown,
    handleChange,
    handlePaste,
    handleResend,
    resetOtp,
    startTimer,
  };
}
