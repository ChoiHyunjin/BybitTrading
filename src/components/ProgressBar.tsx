import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {FetchProgress} from '../data/KlineRepository';
import {colors, spacing, borderRadius} from '../theme/tokens';

interface Props {
  progress: FetchProgress;
}

export function ProgressBar({progress}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.message}>{progress.message}</Text>
        <Text style={styles.percent}>{progress.percent}%</Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {width: `${progress.percent}%`},
            progress.fromCache && styles.fillCache,
          ]}
        />
      </View>
      {progress.loaded > 0 && (
        <Text style={styles.detail}>
          {progress.loaded.toLocaleString()}개 캔들
          {progress.fromCache ? ' (캐시)' : ''}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  percent: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 6,
    backgroundColor: colors.surfaceLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 3,
  },
  fillCache: {
    backgroundColor: colors.profit,
  },
  detail: {
    fontSize: 11,
    color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
