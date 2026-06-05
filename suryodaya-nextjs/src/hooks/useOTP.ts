import { useState, useEffect, useRef, useCallback } from 'react';

interface UseOTPProps {
  length?: number;
  initialTimerSeconds?: number;
  onComplete?: (otp: string) => void;
}

export function useOTP({
  length = 6,
  initialTimerSeconds = 30,
  onComplete,
}: UseOTPProps = {}) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const [activeInput, setActiveInput] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(initialTimerSeconds);
  const [canResend, setCanResend] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Focus shifting logic helper
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown implementation
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

  // Handle value change for an index
  const changeValueAt = (index: number, val: string) => {
    const sanitizedVal = val.replace(/[^0-9]/g, '').slice(-1); // Only keep single digit number
    const newOtp = [...otp];
    newOtp[index] = sanitizedVal;
    setOtp(newOtp);

    // Call onComplete when all values are filled
    const completeOtp = newOtp.join('');
    if (completeOtp.length === length && onComplete) {
      onComplete(completeOtp);
    }
  };

  // Keyboard and focus shift handlers
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      if (otp[index] !== '') {
        // Clear current value
        changeValueAt(index, '');
      } else if (index > 0) {
        // Go back and clear previous value
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

  const handleChange = (index: number, value: string) => {
    changeValueAt(index, value);

    // Shift focus forward if we inserted a number
    if (value !== '' && index < length - 1) {
      setActiveInput(index + 1);
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasted values
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

    // Trigger complete callback if we fully pasted
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
