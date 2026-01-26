export interface resJsonType { 
    data: object[] | object, 
    status: number, 
    message: string, 
    error: boolean, 
} 

export const defaultResJson = { 
    data: [], 
    status: 0, 
    message: '', 
    error: false, 
} 

export type SpResponse = [{ error: boolean, mensaje: string , estatus: number}]