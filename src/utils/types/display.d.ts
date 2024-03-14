export interface DataRange { start: number, end: number }

export interface Size2D { width: number, height: number }

export interface Padding2D {
	left?: number
	top?: number
	right?: number
	bottom?: number
}

export interface GridPosition {  // CSS grid position
	row: { start: number, end: number }
	column: { start: number, end: number }
}

export interface GridObject {  // Plot axes grid
	amount: number
	color: string
	width: number
}

export interface AxisData {  // AxisBase metadata
	min: number
	max: number
	scale: number
	translate: number
}
