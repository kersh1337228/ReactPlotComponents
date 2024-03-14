import React from 'react'
import {AxesReal} from '../axes/Axes'
import {AxesGroupReal} from '../axesGroup/AxesGroup'
import {ComponentChildren} from "../../../utils/types/reactObjects"
import {axisSize} from '../../../utils/constants/plot'
import {defaultValue} from "../../../utils/functions/miscellaneous"
import NumberRange, {plotNumberRange} from "../../../utils/classes/iterable/NumberRange"
import DateTimeRange, {plotDateTimeRange} from "../../../utils/classes/iterable/DateTimeRange"
import {fillData, plotDataTypeVectorised} from "../../../utils/functions/plotDataProcessing"
import Drawing from "../drawings/Drawing/Drawing"
import {Geometrical, TimeSeries} from "../../../utils/types/plotData"
import './Figure.css'
import FigureSettings from "./settings/FigureSettings";

interface FigureProps {
	width: number
	height: number
	title: string
	children: React.ReactNode
}

interface FigureState {
	children: ComponentChildren<AxesReal | AxesGroupReal>
}

export default class Figure extends React.Component<
	FigureProps, FigureState
> {
	public grid: { rows: number, columns: number }
	public constructor(props: FigureProps) {
		super(props)
		// Making sure children variable has array type
		const children = ((props.children as any[]).length ?
			props.children : [props.children]) as JSX.Element[]
		// Building figure grid
		this.grid = {  // Finding max row and column listed in children props
			rows: Math.max.apply(null, Array.from(
				children, child => child.props.position.row.end
			)),
			columns: Math.max.apply(null, Array.from(
				children, child => child.props.position.column.end
			))
		}  // Minimal size units
		const [cellWidth, cellHeight] = [
			this.props.width / (this.grid.columns - 1),
			this.props.height / (this.grid.rows - 1)
		]
		this.state = {
			children: {
				nodes: children.map((child, index) => {
					// Replacing child props
					const size = {  // Calculating nested axes or axes group size
						width: (
							child.props.position.column.end -
							child.props.position.column.start
						) * cellWidth - (
							child.props.yAxis === false ? 0 : axisSize.width
						),
						height: (
							child.props.position.row.end -
							child.props.position.row.start
						) * cellHeight - (
							child.props.xAxis === false ? 0 : axisSize.height
						),
					}
					const childProps = {
						...child.props,
						xAxis: defaultValue(child.props.xAxis, true),
						yAxis: defaultValue(child.props.yAxis, true),
						padding: defaultValue(child.props.padding, {
							left: 0, top: 0, right: 0, bottom: 0, ...child.props.padding
						}), parent: this, size, key: index
					}
					if (child.type.name === 'Axes') {
						// Filling nested <Axes> drawing data
						let xAxisData: NumberRange | DateTimeRange
						let xAxisLabels: number[] | string[]
						const dType = plotDataTypeVectorised(child.props.drawings)
						if (child.props.drawings.length) {
							if (dType)
								if (dType === 'Geometrical') {
									xAxisData = plotNumberRange(child.props.drawings as Drawing<Geometrical, any, any>[])
									xAxisLabels = [...xAxisData]
								} else {
									xAxisData = plotDateTimeRange(child.props.drawings as Drawing<TimeSeries, any, any>[])
									xAxisLabels = [...xAxisData.format('%Y-%m-%d')]
								}
							else throw Error("<Axes> drawings must have uniform data type.")
						} else throw Error("<Axes> must contain at least one drawing.")
						const drawings = (child.props.drawings as Drawing<any, any, any>[]).map(drawing => {
							if (!drawing.global.data.length) throw Error('Drawing data can not be empty.')
							return new (Object.getPrototypeOf(drawing).constructor)(
								fillData(drawing.global.data, xAxisLabels), drawing.name,
								drawing.style, drawing.value_field
							)
						})
						return React.createElement(AxesReal, {...childProps, drawings, xAxisData})
					} else if (child.type.name === 'AxesGroup') {
						return React.createElement(AxesGroupReal, childProps)
					} else  // Non-compatible tag
						throw Error("Only <Axes> and <AxesGroup> can appear as <Figure> children.")
				}), components: []
			}
		}
		// Methods binding
		this.plot = this.plot.bind(this)
	}
	public plot(): void {
		this.state.children.components.forEach(child => child.plot())
	}
	public render(): React.ReactNode {
		return (<>
			<FigureSettings figure={this} />
			<div
				className={'figureGrid'}
				style={{ width: this.props.width, height: this.props.height }}
			>{this.state.children.nodes}</div>
			{/*>{this.state.children.components.length === this.state.children.nodes.length ?*/}
			{/*	this.state.children.nodes.map((child, index) => {*/}
			{/*	if (child.type.name === 'Axes') {*/}
			{/*		return React.createElement(AxesReal, {...child.props, size: this.state.children.components[index].state.size})*/}
			{/*	} else if (child.type.name === 'AxesGroup') {*/}
			{/*		return React.createElement(AxesGroupReal, {...child.props, size: this.state.children.components[index].state.size})*/}
			{/*	}*/}
			{/*}) : this.state.children.nodes}</div>*/}
		</>)
	}
}
