
interface DniResponse {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  success?: boolean;
  message?: string;
}

const TOKEN = 'apis-token-1.aTSI1U7KEuT-6bbbCguH-4Y8TI6KS73N';

export const consultDni = async (dni: string): Promise<DniResponse | null> => {
  try {
    const response = await fetch(`https://api.decolecta.com/v1/reniec/dni?numero=${dni}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        // Nota: Los navegadores modernos bloquean la modificación manual del header 'Referer' por seguridad.
        // Si la API valida estrictamente el Referer desde el servidor, esta llamada podría requerir un proxy backend.
        // Se intenta enviar tal cual se solicitó.
      }
    });

    if (!response.ok) {
      throw new Error('Error en la consulta');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching DNI:", error);
    return null;
  }
};
