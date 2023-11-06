# node-PEWS

대한민국 기상청의 [사용자 맞춤형 지진정보서비스](https://www.weather.go.kr/pews/)의 node.js 클라이언트.

- Supported Features

  - 지진조기경보 (phase 2) 수신
  - 지진정보 (phase 3) 수신
  - 제주, 포항, 경주 지진 시뮬레이션

- TODO
  - 특정 지점 예상도달 시간 / 에상진도 (getGrid())
  - Station 정보
  - Station MMI II 이상 시 발생 event
  - 다중지진 대응...?
  - 캐싱...?

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

### 기본 예시

```typescript
// ESM style import
import PEWS from "node-pews"
// ... or CommonJS style import
const PEWS = require("node-pews").default

const pews = new PEWS()

pews.on("new_eew", (eew) => {
  console.log(`${eew.location}에서 추정규모 ${eew.magnitude}의 지진이 발생!`)
})

pews.start()
```

### 제주 지진 시뮬레이션 예시

```typescript
import { SimulationData } from "node-pews"

const JEJU = SimulationData.JEJU

JEJU.on("new_eew", (eew) => {
  console.log("## 새로운 조기경보 발표! ##")
  console.log(`지역: ${eew.location} (${eew.lat}, ${eew.lon})`)
  console.log(`추정규모: M${eew.magnitude}`)
  console.log(
    `추정최대진도: ${eew.maxIntensity} (${eew.maxIntensityArea.join(", ")})`
  )
})

JEJU.start()
```

Ouptut

```
## 새로운 조기경보 발표! ##
지역: 제주 서귀포시 서남서쪽 32km 해역 (33.15, 122.24)
추정규모: M5.3
추정최대진도: 6 (제주)
```
