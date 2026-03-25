# Sprint 9: 기술 설계 - Kline 데이터 캐싱 레이어

## 설계 결정

### Storage 선택: 인메모리 캐시 (Phase 1) → MMKV/SQLite (Phase 2)

**Phase 1 (현재):** 인메모리 Map 기반 캐시
- 외부 의존성 0, 바로 적용 가능
- 앱 세션 내 재사용 (동일 심볼+인터벌+기간 재실행 시 API 호출 없음)
- 앱 종료 시 소멸 (persistent 아님)

**Phase 2 (추후):** react-native-mmkv 또는 op-sqlite
- 앱 재시작 후에도 캐시 유지
- 네이티브 빌드 의존성 추가 필요

## 아키텍처

```
useBacktest
  └→ KlineRepository.getKlines(symbol, interval, start, end)
       ├→ 캐시 조회: 요청 범위 내 캐시된 데이터 확인
       ├→ 갭 분석: 캐시에 없는 구간 식별
       ├→ API 호출: 갭 구간만 BybitApi.fetchAllKlines()
       ├→ 캐시 저장: 새로 받은 데이터 저장
       └→ 병합 반환: 캐시 + 새 데이터 시간순 정렬
```

## 캐시 키 구조
```
Map<string, Price[]>
key = "{symbol}:{interval}" (e.g., "BTCUSDT:3")
value = Price[] (시간순 정렬, 중복 없음)
```

## 갭 분석 알고리즘
```
요청: [start, end)
캐시: [cachedStart, cachedEnd) (캐시된 데이터의 첫/끝 openTime)

Case 1: 캐시 없음 → 전체 API 호출
Case 2: 요청이 캐시 범위 내 → 캐시에서 slice
Case 3: 왼쪽 갭 → [start, cachedStart) API 호출
Case 4: 오른쪽 갭 → [cachedEnd+1, end) API 호출
Case 5: 양쪽 갭 → 왼쪽 + 오른쪽 API 호출
```

## 디렉토리
```
src/
├── data/
│   └── KlineRepository.ts  # 캐싱 레이어
```
