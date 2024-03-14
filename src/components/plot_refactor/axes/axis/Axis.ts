import React from "react"
import {AxesReal} from "../Axes"
import {AxesGroupReal} from "../../axesGroup/AxesGroup"
import {AxisData, GridObject} from "../../../../utils/types/display"
import {CanvasObject, TooltipCanvasObject} from "../../../../utils/types/reactObjects"
import {Callback} from "../../../../utils/types/callable"

export default abstract class Axis<T extends AxesReal | AxesGroupReal> {
	public metadata: {
		global: AxisData, local: AxisData, delta: AxisData
	}  // Value borders and coordinates transform
	public grid: GridObject  // AxisBase ticks defining grid step
	public font: { name: string, size: number }  // AxisBase labels font
	public readonly canvases: { scale: CanvasObject, tooltip: TooltipCanvasObject }  // Separate axis canvas
	public scrollSpeed: number  // AxisBase scale and translate adjustment speed

	public constructor(
		protected readonly axes: T,  // Parent axes object
		public readonly label: 'x' | 'y',
		public readonly name: string = ''  // AxisBase name shown
	) {
		this.metadata = {
			global: { min: 0, max: 0, scale: 1, translate: 0 },
			local: { min: 0, max: 0, scale: 1, translate: 0 },
			delta: { min: 5, max: 500, scale: 0, translate: 0 }
		}
		this.grid = { amount: 5, color: '#d9d9d9', width: 1 }  // 5 Ticks, grey color, default width
		this.font = { name: 'SF UI Display', size: 10 }  // Basic font
		this.canvases = {
			scale: { ref: React.createRef(), density: 1 },  // AxisBase ticks canvas
			tooltip: {  // Pop-Up tooltips canvas
				ref: React.createRef(),
				mouseEvents: { drag: false, position: { x: 0, y: 0 } }
			}
		}
		this.scrollSpeed = 1  // Basic scroll speed
		// Events binding
		this.wheelHandler = this.wheelHandler.bind(this)
		this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
		this.mouseOutHandler = this.mouseOutHandler.bind(this)
		this.mouseDownHandler = this.mouseDownHandler.bind(this)
		this.mouseUpHandler = this.mouseUpHandler.bind(this)
	}
	public abstract init(): void
	// Meta data
	public get min() { return this.metadata.local.min }
	public get max() { return this.metadata.local.max }
	public get spread() { return this.max - this.min }  // Value delta
	public get scale() { return this.metadata.local.scale + this.metadata.delta.scale }
	public get translate() { return this.metadata.local.translate + this.metadata.delta.translate }
	// Coordinates
	public abstract reScale(ds: number, callback?: Callback): Promise<void>
	public abstract reTranslate(dt: number, callback?: Callback): Promise<void>
	public abstract coordinatesTransform(): void
	// Display
	public setWindow(): void {  // Canvases size setup
		this.canvases.tooltip.ref.current?.addEventListener(
			// @ts-ignore
			'wheel', this.wheelHandler, { passive: false }
		)
	}
	public abstract showScale(): Promise<void>  // Draw axis ticks
	public abstract showTooltip(coordinate: number): Promise<void>  // Draw tooltips on tooltip canvas
	public hideTooltip(): void {  // Clear tooltip canvas
		((
			this.canvases.tooltip.ref.current as HTMLCanvasElement
		)?.getContext('2d') as CanvasRenderingContext2D)?.clearRect(
			0, 0, (this.canvases.tooltip.ref.current as HTMLCanvasElement).width,
			(this.canvases.tooltip.ref.current as HTMLCanvasElement).height
		)
	}
	public abstract render(): React.ReactNode
	// Event handlers
	public async wheelHandler(event: React.WheelEvent): Promise<void> {
		event.preventDefault()
		event.stopPropagation()
		this.reScale(
			-event.deltaY / 2000 * this.scale,
			this.axes.plot
		)
	}
	public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
		if (this.canvases.tooltip.mouseEvents.drag) {  // If mouse is held => change scale
			const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
			const coordinates = {  // Calculating cursor offset
				x: event.clientX - window.left,
				y: event.clientY - window.top
			}
			this.reScale((
				this.canvases.tooltip.mouseEvents.position[this.label] - coordinates[this.label]
			) * this.scrollSpeed * this.scale,
				() => {
					const state = this.axes.state  // @ts-ignore
					state.axes[this.label].canvases.tooltip.mouseEvents.position = coordinates  // @ts-ignore
					this.axes.setState(state, this.axes.plot)
				}
			)
		}
	}
	public async mouseOutHandler(): Promise<void> {
		const state = this.axes.state  // @ts-ignore
		state.axes[this.label].canvases.tooltip.mouseEvents.drag = false  // @ts-ignore
		this.axes.setState(state)
	}
	public async mouseDownHandler(event: React.MouseEvent): Promise<void> {
		const state = this.axes.state  // @ts-ignore
		state.axes[this.label].canvases.tooltip.mouseEvents = {
			drag: true,
			position: {
				x: event.clientX - (
					event.target as HTMLCanvasElement
				).getBoundingClientRect().left,
				y: event.clientY - (
					event.target as HTMLCanvasElement
				).getBoundingClientRect().top,
			}
		}  // @ts-ignore
		this.axes.setState(state)
	}
	public async mouseUpHandler(): Promise<void> {
		const state = this.axes.state  // @ts-ignore
		state.axes[this.label].canvases.tooltip.mouseEvents.drag = false  // @ts-ignore
		this.axes.setState(state)
	}
}
