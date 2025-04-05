export class ResponseModel<T = null> {
    success: boolean;
    message: string;
    data: T | null;

    constructor(success: boolean, message: string, data?: T | null) {
        this.success = success;
        this.message = message;
        this.data = data !== undefined ? data : null; 
    }
}
