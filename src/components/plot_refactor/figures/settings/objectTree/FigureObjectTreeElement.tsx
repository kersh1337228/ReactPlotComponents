import React from 'react'
import {AxesReal} from "../../../axes/Axes"
import {AxesGroupReal} from "../../../axesGroup/AxesGroup"
import AxesObjectTree from "../../../axes/settings/objectTree/AxesObjectTree"
import AxesGroupObjectTree from "../../../axesGroup/settings/objectTree/AxesGroupObjectTree.jsx"


interface ObjectTreeElementProps {
	child: AxesReal | AxesGroupReal
}

interface ObjectTreeElementState {
	active: boolean
}

export default class FigureObjectTreeElement extends React.Component<
	ObjectTreeElementProps, ObjectTreeElementState
> {
	public constructor(props: ObjectTreeElementProps) {
		super(props)
		this.state = { active: false }
	}
	public render(): React.ReactNode {
		return (
			<>
                <span style={{fontWeight: 'bold'}}>{this.props.child.props.title}</span>
				<li className={'figureObjectTreeElement'}>
					{this.props.child instanceof AxesReal ?
						<AxesObjectTree axes={this.props.child} /> :
						<AxesGroupObjectTree axesGroup={this.props.child} />
					}
				</li>
			</>

		)
	}
}
