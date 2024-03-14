import React from 'react'
import {AxesReal} from "../../axes/Axes"
import {PlotData, PlotDataName, PointGeometrical} from "../../../../utils/types/plotData"
import {plotDataType} from "../../../../utils/functions/plotDataProcessing"
import {DataRange} from "../../../../utils/types/display"
import './Drawing.css'

export interface DrawingData<T extends PlotData> {
    data: T[],
    x: { min: number, max: number }
    y: { min: number, max: number }
}

export default abstract class Drawing<
    T extends PlotData,  // Drawing data type
    U extends Object,  // Drawing paths type
    V extends { [key: string]: any }  // Drawing style type
> {
    public axes: AxesReal
    public local: DrawingData<T>
    protected dType: PlotDataName
    protected settings: boolean
    public visible: boolean

    protected constructor(
        public readonly global: DrawingData<T>,
        protected paths: U,
        public readonly name: string,
        public style: V,
        public value_field: string = ''
    ) {
        this.local = {
            ...this.global,
            x: { ...this.global.x },
            y: { ...this.global.y }
        }
        this.dType = plotDataType(global.data) as PlotDataName
        this.visible = true
        this.settings = false
        // @ts-ignore
        this.axes = null
    }
    public get points(): PointGeometrical[] {
        return this.local.data.map((_, i) => this.pointAt(i))
    }
    public async coordinatesTransform(dataRange: DataRange): Promise<void> {
        this.local.x.min = dataRange.start * this.global.x.max
        this.local.x.max = dataRange.end * this.global.x.max
        this.local.data = this.global.data.slice(
            Math.floor(this.global.data.length * dataRange.start),
            Math.ceil(this.global.data.length * dataRange.end)
        )
    }
    public abstract pointAt(i: number): PointGeometrical  // Visible data point at i
    public abstract plot(): Promise<void>  // Canvas graphical representation
    public abstract showStyle(): React.ReactNode  // Style settings window
    public abstract showTooltip(x: number): React.ReactNode  // Popup tooltip
}
