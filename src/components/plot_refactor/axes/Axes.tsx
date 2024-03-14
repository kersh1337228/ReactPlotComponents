import React from 'react'
import Drawing from "../drawings/Drawing/Drawing"
import {AxesGroupReal} from "../axesGroup/AxesGroup"
import AxesSettings from "./settings/AxesSettings"
import xAxis from "./axis/xAxis/xAxis"
import xAxisDateTime from "./axis/xAxis/xAxisDateTime"
import yAxis from "./axis/yAxis/yAxis"
import Figure from "../figures/Figure"
import {PlotData} from "../../../utils/types/plotData"
import {DataRange, GridPosition, Padding2D, Size2D} from "../../../utils/types/display"
import {CanvasObject, TooltipCanvasObject} from "../../../utils/types/reactObjects"
import NumberRange from "../../../utils/classes/iterable/NumberRange"
import DateTimeRange from "../../../utils/classes/iterable/DateTimeRange"
import {Callback} from "../../../utils/types/callable"
import {axisSize} from "../../../utils/constants/plot"
import './Axes.css'

interface AxesPlaceholderProps {
    drawings: Drawing<PlotData, any, any>[]
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    padding?: Padding2D
    title: string
}

// Placeholder
export default function Axes(props: AxesPlaceholderProps): JSX.Element {return <></>}

// Real - component to be used inside of code
interface AxesProps extends AxesPlaceholderProps {
    size: Size2D
    parent: AxesGroupReal | Figure
    xAxisData: NumberRange | DateTimeRange
    dataRange?: DataRange,
    tooltips?: { x: number, y: number }
}

interface AxesState {
    drawings: Drawing<PlotData, any, any>[]
    dataRange: DataRange
    dataAmount: number
    transformMatrix: DOMMatrix
    canvases: {
        plot: CanvasObject
        tooltip: TooltipCanvasObject
    }
    axes: { x: xAxis | xAxisDateTime, y: yAxis }
    tooltips: React.ReactNode
    position: GridPosition
    size: Size2D
}

