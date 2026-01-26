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

export interface payLoadToken { 
    Usuario: string, 
    UsuarioId: number,  
    GrupoPermisoId: number,
    iat: number, 
    exp: number
}

export interface AsigBodUsuario{
      BodegaId: number
}