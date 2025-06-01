import { useState, useEffect } from 'react';
import { DNAModel } from '../models/dnaModel';

export function useDNAModel() {
  const [model, setModel] = useState<DNAModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeModel() {
      try {
        const dnaModel = new DNAModel();
        await dnaModel.initialize();
        
        if (mounted) {
          setModel(dnaModel);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize model');
          setIsLoading(false);
        }
      }
    }

    initializeModel();

    return () => {
      mounted = false;
      if (model) {
        model.dispose();
      }
    };
  }, []);

  return { model, isLoading, error };
}