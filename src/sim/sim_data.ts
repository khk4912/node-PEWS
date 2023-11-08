import { PEWS } from '../client/pews'

export const SimulationData = {
  JEJU: new PEWS(true, 2021007178, new Date(2021, 11, 14, 17, 19, 9), new Date(2021, 11, 14, 17, 27, 23)),
  POHANG: new PEWS(true, 2017000407, new Date(2017, 10, 15, 14, 29, 21), new Date(2017, 10, 15, 14, 34, 20)),
  GYEONGJU: new PEWS(true, 2016000291, new Date(2016, 8, 12, 20, 32, 44), new Date(2016, 8, 12, 20, 37, 43))
}

export const SimulationParams: Record<keyof typeof SimulationData, [boolean, number, Date, Date]> = {
  JEJU: [true, 2021007178, new Date(2021, 11, 14, 17, 19, 9), new Date(2021, 11, 14, 17, 27, 23)],
  POHANG: [true, 2017000407, new Date(2017, 10, 15, 14, 29, 21), new Date(2017, 10, 15, 14, 34, 20)],
  GYEONGJU: [true, 2016000291, new Date(2016, 8, 12, 20, 32, 44), new Date(2016, 8, 12, 20, 37, 43)]
}
