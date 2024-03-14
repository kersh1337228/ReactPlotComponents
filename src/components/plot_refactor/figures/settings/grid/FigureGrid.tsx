import React from 'react'
import Figure from "../../Figure"
import GridTile from "../../../axesGroup/settings/grid/gridTile";

interface FigureGridProps { figure: Figure }

interface FigureGridState {}

export default class FigureGrid extends React.Component<
	FigureGridProps, FigureGridState
> {
	public constructor(props: FigureGridProps) {
		super(props)
		this.state = {}
		this.drop = this.drop.bind(this)
	}
	public drop(event: React.DragEvent): void {
		const [dragIndex, dropIndex] = [
			this.props.figure.state.children.components.findIndex(axes =>
				axes.props.title === event.dataTransfer.getData('dropped')
			), this.props.figure.state.children.components.findIndex(axes =>
				axes.props.title === (event.target as HTMLDivElement).innerHTML
			)
		]
		const [drag, drop] = [
			this.props.figure.state.children.components[dragIndex],
			this.props.figure.state.children.components[dropIndex]
		]
		const {position, size} = drag.state
		// @ts-ignore
		drag.setState({
			position: {...drop.state.position},
			size: {...drop.state.size}
		}, () => {
			console.log(drag.state.size, drop.state.size, drag.props.title)
			// @ts-ignore
			drop.setState({position: {...position}, size: {...size}}, () => {
				console.log(drop.state.size, size, drop.props.title)
				drag.setWindow(() => {
					drop.setWindow(() => {
						drag.coordinatesTransform(drag.state.dataRange, () => {
							drop.coordinatesTransform(drop.state.dataRange, () => {
								this.setState({}, this.props.figure.plot)
							})
						})
					})
				})
			})
		})
	}
	public render(): React.ReactNode {
		return (
			<div style={{
				display: 'grid',
				gridTemplateRows: `repeat(${this.props.figure.grid.rows - 1}, 1fr)`,
				gridTemplateColumns: `repeat(${this.props.figure.grid.columns - 1}, 1fr)`,
				gridGap: 10, padding: 5
			}}>
				{this.props.figure.state.children.components.map(child =>
					<GridTile
						position={child.state.position}
						key={child.props.title}
						dropHandler={this.drop}
					>{child.props.title}</GridTile>
				)}
			</div>
		)
	}
}
