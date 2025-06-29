import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { supabaseUrl, supabaseKey } from './config.js';

const supabase = createClient(supabaseUrl, supabaseKey);

const escucharBtn = document.getElementById('escuchar');
const resultadoDiv = document.getElementById('resultado');

// Configuración reconocimiento de voz
const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES';
reconocimiento.interimResults = false;
reconocimiento.maxAlternatives = 1;

// Inicia escucha al presionar el botón
escucharBtn.addEventListener('click', () => {
    resultadoDiv.innerHTML = '🎙️ Escuchando...';
    console.log("🎤 Iniciando reconocimiento de voz...");
    reconocimiento.start();
});

// Resultado de voz
reconocimiento.onresult = async (event) => {
    const texto = event.results[0][0].transcript;
    resultadoDiv.innerHTML = `🗒️ Tú dijiste: "${texto}"`;

    const datos = extraerDatos(texto);

    if (datos.user_name && datos.date && datos.time) {
        const { error } = await supabase.from('appointments').insert([
            {
                user_name: datos.user_name,
                date: datos.date,
                time: datos.time,
                description: texto
            }
        ]);

        if (error) {
            alert('❌ Error al guardar la cita');
            console.error(error);
        } else {
            alert('✅ Cita guardada con éxito!');
        }
    } else {
        alert('❌ No se pudo extraer la información completa.');
    }
};

// Manejo de errores del micrófono
reconocimiento.onerror = (event) => {
    console.error("❌ Error de reconocimiento:", event.error);
    resultadoDiv.innerHTML = `❌ Error de reconocimiento: ${event.error}`;
};

// Función para extraer datos desde texto
function extraerDatos(texto) {
    let nombreMatch = texto.match(/soy (\w+)/i);
    let fechaMatch = texto.match(/el (\d{1,2} de \w+)/i);
    let horaMatch = texto.match(/a las (\d{1,2})(:\d{2})?/i);

    let nombre = nombreMatch ? nombreMatch[1] : null;

    let fecha = null;
    if (fechaMatch) {
        const meses = {
            enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05',
            junio: '06', julio: '07', agosto: '08', septiembre: '09',
            octubre: '10', noviembre: '11', diciembre: '12'
        };
        const [_, dia, mesTexto] = fechaMatch[0].match(/(\d{1,2}) de (\w+)/);
        const mes = meses[mesTexto.toLowerCase()];
        const year = new Date().getFullYear();
        if (mes) {
            fecha = `${year}-${mes}-${dia.padStart(2, '0')}`;
        }
    }

    let hora = horaMatch ? horaMatch[0].replace('a las ', '') : null;

    return {
        user_name: nombre,
        date: fecha,
        time: hora
    };
}