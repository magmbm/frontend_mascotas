import './RegistroMascota.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/Api';
import { useAuth } from 'react-oidc-context';

export const RegistroMascota: React.FC = () => {
    const auth= useAuth();
    const [nombre, setNombre] = useState("");
    const [edad, setEdad] = useState("");
    const [especie, setEspecie] = useState("Perro");
    const [vacunado, setVacunado] = useState(false);
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();


    const handleSubmit = async (e: React.FormEvent)  =>  {
        e.preventDefault();
        const token= auth.user?.access_token;

        if (!nombre.trim() || !especie.trim() || !edad.trim()) {
        alert("Por favor completa todos los campos.");
        return;
        }

        const nuevaMascota = {
            nombre: nombre.trim(),
            edad: parseInt(edad, 10),
            especie: especie.trim(),
            vacunado: vacunado,
        };
        
        try {
            const response= await fetch(`${API_URL}/api/mascotas/registrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(nuevaMascota),
            });
               
            if (response.status === 201 || response.ok) {
                alert("¡Mascota registrada con éxito!");
                navigate("/");
            } else {
                alert("Ocurrió un error al registrar la mascota.");
            } 
        }catch (error : any) {
            alert("");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="form-container">
      {/* Columna Izquierda: Perfil / Ícono */}
      <div className="form-sidebar">
        <div className="avatar-placeholder">
          <span>🐾</span>
        </div>
        <h2 className="form-title">Nueva Mascota</h2>
        <p className="form-subtitle">Ingresa los datos para crear la ficha</p>
      </div>

      {/* Columna Derecha: Formulario en tarjetas 2x2 */}
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Campo: Nombre */}
        <div className="form-card">
          <label htmlFor="nombre">Nombre</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            placeholder="Ej. Firulais"
            value={nombre}
            onChange={(e)=> setNombre(e.target.value)}
            required
          />
        </div>

        {/* Campo: Especie (Dropdown) */}
        <div className="form-card">
          <label htmlFor="especie">Especie</label>
          <select
            id="especie"
            name="especie"
            value={especie}
            onChange={(e)=> setEspecie(e.target.value)}
          >
            <option value="Perro">Perro</option>
            <option value="Gato">Gato</option>
            <option value="Ave">Ave</option>
            <option value="Roedor">Roedor</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        {/* Campo: Edad */}
        <div className="form-card">
          <label htmlFor="edad">Edad (Años)</label>
          <input
            type="number"
            id="edad"
            name="edad"
            placeholder="Ej. 3"
            min="0"
            value={edad}
            onChange={(e)=> setEdad(e.target.value)}
            required
          />
        </div>

        {/* Campo: Vacunado (Radio Buttons) */}
        <div className="form-card">
          <label>¿Está vacunado?</label>
          <div className="radio-group">
            <label className="radio-option">
              <input
                type="radio"
                name="vacunado"
                value="si"
                checked={vacunado === true}
                onChange={()=> setVacunado(true)}
              />
              <span>Sí</span>
            </label>
            <label className="radio-option">
              <input
                type="radio"
                name="vacunado"
                value="no"
                checked={vacunado === false}
                onChange={()=> setVacunado(false)}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={cargando}>
            Guardar Mascota
          </button>
        </div>
      </form>
    </div>
    )
}
