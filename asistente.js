import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { supabaseUrl, supabaseKey } from './config.js';

const supabase = createClient(supabaseUrl, supabaseKey);

const escucharBtn = document.getElementById('escuchar');
const resultadoDiv = document.getElementById('resultado');

// Bienvenida automática por voz
window.onload = () => {
    const bienvenida = new SpeechSynthesisUtterance(
        "Buenos días, ha llamado al consultorio del Doctor García. ¿En qué le puedo ayudar?"
    );
    bienvenida.lang = 'es-ES';
    speechSynthesis.speak(bienvenida);
};

// Configuración de reconocimiento de voz
const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES';
reconocimiento.interimResults = false;
reconocimiento.maxAlternatives = 1;

// Escuchar al presionar el botón
escucharBtn.addEventListener('click', () => {
    resultadoDiv.innerHTML = '🎙️ Escuchando...';
    reconocimiento.start();
});

// Al recibir resultado
reconocimiento.onresult = async (event) => {
    const texto = event.results[0][0].transcript;
    resultadoDiv.innerHTML = `🗒️ Tú dijiste: "${texto}"`;

    const datos = extraerDatos(texto);

    if (datos.user_name && datos.date && datos.time) {
        const { error } = await supabase.from('appointments').insert([{
            user_name: datos.user_name,
            date: datos.date,
            time: datos.time,
            description: texto
        }]);

        if (error) {
            alert('❌ Error al guardar la cita');
            console.error(error);
        } else {
            const confirmacion = new SpeechSynthesisUtterance("Cita guardada con éxito.");
            confirmacion.lang = 'es-ES';
            speechSynthesis.speak(confirmacion);
            alert('✅ Cita guardada con éxito!');
        }
    } else {
        const errorTexto = new SpeechSynthesisUtterance("No se pudo entender toda la información. Por favor repita.");
        errorTexto.lang = 'es-ES';
        speechSynthesis.speak(errorTexto);
        alert('❌ No se pudo extraer la información completa.');
    }
};

// Error al escuchar
reconocimiento.onerror = (event) => {
    resultadoDiv.innerHTML = `❌ Error de reconocimiento: ${event.error}`;
    console.error("❌ Error de reconocimiento:", event.error);
};

// Función para extraer datos
function extraerDatos(texto) {
    let nombreMatch = texto.match(/soy (\w+)/i);
    let fechaMatch = texto.match(/el (\d{1,2}) de (\w+)/i);
    let horaMatch = texto.match(/a las (\d{1,2})(:\d{2})?/i);

    let nombre = nombreMatch ? nombreMatch[1] : null;

    let fecha = null;
    if (fechaMatch) {
        const meses = {
            enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05',
            junio: '06', julio: '07', agosto: '08', septiembre: '09',
            octubre: '10', noviembre: '11', diciembre: '12'
        };
        const dia = fechaMatch[1];
        const mesTexto = fechaMatch[2];
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