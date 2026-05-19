import { useState, useCallback } from 'react';
import { detectFileType, validateFile } from '../utils/file/detectFileType';
import { processDocument } from '../utils/file/documentProcessor';
import { processImageForVerification } from '../utils/imageVerificationProcessor';

const useVerificationProcessing = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const reset = useCallback(() => {
    setLoading(false);
    setProgress({ stage: '', percent: 0 });
    setResult(null);
    setError(null);
  }, []);

  const processFile = useCallback(async (file) => {
    reset();
    
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const { type } = detectFileType(file);
      let payload;

      const handleProgress = (stage, percent) => {
        setProgress({ stage, percent });
      };

      if (type === 'PDF') {
        payload = await processDocument(file, handleProgress);
      } else if (type === 'IMAGE') {
        payload = await processImageForVerification(file, handleProgress);
      } else {
        throw new Error('Unsupported file type for verification.');
      }

      setResult({
        ...payload,
        fileType: type
      });
      setProgress({ stage: 'Processing complete', percent: 100 });
    } catch (err) {
      setError(err.message || 'Processing failed.');
      setProgress({ stage: 'Processing failed', percent: 0 });
    } finally {
      setLoading(false);
    }
  }, [reset]);

  return {
    processFile,
    loading,
    progress,
    result,
    error,
    reset,
  };
};

export default useVerificationProcessing;
