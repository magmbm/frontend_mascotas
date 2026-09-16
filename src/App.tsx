import { useEffect, useState } from 'react'
import perro_bienvenida  from './assets/perro.png';
import './App.css'
import { useAuth } from "react-oidc-context";
import {  useNavigate, Route, Routes } from 'react-router';
import { CarnetMascota } from './paginas/CarnetMascota';
import { RegistroMascota } from './paginas/RegistroMascota';
import { GestorMascotas } from './paginas/GestorMascotas';
import { API_URL } from './config/Api';

interface TarjetaProps {
  imagen?: string;
  nombre: string;
  especie: string;
  edad: number;
  vacunado?: boolean;
  onVerDetalles?: () => void;
}

export const MascotaCard = ({
  nombre,
  especie,
  edad,
  vacunado,
  imagen,
  onVerDetalles
}: TarjetaProps) => {
  return (
    <div className="card">
      {perro_bienvenida && <img src={perro_bienvenida} alt={nombre} className="card-img" />}

      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{nombre}</h3>
          {vacunado !== undefined && (
            <span className={`badge ${vacunado ? "badge-success" : "badge-danger"}`}>
              {vacunado ? "✅ Vacunado" : "❌ Sin vacunar"}
            </span>
          )}
        </div>

        <p className="card-info">
          <strong>Especie:</strong> {especie} | <strong>Edad:</strong> {edad} {edad === 1 ? "año" : "años"}
        </p>

        {onVerDetalles && (
          <button className="card-btn" onClick={onVerDetalles}>
            Ver detalles
          </button>
        )}
      </div>
    </div>
  );
};

export const TarjetaMascota=  ({
}) => {
  const navigate= useNavigate();
  const [cargando, setCargando]= useState(false);
  const [mascotas, setMascotas]= useState([]);
  const auth= useAuth();

  const getMascota= async ()=> {
    try {
      const token= auth.user?.access_token;
      const response= await fetch(`${API_URL}/api/mascotas/listar`, {
        method : "GET",
        headers : {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      })
      
      if (response.ok) {
        const data= await response.json();
        console.log(data);
        setMascotas(data);
      }

    } catch (error : any) {
      console.log("Error get mascota");
      console.log(error);
    } setCargando(false);
  }

  useEffect(()=> {
    getMascota()
  }, [cargando])

  return (
    <div className="cards-grid">
      {mascotas.map((m) => (
        <MascotaCard
          key={m.id}
          nombre={m.nombre}
          especie={m.especie}
          edad={m.edad}
          vacunado={m.vacunado}
          imagen={perro_bienvenida}
          onVerDetalles={() => navigate('/carnet', { state: { id: m.id } })}
        />
      ))}
    </div>
  )

}


const Inicio: React.FC = () => {
  const auth= useAuth();
  const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
  return (
    <div>
      <p>Bienvenido "{auth.user?.profile.email}"</p>
      <p>
        <strong>Roles: </strong>
        {roles.length > 0 ? roles.join(', ') : 'Sin roles asignados'}
      </p>
      <div className='tarjetaCont'>
        <TarjetaMascota
          />
      </div>
    </div>
  );
};


function App() {
  const navigate = useNavigate();
  const auth = useAuth();
  const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];

  const handleCerrarSesion = async ()  => {
    await auth.signoutRedirect();

    const cognitoDomain = "https://us-east-1qmdhsiox2.auth.us-east-1.amazoncognito.com";
    const clientId = "55hsp4g2da2n0g262v5bphgsj5";
    const logoutUri = "http://localhost:5173";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${logoutUri}`;
  };

  useEffect(() => {
    console.log("Flag");
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      auth.signinRedirect().catch((err) => {
        console.error("Error al redirigir a Cognito:", err);
      });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.error]);

  if (auth.isLoading) {
    return(
      <div>
        <h3>Cargando sesión de usuario...</h3>
      </div>
    )
  }

  /*
  if (!auth.isAuthenticated) {
    auth.signinRedirect();
  }
  */
    const tieneAlgunRol = (rolesRequeridos: string[]) => {
      return rolesRequeridos.some((rol) => roles.includes(rol));
    };

  if (auth.isAuthenticated) {
    console.log("Access Token");
    console.log(auth.user?.profile);
    console.log(auth.user?.access_token);
    return (
      <>
        <div className="header">
          <button className='botonTitulo' onClick={()=> navigate('/')}>
          <h1 className="tituloPagina">Mascotas</h1>
          </button>
          <button className="btnCerrarSesion" onClick={handleCerrarSesion}>
            Cerrar Sesión
          </button>
        </div>
        <div className="navbar">
          <ul>

            <button className='btn' onClick={()=> navigate('/')}>Home</button>
            {tieneAlgunRol(['Admin', 'Vet']) && (
              <>
              <button className='btn' onClick={()=> navigate('/mascota/registrar')}>Agregar Mascota</button>
              <button className='btn' onClick={()=> navigate('/mascota/crud')}>Gestor de Mascotas</button>
              </>
            )} 
          </ul>
        </div>
        <div className="ticks"></div>
        <div className='tarjetaCont'>
          </div>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/carnet" element={<CarnetMascota />} />
          <Route path="/mascota/registrar" element={<RegistroMascota />}/>
          <Route path="/mascota/crud" element={<GestorMascotas />}/>
        </Routes>
        </>
    )

  }

}

export default App
