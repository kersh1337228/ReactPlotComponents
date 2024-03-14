import {
	DataObject,
	ObjectGeometrical,
	ObjectTimeSeries,
	PlotData,
	PlotDataName,
	PointGeometrical,
	PointTimeSeries
} from '../types/plotData'
import Drawing from "../../components/plot_refactor/drawings/Drawing/Drawing"

export function plotDataType(data: PlotData[]): PlotDataName | undefined | never {
	if (!data.length) throw Error('Data is empty.')
	if (typeof (data[0] as PointGeometrical)[0] === 'number') return 'PointGeometrical'
	if (typeof (data[0] as PointTimeSeries)[0] === 'string') return 'PointTimeSeries'
	if (typeof (data[0] as ObjectGeometrical)['timestamp'] === 'number') return 'ObjectGeometrical'
	else if (typeof (data[0] as ObjectTimeSeries)['timestamp'] === 'string') return 'ObjectTimeSeries'
	return undefined
}

export function plotDataTypeVectorised(drawings: Drawing<PlotData, any, any>[]): 'Geometrical' | 'TimeSeries' | undefined {
	const dTypes = drawings.map(drawing => plotDataType(drawing.global.data))
	return dTypes.every(
		dType => dType === 'PointGeometrical' ||
			dType === 'ObjectGeometrical'
	) ? 'Geometrical' : dTypes.every(
		dType => dType !== 'PointGeometrical' &&
			dType !== 'ObjectGeometrical'
	) ? 'TimeSeries' : undefined
}

export function fillData(data: PlotData[], labels: number[] | string[]): PlotData[] | never {
	let copy: PlotData[] = []
	const dType = plotDataType(data)
	if (dType === 'PointGeometrical' || dType === 'PointTimeSeries') {
		const labelsPresent = Array.from(data, pair => pair[0])
		let i = -1
		labels.forEach(label => {
			if (!labelsPresent.includes(label)) {  // @ts-ignore
				copy.push([label, null])
			} else copy.push(data[++i])
		})
	} else if (dType === 'ObjectGeometrical' || dType === 'ObjectTimeSeries') {
		const fields = Object.keys(data[0]).filter(field => field !== 'timestamp')
		const labelsPresent = Array.from(data as DataObject<any>[], obj => obj.timestamp)
		let i = -1
		labels.forEach(label => {
			if (!labelsPresent.includes(label)) {  // @ts-ignore
				const obj: DataObject<any> = { timestamp: label }
				fields.forEach(field => obj[field] = null)
				copy.push(obj)
			} else copy.push(data[++i])
		})
	} else throw Error('Data type is undefined.')
	return copy
}
