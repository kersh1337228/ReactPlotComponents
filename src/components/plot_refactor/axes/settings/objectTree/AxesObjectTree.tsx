import React from 'react'
import {AxesReal} from "../../Axes"
import AxesObjectTreeElement from "./AxesObjectTreeElement"

interface AxesObjectTreeProps {
    axes: AxesReal
}

interface AxesObjectTreeState {}

export default class AxesObjectTree extends React.Component<
    AxesObjectTreeProps, AxesObjectTreeState
> {
    public constructor(props: AxesObjectTreeProps) {
        super(props)
        this.state = {}
    }
    public render(): React.ReactNode {
        return (
            <table className={'objectTree'}>
                <tbody>
                    {this.props.axes.state.drawings.map(drawing =>
                        <AxesObjectTreeElement drawing={drawing} key={drawing.name}/>
                    )}
                </tbody>
            </table>
            // <ul className={'objectTree'}>
            //     {this.props.axes.state.drawings.map(drawing =>
            //         <AxesObjectTreeElement drawing={drawing} key={drawing.name}/>
            //     )}
            // </ul>
        )
    }
}
