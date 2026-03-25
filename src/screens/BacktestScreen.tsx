import React, { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Picker } from '../components/Picker';
import { ResultSummary } from '../components/ResultSummary';
import { TradeList } from '../components/TradeList';
import { useBacktest } from '../hooks/useBacktest';
import { BollingerStrategy } from '../strategies/BollingerStrategy';
import { SmaCrossoverStrategy } from '../strategies/SmaCrossoverStrategy';
import { RsiStrategy } from '../strategies/RsiStrategy';
import { MacdVolumeStrategy } from '../strategies/MacdVolumeStrategy';
import { AtrChannelStrategy } from '../strategies/AtrChannelStrategy';
import { MultiFactorStrategy } from '../strategies/MultiFactorStrategy';
import { TradingStrategy } from '../strategies/TradingStrategy';
import { borderRadius, colors, spacing } from '../theme/tokens';

const SYMBOL_OPTIONS = [
  { label: 'BTC/USDT', value: 'BTCUSDT' },
  { label: 'ETH/USDT', value: 'ETHUSDT' },
  { label: 'SOL/USDT', value: 'SOLUSDT' },
  { label: 'XRP/USDT', value: 'XRPUSDT' },
  { label: 'DOGE/USDT', value: 'DOGEUSDT' },
];

const STRATEGY_OPTIONS = [
  { label: 'Multi-Factor', value: 'multi' },
  { label: 'MACD + Volume', value: 'macd' },
  { label: 'ATR Channel', value: 'atr' },
  { label: 'SMA Crossover', value: 'sma' },
  { label: 'RSI (30/70)', value: 'rsi' },
  { label: 'Bollinger Band', value: 'bollinger' },
];

function createStrategy(key: string): TradingStrategy {
  switch (key) {
    case 'multi':
      return new MultiFactorStrategy();
    case 'macd':
      return new MacdVolumeStrategy();
    case 'atr':
      return new AtrChannelStrategy();
    case 'sma':
      return new SmaCrossoverStrategy();
    case 'rsi':
      return new RsiStrategy();
    case 'bollinger':
      return new BollingerStrategy();
    default:
      return new MultiFactorStrategy();
  }
}

const INTERVAL_OPTIONS = [
  { label: '1분', value: '1' },
  { label: '3분', value: '3' },
  { label: '5분', value: '5' },
  { label: '15분', value: '15' },
  { label: '30분', value: '30' },
  { label: '1시간', value: '60' },
  { label: '4시간', value: '240' },
  { label: '1일', value: 'D' },
];

export function BacktestScreen() {
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setInterval] = useState('3');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialMoney, setInitialMoney] = useState('10000');
  const [strategyKey, setStrategyKey] = useState('multi');

  const { state, runBacktest } = useBacktest();

  const handleRun = () => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const money = parseFloat(initialMoney) || 10000;

    runBacktest({
      symbol,
      interval,
      startTime: start,
      endTime: end,
      initialMoney: money,
      strategy: createStrategy(strategyKey),
    });
  };

  const isLoading = state.status === 'loading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>백테스팅</Text>

        <View style={styles.configSection}>
          <View style={styles.fieldRow}>
            <View style={styles.flexField}>
              <Text style={styles.fieldLabel}>심볼</Text>
              <Picker
                options={SYMBOL_OPTIONS}
                selectedValue={symbol}
                onSelect={setSymbol}
              />
            </View>
            <View style={styles.flexField}>
              <Text style={styles.fieldLabel}>인터벌</Text>
              <Picker
                options={INTERVAL_OPTIONS}
                selectedValue={interval}
                onSelect={setInterval}
              />
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.flexField}>
              <Text style={styles.fieldLabel}>시작일</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={styles.flexField}>
              <Text style={styles.fieldLabel}>종료일</Text>
              <TextInput
                style={styles.input}
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>초기 자본 (USDT)</Text>
            <TextInput
              style={styles.input}
              value={initialMoney}
              onChangeText={setInitialMoney}
              keyboardType="numeric"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>전략</Text>
            <Picker
              options={STRATEGY_OPTIONS}
              selectedValue={strategyKey}
              onSelect={setStrategyKey}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.runButton, isLoading && styles.runButtonDisabled]}
          onPress={handleRun}
          disabled={isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" size="small" />
              <Text style={styles.runButtonText}>{state.message}</Text>
            </View>
          ) : (
            <Text style={styles.runButtonText}>백테스트 실행</Text>
          )}
        </TouchableOpacity>

        {state.status === 'error' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}

        {state.status === 'success' && (
          <>
            <View style={styles.resultSection}>
              <ResultSummary result={state.result} />
            </View>
            <TradeList trades={state.result.trades} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  configSection: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  flexField: {
    flex: 1,
    gap: spacing.xs,
  },
  field: {
    gap: spacing.xs,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputDisabled: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  runButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.button,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  runButtonDisabled: {
    opacity: 0.5,
  },
  runButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorBox: {
    backgroundColor: 'rgba(248, 81, 73, 0.1)',
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.loss,
    textAlign: 'center',
  },
  resultSection: {
    marginBottom: spacing.sm,
  },
});
