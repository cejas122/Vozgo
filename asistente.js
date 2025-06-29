import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { supabaseUrl, supabaseKey } from './config.js'

const supabase = createClient(supabaseUrl, supabaseKey)

const escucharBtn = document.getElementById('escuchar')
const resultadoDiv = document.getElementById('resultado')

// Configurar reconocimiento de voz
const reconocimiento = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
reconocimiento.lang = 'es-ES'
reconocimiento.interimResults = false
reconocimiento.maxAlternatives = 1

// Función para hablar
function hablar(texto) {
    const voz = new SpeechSynthesisUtterance(texto)
    voz.lang = 'es-ES'
    speechSynthesis.speak(voz)
}

// Al hacer clic, saluda y empieza a escuchar
escucharBtn.addEventListener('click', () => {
    resultadoDiv.innerHTML = ''
    hablar('Buen día. Habla con el consultorio del doctor Ramírez. ¿En qué lo puedo ayudar?')
    reconocimiento.start()
})

// Cuando detecta la voz
reconocimiento.onresult = async (event) => {
    const texto = event.results[0][0].transcript
    resultadoDiv.innerHTML = `🗒️ Tú dijiste: "${texto}"`

    const datos = extraerDatos(texto)

    if (datos.user_name && datos.date && datos.time) {
        const { error } = await supabase.from('appointments').insert([{
            user_name: datos.user_name,
            date: datos.date,
            time: datos.time,
            description: texto
        }])

        if (error) {
            console.error(error)
            hablar('Hubo un error al guardar la cita. Inténtelo de nuevo.')
        } else {
            hablar(`Listo ${datos.user_name}, su cita para el ${formatoFechaVoz(datos.date)} a las ${datos.time} ha sido registrada.`)
        }
    } else {
        hablar('No entendí toda la información. ¿Podría repetir su nombre, la fecha y la hora de la cita?')
    }
}

reconocimiento.onerror = (event) => {
    resultadoDiv.innerHTML = `❌ Error al reconocer: ${event.error}`
    hablar('Ocurrió un error al escuchar. Intente nuevamente.')
}

// Función para extraer datos
function extraerDatos(texto) {
    let nombreMatch = texto.match(/soy (\w+)/i)
    let fechaMatch = texto.match(/el (\d{1,2} de \w+)/i)
    let horaMatch = texto.match(/a las (\d{1,2})(:\d{2})?/i)

    let nombre = nombreMatch ? nombreMatch[1] : null

    let fecha = null
    if (fechaMatch) {
        const meses = {
            enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05',
            junio: '06', julio: '07', agosto: '08', septiembre: '09',
            octubre: '10', noviembre: '11', diciembre: '12'
        }
        const [_, dia, mesTexto] = fechaMatch[0].match(/(\d{1,2}) de (\w+)/)
        const mes = meses[mesTexto.toLowerCase()]
        const year = new Date().getFullYear()
        if (mes) {
            fecha = `${year}-${mes}-${dia.padStart(2, '0')}`
        }
    }

    let hora = horaMatch ? horaMatch[0].replace('a las ', '') : null

    return {
        user_name: nombre,
        date: fecha,
        time: hora
    }
}

// Convierte fecha a voz: 2025-07-05 -> 5 de julio
function formatoFechaVoz(fecha) {
    const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    const [año, mes, dia] = fecha.split('-')
    return `${parseInt(dia)} de ${meses[parseInt(mes) - 1]}`
}
