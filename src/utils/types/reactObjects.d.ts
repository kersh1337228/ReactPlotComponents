import React from "react"

export interface CanvasObject {  // Drawing canvas
	ref: React.RefObject<HTMLCanvasElement>
	density: number
}

export interface TooltipCanvasObject {  // Event handling canvas
	ref: React.RefObject<HTMLCanvasElement>,
	mouseEvents: {
		drag: boolean,
		position: { x: number, y: number }
	}
}

export interface ComponentChildren<T extends React.Component> {  // Children nodes and components container
	components: T[], nodes: JSX.Element[]
}
