function escuchar() {
    const resultado = document.getElementById("resultado");

    const reconocimiento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!reconocimiento) {
        resultado.textContent = "Este navegador no soporta reconocimiento de voz 😢";
        return;
    }

    const reconocimientoVoz = new reconocimiento();
    reconocimientoVoz.lang = "es-ES";
    reconocimientoVoz.interimResults = false;
    reconocimientoVoz.maxAlternatives = 1;

    resultado.textContent = "🎧 Escuchando...";

    reconocimientoVoz.onresult = (event) => {
        const texto = event.results[0][0].transcript;
        resultado.textContent = `📝 Tú dijiste: "${texto}"`;
        guardarCita(texto);
    };

    reconocimientoVoz.onerror = (event) => {
        resultado.textContent = "❌ Error al reconocer: " + event.error;
    };

    reconocimientoVoz.start();
}

async function guardarCita(texto) {
    const { error } = await window.supabase.from("appointments").insert([
        {
            user_name: "Paciente automático",
            date: new Date().toISOString().slice(0, 10),
            time: new Date().toLocaleTimeString(),
            description: texto
        }
    ]);

    if (error) {
        console.error("❌ Error al guardar la cita:", error);
        alert("Error al guardar la cita 😢");
    } else {
        alert("✅ Cita guardada con éxito!");
    }
}
