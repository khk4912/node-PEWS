# node-PEWS

대한민국 기상청의 [사용자 맞춤형 지진정보서비스](https://www.weather.go.kr/pews/)의 node.js 클라이언트.

## Example

### 기본 예시

```typescript
import PEWS from "node-pews"

const pews = new PEWS()

pews.on("new_eew", (eew) => {
  console.log(`${eew.location}에서 추정규모 ${eew.magnitude}의 지진이 발생!`)
})

pews.start()
```

### 제주 지진 시뮬레이션 예시

```typescript
import { SimulationData } from "./sim/sim_data"

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

```
## 새로운 조기경보 발표! ##
지역: 제주 서귀포시 서남서쪽 32km 해역 (33.15, 122.24)
추정규모: M5.3
추정최대진도: 6 (제주)
```
