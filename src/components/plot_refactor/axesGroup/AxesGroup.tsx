import React from 'react'
import xAxisGroup from "./axis/xAxisGroup"
import xAxisDateTimeGroup from "./axis/xAxisDateTimeGroup"
import {AxesReal} from "../axes/Axes"
import AxesGroupSettings from "./settings/AxesGroupSettings"
import {axisSize} from "../../../utils/constants/plot"
import Drawing from "../drawings/Drawing/Drawing"
import {fillData, plotDataTypeVectorised} from "../../../utils/functions/plotDataProcessing"
import {DataRange, GridPosition, Padding2D, Size2D} from "../../../utils/types/display"
import {ComponentChildren, TooltipCanvasObject} from "../../../utils/types/reactObjects"
import {PlotData, Geometrical, TimeSeries} from "../../../utils/types/plotData"
import {Callback} from "../../../utils/types/callable"
import NumberRange, {plotNumberRange} from "../../../utils/classes/iterable/NumberRange"
import DateTimeRange, {plotDateTimeRange} from "../../../utils/classes/iterable/DateTimeRange"
import Figure from "../figures/Figure"
import {defaultValue} from "../../../utils/functions/miscellaneous"
import './AxesGroup.css'

interface AxesGroupPlaceholderProps {
    children: JSX.Element[]
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    padding?: Padding2D
    title: string
}

// Placeholder
export default function AxesGroup(props: AxesGroupPlaceholderProps): JSX.Element {return <></>}

interface AxesGroupProps extends AxesGroupPlaceholderProps {
    size: Size2D
    parent: Figure
    xAxisData: NumberRange | DateTimeRange
}

interface AxesGroupState {
    children: ComponentChildren<AxesReal>
    dataRange: DataRange
    dataAmount: number
    canvases: { tooltip: TooltipCanvasObject }
    axes: { x: xAxisGroup | xAxisDateTimeGroup }
    tooltips: boolean
    position: GridPosition
    size: Size2D
}

