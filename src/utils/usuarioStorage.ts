import { API_URL } from '../config/Api';

const PREFIJO_CLAVE = "id_usuario:";

/** Guarda el id_usuario de la base de datos asociado al email de la sesión. */
export const guardarIdUsuario = (email: string, id: number): void => {
    if (!email || !Number.isInteger(id) || id <= 0) return;
    localStorage.setItem(`${PREFIJO_CLAVE}${email.trim().toLowerCase()}`, String(id));
};

/** Recupera el id_usuario guardado previamente para ese email. */
export const obtenerIdUsuarioGuardado = (email: string): number | null => {
    if (!email) return null;

    const guardado = localStorage.getItem(`${PREFIJO_CLAVE}${email.trim().toLowerCase()}`);
    const id = Number(guardado);

    return Number.isInteger(id) && id > 0 ? id : null;
};

/**
 * Resuelve el id_usuario (PK de la tabla usuarios) del usuario logueado.
 * Primero revisa el cache local y, si no existe, lo busca en el listado
 * de usuarios usando el email de la sesión.
 *
 * Nota: /api/usuarios/listar está protegido para Admin y Vet. Para que un
 * Owner pueda resolver su id sin cache, el backend debe exponer un endpoint
 * que devuelva el usuario a partir del email del JWT.
 */
export const resolverIdUsuario = async (
    token: string | undefined,
    email: string
): Promise<number | null> => {
    const cacheado = obtenerIdUsuarioGuardado(email);
    if (cacheado !== null) return cacheado;

    if (!token || !email) return null;

    try {
        const response = await fetch(`${API_URL}/api/usuarios/listar`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.warn(`No se pudo listar usuarios para resolver fk_owner (${response.status})`);
            return null;
        }

        const texto = await response.text();
        if (!texto.trim()) return null;

        let datos: unknown = JSON.parse(texto);

        // La respuesta puede venir doblemente serializada como string JSON.
        if (typeof datos === "string") {
            datos = JSON.parse(datos);
        }

        if (!Array.isArray(datos)) return null;

        const emailBuscado = email.trim().toLowerCase();
        const usuario = (datos as Array<Record<string, unknown>>).find(
            (u) => String(u?.email_usuario ?? "").trim().toLowerCase() === emailBuscado
        );

        const id = Number(usuario?.id_usuario);
        if (!Number.isInteger(id) || id <= 0) return null;

        guardarIdUsuario(email, id);
        return id;
    } catch (err) {
        console.error("Error al resolver el id del usuario logueado:", err);
        return null;
    }
};
