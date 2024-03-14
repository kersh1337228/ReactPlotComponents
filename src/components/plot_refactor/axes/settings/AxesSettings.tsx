import React from 'react'
import {AxesReal} from "../Axes"
import Dialog from "../../../misc/dialog/Dialog"
import AxesObjectTree from "./objectTree/AxesObjectTree"
import SettingsIcon from "../../../misc/icons/SettingsIcon"
import './AxesSettings.css'

interface AxesSettingsProps { axes: AxesReal }

interface AxesSettingsState { active: boolean }

export default class AxesSettings extends React.Component<
    AxesSettingsProps, AxesSettingsState
> {
    public constructor(props: AxesSettingsProps) {
        super(props)
        this.state = { active: false }
    }
    public render(): React.ReactNode {
        return (
            <div
                className={'axesSettings'}
                onClick={() => {this.setState({active: !this.state.active})}}
            >
                <SettingsIcon/>
                <Dialog
                    title={this.props.axes.props.title} tabs={{
                        'Object tree': <AxesObjectTree axes={this.props.axes} />,
                    }}
                    active={this.state.active}
                    close={() => {this.setState({active: false})}}
                    size={{width: 400}} zIndex={11}
                />
            </div>
        )
    }
}
