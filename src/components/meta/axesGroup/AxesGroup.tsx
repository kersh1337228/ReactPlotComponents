import React from 'react'
import xAxisGroup from "./axis/xAxisGroup"
import xAxisDateTimeGroup from "./axis/xAxisDateTimeGroup"
import {AxesReal} from "../axes/Axes"
import './AxesGroup.css'
import AxesGroupSettings from "./settings/AxesGroupSettings"
import {axisSize, initDataAmount} from "../Figure/Figure"
import Drawing from "../drawings/Drawing/Drawing"
import {fillData, plotDataTypeVectorised} from "../utils/functions/dataTypes"
import xAxisGroupBase from "./axis/xAxisGroupBase"
import {DataRange, GridPosition, Padding2D, Size2D} from "../utils/types/display"
import {ComponentChildren, TooltipCanvasObject} from '../utils/types/react'
import {PlotData, Point2D, TimeSeries} from "../utils/types/plotData"
import {Callback} from "../utils/types/callable"
import NumberRange, {plotNumberRange} from "../utils/classes/iterable/NumberRange"
import DateTimeRange, {plotDateTimeRange} from "../utils/classes/iterable/DateTimeRange"

interface AxesGroupPlaceholderProps {
    children: React.ReactNode
    position: GridPosition
    xAxis?: boolean
    yAxis?: boolean
    padding?: Padding2D
    title?: string
}

// Placeholder
export default function AxesGroup(props: AxesGroupPlaceholderProps): JSX.Element {return <></>}

interface AxesGroupProps extends AxesGroupPlaceholderProps {
    size: Size2D
}

interface AxesGroupState {
    children: ComponentChildren<AxesReal>
    data_range: DataRange | undefined
    data_amount: number
    tooltips: { x: number, y: number } | null
    tooltip: TooltipCanvasObject
    xAxis: xAxisGroupBase<NumberRange | DateTimeRange>
}

