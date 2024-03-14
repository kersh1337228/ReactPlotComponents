import React from 'react'
import {AxesGroupReal} from "../../AxesGroup"
import AxesGroupObjectTreeElement from "./AxesGroupObjectTreeElement"

interface AxesGroupObjectTreeProps { axesGroup: AxesGroupReal }

interface AxesGroupObjectTreeState {}

export default class AxesGroupObjectTree extends React.Component<
    AxesGroupObjectTreeProps, AxesGroupObjectTreeState
> {
    public constructor(props: AxesGroupObjectTreeProps) {
        super(props)
        this.state = {}
    }
    public render(): React.ReactNode {
        return (
            <ul className={'groupObjectTree'}>
                {this.props.axesGroup.state.children.components.map((axes, index) =>
                    <AxesGroupObjectTreeElement key={index} axes={axes}/>
                )}
            </ul>
        )
    }
}
