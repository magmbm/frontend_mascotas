import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/Api';
import { useAuth } from 'react-oidc-context';
import './GestorCitas.css'
import type { Cita } from '../utils/types';



export const GestorCitas: React.FC = ({}) => {
    const [citas, setCitas]= useState<Cita[]>([]);
    let eliminar;
    const auth= useAuth();
    //const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
    //const navigate= useNavigate();

    const listarCitas= async ()=> {
        try {
            const token= auth.user?.access_token;
            const response= await fetch(`${API_URL}/api/citas/listar`, {
                method : "GET",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })
            console.log(response);
            console.log(token);
            const data= await response.json();
            setCitas(data);
        } catch (error : any) {
            alert("Error al traer los datos")
            console.log(error);
        }

    }

    useEffect(()=> {
        listarCitas();
    }, [eliminar]);

    /*
    const eliminarUsuario= async (id : string | number)=> {
        try {
            const token= auth.user?.access_token;
            console.log("Delete"); 
            const response= await fetch(`${API_URL}/api/usuarios/eliminar/${id}`, {
                method : "DELETE",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })
            
            if (response.status== 200) {
                setEliminar(!eliminar);
                alert("Usuario Eliminado con éxito");
            }
        } catch (error : any) {
            alert("No se pudo eliminar el registro")
        }
    }
    */ 

    return (
    <div className="">
        <h2 className='titulo'>Próximas citas</h2> 
        <div className='citas-contenedor'>
                {citas.length > 0 ? (
                    citas.map((m) => (
                        <div className="citas-card">
  {/* Cabecera con motivo, ID de cita y badge de especie */}
  <div className="citas-header">
    <div className="citas-header-info">
      <span className="citas-badge-id">Cita #{m.id_cita}</span>
      <h3 className="titulo-citas">{m.motivo_cita}</h3>
    </div>
    <span className="especie-badge">{}</span>
  </div>

  {/* Cuerpo con todos los atributos del objeto cita */}
  <div className="citas-body">
    <div className="citas-campo">
      <span className="citas-label">Mascota</span>
      <span className="citas-valor valor-destacado">{m.nombre_mascota} ({m.especie_mascota})</span>
    </div>

    <div className="citas-campo">
      <span className="citas-label">Fecha y Hora</span>
      <span className="citas-valor">
        {new Date(m.fecha_hora_cita).toLocaleString('es-ES', {
          dateStyle: 'medium',
          timeStyle: 'short'
        })}
      </span>
    </div>

    <div className="citas-campo">
      <span className="citas-label">ID Dueño</span>
      <span className="citas-valor">#{m.fk_owner}</span>
    </div>

    <div className="citas-campo">
      <span className="citas-label">ID Veterinario</span>
      <span className="citas-valor">#{m.fk_vet}</span>
    </div>
  </div>
</div>



                    ))
                ) : (
                    <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                        No hay usuarios registrados.
                    </td>
                    </tr>
                )}
        </div>
    </div>
  );
};