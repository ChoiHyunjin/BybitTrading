import React from 'react';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import {Trade} from '../models/Trade';
import {TradeItem} from './TradeItem';
import {colors, spacing} from '../theme/tokens';

interface Props {
  trades: Trade[];
}

export function TradeList({trades}: Props) {
  if (trades.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          해당 기간에 거래 신호가 발생하지 않았습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>거래 내역 ({trades.length})</Text>
      <FlatList
        data={trades}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({item, index}) => <TradeItem trade={item} index={index} />}
        scrollEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
