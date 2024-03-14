import React from "react"
import {axisSize} from "../../../utils/constants/plot"
import './ModalDynamic.css'

interface ModalDynamicProps {
    children: React.ReactElement
    active: boolean
    translate: { x: number | string, y: number | string }
    zIndex: number
    hide?: () => void
    placeholder?: JSX.Element | string
}

interface ModalDynamicState {}

export default class ModalDynamic extends React.Component<
    ModalDynamicProps, ModalDynamicState
> {
    public constructor(props: ModalDynamicProps) {
        super(props)
        this.state = {}
    }
    public get translate(): { x: string, y: string } {
        return {
            x: typeof this.props.translate.x === 'number' ?
                `${this.props.translate.x}px` : this.props.translate.x,
            y: typeof this.props.translate.y === 'number' ?
                `${this.props.translate.y}px` : this.props.translate.y,
        }
    }
    public render(): React.ReactElement {
        return (
            <div className={this.props.active ? 'modalDynamic active' : 'modalDynamic'} style={{
                transform: `translate(${this.translate.x}, ${this.translate.y})`,
                zIndex: this.props.zIndex
            }} onClick={(event: React.MouseEvent) => {event.stopPropagation()}}
            >
                {this.props.children}
            </div>
        )
    }
}
