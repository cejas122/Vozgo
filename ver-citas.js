document.addEventListener("DOMContentLoaded", async () => {
    const tabla = document.querySelector("#tablaCitas tbody");

    const { data, error } = await window.supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("❌ Error al cargar las citas:", error);
        tabla.innerHTML = "<tr><td colspan='4'>Error al cargar citas</td></tr>";
        return;
    }

    if (data.length === 0) {
        tabla.innerHTML = "<tr><td colspan='4'>No hay citas registradas.</td></tr>";
        return;
    }

    data.forEach(cita => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
      <td>${cita.user_name}</td>
      <td>${cita.date}</td>
      <td>${cita.time}</td>
      <td>${cita.description}</td>
    `;
        tabla.appendChild(fila);
    });
});
