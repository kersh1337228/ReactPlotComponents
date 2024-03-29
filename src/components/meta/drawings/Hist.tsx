import Drawing from "./Drawing/Drawing"
import DrawingScalar from "./Drawing/DrawingScalar"
import DrawingVector from "./Drawing/DrawingVector"
import {plotDataType} from "../utils/functions/dataTypes"
import {Point2D, TimeSeries, TimeSeriesArray, TimeSeriesObject} from "../utils/types/plotData"

export interface HistStyle {
    color: { pos: string, neg: string }
}

// @ts-ignore
export class HistBase<T extends Point2D | TimeSeries | Quotes> extends Drawing<T> {
    public constructor(name: string, data: T[], style?: HistStyle) {
        super(name, data)
        this.style = style ? style : { color: { pos: '#53e9b5', neg: '#da2c4d' } }
    }
    // Drawing
    public async plot(): Promise<void> {
        if (this.axes) {
            const context = this.axes.state.canvases.plot.ref.current?.getContext('2d')
            if (this.visible && context) {
                // Transforming coordinates
                context.save()
                context.translate(
                    this.axes.state.axes.x.coordinates.translate,
                    this.axes.state.axes.y.coordinates.translate
                )
                context.scale(
                    this.axes.state.axes.x.coordinates.scale,
                    this.axes.state.axes.y.coordinates.scale
                )
                // Drawing
                for (let i = 0; i < this.data_amount; ++i) {
                    const [x, y] = this.point(i)
                    if (y) {
                        context.fillStyle = y > 0 ?
                            this.style.color.pos : this.style.color.neg
                        context.fillRect(x - 0.45, 0, 0.9, y)
                    }
                }
                context.restore()
            }
        }
    }
    // Events
    public show_style(): React.ReactElement {
        return (
            <div key={this.name}>
                <label htmlFor={'visible'}>{this.name}</label>
                <input type={'checkbox'} name={'visible'}
                       onChange={async (event) => {
                           this.visible = event.target.checked
                           await this.axes?.recalculate_metadata(
                               this.axes.state.data_range
                           )
                       }}
                       defaultChecked={this.visible}
                />
                <ul>
                    <li>Positive color: <input
                        type={'color'}
                        defaultValue={this.style.color.pos}
                        onChange={async (event) => {
                            this.style.color.pos = event.target.value
                            await this.axes?.plot()
                        }}
                    /></li>
                    <li>Negative color: <input
                        type={'color'}
                        defaultValue={this.style.color.neg}
                        onChange={async (event) => {
                            this.style.color.neg = event.target.value
                            await this.axes?.plot()
                        }}
                    /></li>
                </ul>
            </div>
        )
    }
}

class HistScalar extends DrawingScalar(HistBase<Point2D | TimeSeriesArray>) {}
class HistVector extends DrawingVector(HistBase<TimeSeriesObject>) {}

export default function Hist(
    name: string,
    data: Point2D[] | TimeSeries[],
    style?: HistStyle
): HistScalar | HistVector {
    return plotDataType(data) === 'TimeSeriesObject' ?
        new HistVector(name, data as TimeSeriesObject[], style) :
        new HistScalar(name, data as Point2D[] | TimeSeriesArray[], style)
}
