import { useEffect, useState } from 'react'
import perro_bienvenida  from './assets/perro.png';
import './App.css'
import { useAuth } from "react-oidc-context";
import {  useNavigate, Route, Routes } from 'react-router';
import { CarnetMascota } from './paginas/CarnetMascota';
import { AgendarCitas } from './paginas/Citas';
import { RegistroMascota } from './paginas/RegistroMascota';
import { GestorMascotas } from './paginas/GestorMascotas';
import { GestorUsuarios } from './paginas/GestorUsuarios';
import { RegistroUsuario } from './paginas/RegistroUsuario';
import { API_URL } from './config/Api';
import { resolverIdUsuario } from './utils/usuarioStorage';
import type { Mascota } from './utils/types';
import { GestorCitas } from './paginas/GestorCitas';

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
  const [mascotas, setMascotas]= useState<Mascota[]>([]);
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
        console.log("Inicio");
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
          key={m.id_mascota}
          nombre={m.nombre_mascota}
          especie={m.especie}
          edad={m.edad_mascota}
          vacunado={m.vacunado}
          imagen={perro_bienvenida}
          onVerDetalles={() => navigate('/carnet', { state: { id: m.id_mascota } })}
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
  const token= auth.user?.access_token;
  const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
  const [verificandoUsuario, setVerificandoUsuario] = useState(true);

  const registrarUsuario = async (email : string) => {
    try {
      if (email== "" || email== undefined) return false;
      const response= await fetch(`${API_URL}/api/usuarios/registrado`, {
        method : "GET",
        headers : {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "email_usuario" : email
        }
      })
      if (!response.ok) return false;
      const data = await response.json();
      console.log("Datos");
      console.log(data);
      if (!data) return false;
      return true;
    } catch (err : any) {
      console.log(err);
      return false;
    }
  }

  const handleCerrarSesion = async () => {
    try {
      // signoutRedirect usa el end_session_endpoint que ya viene en la
      // configuración OIDC (main.tsx) y elimina la sesión local.
      // Cognito espera el parámetro "logout_uri", no "post_logout_redirect_uri".
      await auth.signoutRedirect({
        extraQueryParams: {
          client_id: auth.settings.client_id,
          logout_uri: window.location.origin,
        },
      });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
  };

  useEffect(() => {
    console.log("Flag");
    if (!auth.isLoading && !auth.isAuthenticated && !auth.activeNavigator && !auth.error) {
      auth.signinRedirect().catch((err) => {
        console.error("Error al redirigir a Cognito:", err);
      });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.activeNavigator, auth.error]);

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setVerificandoUsuario(true);
      return;
    }

    let cancelado = false;

    const verificarRegistro = async () => {
      const email = auth.user?.profile.email;

      if (!email) {
        setVerificandoUsuario(false);
        return;
      }

      const registrado = await registrarUsuario(email);

      if (cancelado) return;

      if (registrado) {
        // Usuario ya registrado: obtenemos su id_usuario y lo guardamos
        // en localStorage para usarlo luego como fk_owner al agendar.
        await resolverIdUsuario(token, email);

        if (cancelado) return;
      }

      setVerificandoUsuario(false);

      if (!registrado) {
        console.log("Pasamos esta barrera");
        navigate('/usuario/registrar');
      }
    };

    verificarRegistro();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.isAuthenticated, auth.user?.profile.email]);

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

  if (auth.isAuthenticated && verificandoUsuario) {
    return (
      <div>
        <h3>Verificando usuario...</h3>
      </div>
    )
  }

  if (auth.isAuthenticated) {
    console.log("Access Token");
    console.log(auth.user?.profile);

    console.log("Pablo");
    
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
        <div className="navbar-mascotas">
          <ul className="lista-navbar">

            <button className='btn btn-navbar' onClick={()=> navigate('/')}>Home</button>
            {tieneAlgunRol(['Admin', 'Vet']) && (
              <>
              <button className='btn btn-navbar' onClick={()=> navigate('/mascota/registrar')}>Agregar Mascota</button>
              <button className='btn btn-navbar' onClick={()=> navigate('/mascota/crud')}>Gestor de Mascotas</button>
              </>
            )} 
            {tieneAlgunRol(['Admin']) && (
              <>
              <button className='btn btn-navbar' onClick={()=> navigate('/usuario/crud')}>Gestor de Usuarios</button>
              </>
            )}

            {tieneAlgunRol(['Admin', 'Vet']) && (
              <>
              <button className='btn btn-navbar' onClick={()=> navigate('/cita/crud')}>Próximas Citas</button>
              </>
            )}
            {tieneAlgunRol(['Admin', 'Owner']) && (
            <button className='btn btn-navbar' onClick={()=> navigate('/cita/agendar')}>Agendar Cita</button>
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
          <Route path="/usuario/crud" element={<GestorUsuarios />}/>
          <Route path="/cita/crud" element={<GestorCitas />}/>
          <Route path="/usuario/registrar" element={<RegistroUsuario />}/>
          <Route path="/cita/agendar" element={<AgendarCitas />}/>
        </Routes>
        </>
    )

  }

}

export default App