export class AxesReal extends React.Component<AxesProps, AxesState> {
    // Constants
    public offset: number
    public axisSize: { x: number, y: number }
    public settings: React.ReactNode
    // Methods
    public constructor(props: AxesProps) {
        super(props)
        // State initialization
        this.state = {
            drawings: this.props.drawings.map(drawing => {
                drawing.axes = this
                return drawing
            }),
            dataRange: { start: 0, end: 1 },
            dataAmount: this.props.xAxisData.length,
            transformMatrix: new DOMMatrix([ 1, 0, 0, 1, 0, 0 ]),
            canvases: {
                plot: { ref: React.createRef(), density: 1 },
                tooltip: {
                    ref: React.createRef(),
                    mouseEvents: { drag: false, position: { x: 0, y: 0 } }
                }
            },
            tooltips: null,
            axes: {
                x: this.props.xAxisData instanceof NumberRange ?
                    new xAxis(this, this.props.xAxisData as NumberRange) :
                    new xAxisDateTime(this, this.props.xAxisData as DateTimeRange),
                y: new yAxis(this)
            }, position: props.position, size: props.size
        }
        // Methods binding
        this.coordinatesTransform = this.coordinatesTransform.bind(this)
        this.plot = this.plot.bind(this)
        this.wheelHandler = this.wheelHandler.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
        // Constants initialization
        this.offset = 0  // Plot window top y coordinate initial value
        this.axisSize = {
            x: this.props.xAxis ? axisSize.height : 0,
            y: this.props.yAxis ? axisSize.width : 0
        }
        this.settings = this.props.parent instanceof Figure ? <AxesSettings axes={this}/> : null
        // Passing children inside of parent node
        let state = props.parent.state
        state.children.components.push(this)
        // @ts-ignore
        props.parent.setState(state)
    }
    // All drawings visible
    public get drawings(): Drawing<PlotData, any, any>[] {
        return this.state ? this.state.drawings.filter(
            drawing => drawing.visible
        ) : this.props.drawings
    }
    // Max visible drawing data amount
    public get globalDataAmount(): number {
        return Math.max.apply(
            null, [1, ...Array.from(
                this.state.drawings.filter(drawing => drawing.visible),
                drawing => drawing.global.data.length
            )]
        )
    }
    // Canvas inner width
    public get width(): number {
        return this.state.size ? this.state.size.width : 0
        // this.state.canvases.plot.density : 0
    }
    // Canvas inner height
    public get height(): number {
        return this.state.size ? this.state.size.height : 0
        // this.state.canvases.plot.density : 0
    }
    // Image padding
    public get padding(): { top: number, left: number, bottom: number, right: number } {
        return {
            left: 0, top: 0, right: 0, bottom: 0,
            ...this.props.padding
        }
    }
    // Canvas borders coordinates
    public get left(): number {
        return this.width * this.padding.left
    }
    public get right(): number {
        return this.width * (1 - this.padding.right)
    }
    public get top(): number {
        return this.height * (1 - this.padding.top)
    }
    public get bottom(): number {
        return this.height * this.padding.bottom
    }
    // Canvas inner width with padding
    public get paddedWidth(): number {
        return this.right - this.left
    }
    // Canvas inner height with padding
    public get paddedHeight(): number {
        return this.top - this.bottom
    }
    // Change canvas resolution
    public setWindow(callback?: Callback) {
        const state = this.state
        if (
            state.canvases.plot.ref.current &&
            state.canvases.tooltip.ref.current
        ) {
            state.canvases.plot.ref.current.width = this.width
            state.canvases.plot.ref.current.height = this.height
            state.canvases.tooltip.ref.current.width = this.width
            state.canvases.tooltip.ref.current.height = this.height
        }
        state.axes.x.setWindow()
        state.axes.y.setWindow()
        this.setState(state, callback)
    }
    // Set new meta-data for data range given
    public async coordinatesTransform(
        dataRange: DataRange, callback: Callback = this.plot
    ): Promise<void> {
        this.drawings.forEach(async drawing => await drawing.coordinatesTransform(dataRange))
        this.setState({
            dataRange, dataAmount: Math.max.apply(
                null, [1, ...this.drawings.map(
                    drawing => drawing.local.data.length
                )]
            )
        }, async () => {
            if (this.drawings.length) {
                const state = this.state
                state.axes.x.coordinatesTransform()
                state.axes.y.coordinatesTransform()
                this.setState({
                    ...state, transformMatrix: new DOMMatrix([
                        state.axes.x.scale, 0, 0,
                        state.axes.y.scale,
                        state.axes.x.translate,
                        state.axes.y.translate
                    ])
                }, callback)
            } else callback()
        })
    }
    // Transforms path given using current transform matrix
    public applyTransform(init: Path2D): Path2D {
        const temp = new Path2D()
        temp.addPath(init, this.state.transformMatrix)
        return temp
    }
    // Draw plots
    public async plot(): Promise<void> {
        ((
            this.state.canvases.plot.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D).clearRect(
            0, 0, this.width, this.height
        )
        if (this.drawings.length) {
            this.state.axes.x.showScale()
            this.state.axes.y.showScale()
            this.drawings.forEach(drawing => drawing.plot())
        }

    }
    // Draw crosshair and tooltips
    public showTooltips(x: number, y: number, callback?: Callback): void {
        const state = this.state
        const ctx = (
            this.state.canvases.tooltip.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D
        ctx.clearRect(0, 0, this.width, this.height)
        if (this.drawings.length) {
            ctx.save()
            ctx.lineWidth = this.state.canvases.plot.density
            ctx.strokeStyle = '#696969'
            ctx.setLineDash([5, 5])
            this.state.axes.x.showTooltip(x)
            this.state.axes.y.showTooltip(y)
            ctx.restore()
            state.canvases.tooltip.mouseEvents.position = {x, y}
            this.setState({...state, tooltips: this.drawings.map(
                drawing => drawing.showTooltip(x)
            )}, callback)
        }
    }
    // Clear cross-hair and tooltips
    public hideTooltips(callback?: Callback): void {
        const state = this.state
        state.canvases.tooltip.mouseEvents.drag = false
        state.axes.x.hideTooltip()
        state.axes.y.hideTooltip();
        ((
            this.state.canvases.tooltip.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D).clearRect(
            0, 0, this.width, this.height
        )
        this.setState({...state, tooltips: null}, callback)
    }
    // Event handlers
    public async wheelHandler(event: React.WheelEvent): Promise<void> {
        event.preventDefault()
        event.stopPropagation()
        this.state.axes.x.reScale(
            -event.deltaY / 2000 * this.state.axes.x.scale,
            this.plot
        )
    }
    public async mouseMoveHandler(event: React.MouseEvent): Promise<void> {
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
        const [x, y] = [
            event.clientX - window.left,
            event.clientY - window.top
        ]
        if (this.state.canvases.tooltip.mouseEvents.drag)
            this.state.axes.x.reTranslate(
                x - this.state.canvases.tooltip.mouseEvents.position.x,
                () => { this.showTooltips(x, y, this.plot) }
            )
        else this.showTooltips(x, y)
    }
    public async mouseOutHandler(): Promise<void> {
        this.hideTooltips()
    }
    public async mouseDownHandler(event: React.MouseEvent): Promise<void> {
        const state = this.state
        state.canvases.tooltip.mouseEvents = {
            drag: true,
            position: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.clientY - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().top,
            }
        }
        this.setState(state)
    }
    public async mouseUpHandler(): Promise<void> {
        const state = this.state
        state.canvases.tooltip.mouseEvents.drag = false
        this.setState(state)
    }
    // Life cycle
    public static getDerivedStateFromProps(
        nextProps: Readonly<AxesProps>,
        prevState: Readonly<AxesState>
    ) {
        if (nextProps.parent instanceof AxesGroupReal)
            return {...prevState, size: {...nextProps.size}}
        else
            return prevState
    }
    public componentDidUpdate(
        prevProps: Readonly<AxesProps>,
        prevState: Readonly<AxesState>, snapshot?: any
    ) {
        // Tooltips
        if (prevProps.tooltips !== this.props.tooltips)
            if (this.props.tooltips)
                this.showTooltips(
                    this.props.tooltips.x, this.props.tooltips.y - (
                        this.state.canvases.plot.ref.current?.offsetTop as number
                ) + this.offset)
            else if (!this.props.tooltips && prevProps.tooltips)
                this.hideTooltips()
        if (
            prevState.size.width !== this.state.size.width ||
            prevState.size.height !== this.state.size.height
        ) {
            this.setWindow(() => {
                this.coordinatesTransform(this.state.dataRange)
            })
        }
    }
    public componentDidMount(): void {
        this.offset = this.props.parent instanceof Figure ?
            (this.state.canvases.plot.ref.current?.parentElement?.parentElement?.parentElement?.offsetTop as number)  :
            (this.state.canvases.plot.ref.current?.parentElement?.parentElement?.offsetTop as number)
        this.state.canvases.tooltip.ref.current?.addEventListener(
            // @ts-ignore
            'wheel', this.wheelHandler, { passive: false }
        )  // No page scrolling
        this.state.axes.x.init()
        this.state.axes.y.init()
        this.setWindow(async () => {
            await this.coordinatesTransform({
                start: this.state.axes.x.metadata.local.min /
                    this.state.axes.x.metadata.global.max,
                end: this.state.axes.x.metadata.local.max /
                    this.state.axes.x.metadata.global.max,
            })
        })
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGrid'}
                style={{
                    width: this.width + this.axisSize.y,
                    height: this.height + this.axisSize.x,
                    gridRowStart: this.state.position.row.start,
                    gridRowEnd: this.state.position.row.end,
                    gridColumnStart: this.state.position.column.start,
                    gridColumnEnd: this.state.position.column.end
                }}
            >
                <div className={'axes tooltips'}>
                    {this.state.tooltips}
                </div>
                <canvas
                    ref={this.state.canvases.plot.ref}
                    className={'axes plot scale'}
                    style={{ width: this.width, height: this.height }}
                ></canvas>
                <canvas
                    ref={this.state.canvases.tooltip.ref}
                    className={'axes plot tooltip'}
                    style={{ width: this.width, height: this.height }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
                {this.state.axes.x.render()}
                {this.state.axes.y.render()}
                {this.settings}
            </div>
        )
    }
}
