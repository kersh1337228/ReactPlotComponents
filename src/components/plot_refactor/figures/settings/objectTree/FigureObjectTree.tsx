import React from 'react'
import Figure from "../../Figure"
import FigureObjectTreeElement from "./FigureObjectTreeElement"

interface FigureObjectTreeProps { figure: Figure }

interface FigureObjectTreeState {}

export default class FigureObjectTree extends React.Component<
	FigureObjectTreeProps, FigureObjectTreeState
> {
	public constructor(props: FigureObjectTreeProps) {
		super(props)
		this.state = {}
	}
	public render(): React.ReactNode {
		return (
			<ul className={'figureObjectTree'}>
				{this.props.figure.state.children.components.map((child, index) =>
					<FigureObjectTreeElement key={index} child={child}/>
				)}
			</ul>
		)
	}
}
