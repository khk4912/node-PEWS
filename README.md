# node-PEWS

대한민국 기상청의 [사용자 맞춤형 지진정보서비스](https://www.weather.go.kr/pews/)의 node.js 클라이언트.

- Supported Features

  - 지진조기경보 (phase 2) 수신
  - 지진정보 (phase 3) 수신
  - 제주, 포항, 경주 지진 시뮬레이션

- TODO

  - [x] 특정 지점 예상도달 시간 / 에상진도 (getGrid())
  - [x] Station 정보
  - [ ] Station MMI II 이상 시 발생 event
  - [ ] 다중지진 대응...?
  - [ ] 캐싱...?
  - [x] TS 데코레이터 기반 이벤트...??

## Installation

node-PEWS를 이용하려면 아래의 단계를 참고하세요.

1. 레포지토리 클론

```bash
❯ git clone https://github.com/khk4912/node-PEWS.git
```

2. 의존성 설치

```bash
❯ npm install
or
❯ yarn install
```

3. TypeScipt 빌드

```bash
❯ tsc
```

4. 자신의 프로젝트에 node-PEWS 설치

```bash
❯ npm install path/to/node-PEWS
or
❯ yarn add file://path/to/node-PEWS
```

## Example

더 많은 예제를 보시려면, example 폴더를 참고하세요.

### 기본 예시

```typescript
import { PEWS } from 'node-pews'
// or
// const { PEWS } = require("node-pews")

const pews = new PEWS()

pews.on('new_eew', (eew) => {
  console.log(`${eew.location}에서 추정규모 ${eew.magnitude}의 지진이 발생!`)
})

pews.start()
```

### 데코레이터 예시

```typescript
import { PEWS, event, type EEWInfo, type EqkInfo } from 'node-pews'

class MyTest extends PEWS {
  // event 데코레이터에 이벤트 이름을 지정하거나...
  @event('new_eew')
  randomName(data: EEWInfo): void {
    console.log('new_eew 이벤트!')
    console.log(data)
  }

  // 메소드 이름을 이벤트 이름으로 사용해도 됩니다.
  @event()
  new_info(data: EqkInfo): void {
    console.log('new_info 이벤트!')
    console.log(data)
  }
}

const test = new MyTest()
test.start()
```

### 제주 지진 시뮬레이션 예시

```typescript
import { SimulationData } from 'node-pews'
// or
// const { SimulationData } = require("node-pews")

const JEJU = SimulationData.JEJU

JEJU.on('new_eew', (eew) => {
  console.log('## 새로운 조기경보 발표! ##')
  console.log(`지역: ${eew.location} (${eew.lat}, ${eew.lon})`)
  console.log(`추정규모: M${eew.magnitude}`)
  console.log(
    `추정최대진도: ${eew.maxIntensity} (${eew.maxIntensityArea.join(', ')})`,
  )
})

JEJU.start()
```

Output

```
## 새로운 조기경보 발표! ##
지역: 제주 서귀포시 서남서쪽 32km 해역 (33.15, 122.24)
추정규모: M5.3
추정최대진도: 6 (제주)
```
