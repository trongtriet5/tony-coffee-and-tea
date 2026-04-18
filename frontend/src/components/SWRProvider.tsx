'use client';
import { SWRConfig } from 'swr';

export function SWRProvider({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 10000,
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        fetcher: (url: string) => fetch(url).then(res => {
          if (!res.ok) throw new Error('Network response was not ok');
          return res.json();
        }),
      }}
    >
      {children}
    </SWRConfig>
  );
}
