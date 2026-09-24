export interface ValidationError {
    loc: (string | number)[];
    msg: string;
    type: string;
}
