import {DataRange} from "../types/display"

export function coordinatesTransform(
	x: number, scale: number, translate: number
): number {
	return x * scale + translate
}

export function getTransformDelta(
	min: number, max: number,
	newMin: number, newMax: number,
	scale: number, translate: number
): [number, number] {
	return [
		(newMax - newMin) / (max - min) - scale,  // Scale
		(newMax + newMin) / 2 - (max + min) *  // Translate
		(newMax - newMin) / 2 / (max - min) - translate
	]
}

export function bordersToDataRange(
	max: number, newMin: number,
	newMax: number
): DataRange {
	return {
		start: newMin / max,
		end: newMax / max
	}
}

export function dataRangeToBorders(
	dataRange: DataRange, max: number
): [number, number] {
	return [
		dataRange.start * max,
		dataRange.end * max
	]
}
