const store = new Map();

class MMKV {
  constructor() {}
  getString(key) {
    return store.get(key) ?? undefined;
  }
  set(key, value) {
    store.set(key, value);
  }
  clearAll() {
    store.clear();
  }
}

module.exports = {MMKV};
