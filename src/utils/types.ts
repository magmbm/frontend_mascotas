export interface Mascota {
    id_mascota: string | number;
    nombre_mascota: string;
    edad_mascota: number;
    peso_mascota : number;
    vacunado: boolean;
    especie: string;
    sexo : string;
}

export interface Usuario {
    id_usuario : string | number;
    nombre_usuario : string,
    papellido_usuario : string,
    sapellido_usuario : string,
    email_usuario : string,
    numrun_usuario : number,
    dvrun_usuario : string,
}