import React from 'react'
import {AxesReal} from "../../../axes/Axes"
import AxesObjectTree from "../../../axes/settings/objectTree/AxesObjectTree"

interface ObjectTreeElementProps {
    axes: AxesReal
}

interface ObjectTreeElementState {
    active: boolean
}

export default class AxesGroupObjectTreeElement extends React.Component<
    ObjectTreeElementProps, ObjectTreeElementState
    > {
    public constructor(props: ObjectTreeElementProps) {
        super(props)
        this.state = {
            active: false
        }
    }
    public render(): React.ReactNode {
        return (
            <li className={'groupObjectTreeElement'}>
                <span>{
                    this.props.axes.props.title ?
                        this.props.axes.props.title : 'Nameless'
                } {this.props.axes.props.position.row.start}
                </span>
                <AxesObjectTree axes={this.props.axes}/>
            </li>
        )
    }
}
