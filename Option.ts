import { IError, Result } from "./Result";

export class Option<T> {
	private _data: T | undefined;

	private constructor(data: T | undefined) {
		this._data = data;
	}

	public IsSome() {
		return this._data !== undefined;
	}

	public IsNone() {
		return this._data === undefined;
	}

	public static Some<T>(data: T): Option<T> {
		return new Option(data);
	}
	public static None<T>(): Option<T> {
		return new Option<T>(undefined);
	}
	public static Maybe<T>(data: T | undefined): Option<T> {
		return new Option<T>(data)
	}

	public Map<TOut>(func: (data: T) => TOut | Option<TOut>): Option<TOut> {
		if (this._data === undefined) {
			return Option.None<TOut>();
		}
		const result = func(this._data);
		const asOption = result as Option<TOut>;
		if (asOption.IsSome === undefined) {
			return Option.Maybe<TOut>(result as TOut);
		}
		return asOption;
	}

	public ToResult(): Result<T> {
		return Result.Unknown<T>(this._data, new NoValue());
	}
}

class NoValue implements IError {
	public GetMessage(): string {
		return "Optional value was empty";
	}
	public Log(): void {
		console.log("Optional value was empty");
	}
}
