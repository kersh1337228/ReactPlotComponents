// Base generic data types
type DataPoint<T extends number | string> = [ T, number | null ]
interface DataObject<T extends number | string> {
	timestamp: T
	[ numericType: string ]: number | null
	[ anyType: string ]: any
}
// Geometrical
export type PointGeometrical = DataPoint<number>
export interface ObjectGeometrical extends DataObject<number> {}
export type Geometrical = PointGeometrical | ObjectGeometrical
// Time series
export type PointTimeSeries = DataPoint<string>
export interface ObjectTimeSeries extends DataObject<string> {}
export type TimeSeries = PointTimeSeries | ObjectTimeSeries
// Quotes - custom TimeSeries implementation
export interface Quotes extends ObjectTimeSeries {
	open: number | null
	high: number | null
	low: number | null
	close: number | null
	volume: number | null
}
// Generalization
export type PlotData = Geometrical | TimeSeries
export type PlotDataName = 'PointGeometrical' | 'ObjectGeometrical' | 'PointTimeSeries' | 'ObjectTimeSeries'
