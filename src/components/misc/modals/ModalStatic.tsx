import React from "react"
import './ModalStatic.css'

interface ModalStaticState {}

interface ModalStaticProps {
    children: React.ReactElement
    active: boolean
    hide?: () => void
    placeholder?: JSX.Element | string
}

export default class ModalStatic extends React.Component<
    ModalStaticProps, ModalStaticState
> {
    constructor(props: ModalStaticProps) {
        super(props)
        this.state = {}
    }
    render(): React.ReactElement {
        return (
            <div className={'modalStatic'}>
                <div
                    className={
                        this.props.active ?
                            'modalBackground active' : 'modalBackground'
                    }
                    onClick={this.props.hide}
                >
                    <div
                        className={'modalForeground'}
                        onClick={(event: React.MouseEvent) => {event.stopPropagation()}}
                    >
                        {this.props.children}
                    </div>
                </div>
                {this.props.placeholder}
            </div>
        )
    }
}
