export class APIError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "APIError"
    }
}

export class AppError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "AppError"
    }
}
