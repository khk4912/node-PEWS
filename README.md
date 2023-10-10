# node-PEWS

대한민국 기상청의 [사용자 맞춤형 지진정보서비스](https://www.weather.go.kr/pews/)의 node.js 클라이언트.

## Example

```typescript
import PEWS from "node-pews"

const pews = new PEWS()

pews.on("new_eew", (eew) => {
  console.log(`${eew.location}에서 추정규모 ${eew.magnitude}의 지진이 발생!`)
})

pews.start()
```
