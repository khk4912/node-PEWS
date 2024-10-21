
/**
 * 기본 요청에 사용되는 현재 시각 URL을 반환합니다.
 *
 * @param of 'b' (지진) | 's' (Station), optional
 * @returns
 */
export function getRequestURL (of: 'b' | 's' = 'b'): string {
  const DEFAULT_ROUTE = 'https://www.weather.go.kr/pews/data/'
  const yyyymmddhhmmss = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

  return `${DEFAULT_ROUTE}${yyyymmddhhmmss}.${of}`
}
