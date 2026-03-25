let mmkvInstance: any = null;

try {
  const {MMKV} = require('react-native-mmkv');
  mmkvInstance = new MMKV({id: 'kline-cache'});
} catch {
  // MMKV not available (native module not linked) — fall back to no-op
}

export const storage = {
  getString(key: string): string | undefined {
    return mmkvInstance?.getString(key) ?? undefined;
  },
  set(key: string, value: string): void {
    mmkvInstance?.set(key, value);
  },
  clearAll(): void {
    mmkvInstance?.clearAll();
  },
};
