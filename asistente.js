const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const escucharBtn = document.getElementById('escuchar');
const resultadoDiv = document.getElementById('resultado');

const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
reconocimiento.lang = 'es-ES';
reconocimiento.interimResults = false;
reconocimiento.maxAlternatives = 1;

escucharBtn.addEventListener('click', () => {
    resultadoDiv.innerHTML = '';
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
            alert('❌ Error al guardar la cita');
            console.error(error);
        } else {
            alert('✅ Cita guardada con éxito!');
        }
    } else {
        alert('❌ No se pudo extraer la información completa.');
    }
};

reconocimiento.onerror = (event) => {
    resultadoDiv.innerHTML = `❌ Error al reconocer: ${event.error}`;
};

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
