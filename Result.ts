type NonVoid = number | string | boolean | null | undefined | symbol | bigint | object;

export class Result<T extends NonVoid>
{
	private _data: T | undefined;
	private _error: IError | undefined;
	private _failed: boolean;


	constructor(data: T | undefined, error: IError | undefined) {
		this._data = data;
		this._error = error;
		if (data === undefined) {
			this._failed = true;
		} else {
			this._failed = false;
		}
	}

	public Succeeded(): boolean {
		return !this._failed;
	}
	public Failed(): boolean {
		return this._failed;
	}

	public Data(): T {
		if (this._data === undefined) {
			throw new Error("Cannot check data in failed result");
		}
		return this._data;
	}

	public Error(): IError {
		if (this._error === undefined) {
			throw new Error("Cannot check error in successful result");
		}
		return this._error;
	}

	public static Ok<T extends NonVoid>(data: T): Result<T> {
		return new Result(data, undefined);
	}

	public static Fail<T extends NonVoid>(error: IError): Result<T> {
		return new Result<T>(undefined, error);
	}

	public static Unknown<T extends NonVoid>(data: T | undefined, error: IError) {
		if (data === undefined) {
			return Result.Fail<T>(error);
		}
		return Result.Ok<T>(data);
	}


	public Map<TOut extends NonVoid>(func: (data: T) => Result<TOut> | TOut): Result<TOut> {
		if (this._failed) {
			return Result.Fail<TOut>(this.Error());
		}
		const funcResult: TOut | Result<TOut> = func(this.Data());
		if (funcResult instanceof Result) {
			return funcResult;
		}
		return Result.Unknown<TOut>(funcResult as TOut, new UnknownError());
	}

	public UseData(action: (data: T) => void): Result<T> {
		if (this._failed) {
			return this;
		}
		action(this.Data());
		return this;
	}

	public IfSucceeded(action: (data: T) => void): Result<T> {
		if (this._failed) {
			return this;
		}
		action(this.Data());
		return this;
	}

	public IfFailed(action: (error: IError) => void): Result<T> {
		if (this._failed) {
			action(this.Error());
			return this;
		}
		return this;
	}

	public ToSimpleResult(): SimpleResult {
		if (this._error === undefined) {
			return SimpleResult.Ok();
		}
		return SimpleResult.Fail(this._error);
	}
}

export class UnknownError implements IError {
	private _message: string = "An unknown error has occured";
	public GetMessage(): string {
		return this._message;
	}
	public Log(): void {
		console.log(this._message);
	}
}

export class SimpleResult {
	private _error: IError | undefined;
	private _failed: boolean;

	constructor(error: IError | undefined) {
		this._error = error;
		if (error === undefined) {
			this._failed = false;
		}
		this._failed = true;
	}

	public Error(): IError {
		if (this._error === undefined) {
			throw new Error("Cannot get error in successful result");
		}
		return this._error;
	}

	public Succeeded(): boolean {
		return !this._failed;
	}
	public Failed(): boolean {
		return this._failed;
	}

	public static Ok() {
		return new SimpleResult(undefined);
	}
	public static Fail(error: IError) {
		return new SimpleResult(error);
	}
}

export interface IError {
	GetMessage(): string;
	Log(): void;
}
