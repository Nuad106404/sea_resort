import { useEffect } from 'react';

export function useDocumentTitle(title: string, suffix: string = '') {
  useEffect(() => {
    const fullTitle = suffix ? `${title} - ${suffix}` : title;
    document.title = fullTitle;
  }, [title, suffix]);
}
