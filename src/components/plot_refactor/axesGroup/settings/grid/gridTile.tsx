import React from 'react'
import {GridPosition} from "../../../../../utils/types/display";

interface GridTileProps {
	position: GridPosition
	children: any
	dropHandler: React.EventHandler<React.DragEvent>
}

interface GridTileState {
	drag: {
		state: boolean,
		position: {x: number, y: number}
	}
}

export default class GridTile extends React.Component<
	GridTileProps, GridTileState
> {
	public constructor(props: GridTileProps) {
		super(props)
		this.state = {
			drag: {
				state: false,
				position: {x: 0, y: 0}
			}
		}
		this.dragStartHandler = this.dragStartHandler.bind(this)
		this.dragOverHandler = this.dragOverHandler.bind(this)
		this.dragEnterHandler = this.dragEnterHandler.bind(this)
		this.dragLeaveHandler = this.dragLeaveHandler.bind(this)
		this.dragEndHandler = this.dragEndHandler.bind(this)
		this.dropHandler = this.dropHandler.bind(this)
	}
	public dragStartHandler(event: React.DragEvent): void {
		event.dataTransfer.setData('dropped', (event.target as HTMLDivElement).innerHTML)
	}
	public dragOverHandler(event: React.DragEvent): void {
		event.preventDefault()
	}
	public dragEnterHandler(event: React.DragEvent): void {
		event.preventDefault()
	}
	public dragLeaveHandler(event: React.DragEvent): void {}
	public dragEndHandler(event: React.DragEvent): void {}
	public dropHandler(event: React.DragEvent): void {
		event.preventDefault()
	}
	public render(): React.ReactNode {
		return (
			<div style={{
				gridRowStart: this.props.position.row.start, gridRowEnd: this.props.position.row.end,
				gridColumnStart: this.props.position.column.start, gridColumnEnd: this.props.position.column.end,
				border: 'solid black 1px', borderRadius: 7, padding: 5,
				textAlign: 'center', display: 'flex',
				alignItems: 'center', justifyContent: 'center',
				cursor: 'pointer'
			}} className={'gridTile'} draggable={true}
			     onDragStart={this.dragStartHandler}
			     onDragOver={this.dragOverHandler}
			     onDragEnter={this.dragEnterHandler}
			     onDragLeave={this.dragLeaveHandler}
			     onDragEnd={this.dragEndHandler}
			     onDrop={this.props.dropHandler}
			>
				{this.props.children}
			</div>
		)
	}
}
