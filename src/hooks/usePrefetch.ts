import {useState, useCallback} from 'react';
import {KlineRepository, FetchProgress} from '../data/KlineRepository';

export type PrefetchState =
  | {status: 'idle'}
  | {status: 'loading'; progress: FetchProgress}
  | {status: 'done'; progress: FetchProgress}
  | {status: 'error'; error: string};

export interface PrefetchParams {
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
}

export function usePrefetch() {
  const [state, setState] = useState<PrefetchState>({status: 'idle'});

  const prefetch = useCallback(async (params: PrefetchParams) => {
    try {
      setState({
        status: 'loading',
        progress: {loaded: 0, estimated: 0, percent: 0, message: '준비 중...', fromCache: false},
      });

      await KlineRepository.getKlines(
        params.symbol,
        params.interval,
        params.startTime,
        params.endTime,
        progress => {
          if (progress.percent >= 100) {
            setState({status: 'done', progress});
          } else {
            setState({status: 'loading', progress});
          }
        },
      );

      // Ensure final state is 'done'
      setState(prev => {
        if (prev.status === 'loading') {
          return {status: 'done', progress: (prev as any).progress};
        }
        return prev;
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : '데이터 로드 실패';
      setState({status: 'error', error: message});
    }
  }, []);

  const reset = useCallback(() => setState({status: 'idle'}), []);

  return {state, prefetch, reset};
}
