import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { supabaseUrl, supabaseKey } from './config.js';

const supabase = createClient(supabaseUrl, supabaseKey);

const escucharBtn = document.getElementById('escuchar');
const resultadoDiv = document.getElementById('resultado');

const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES';
reconocimiento.interimResults = false;

escucharBtn.addEventListener('click', () => {
    resultadoDiv.innerHTML = '🎧 Escuchando...';
    reconocimiento.start();
});

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
            resultadoDiv.innerHTML += `<br>❌ Error al guardar`;
            console.error(error);
        } else {
            resultadoDiv.innerHTML += `<br>✅ Cita guardada`;
        }
    } else {
        resultadoDiv.innerHTML += `<br>❌ Información incompleta`;
    }
};

function extraerDatos(texto) {
    let nombreMatch = texto.match(/soy (\w+)/i);
    let fechaMatch = texto.match(/el (\d{1,2}) de (\w+)/i);
    let horaMatch = texto.match(/a las (\d{1,2})(?::(\d{2}))?/i);

    const meses = {
        enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05',
        junio: '06', julio: '07', agosto: '08', septiembre: '09',
        octubre: '10', noviembre: '11', diciembre: '12'
    };

    let nombre = nombreMatch ? nombreMatch[1] : null;
    let fecha = null;
    if (fechaMatch) {
        const dia = fechaMatch[1].padStart(2, '0');
        const mes = meses[fechaMatch[2].toLowerCase()];
        const año = new Date().getFullYear();
        fecha = `${año}-${mes}-${dia}`;
    }

    let hora = horaMatch ? `${horaMatch[1]}:${horaMatch[2] || '00'}` : null;

    return {
        user_name: nombre,
        date: fecha,
        time: hora
    };
}
