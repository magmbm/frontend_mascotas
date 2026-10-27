import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { API_URL } from '../config/Api';
import { camposPorRellenar, registroFallidoUsuario } from '../utils/MensajesError';
import { guardarIdUsuario } from '../utils/usuarioStorage';
import './RegistroUsuario.css';

export const RegistroUsuario: React.FC = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const [nombre, setNombre] = useState("");
    const [papellido, setPapellido] = useState("");
    const [sapellido, setSapellido] = useState("");
    const [numrun, setNumrun] = useState("");
    const [dvrun, setDvrun] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const email = (auth.user?.profile.email as string) ?? "";

    const validar = () => {
        if (!nombre.trim() || !papellido.trim() || !sapellido.trim() || !numrun.trim() || !dvrun.trim()) {
            setError(camposPorRellenar);
            return false;
        }
        if (!/^\d{5,8}$/.test(numrun.trim())) {
            setError("El RUN debe tener entre 5 y 8 dígitos, sin puntos ni guión.");
            return false;
        }
        if (!/^[0-9kK]$/.test(dvrun.trim())) {
            setError("El dígito verificador debe ser un número o la letra K.");
            return false;
        }
        if (!email) {
            setError("No se pudo obtener el email de tu sesión.");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validar()) return;

        setCargando(true);

        const nuevoUsuario = {
            nombre_usuario: nombre.trim(),
            papellido_usuario: papellido.trim(),
            sapellido_usuario: sapellido.trim(),
            numrun_usuario: parseInt(numrun.trim(), 10),
            dvrun_usuario: dvrun.trim().toUpperCase(),
            email_usuario: email,
        };

        try {
            const response = await fetch(`${API_URL}/api/usuarios/registrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${auth.user?.access_token}`,
                },
                body: JSON.stringify(nuevoUsuario),
            });

            if (response.ok) {
                // La respuesta trae el usuario creado con su id_usuario.
                // Lo guardamos para poder usarlo como fk_owner al agendar citas.
                try {
                    const texto = await response.text();
                    if (texto.trim()) {
                        const creado = JSON.parse(texto);
                        const idCreado = Number(creado?.id_usuario);
                        if (Number.isInteger(idCreado) && idCreado > 0) {
                            guardarIdUsuario(email, idCreado);
                        }
                    }
                } catch (err) {
                    console.warn("No se pudo guardar el id del usuario registrado:", err);
                }

                alert("¡Usuario registrado con éxito!");
                navigate("/");
            } else {
                console.log(response.status);
                setError(registroFallidoUsuario);
            }
        } catch (err: any) {
            console.log(err);
            setError(registroFallidoUsuario);
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="registro-usuario-cont">
            <div className="registro-usuario-header">
                <h2 className="titulo">Registro de usuario</h2>
                <p className="registro-subtitulo">Completa tus datos para crear tu ficha</p>
            </div>

            <div className="registro-cuenta">
                <span className="registro-cuenta-label">Cuenta</span>
                <strong>{email || "Email no disponible"}</strong>
            </div>

            <form className="registro-form" onSubmit={handleSubmit} noValidate>
                <div className="registro-grid">
                    <div className="registro-card registro-card-completo">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ej. Juan"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                    </div>

                    <div className="registro-card">
                        <label htmlFor="papellido">Primer apellido</label>
                        <input
                            type="text"
                            id="papellido"
                            name="papellido"
                            placeholder="Ej. Pérez"
                            value={papellido}
                            onChange={(e) => setPapellido(e.target.value)}
                            required
                        />
                    </div>

                    <div className="registro-card">
                        <label htmlFor="sapellido">Segundo apellido</label>
                        <input
                            type="text"
                            id="sapellido"
                            name="sapellido"
                            placeholder="Ej. Soto"
                            value={sapellido}
                            onChange={(e) => setSapellido(e.target.value)}
                            required
                        />
                    </div>

                    <div className="registro-card">
                        <label htmlFor="numrun">Número de RUN</label>
                        <input
                            type="text"
                            id="numrun"
                            name="numrun"
                            placeholder="Ej. 12345678"
                            inputMode="numeric"
                            maxLength={8}
                            value={numrun}
                            onChange={(e) => setNumrun(e.target.value.replace(/\D/g, ""))}
                            required
                        />
                        <span className="registro-ayuda">Sin puntos ni guión</span>
                    </div>

                    <div className="registro-card">
                        <label htmlFor="dvrun">Dígito verificador</label>
                        <input
                            type="text"
                            id="dvrun"
                            name="dvrun"
                            placeholder="Ej. 5 o K"
                            maxLength={1}
                            value={dvrun}
                            onChange={(e) => setDvrun(e.target.value.toUpperCase().replace(/[^0-9K]/g, ""))}
                            required
                        />
                        <span className="registro-ayuda">Puede ser un número o la letra K</span>
                    </div>
                </div>

                {error && <p className="registro-error">{error}</p>}

                <div className="registro-actions">
                    <button type="submit" className="btn-registro" disabled={cargando}>
                        {cargando ? "Guardando..." : "Guardar Usuario"}
                    </button>
                </div>
            </form>
        </div>
    );
};
