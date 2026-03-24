/**
 * BybitTrading - Backtesting App
 *
 * @format
 */

import {StatusBar} from 'react-native';
import {BacktestScreen} from './src/screens/BacktestScreen';

function App() {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <BacktestScreen />
    </>
  );
}

export default App;
