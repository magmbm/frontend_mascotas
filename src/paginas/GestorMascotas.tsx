import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/Api';
import { useAuth } from 'react-oidc-context';
import './GestorMascotas.css'
import { useNavigate } from 'react-router-dom';
import type { Mascota } from '../utils/types';



export const GestorMascotas: React.FC = ({}) => {
    const [mascotas, setMascotas]= useState<Mascota[]>([]);
    const [eliminar, setEliminar]= useState(false);
    const auth= useAuth();
    const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
    const navigate= useNavigate();
    const listarMascotas= async ()=> {
        try {
            const token= auth.user?.access_token;
            const response= await fetch(`${API_URL}/api/mascotas/listar`, {
                method : "GET",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })
            console.log(response);
            console.log(token);
            const data= await response.json();
            setMascotas(data);
        } catch (error : any) {
            alert("Error al traer los datos")
            console.log(error);
        }

    }

    useEffect(()=> {
        listarMascotas();
    }, [eliminar]);

    const eliminarMascota= async (id : string | number)=> {
        try {
            const token= auth.user?.access_token;
            console.log("Delete"); 
            const response= await fetch(`${API_URL}/api/mascotas/eliminar/${id}`, {
                method : "DELETE",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })

            if (response.status== 200) {
                setEliminar(!eliminar);
                alert("Mascota Eliminado con éxito");
            }
        } catch (error : any) {
            alert("No se pudo eliminar el registro")
        }
    }

    return (
    <div className="tabla-container">
        <h2 className='titulo'>Mascotas en el sistema</h2> 
        <div className='tablaCont'>

            <table className="tabla-mascotas">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Edad</th>
                    <th>Especie</th>
                    <th>Vacunado</th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {mascotas.length > 0 ? (
                    mascotas.map((m) => (
                    <tr key={m.id_mascota}>
                        <td>{m.id_mascota}</td>
                        <td><strong>{m.nombre_mascota}</strong></td>
                        <td>{m.edad_mascota} {m.edad_mascota === 1 ? 'año' : 'años'}</td>
                        <td>{m.especie}</td>
                        <td>
                        <span className={`badge ${m.vacunado ? 'badge-success' : 'badge-danger'}`}>
                            {m.vacunado ? 'Sí' : 'No'}
                        </span>
                        </td>
                        <td><button className='btn' onClick={()=> navigate('/carnet', { state : { id : m.id_mascota }})}>Ver más</button></td>
                        {roles.includes("Admin") && 
                        <td><button className='btn btn_basurero' onClick={()=> eliminarMascota(m.id_mascota)} ><img src="https://cdn-icons-png.flaticon.com/512/4812/4812459.png" className='basurero_icon'/></button></td>
                        }
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                        No hay mascotas registradas.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  );
};