export class AxesGroupReal extends React.Component<AxesGroupProps, AxesGroupState> {
    public constructor(props: AxesGroupProps) {
        super(props)
        // Children nodes array
        let children: JSX.Element[]
        if ((props.children as any[]).length)
            children = props.children as JSX.Element[]
        else
            children = [props.children as JSX.Element]
        // Grid borders
        const [maxRow, maxCol] = [
            Math.max.apply(null, Array.from(
                children, child => child.props.position.row.end
            )),
            Math.max.apply(null, Array.from(
                children, child => child.props.position.column.end
            ))
        ]
        // Children drawings dType
        const drawings = [].concat(...Array.from(children, axes => axes.props.drawings))
        const dType = plotDataTypeVectorised(drawings)
        let xAxisInit: xAxisGroupBase<NumberRange | DateTimeRange>
        let labels: number[] | string[]
        if (dType) {
            if (dType === 'Point2D') {
                xAxisInit = new xAxisGroup(this)
                labels = [...plotNumberRange(drawings as Drawing<Point2D>[])]
            } else {
                xAxisInit = new xAxisDateTimeGroup(this)
                labels = [...plotDateTimeRange(drawings as Drawing<TimeSeries>[]).format('%Y-%m-%d')]
            }
        }
        else throw Error("<AxesGroup> nested <Axes> drawings must have uniform data type")
        // Children nodes finally rendered
        let stateChildren = children.map((child, index) => {
            const size = {  // Children node actual size
                width: (child.props.position.column.end -
                    child.props.position.column.start
                ) * (props.size ?
                        props.size.width : 0
                ) / (maxCol - 1),
                height: (child.props.position.row.end -
                    child.props.position.row.start
                ) * (props.size ?
                        props.size.height : 0
                ) / (maxRow - 1),
            }
            if (child.type.name === 'Axes') {
                const drawing = child.props.drawings[0]
                drawing.data.full = fillData(drawing.data.full, labels)
                return React.createElement(AxesReal, {
                    ...child.props, size, xAxis: false, parent: this, padding: props.padding,
                    position: {...child.props.position, column: {start: 1, end: 3}},
                    drawings: [drawing, ...child.props.drawings.slice(1)]
                })
            }
            else throw Error("Only <Axes> can appear as <AxesGroup> children.")
        })
        // State initialization
        this.state = {
            children: { nodes: stateChildren, components: [] },
            data_range: undefined,
            data_amount: 0,
            tooltips: null,
            tooltip: {
                ref: React.createRef(),
                mouse_events: { drag: false, position: {x: 0, y: 0} }
            },
            xAxis: xAxisInit,
        }
        // Methods binding
        this.mouseMoveHandler = this.mouseMoveHandler.bind(this)
        this.mouseOutHandler = this.mouseOutHandler.bind(this)
        this.mouseDownHandler = this.mouseDownHandler.bind(this)
        this.mouseUpHandler = this.mouseUpHandler.bind(this)
    }
    // All Drawing objects inside
    public get children(): JSX.Element[] | AxesReal[] {
        return this.state.children.components.length < this.state.children.nodes.length ?
            this.state.children.nodes : this.state.children.components
    }
    public get drawings(): Drawing<PlotData> [] {
        return ([] as Array<Drawing<PlotData>>).concat(
            ...this.children.map(axes => (
                axes instanceof AxesReal ?
                    axes.drawings : axes.props.drawings
            ))
        )
    }
    // Max data amount inside
    public get max_data_amount(): number {
        return Math.max.apply(null, [1, ...Array.from(
            this.children as any[], axes => Math.max.apply(
                null, Array.from((axes instanceof AxesReal ?
                        axes.drawings : axes.props.drawings
                ), drawing => (drawing as Drawing<any>).data.full.length)
            )
        )] as number[])
    }
    // Actual component width
    public get width(): number {
        return this.props.size.width
    }
    // Actual component height
    public get height(): number {
        return this.props.size.height
    }
    // Change components size and canvases resolution
    public set_window(callback?: Callback) {
        const state = this.state
        if (state.tooltip.ref.current) {
            state.tooltip.ref.current.width = this.width
            state.tooltip.ref.current.height = this.height
        }
        state.xAxis.set_window()
        this.setState(state, callback)
    }
    // Set new meta-data for data range given
    public async recalculate_metadata(data_range: DataRange, callback?: Callback): Promise<void> {
        const state = this.state
        const drawings = ([] as Array<Drawing<PlotData>>).concat(
            ...state.children.components.map(axes => {
                const drawings = axes.state.drawings
                drawings.forEach(drawing => drawing.recalculate_metadata(data_range))
                return drawings
            })
        )
        this.setState({
            ...state, data_range,
            data_amount: this.state.children.components[0].state.data_amount ?
                this.state.children.components[0].state.data_amount :
                Math.max.apply(
                    null, [1, ...drawings.map(drawing => drawing.data_amount)]
                )
        }, () => {
                const state = this.state
                if (drawings.length)
                    state.xAxis.transform_coordinates(drawings)
                state.xAxis.show_scale()
                this.setState(state, callback)
            }
        )
    }
    // Draw crosshair and tooltips
    public show_tooltips(x: number, y: number, callback?: Callback): void {
        const state = this.state
        const context = state.tooltip.ref.current?.getContext('2d')
        if (context) {
            context.save()
            context.clearRect(0, 0, this.width, this.height)
            context.lineWidth = this.state.children.components[0].state.canvases.plot.density
            context.strokeStyle = '#696969'
            context.setLineDash([5, 5])
            state.xAxis.show_tooltip(x)
            context.restore()
        }
        state.tooltip.mouse_events.position = {x, y}
        this.setState({...state, tooltips: {x, y}}, callback)
    }
    // Event handlers
    public async mouseMoveHandler(event: React.MouseEvent) {
        const window = (event.target as HTMLCanvasElement).getBoundingClientRect()
        const [x, y] = [
            event.clientX - window.left,
            event.clientY - window.top
        ]
        if (x >= 0 && y >= 0 && this.state.data_range) {
            let data_range = {start: 0, end: 1}
            Object.assign(data_range, this.state.data_range)
            if (this.state.tooltip.mouse_events.drag) {
                const x_offset = (
                    x - this.state.tooltip.mouse_events.position.x
                ) * this.state.xAxis.scroll_speed / this.state.xAxis.coordinates.scale / this.max_data_amount * 2
                if (x_offset) {
                    if (x_offset < 0) {
                        data_range.end =
                            data_range.end - x_offset >= 1 ?
                                1 : data_range.end - x_offset
                        data_range.start =
                            data_range.end - (
                                this.state.data_range.end -
                                this.state.data_range.start
                            )
                    } else if (x_offset > 0) {
                        data_range.start =
                            data_range.start - x_offset <= 0 ?
                                0 : data_range.start - x_offset
                        data_range.end =
                            data_range.start + (
                                this.state.data_range.end -
                                this.state.data_range.start
                            )
                    }
                }
                this.recalculate_metadata(data_range, () => { this.show_tooltips(x, y) })
            } else this.show_tooltips(x, y)
        }
    }
    public mouseOutHandler() {
        const state = this.state
        state.tooltip.mouse_events.drag = false
        state.xAxis.hide_tooltip()
        state.tooltip.ref.current?.getContext('2d')?.clearRect(0, 0, this.width, this.height)
        this.setState({...state, tooltips: null})
    }
    public mouseDownHandler(event: React.MouseEvent) {
        this.setState({tooltip: {
            ...this.state.tooltip,
            mouse_events: {
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
        }})
    }
    public mouseUpHandler() {
        this.setState({
            tooltip: {
                ...this.state.tooltip,
                mouse_events: {
                    ...this.state.tooltip.mouse_events,
                    drag: false
                }
            }
        })
    }
    // Life cycle
    public componentDidMount(): void {
        this.set_window(async () => {
            await this.recalculate_metadata({
                start: 1 - Math.min(
                    initDataAmount, this.max_data_amount
                ) / this.max_data_amount,
                end: 1
            })
        })
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGroupGrid'}
                style={{
                    width: this.props.size.width + axisSize.y,
                    height: this.props.size.height + (this.props.xAxis === false ? 0 : axisSize.x),
                    gridRowStart: this.props.position.row.start,
                    gridRowEnd: this.props.position.row.end,
                    gridColumnStart: this.props.position.column.start,
                    gridColumnEnd: this.props.position.column.end
                }}
            >
                {this.state.children.nodes.map((child, index) =>
                    React.createElement(AxesReal, {
                        ...child.props,
                        data_range: this.state.data_range,
                        tooltips: this.state.tooltips ? {
                            ...this.state.tooltips,
                            y: this.state.tooltips.y - child.props.size.height * index
                        } : null,
                        key: index
                    })
                )}
                {this.state.xAxis.render()}
                <div
                    className={'axesGroup placeholder'}
                    style={{
                        width: axisSize.y,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.nodes.length + 1
                    }}
                ></div>
                <canvas
                    ref={this.state.tooltip.ref}
                    className={'axesGroup tooltip'}
                    style={{
                        width: this.props.size?.width,
                        height: this.props.size?.height,
                        gridRowStart: 1,
                        gridRowEnd: this.state.children.nodes.length + 1
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
