import "./CarnetMascota.css";


interface CarnetProps {
  nombre: string;
  especieRaza: string;
  edad: number;
  sexo: string;
  ubicacion: string;
  fotoUrl: string;
  bio?: string;
  vacunas?: string;
  personalidad?: string;
  contacto?: string;
}


export const CarnetMascota: any = ({
  nombre = "Firulais",
  especieRaza = "Perro • Dachshund",
  edad = 3,
  sexo = "Macho",
  ubicacion = "Santiago, CL",
  fotoUrl = "https://via.placeholder.com/150",
  bio = "Muy juguetón y cariñoso. Le encanta salir a correr al parque por las mañanas.",
  vacunas = "Al día (Séxtuple, Antirrábica). Próximo control en Noviembre.",
  personalidad = "Sociable con otros perros, amigable con niños, le asustan los truenos.",
  contacto = "Dueño: Juan Pérez | Tel: +56 9 1234 5678",
}) => {
  return (
    <div className="carnet-container">
      {/* Columna Izquierda: Perfil */}
      <div className="carnet-sidebar">
        <div className="avatar-wrapper">
          <img src={fotoUrl} alt={nombre} className="pet-avatar" />
        </div>
        
        <h2 className="pet-name">{nombre}</h2>
        <p className="pet-subtitle">{especieRaza}</p>

        <div className="pet-quick-info">
          <div className="info-row">
            <span className="label">Edad</span>
            <span className="value">{edad} años</span>
          </div>
          <div className="info-row">
            <span className="label">Sexo</span>
            <span className="value">{sexo}</span>
          </div>
          <div className="info-row">
            <span className="label">Ubicación</span>
            <span className="value">{ubicacion}</span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Tarjetas de Información 2x2 */}
      <div className="carnet-grid">
        <div className="info-card">
          <h3>Biografía</h3>
          <p>{bio}</p>
        </div>

        <div className="info-card">
          <h3>Vacunas y Salud</h3>
          <p>{vacunas}</p>
        </div>

        <div className="info-card">
          <h3>Personalidad</h3>
          <p>{personalidad}</p>
        </div>

        <div className="info-card">
          <h3>Contacto Emergencia</h3>
          <p>{contacto}</p>
        </div>
      </div>
    </div>
  );
};