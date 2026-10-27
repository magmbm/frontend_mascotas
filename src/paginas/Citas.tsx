import { useAuth } from 'react-oidc-context';
import { API_URL } from '../config/Api';
import { obtenerIdUsuarioGuardado, resolverIdUsuario } from '../utils/usuarioStorage';
import './Citas.css';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const SEMANAS = ["Esta Semana", "Próxima Semana", "En 3 Semanas", "En 4 Semanas"];
const ESPECIES = ["Perro", "Gato", "Hamster"];
//const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"];
const DIAS_POR_SEMANA = 4; // Lunes a Jueves

const obtenerDiasSemana = (offsetSemanas: number): Date[] => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Próximo lunes (si hoy es lunes, parte la semana siguiente)
    const diaActual = hoy.getDay();
    const diasHastaLunes = ((8 - diaActual) % 7) || 7;

    return Array.from({ length: DIAS_POR_SEMANA }, (_, i) => {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + diasHastaLunes + offsetSemanas * 7 + i);
        return fecha;
    });
};

const formatearDiaBoton = (fecha: Date): string => {
    const texto = fecha.toLocaleDateString("es-CL", {
        weekday: "long",
        day: "numeric",
        month: "short",
    });
    return texto.charAt(0).toUpperCase() + texto.slice(1);
};

type ResultadoEnvio = { tipo: "ok" | "error"; texto: string } | null;

