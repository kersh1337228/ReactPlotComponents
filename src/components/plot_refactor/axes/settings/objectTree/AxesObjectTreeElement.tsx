import React from 'react'
import EyeIcon from "../../../../misc/icons/EyeIcon"
import CrossIcon from "../../../../misc/icons/CrossIcon"
import SettingsIcon from "../../../../misc/icons/SettingsIcon"
import Dialog from "../../../../misc/dialog/Dialog"
import Drawing from "../../../drawings/Drawing/Drawing"
import {PlotData} from "../../../../../utils/types/plotData"

interface AxesObjectTreeElementProps {
    drawing: Drawing<PlotData, any, any>
}

interface AxesObjectTreeElementState {
    active: boolean
}

export default class AxesObjectTreeElement extends React.Component<
    AxesObjectTreeElementProps, AxesObjectTreeElementState
> {
    public constructor(props: AxesObjectTreeElementProps) {
        super(props)
        this.state = {
            active: false
        }
    }
    public render(): React.ReactNode {
        return (
            <>
                <tr className={'objectTreeElement'}>
                    <td>{this.props.drawing.constructor.name}</td>
                    <td>{this.props.drawing.name}</td>
                    <td onClick={() => {this.setState({active: true})}} style={{cursor: 'pointer'}}>
                        <SettingsIcon/>
                        <Dialog
                            title={`${this.props.drawing.name} settings`}
                            tabs={{
                                Style: this.props.drawing.showStyle()
                            }}
                            active={this.state.active}
                            close={() => {this.setState({active: false})}}
                            zIndex={12}
                        />
                    </td>
                    <td onClick={async () => {
                        this.props.drawing.visible = !this.props.drawing.visible
                        await this.props.drawing.axes?.plot()
                    }} style={{cursor: 'pointer'}}><EyeIcon/></td>
                    <td onClick={() => {
                        this.props.drawing.axes?.setState({
                            drawings: this.props.drawing.axes.state.drawings.filter(
                                d => d.name !== this.props.drawing.name
                            )
                        }, async () => {
                            await this.props.drawing.axes?.plot()
                        })
                    }} style={{cursor: 'pointer'}}><CrossIcon/></td>
                </tr>
            </>
            // <li className={'objectTreeElement'}>
            //     <span>{this.props.drawing.constructor.name}</span>
            //     <span>{this.props.drawing.name}</span>
            //     <span onClick={() => {this.setState({active: true})}} style={{cursor: 'pointer'}}>
            //         <SettingsIcon/>
            //     </span>
            //     <span onClick={async () => {
            //         this.props.drawing.visible = !this.props.drawing.visible
            //         await this.props.drawing.axes?.plot()
            //     }} style={{cursor: 'pointer'}}><EyeIcon/></span>
            //     <span onClick={() => {
            //         this.props.drawing.axes?.setState({
            //             drawings: this.props.drawing.axes.state.drawings.filter(
            //                 d => d.name !== this.props.drawing.name
            //             )
            //         }, async () => {
            //             await this.props.drawing.axes?.plot()
            //         })
            //     }} style={{cursor: 'pointer'}}><CrossIcon/></span>
            //     <Dialog
            //         title={`${this.props.drawing.name} settings`}
            //         tabs={{
            //             Style: this.props.drawing.showStyle()
            //         }}
            //         active={this.state.active}
            //         close={() => {this.setState({active: false})}}
            //         zIndex={12}
            //     />
            // </li>
        )
    }
}
