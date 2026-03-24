import {useState, useCallback} from 'react';
import {BacktestResult} from '../models/BacktestResult';
import {BacktestEngine} from '../engine/BacktestEngine';
import {BybitApi} from '../api/BybitApi';
import {TradingStrategy} from '../strategies/TradingStrategy';

export type BacktestState =
  | {status: 'idle'}
  | {status: 'loading'; message: string}
  | {status: 'success'; result: BacktestResult}
  | {status: 'error'; error: string};

export interface BacktestParams {
  symbol: string;
  interval: string;
  startTime: number;
  endTime: number;
  initialMoney: number;
  strategy: TradingStrategy;
}

export function useBacktest() {
  const [state, setState] = useState<BacktestState>({status: 'idle'});

  const runBacktest = useCallback(async (params: BacktestParams) => {
    try {
      setState({status: 'loading', message: '데이터를 불러오는 중...'});

      const prices = await BybitApi.fetchAllKlines({
        symbol: params.symbol,
        interval: params.interval,
        start: params.startTime,
        end: params.endTime,
      });

      if (prices.length === 0) {
        setState({status: 'error', error: '해당 기간의 데이터가 없습니다.'});
        return;
      }

      setState({status: 'loading', message: '전략을 실행하는 중...'});

      const engine = new BacktestEngine();
      const result = engine.run(
        {
          strategy: params.strategy,
          initialMoney: params.initialMoney,
        },
        prices,
      );

      setState({status: 'success', result});
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setState({status: 'error', error: message});
    }
  }, []);

  const reset = useCallback(() => {
    setState({status: 'idle'});
  }, []);

  return {state, runBacktest, reset};
}
