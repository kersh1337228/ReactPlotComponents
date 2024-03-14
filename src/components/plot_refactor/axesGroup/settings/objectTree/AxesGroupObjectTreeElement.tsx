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
            <>
                <span style={{fontWeight: 'bold'}}>{this.props.axes.props.title}</span>
                <li className={'groupObjectTreeElement'}>
                    <AxesObjectTree axes={this.props.axes}/>
                </li>
            </>

        )
    }
}
