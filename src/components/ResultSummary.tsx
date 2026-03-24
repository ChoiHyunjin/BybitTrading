import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {BacktestResult} from '../models/BacktestResult';
import {colors, spacing, borderRadius} from '../theme/tokens';

interface Props {
  result: BacktestResult;
}

function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

function ResultCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, {color}]}>{value}</Text>
    </View>
  );
}

export function ResultSummary({result}: Props) {
  const returnColor = result.totalReturn >= 0 ? colors.profit : colors.loss;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <ResultCard
          label="총 수익률"
          value={formatPercent(result.totalReturn)}
          color={returnColor}
        />
        <ResultCard
          label="승률"
          value={`${result.winRate.toFixed(1)}%`}
          color={colors.textPrimary}
        />
      </View>
      <View style={styles.row}>
        <ResultCard
          label="최대 낙폭 (MDD)"
          value={`-${result.maxDrawdown.toFixed(2)}%`}
          color={colors.loss}
        />
        <ResultCard
          label="총 거래 수"
          value={`${result.totalTrades}건`}
          color={colors.textPrimary}
        />
      </View>
      <View style={styles.moneyRow}>
        <Text style={styles.moneyLabel}>
          {result.initialMoney.toLocaleString()} → {result.finalMoney.toLocaleString()} USDT
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.lg,
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  moneyRow: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.md,
    alignItems: 'center',
  },
  moneyLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
