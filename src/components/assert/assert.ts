import { useEffect } from 'react';

export default function assert(test: boolean, message?: string | undefined) {
  if (!test) throw new Error('Assertion Failure: ' + (message ?? 'No message provided.'));
}

export function useAssertion(assertion: boolean, message: string, dependencies: any[]) {
  useEffect(() => {
    assert(assertion, message);
  }, [assertion, message, dependencies]);
}
