import React, { useEffect, useState } from 'react';
import { API_URL } from '../config/Api';
import { useAuth } from 'react-oidc-context';
import './GestorUsuarios.css'
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../utils/types';


interface TablaUsuariosProps {
  usuarios: Usuario[];
}

export const GestorUsuarios: React.FC = ({}) => {
    const [usuarios, setUsuarios]= useState<Usuario[]>([]);
    const [eliminar, setEliminar]= useState(false);
    const auth= useAuth();
    const roles = (auth.user?.profile["cognito:groups"] as string[]) || [];
    const navigate= useNavigate();
    const listarUsuarios= async ()=> {
        try {
            const token= auth.user?.access_token;
            const response= await fetch(`${API_URL}/api/usuarios/listar`, {
                method : "GET",
                headers : {
                    Authorization: `Bearer ${token}`,
                }
            })
            console.log(response);
            console.log(token);
            const data= await response.json();
            setUsuarios(data);
        } catch (error : any) {
            alert("Error al traer los datos")
            console.log(error);
        }

    }

    useEffect(()=> {
        listarUsuarios();
    }, [eliminar]);

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

    return (
    <div className="tabla-container">
        <h2 className='titulo'>Usuarios en el sistema</h2> 
        <div className='tablaCont'>

            <table className="tabla-usuarios">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre y apellidos</th>
                    <th>Email</th>
                    <th>RUN</th>
                    <th>Vacunado</th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {usuarios.length > 0 ? (
                    usuarios.map((m) => (
                    <tr key={m.id_usuario}>
                        <td>{m.id_usuario}</td>
                        <td><strong>{m.nombre_usuario} {m.papellido_usuario} {m.sapellido_usuario}</strong></td>
                        <td>{m.email_usuario} </td>
                        <td>{m.numrun_usuario}- {m.dvrun_usuario}</td>
                        <td>
                        </td>
                        <td><button className='btn' onClick={()=> navigate('/carnet', { state : { id : m.id_usuario }})}>Ver más</button></td>
                        {roles.includes("Admin") && 
                        <td><button className='btn btn_basurero' onClick={()=> eliminarUsuario(m.id_usuario)} ><img src="https://cdn-icons-png.flaticon.com/512/4812/4812459.png" className='basurero_icon'/></button></td>
                        }
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={5} style={{ textAlign: 'center' }}>
                        No hay usuarios registrados.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    </div>
  );
};