// Date string representation
export type DecimalPoint = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
type YearString = `${19 | 20}${DecimalPoint}${DecimalPoint}`
type MonthString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `1${0 | 1 | 2}`
type DayString = `0${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}` | `${1 | 2}${DecimalPoint}` | `3${0 | 1}`
export type DateString = `${YearString}-${MonthString}-${DayString}` | `${YearString}-${MonthString}` | YearString
// Time string representation
type HourString = `${0 | 1}${DecimalPoint}` | `2${0 | 1 | 2 | 3}`
type MinuteString = `${0 | 1 | 2 | 3 | 4 | 5}${DecimalPoint}`
export type TimeString = `${HourString}:${MinuteString}:${MinuteString}` | `${HourString}:${MinuteString}`
