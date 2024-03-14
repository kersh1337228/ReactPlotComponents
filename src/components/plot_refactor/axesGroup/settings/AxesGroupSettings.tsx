import React from 'react'
import Dialog from "../../../misc/dialog/Dialog"
import SettingsIcon from "../../../misc/icons/SettingsIcon"
import {AxesGroupReal} from "../AxesGroup"
import AxesGroupObjectTree from "./objectTree/AxesGroupObjectTree.jsx"
import '../../axes/settings/AxesSettings.css'
import './AxesGroupSettings.css'
import AxesGroupGrid from "./grid/AxesGroupGrid"

interface AxesGroupSettingsProps { axesGroup: AxesGroupReal }

interface AxesGroupSettingsState { active: boolean }

export default class AxesGroupSettings extends React.Component<
    AxesGroupSettingsProps, AxesGroupSettingsState
> {
    public constructor(props: AxesGroupSettingsProps) {
        super(props)
        this.state = { active: false }
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesGroupSettings'}
                style={{
                    gridRowStart: this.props.axesGroup.grid.rows,
                    gridRowEnd: this.props.axesGroup.grid.rows + 1
                }}
                onClick={() => {this.setState({active: !this.state.active})}}
            >
                <SettingsIcon/>
                <Dialog
                    title={this.props.axesGroup.props.title} tabs={{
                    'Object Tree': <AxesGroupObjectTree axesGroup={this.props.axesGroup} />,
                    'Axes Grid': <AxesGroupGrid axesGroup={this.props.axesGroup} />
                }}
                    active={this.state.active}
                    close={() => {this.setState({active: false})}}
                    size={{width: 400}} zIndex={11}
                />
            </div>
        )
    }
}