export class AxesGroupReal extends React.Component<AxesGroupProps, AxesGroupState> {
    // Settings
    public grid: { rows: number, columns: number }
    public axisSize: { x: number, y: number }
    // Methods
    public constructor(props: AxesGroupProps) {
        super(props)
        // Children nodes array
        let groupChildren = (props.children as any[]).length ?
            props.children as JSX.Element[]:  // @ts-ignore
            [props.children as JSX.Element]  // Making array (one child was passed)
        // Children drawings dType
        let drawings = [].concat(...Array.from(
            groupChildren, groupChild => groupChild.props.drawings
        ))
        const dType = plotDataTypeVectorised(drawings)
        let xAxisData: NumberRange | DateTimeRange
        let xAxisLabels: number[] | string[]
        if (dType)
            if (dType === 'Geometrical') {
                xAxisData = plotNumberRange(drawings as Drawing<Geometrical, any, any>[])
                xAxisLabels = [...xAxisData]
            } else {
                xAxisData = plotDateTimeRange(drawings as Drawing<TimeSeries, any, any>[])
                xAxisLabels = [...xAxisData.format('%Y-%m-%d')]
            }
        else throw Error("<AxesGroup> nested <Axes> drawings all must have uniform data type.")
        // Grid borders
        this.grid = {
            rows: Math.max.apply(null, Array.from(
                groupChildren, groupChild => groupChild.props.position.row.end
            )),
            columns: Math.max.apply(null, Array.from(
                groupChildren, groupChild => groupChild.props.position.column.end
            ))
        }  // Minimal size units
        const cellHeight = this.props.size.height / (this.grid.rows - 1)
        // State initialization
        this.state = {
            children: { nodes: this.props.children.map((groupChild, index) => {
                const size = {  // Children node actual size
                    width: this.props.size.width,
                    height: (
                        groupChild.props.position.row.end -
                        groupChild.props.position.row.start
                    ) * cellHeight,
                }
                const drawings = (groupChild.props.drawings as Drawing<any, any, any>[]).map(drawing => {
                    if (!drawing.global.data.length) throw Error('Drawing data can not be empty.')
                    return new (Object.getPrototypeOf(drawing).constructor)(
                        fillData(drawing.global.data, xAxisLabels), drawing.name,
                        drawing.style, drawing.value_field
                    )
                })
                const childProps = {
                    ...groupChild.props,
                    xAxis: false,
                    yAxis: defaultValue(groupChild.props.yAxis, true),
                    padding: defaultValue(groupChild.props.padding, {
                        left: 0, top: 0, right: 0, bottom: 0, ...groupChild.props.padding
                    }), title: defaultValue(groupChild.props.title, ''),
                    position: {...groupChild.props.position, column: {start: 1, end: 3}},
                    drawings, parent: this, size, key: index, xAxisData
                }
                return React.createElement(AxesReal, childProps)
            }), components: [] },
            dataRange: { start: 0, end: 1 },
            dataAmount: xAxisData.length,
            canvases: {
                tooltip: {
                    ref: React.createRef(),
                    mouseEvents: { drag: false, position: {x: 0, y: 0} }
                }
            }, tooltips: false, axes: {
                x: xAxisData instanceof NumberRange ?
                    new xAxisGroup(this, xAxisData as NumberRange) :
                    new xAxisDateTimeGroup(this, xAxisData as DateTimeRange)
            }, position: props.position, size: props.size
        }
        // Methods binding
        this.wheelHandler = this.wheelHandler.bind(this)
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
        this.plot = this.plot.bind(this)
        // Constants initialization
        this.axisSize = {
            x: this.props.xAxis ? axisSize.height : 0,
            y: this.props.yAxis ? axisSize.width : 0
        }
        // Passing children inside of parent node
        let state = props.parent.state
        state.children.components.push(this)
        props.parent.setState(state)
    }
    // All Drawing objects inside
    public get children(): JSX.Element[] | AxesReal[] {
        return this.state ? this.state.children.components : this.props.children
    }
    public get drawings(): Drawing<PlotData, any, any> [] {
        return this.state ? ([] as Array<Drawing<PlotData, any, any>>).concat(
            ...this.children.map(axes => (axes as AxesReal).drawings)
        ) : ([] as Array<Drawing<PlotData, any, any>>).concat(
            ...this.children.map(axes => axes.props.drawings)
        )
    }
    // Max data amount inside
    public get globalDataAmount(): number {
        return Math.max.apply(null, [1, ...Array.from(
            this.drawings, drawing => (
                drawing as Drawing<PlotData, any, any>
            ).global.data.length
        )] as number[])
    }
    // Actual component width
    public get width(): number {
        return this.state.size.width
    }
    // Actual component height
    public get height(): number {
        return this.state.size.height
    }
    // Image padding
    public get padding(): { top: number, left: number, bottom: number, right: number } {
        return this.props.padding ? {
            top: this.props.padding.top ?  this.props.padding.top : 0,
            left: this.props.padding.left ?  this.props.padding.left : 0,
            bottom: this.props.padding.bottom ?  this.props.padding.bottom : 0,
            right: this.props.padding.right ?  this.props.padding.right : 0
        } : { top: 0, left: 0, bottom: 0, right: 0 }
    }
    // Canvas borders coordinates
    public get left(): number { return 0 }
    public get right(): number { return this.width }
    public get top(): number { return this.height }
    public get bottom(): number { return 0 }
    // Canvas inner width with padding
    public get paddedWidth(): number {
        return this.right - this.left
    }
    // Canvas inner height with padding
    public get paddedHeight(): number {
        return this.top - this.bottom
    }
    // Change components size and canvases resolution
    public setWindow(callback?: Callback) {
        const state = this.state
        state.children.nodes = this.state.children.nodes.map(groupChild => {
            const size = {  // Children node actual size
                width: this.width,
                height: (
                    groupChild.props.position.row.end -
                    groupChild.props.position.row.start
                ) * this.height / (this.grid.rows - 1),
            }
            return React.createElement(AxesReal, {...groupChild.props, size})
        })
        const canvas = state.canvases.tooltip.ref.current as HTMLCanvasElement
        canvas.width = this.width
        canvas.height = this.height
        state.axes.x.setWindow()
        this.setState(state, callback)
    }
    // Set new meta-data for data range given
    public async coordinatesTransform(
        dataRange: DataRange, callback: Callback = this.plot
    ): Promise<void> {
        const drawings = ([] as Array<Drawing<PlotData, any, any>>).concat(
            ...this.state.children.components.map(axes => axes.drawings.map(drawing => {
                drawing.coordinatesTransform(dataRange)
                return drawing
            }))
        )
        this.setState({
            dataRange, dataAmount: Math.max.apply(
                null, [1, ...drawings.map(drawing => drawing.local.data.length)]
            )
        }, () => {
            if (drawings.length) {
                const state = this.state
                state.axes.x.coordinatesTransform()
                state.axes.x.showScale()
                this.setState(state, callback)
            }
        })
    }
    // Draw crosshair and tooltips
    public showTooltips(x: number, y: number, callback?: Callback): void {
        const ctx = (
            this.state.canvases.tooltip.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D
        ctx.clearRect(0, 0, this.width, this.height)
        if (this.drawings.length) {
            ctx.save()
            ctx.lineWidth = 1
            ctx.strokeStyle = '#696969'
            ctx.setLineDash([5, 5])
            const state = this.state
            state.axes.x.showTooltip(x)
            ctx.restore()
            state.canvases.tooltip.mouseEvents.position = {x, y}
            this.setState({...state, tooltips: true}, callback)
        }
    }
    public plot(): void {
        this.state.children.components.forEach(axes => axes.plot())
    }
    // Event handlers
    public async wheelHandler(event: React.WheelEvent): Promise<void> {
        event.preventDefault()
        event.stopPropagation()
        this.state.axes.x.reScale(
            -event.deltaY / 2000 * this.state.axes.x.scale
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
                () => { this.showTooltips(x, y) }
            )
        else this.showTooltips(x, y)
    }
    public async mouseOutHandler(): Promise<void> {
        const state = this.state
        state.canvases.tooltip.mouseEvents.drag = false
        state.axes.x.hideTooltip();
        ((
            this.state.canvases.tooltip.ref.current as HTMLCanvasElement
        ).getContext('2d') as CanvasRenderingContext2D).clearRect(
            0, 0, this.width, this.height
        )
        this.setState({...state, tooltips: false})
    }
    public async mouseDownHandler(event: React.MouseEvent): Promise<void> {
        const state = this.state
        state.canvases.tooltip.mouseEvents = {
            drag: true,
            position: {
                x: event.clientX - (
                    event.target as HTMLCanvasElement
                ).getBoundingClientRect().left,
                y: event.pageY,
                // y: event.clientY - (
                //     event.target as HTMLCanvasElement
                // ).getBoundingClientRect().top,
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
    public componentDidMount(): void {
        this.state.canvases.tooltip.ref.current?.addEventListener(
            // @ts-ignore
            'wheel', this.wheelHandler, { passive: false }
        )  // No page scrolling
        this.state.axes.x.init()
        this.setWindow(async () => {
            this.coordinatesTransform({
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
                className={'axesGroupGrid'}
                style={{
                    width: this.width + this.axisSize.y,
                    height: this.height + this.axisSize.x,
                    gridRowStart: this.state.position.row.start,
                    gridRowEnd: this.state.position.row.end,
                    gridColumnStart: this.state.position.column.start,
                    gridColumnEnd: this.state.position.column.end
                }}
            >
                {this.state.children.nodes.map((child, index) =>
                    React.createElement(AxesReal, {
                        ...child.props, key: index,
                        tooltips: this.state.tooltips ?
                            this.state.canvases.tooltip.mouseEvents.position : undefined
                    })
                )}
                {this.state.axes.x.render()}
                <div
                    className={'axesGroup placeholder'}
                    style={{
                        width: axisSize.width,
                        height: this.height,
                        gridRowStart: 1,
                        gridRowEnd: this.grid.rows,
                        gridColumnStart: 1,
                        gridColumnEnd: 2
                    }}
                ></div>
                <canvas
                    ref={this.state.canvases.tooltip.ref}
                    className={'axesGroup tooltip'}
                    style={{
                        width: this.width,
                        height: this.height,
                        gridRowStart: 1,
                        gridRowEnd: this.grid.rows,
                        gridColumnStart: 2,
                        gridColumnEnd: 3
                    }}
                    onMouseMove={this.mouseMoveHandler}
                    onMouseOut={this.mouseOutHandler}
                    onMouseDown={this.mouseDownHandler}
                    onMouseUp={this.mouseUpHandler}
                ></canvas>
                <AxesGroupSettings axesGroup={this}/>
            </div>
        )
    }
}