export const AgendarCitas: React.FC = () => {
    const auth = useAuth();
    const [nombreMascota, setNombreMascota] = useState("");
    const [especie, setEspecie] = useState("Perro");
    const [motivo, setMotivo] = useState("Atención General");
    const [etapa, setEtapa] = useState<number>(0);
    const [semana, setSemana] = useState(0);
    const [dia, setDia] = useState<number | null>(null);
    const [hora, setHora] = useState("09:00");
    const [enviando, setEnviando] = useState(false);
    const [resultado, setResultado] = useState<ResultadoEnvio>(null);

    const email = (auth.user?.profile.email as string) ?? "";
    const diasSemana = obtenerDiasSemana(semana);
    const fechaSeleccionada = dia !== null ? diasSemana[dia] : null;

    const seleccionarSemana = (offset: number) => {
        setSemana(offset);
        setDia(null);
        setResultado(null);
    };

    const agendar_cita = async () => {
        const token = auth.user?.access_token;

        if (!nombreMascota.trim()) {
            setResultado({ tipo: "error", texto: "Debes indicar el nombre de tu mascota." });
            setEtapa(0);
            return;
        }

        if (!fechaSeleccionada) {
            setResultado({ tipo: "error", texto: "Debes elegir un día para la atención." });
            return;
        }

        if (!/^\d{2}:\d{2}$/.test(hora)) {
            setResultado({ tipo: "error", texto: "Debes indicar una hora válida para la atención." });
            return;
        }

        setEnviando(true);
        setResultado(null);

        try {
            // fk_owner se toma del id_usuario guardado en localStorage.
            let idUsuario = obtenerIdUsuarioGuardado(email);

            if (idUsuario === null) {
                // Respaldo: si todavía no está guardado, lo resolvemos y guardamos.
                idUsuario = await resolverIdUsuario(token, email);
            }

            if (idUsuario === null) {
                setResultado({
                    tipo: "error",
                    texto: "No se pudo identificar tu id de usuario. Vuelve a iniciar sesión o contacta al administrador.",
                });
                return;
            }

            const anio = fechaSeleccionada.getFullYear();
            const mes = String(fechaSeleccionada.getMonth() + 1).padStart(2, "0");
            const diaMes = String(fechaSeleccionada.getDate()).padStart(2, "0");

            // Mismas columnas que valida la Lambda CRUDCita (COLUMNAS_CITA).
            const cita = {
                fecha_hora_cita: `${anio}-${mes}-${diaMes}T${hora}:00`,
                motivo_cita: motivo,
                nombre_mascota: nombreMascota.trim(),
                especie_mascota: especie,
                fk_owner: idUsuario,
                fk_vet: 1, // pendiente: se definirá en la BD
            };

            // El backend recibe Map<String, String>: el JSON de la cita va serializado
            // dentro de "mensaje" y la Lambda lo desenvuelve y valida.
            console.log(cita);
            const response = await fetch(`${API_URL}/api/citas/registrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    asunto: `Solicitud de cita - ${motivo}`,
                    mensaje: JSON.stringify(cita),
                }),
            }
            );

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            // El backend responde ResponseEntity<String> con el messageId de SNS.
            const messageId = (await response.text()).trim();
            console.log("Cita enviada, messageId:", messageId);

            setResultado({
                tipo: "ok",
                texto: messageId
                    ? `Cita solicitada correctamente. ID del mensaje: ${messageId}`
                    : "Cita solicitada correctamente.",
            });
        } catch (err: any) {
            console.error("Error al agendar la cita:", err);
            setResultado({
                tipo: "error",
                texto: "No se pudo enviar la solicitud de cita. Intenta nuevamente.",
            });
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="citas-cont">
            {etapa === 0 ? (
                <>
                    <div className="citas-header">
                        <h2 className="titulo">Cuéntanos de tu mascota</h2>
                        <div className="btn-mascotas-cont">
                            {ESPECIES.map((opcion) => (
                                <button
                                    key={opcion}
                                    type="button"
                                    className={`btn btn-mascotas shadow ${especie === opcion ? "btn-cita-activo" : ""}`}
                                    onClick={() => setEspecie(opcion)}
                                >
                                    {opcion}
                                </button>
                            ))}
                        </div>
                        <p className="label label-nombre-mascota">Nombre de tu mascota</p>
                        <input
                            type="text"
                            id="nombre-mascota-input"
                            className="form-control"
                            placeholder="Ej. Firulais"
                            value={nombreMascota}
                            onChange={(e) => setNombreMascota(e.target.value)}
                        />
                    </div>

                    <div className="motivo-titulo">
                        <p id="titulo-lista">¿Cómo te podemos ayudar?</p>
                    </div>
                    <div className="list-cont">
                        <ul className="lista-motivos">
                            {[
                                "Atención General",
                                "Vacunación",
                                "Antiparasitario interno",
                                "Pack completo de examenes",
                                "Radiografias",
                                "Aplicación de microchip",
                            ].map((opcion) => (
                                <li key={opcion}>
                                    <button
                                        type="button"
                                        className={`btn btn-lista-motivos shadow ${motivo === opcion ? "btn-cita-activo" : ""}`}
                                        onClick={() => setMotivo(opcion)}
                                    >
                                        {opcion}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="cita-acciones">
                        <button
                            type="button"
                            className="btn btn-cita btn-cita-primario"
                            disabled={!nombreMascota.trim()}
                            onClick={() => {
                                setResultado(null);
                                setEtapa(1);
                            }}
                        >
                            Continuar
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <div className="citas-header">
                        <h2 className="titulo">Elige una hora para la atención</h2>
                        <div className="btn-mascotas-cont">
                            {SEMANAS.map((opcion, index) => (
                                <button
                                    key={opcion}
                                    type="button"
                                    className={`btn btn-fechas-semanas shadow ${semana === index ? "btn-cita-activo" : ""}`}
                                    onClick={() => seleccionarSemana(index)}
                                >
                                    {opcion}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ul className="lista-fechas-cont">
                        {diasSemana.map((fecha, index) => (
                            <li key={fecha.toISOString()}>
                                <button
                                    type="button"
                                    className={`btn btn-lista-fechas ${dia === index ? "btn-cita-activo" : ""}`}
                                    onClick={() => {
                                        setDia(index);
                                        setResultado(null);
                                    }}
                                >
                                    {formatearDiaBoton(fecha)}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="cita-hora">
                        <label htmlFor="hora-cita">Hora de la atención</label>
                        <input
                            type="time"
                            id="hora-cita"
                            className="form-control"
                            value={hora}
                            onChange={(e) => {
                                setHora(e.target.value);
                                setResultado(null);
                            }}
                            required
                        />
                    </div>

                    {resultado && (
                        <p className={`cita-resultado ${resultado.tipo === "ok" ? "cita-resultado-ok" : "cita-resultado-error"}`}>
                            {resultado.texto}
                        </p>
                    )}

                    <div className="cita-acciones">
                        <button
                            type="button"
                            className="btn btn-cita"
                            disabled={enviando}
                            onClick={() => {
                                setResultado(null);
                                setEtapa(0);
                            }}
                        >
                            Volver
                        </button>
                        <button
                            type="button"
                            className="btn btn-cita btn-cita-primario"
                            disabled={enviando || !fechaSeleccionada || !hora}
                            onClick={agendar_cita}
                        >
                            {enviando ? "Enviando..." : "Agendar cita"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};
