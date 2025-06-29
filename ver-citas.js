const supabase = supabaseClient(supabaseUrl, supabaseKey);

// Obtener referencia al cuerpo de la tabla
const tablaBody = document.querySelector('#tablaCitas tbody');

// Función para cargar y mostrar las citas
async function cargarCitas() {
    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        console.error('Error al obtener citas:', error.message);
        tablaBody.innerHTML = '<tr><td colspan="4">❌ Error al cargar citas</td></tr>';
        return;
    }

    if (!data || data.length === 0) {
        tablaBody.innerHTML = '<tr><td colspan="4">No hay citas registradas.</td></tr>';
        return;
    }

    // Limpiar tabla
    tablaBody.innerHTML = '';

    // Insertar cada cita en la tabla
    data.forEach((cita) => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
      <td>${cita.user_name}</td>
      <td>${cita.date}</td>
      <td>${cita.time}</td>
      <td>${cita.description}</td>
    `;
        tablaBody.appendChild(fila);
    });
}

// Llamar a la función al cargar
cargarCitas();
