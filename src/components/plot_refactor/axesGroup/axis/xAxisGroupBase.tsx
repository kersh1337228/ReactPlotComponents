import React from "react"
import {AxesGroupReal} from "../AxesGroup"
import {axisSize} from "../../../../utils/constants/plot"
import NumberRange from "../../../../utils/classes/iterable/NumberRange"
import DateTimeRange from "../../../../utils/classes/iterable/DateTimeRange"
import xAxisBase from "../../axes/axis/xAxis/xAxisBase"
import {Callback} from "../../../../utils/types/callable"

export default abstract class xAxisGroupBase<T extends NumberRange | DateTimeRange> extends xAxisBase<T, AxesGroupReal> {
    public async reScale(ds: number, callback?: Callback): Promise<void> {
        await super.reScale(ds, callback)
        this.axes.state.children.components.forEach(
            axes => (axes.state.axes.x as xAxisBase<T, any>).reScale(ds)
        )
    }
    public async reTranslate(dt: number, callback?: Callback): Promise<void> {
        await super.reTranslate(dt, callback)
        this.axes.state.children.components.forEach(
            axes => (axes.state.axes.x as xAxisBase<T, any>).reTranslate(dt)
        )
    }
    public render(): React.ReactNode {
        return this.axes.props.xAxis === false ? null :
            <><canvas
                ref={this.canvases.scale.ref}
                className={'axes x scale'}
                style={{
                    width: this.axes.props.size.width,
                    height: axisSize.height,
                    gridRowStart: this.axes.grid.rows,
                    gridRowEnd: this.axes.grid.rows + 1
                }}
            ></canvas><canvas
                ref={this.canvases.tooltip.ref}
                className={'axes x tooltip'}
                style={{
                    width: this.axes.props.size.width,
                    height: axisSize.height,
                    gridRowStart: this.axes.grid.rows,
                    gridRowEnd: this.axes.grid.rows + 1
                }}
                onMouseMove={this.mouseMoveHandler}
                onMouseOut={this.mouseOutHandler}
                onMouseDown={this.mouseDownHandler}
                onMouseUp={this.mouseUpHandler}
            ></canvas></>
    }
}
