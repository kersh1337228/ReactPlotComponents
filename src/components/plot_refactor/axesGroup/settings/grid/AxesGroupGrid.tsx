import React from 'react'
import {AxesGroupReal} from "../../AxesGroup"
import GridTile from "./gridTile"
import {AxesReal} from "../../../axes/Axes";

interface AxesGroupGridProps {
	axesGroup: AxesGroupReal
}

interface AxesGroupGridState {}

export default class AxesGroupGrid extends React.Component<
	AxesGroupGridProps, AxesGroupGridState
> {
	public constructor(props: AxesGroupGridProps) {
		super(props)
		this.state = {}
		this.drop = this.drop.bind(this)
	}
	public drop(event: React.DragEvent): void {
		const [dragIndex, dropIndex] = [
			this.props.axesGroup.state.children.components.findIndex(axes =>
				axes.props.title === event.dataTransfer.getData('dropped')
			), this.props.axesGroup.state.children.components.findIndex(axes =>
				axes.props.title === (event.target as HTMLDivElement).innerHTML
			)
		]
		const [drag, drop] = [
			this.props.axesGroup.state.children.components[dragIndex],
			this.props.axesGroup.state.children.components[dropIndex]
		]
		const {position, size} = drag.state
		drag.setState({position: {
			row: {...drop.state.position.row},
			column: {...drop.state.position.column}
		}, size: {...drop.state.size}}, () => {
			drag.setWindow(() => {
				drag.coordinatesTransform(drag.state.dataRange, () => {
					drop.setState({position: {
						row: {...position.row},
						column: {...position.column}
					}, size: {...size}}, () => {
						drop.setWindow(() => {
							drop.coordinatesTransform(drop.state.dataRange, () => {
								this.setState({}, this.props.axesGroup.plot)
							})
						})
					})
				})
			})
		})
		// drag.setState({position: {
		// 	row: {...drop.state.position.row},
		// 	column: {...drop.state.position.column}
		// }, size: {...drop.state.size}}, () => {
		// 	drag.setWindow(() => {
		// 		drag.coordinatesTransform(drag.state.dataRange, () => {
		// 			drop.setState({position: {
		// 				row: {...position.row},
		// 				column: {...position.column}
		// 			}, size: {...size}}, () => {
		// 				drop.setWindow(() => {
		// 					drop.coordinatesTransform(drop.state.dataRange, () => {
		// 						const {components, nodes} = this.props.axesGroup.state.children;
		// 						// [components[dragIndex], components[dropIndex]] = [components[dropIndex], components[dragIndex]];
		// 						[nodes[dragIndex], nodes[dropIndex]] = [nodes[dropIndex], nodes[dragIndex]];
		// 						this.props.axesGroup.setState({children: {nodes, components}}, () => {
		// 							this.setState({}, this.props.axesGroup.plot)
		// 						})
		// 					})
		// 				})
		// 			})
		// 		})
		// 	})
		// })
	}
	public render(): React.ReactNode {
		return (
			<div style={{
				display: 'grid',
				gridTemplateRows: `repeat(${this.props.axesGroup.grid.rows - 1}, 1fr)`,
				gridTemplateColumns: `repeat(${this.props.axesGroup.grid.columns - 1}, 1fr)`,
				gridGap: 10, padding: 5
			}}>
				{this.props.axesGroup.state.children.components.map(axes =>
					<GridTile
						position={axes.state.position}
						key={axes.props.title}
						dropHandler={this.drop}
					>{axes.props.title}</GridTile>
				)}
			</div>
		)
	}
}
