import React from 'react'
import './Figure.css'

interface FigureProps {
    width: number
    height: number
    children: React.ReactNode
    name?: string
}

interface FigureState {
    children: React.ReactNode
}

export default class Figure extends React.Component<
    FigureProps, FigureState
> {
    public constructor(props: FigureProps) {
        super(props)
        // Children node size correction
        if (props.children) {
            let children: JSX.Element[]
            if ((props.children as any[]).length) {
                children = props.children as JSX.Element[]
            } else {
                children = [props.children as JSX.Element]
            }
            const [maxRow, maxCol] = [
                Math.max.apply(
                    null, Array.from(
                        children, child => child.props.position.row.end
                    )
                ), Math.max.apply(
                    null, Array.from(
                        children, child => child.props.position.column.end
                    )
                )
            ]
            this.state = {
                children: children.map(child => {
                    return React.cloneElement(
                        child, {
                            ...child.props,
                            size: {
                                width: (
                                    child.props.position.column.end -
                                    child.props.position.column.start
                                ) * this.props.width / (maxCol - 1) - (
                                    child.props.yAxis === false ? 0 : 50
                                ),
                                height: (
                                    child.props.position.row.end -
                                    child.props.position.row.start
                                ) * this.props.height / (maxRow - 1) - (
                                    child.props.xAxis === false ? 0 : 50
                                ),
                            }
                        }
                    )
                })
            }
        }
    }
    public render(): React.ReactElement {
        return (
            <div
                className={'figureGrid'}
                style={{
                    width: this.props.width,
                    height: this.props.height
                }}
            >
                {this.state.children}
            </div>
        )
    }
}
