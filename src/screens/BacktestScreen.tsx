import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useBacktest} from '../hooks/useBacktest';
import {ResultSummary} from '../components/ResultSummary';
import {TradeList} from '../components/TradeList';
import {BollingerStrategy} from '../strategies/BollingerStrategy';
import {colors, spacing, borderRadius} from '../theme/tokens';

export function BacktestScreen() {
  const [symbol] = useState('BTCUSDT');
  const [interval] = useState('3');
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2024-12-31');
  const [initialMoney, setInitialMoney] = useState('10000');

  const {state, runBacktest} = useBacktest();

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
      strategy: new BollingerStrategy(),
    });
  };

  const isLoading = state.status === 'loading';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>백테스팅</Text>

        <View style={styles.configSection}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>심볼</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputText}>{symbol}</Text>
            </View>
          </View>

          <View style={styles.fieldRow}>
            <View style={[styles.field, {flex: 1}]}>
              <Text style={styles.fieldLabel}>시작일</Text>
              <TextInput
                style={styles.input}
                value={startDate}
                onChangeText={setStartDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
            <View style={[styles.field, {flex: 1}]}>
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
            <View style={styles.inputDisabled}>
              <Text style={styles.inputText}>Bollinger Band Strategy</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.runButton, isLoading && styles.runButtonDisabled]}
          onPress={handleRun}
          disabled={isLoading}>
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
