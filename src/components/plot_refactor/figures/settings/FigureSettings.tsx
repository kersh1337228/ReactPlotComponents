import React from 'react'
import Dialog from "../../../misc/dialog/Dialog"
import SettingsIcon from "../../../misc/icons/SettingsIcon"
import Figure from "../Figure"
import FigureObjectTree from "./objectTree/FigureObjectTree"
import './FigureSettings.css'
import FigureGrid from "./grid/FigureGrid";

interface FigureSettingsProps { figure: Figure }

interface FigureSettingsState { active: boolean }

export default class FigureSettings extends React.Component<
	FigureSettingsProps, FigureSettingsState
> {
	public constructor(props: FigureSettingsProps) {
		super(props)
		this.state = { active: false }
	}
	public render(): React.ReactNode {
		return (
			<div
				className={'figureSettings'}
				style={{
					width: this.props.figure.props.width,
					gridRowStart: this.props.figure.grid.rows,
					gridRowEnd: this.props.figure.grid.rows + 1
				}}
			>
				<div className={'toggle'} onClick={() => {this.setState({active: !this.state.active})}}>
					<SettingsIcon/>
					<div style={{fontFamily: 'SF UI Display', fontWeight: 'bold'}}>
						{this.props.figure.props.title}
					</div>
				</div>
				<Dialog
					title={this.props.figure.props.title} tabs={{
					'Object Tree': <FigureObjectTree figure={this.props.figure} />,
					'Axes Grid': <FigureGrid figure={this.props.figure} />
				}}
					active={this.state.active}
					close={() => {this.setState({active: false})}}
					size={{width: 400}} zIndex={11}
					offset={{y: '-60%', x: '-55%'}}
				/>
			</div>
		)
	}
}
