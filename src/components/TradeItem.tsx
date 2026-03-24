import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Trade} from '../models/Trade';
import {colors, spacing} from '../theme/tokens';

interface Props {
  trade: Trade;
  index: number;
}

export function TradeItem({trade, index}: Props) {
  const isBuy = trade.action === 'BUY';
  const actionColor = isBuy ? colors.accent : trade.pnl && trade.pnl >= 0 ? colors.profit : colors.loss;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.index}>#{index + 1}</Text>
        <View style={[styles.badge, {backgroundColor: actionColor}]}>
          <Text style={styles.badgeText}>{trade.action}</Text>
        </View>
      </View>
      <View style={styles.center}>
        <Text style={styles.price}>{trade.price.toLocaleString()}</Text>
        <Text style={styles.amount}>{trade.amount.toFixed(3)} BTC</Text>
      </View>
      <View style={styles.right}>
        {trade.pnl != null ? (
          <>
            <Text style={[styles.pnl, {color: trade.pnl >= 0 ? colors.profit : colors.loss}]}>
              {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
            </Text>
            <Text style={[styles.pnlPercent, {color: trade.pnl >= 0 ? colors.profit : colors.loss}]}>
              {trade.pnlPercent != null ? `${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(1)}%` : ''}
            </Text>
          </>
        ) : (
          <Text style={styles.amount}>
            -{(trade.price * trade.amount).toLocaleString()}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: spacing.sm,
  },
  index: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  center: {
    flex: 1,
  },
  price: {
    fontSize: 14,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  amount: {
    fontSize: 12,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  right: {
    alignItems: 'flex-end',
  },
  pnl: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pnlPercent: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
