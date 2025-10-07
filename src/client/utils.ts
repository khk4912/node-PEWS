/**
 * 기본 요청에 사용되는 현재 시각 URL을 반환합니다.
 *
 * @param of 'b' (지진) | 's' (Station), optional
 * @param tide 지연 시간 (밀리초 단위, 기본값: 1000ms), optional
 * @returns
 */
export function getRequestURL (of: 'b' | 's' = 'b', tide: number = 1000, baseURL?: string): string {
  const date = new Date(Date.now() - tide)
  // const DEFAULT_ROUTE = 'https://www.weather.go.kr/pews/data/'
  const DEFAULT_ROUTE = '/pews/'
  const yyyymmddhhmmss = date.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)

  return `${baseURL ?? DEFAULT_ROUTE}${yyyymmddhhmmss}.${of}`
}
