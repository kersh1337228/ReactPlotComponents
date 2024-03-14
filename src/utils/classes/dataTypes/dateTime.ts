export class Duration {  // DateTime intervals measure
	private constructor(private duration: number) {}
	// Constructors
	public static milliseconds(n: number): Duration { return new Duration(n) }
	public static seconds(n: number): Duration { return new Duration(n * 1000) }
	public static minutes(n: number): Duration { return new Duration(n * 1000 * 60) }
	public static hours(n: number): Duration { return new Duration(n * 1000 * 60 * 60) }
	public static days(n: number): Duration { return new Duration(n * 1000 * 60 * 60 * 24) }
	public static years(n: number): Duration { return new Duration(n * 1000 * 60 * 60 * 24 * 365) }
	public static month(n: number): Duration { return new Duration(n * 1000 * 60 * 60 * 24 * 365 / 12) }
	// Duration Components
	public get milliseconds() { return Math.floor(this.duration) }
	public get seconds(): number { return Math.floor(this.milliseconds / 1000) }
	public get minutes(): number { return Math.floor(this.seconds / 60) }
	public get hours(): number { return Math.floor(this.minutes / 60) }
	public get days(): number { return Math.floor(this.hours / 24) }
	public get years(): number { return Math.floor(this.days / 365) }
	public get months(): number { return Math.floor(this.years * 12) }
}

export class DateTime {  // DateTime representation
	private readonly obj: Date
	private readonly str: string
	constructor(datetime: string | Date | DateTime) {
		if (datetime instanceof Date) {
			this.obj = datetime
			const iso = datetime.toISOString()
			this.str = `${iso.slice(0, 10)} ${iso.slice(11, 19)}`
		} else if (datetime instanceof DateTime) {
			this.obj = datetime.obj
			this.str = datetime.str
		} else {
			if (DateTime.validateString(datetime)) {
				this.str = datetime
				this.obj = new Date(datetime)
			} else throw Error('Wrong datetime string format.')
		}
	}
	// DateTime Components
	public get year(): number { return this.obj.getFullYear() }
	public get month(): number { return this.obj.getMonth() + 1 }
	public get day(): number { return this.obj.getDate() }
	public get hour(): number { return this.obj.getHours() }
	public get minute(): number { return this.obj.getMinutes() }
	public get second(): number { return this.obj.getSeconds() }
	// Utilities
	public static validateString(str: string): boolean {
		const regex = /^((19|20)[\d]{2})(-((0[1-9]{1})|(1[0-2]{1}))(-((0[1-9]{1})|([1-2][\d]{1})|(3[0-1]{1})))?)?( (([0-1][\d]{1})|(2[0-3]{1})):([0-5]{1}[\d]{1})(:[0-5]{1}[\d]{1})?)?$/
		return regex.test(str)
	}
	public format(format_string: string) {
		return format_string.replaceAll(
			'%Y', String(this.year)
		).replaceAll(
			'%m', this.month < 10 ? `0${this.month}` : String(this.month)
		).replaceAll(
			'%d', this.day < 10 ? `0${this.day}` : String(this.day)
		).replaceAll(
			'%H', this.hour < 10 ? `0${this.hour}` : String(this.hour)
		).replaceAll(
			'%M', this.minute < 10 ? `0${this.minute}` : String(this.minute)
		).replaceAll(
			'%S', this.second < 10 ? `0${this.second}` : String(this.second)
		)
	}
	public get string(): string { return this.str }
	public get object(): Date { return this.obj }
	public static diff(  // Time difference expressed as Duration
		dt1: DateTime | Date | string,
		dt2: DateTime | Date | string
	): Duration {
		return Duration.milliseconds(
			// @ts-ignore
			new DateTime(dt1).object - new DateTime(dt2).object
		)
	}
}
