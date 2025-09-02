// Importa las funciones necesarias de Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, get, child, update, remove, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC81uKipArf__Mp9ernUh88E7kzjePdryA",
    authDomain: "parqueadero-fb51c.firebaseapp.com",
    projectId: "parqueadero-fb51c",
    storageBucket: "parqueadero-fb51c.firebasestorage.app",
    messagingSenderId: "76380635067",
    appId: "1:76380635067:web:1efaefb6b8b540b4764e9e",
    measurementId: "G-YRQPFTKDL2"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app, "https://parqueadero-fb51c-default-rtdb.firebaseio.com/");

// Precios predeterminados
const defaultPrices = {
    carro_hora: 6000,
    moto_hora: 4000,
    carro_12h: 30000,
    moto_12h: 15000,
    carro_mensual: 250000,
    food_truck_mensual: 200000
};

let currentPrices = { ...defaultPrices };
let isAdmin = false;

// Referencias a elementos del DOM
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password-input');
const loginError = document.getElementById('login-error');
const entradaForm = document.getElementById('entrada-form');
const salidaForm = document.getElementById('salida-form');
const salidaDetails = document.getElementById('salida-details');
const confirmarSalidaBtn = document.getElementById('confirmar-salida-btn');
const entradaMessage = document.getElementById('entrada-message');
const salidaMessage = document.getElementById('salida-message');
const mensualidadesList = document.getElementById('mensualidades-list');
const adminPanel = document.getElementById('admin-panel');
const preciosForm = document.getElementById('precios-form');
const tipoPagoEntrada = document.getElementById('tipo-pago-entrada');
const mensualidadGroup = document.getElementById('mensualidad-group');

// Función para mostrar/ocultar secciones
function showSection(id) {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(id).classList.remove('hidden');
}

// Lógica de autenticación simple
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value;
    if (password === 'admin123') { // Contraseña de administrador
        isAdmin = true;
        showSection('dashboard-section');
        showTab('entrada');
        adminPanel.classList.remove('hidden');
        loadPrices();
    } else if (password === 'trabajador123') { // Contraseña de trabajador
        isAdmin = false;
        showSection('dashboard-section');
        showTab('entrada');
        adminPanel.classList.add('hidden');
    } else {
        loginError.textContent = 'Contraseña incorrecta';
        passwordInput.value = '';
    }
});

// Función para mostrar las pestañas del dashboard
window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
    
    // Si la pestaña es 'mensualidades', carga la lista
    if (tabId === 'mensualidades') {
        loadMonthlyVehicles();
    }
};

// Muestra el campo de precio de mensualidad si se selecciona
tipoPagoEntrada.addEventListener('change', () => {
    if (tipoPagoEntrada.value === 'Mensualidad') {
        mensualidadGroup.classList.remove('hidden');
    } else {
        mensualidadGroup.classList.add('hidden');
    }
});

// Registrar entrada del vehículo
entradaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const placa = document.getElementById('placa-entrada').value.toUpperCase();
    const tipo = document.getElementById('tipo-vehiculo-entrada').value;
    const tipoPago = document.getElementById('tipo-pago-entrada').value;
    const esClienteEspecial = document.getElementById('cliente-especial-entrada').checked;
    const precioMensualidad = document.getElementById('precio-mensualidad').value;

    const vehiculosRef = ref(db, `vehiculos/${placa}`);
    const snapshot = await get(vehiculosRef);

    if (snapshot.exists()) {
        entradaMessage.textContent = `Error: La placa ${placa} ya está registrada en el parqueadero.`;
        entradaMessage.style.color = '#e74c3c';
    } else {
        let vehicleData = {
            placa,
            tipo,
            entrada: new Date().toISOString(),
            tipoPago,
            clienteEspecial: esClienteEspecial
        };

        if (tipoPago === 'Mensualidad') {
            vehicleData.mensualidadHasta = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            if (precioMensualidad) {
                vehicleData.precioMensualidad = parseFloat(precioMensualidad);
            } else {
                vehicleData.precioMensualidad = tipo === 'Carro' ? currentPrices.carro_mensual : currentPrices.food_truck_mensual;
            }
        }
        
        await update(vehiculosRef, vehicleData);
        entradaMessage.textContent = `✅ Entrada registrada para la placa ${placa}.`;
        entradaMessage.style.color = '#27ae60';
        entradaForm.reset();
        mensualidadGroup.classList.add('hidden');
    }
});

// Calcular salida y pago
salidaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const placa = document.getElementById('placa-salida').value.toUpperCase();
    const vehiculoRef = ref(db, `vehiculos/${placa}`);
    const snapshot = await get(vehiculoRef);

    salidaDetails.classList.add('hidden');
    salidaMessage.textContent = '';
    
    if (!snapshot.exists()) {
        salidaMessage.textContent = `Error: No se encontró la placa ${placa}.`;
        salidaMessage.style.color = '#e74c3c';
        return;
    }

    const data = snapshot.val();
    const entrada = new Date(data.entrada);
    const salida = new Date();
    const tiempoEstadiaMs = salida - entrada;
    const tiempoEstadiaHoras = tiempoEstadiaMs / (1000 * 60 * 60);

    let totalPagar = 0;
    let tiempoTexto = '';

    if (data.tipoPago === 'Mensualidad') {
        const mensualidadHasta = new Date(data.mensualidadHasta);
        if (salida > mensualidadHasta) {
            tiempoTexto = `El vehículo está fuera de la fecha de mensualidad. Fecha de pago: ${mensualidadHasta.toLocaleDateString()}`;
            totalPagar = 0; // Se cobra al renovar
        } else {
            tiempoTexto = `Mensualidad pagada hasta el ${mensualidadHasta.toLocaleDateString()}.`;
            totalPagar = 0;
        }
    } else {
        const horas = Math.floor(tiempoEstadiaHoras);
        const minutos = Math.floor((tiempoEstadiaHoras - horas) * 60);
        tiempoTexto = `${horas}h ${minutos}m`;

        const precioHora = data.tipo === 'Carro' ? currentPrices.carro_hora : currentPrices.moto_hora;
        const precio12h = data.tipo === 'Carro' ? currentPrices.carro_12h : currentPrices.moto_12h;
        const precioMediaHora = precioHora / 2;

        if (tiempoEstadiaHoras <= 0.5) {
            totalPagar = precioMediaHora;
        } else if (tiempoEstadiaHoras > 0.5 && tiempoEstadiaHoras <= 12) {
            totalPagar = Math.ceil(tiempoEstadiaHoras) * precioHora;
        } else {
            const horasAdicionales = tiempoEstadiaHoras - 12;
            totalPagar = precio12h + (Math.ceil(horasAdicionales) * precioHora);
        }

        if (data.clienteEspecial) {
            totalPagar *= 0.9; // 10% de descuento
        }
    }

    // Muestra los detalles
    document.getElementById('salida-placa').textContent = placa;
    document.getElementById('salida-tipo').textContent = data.tipo;
    document.getElementById('salida-tiempo').textContent = tiempoTexto;
    document.getElementById('salida-total').textContent = formatPrice(totalPagar);
    salidaDetails.classList.remove('hidden');

    // Configura el botón de confirmar
    confirmarSalidaBtn.onclick = async () => {
        // Guarda el registro en la base de datos de historial
        await push(ref(db, 'historial'), {
            placa,
            tipo: data.tipo,
            entrada: data.entrada,
            salida: salida.toISOString(),
            totalPagar,
            tipoPago: data.tipoPago,
            clienteEspecial: data.clienteEspecial
        });

        // Elimina el vehículo de la lista de activos
        await remove(vehiculoRef);
        
        // Genera el recibo
        generateReceipt(placa, data.tipo, entrada, salida, totalPagar, data.tipoPago);

        salidaMessage.textContent = `✅ Salida confirmada y recibo generado para la placa ${placa}.`;
        salidaMessage.style.color = '#27ae60';
        salidaForm.reset();
        salidaDetails.classList.add('hidden');
    };
});

// Cargar vehículos con mensualidad
function loadMonthlyVehicles() {
    onValue(ref(db, 'vehiculos'), (snapshot) => {
        mensualidadesList.innerHTML = '';
        if (snapshot.exists()) {
            snapshot.forEach(childSnapshot => {
                const vehicle = childSnapshot.val();
                if (vehicle.tipoPago === 'Mensualidad') {
                    const li = document.createElement('li');
                    const hasta = new Date(vehicle.mensualidadHasta);
                    const precio = vehicle.precioMensualidad ? formatPrice(vehicle.precioMensualidad) : 'N/A';
                    li.innerHTML = `
                        <span>Placa: ${vehicle.placa}</span>
                        <span>Tipo: ${vehicle.tipo}</span>
                        <span>Precio: ${precio}</span>
                        <span>Vence: ${hasta.toLocaleDateString()}</span>
                    `;
                    mensualidadesList.appendChild(li);
                }
            });
        }
    });
}

// Cargar y actualizar precios del administrador
function loadPrices() {
    onValue(ref(db, 'precios'), (snapshot) => {
        if (snapshot.exists()) {
            currentPrices = snapshot.val();
        } else {
            // Si no hay precios, los sube por defecto
            update(ref(db, 'precios'), defaultPrices);
        }
        // Rellena los campos del formulario de admin
        document.getElementById('precio-hora-carro').value = currentPrices.carro_hora;
        document.getElementById('precio-hora-moto').value = currentPrices.moto_hora;
        document.getElementById('precio-12h-carro').value = currentPrices.carro_12h;
        document.getElementById('precio-12h-moto').value = currentPrices.moto_12h;
    });
}

preciosForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPrices = {
        carro_hora: parseFloat(document.getElementById('precio-hora-carro').value),
        moto_hora: parseFloat(document.getElementById('precio-hora-moto').value),
        carro_12h: parseFloat(document.getElementById('precio-12h-carro').value),
        moto_12h: parseFloat(document.getElementById('precio-12h-moto').value)
    };
    await update(ref(db, 'precios'), newPrices);
    alert('Precios actualizados exitosamente.');
});

// Función para formatear el precio
function formatPrice(price) {
    if (price === 0) return '0 COP';
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(price);
}

// Función para generar y descargar el recibo
function generateReceipt(placa, tipo, entrada, salida, totalPagar, tipoPago) {
    const totalFormateado = formatPrice(totalPagar);
    const entradaStr = entrada.toLocaleString('es-CO');
    const salidaStr = salida.toLocaleString('es-CO');
    const tiempoEstadiaMs = salida - entrada;
    const tiempoEstadiaHoras = tiempoEstadiaMs / (1000 * 60 * 60);
    const horas = Math.floor(tiempoEstadiaHoras);
    const minutos = Math.floor((tiempoEstadiaHoras - horas) * 60);

    const receiptContent = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="text-align: center; color: #333;">Recibo de Pago</h2>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 15px 0;">
            <p><strong>Parqueadero Veloz</strong></p>
            <p><strong>Fecha y Hora:</strong> ${salidaStr}</p>
            <hr style="border: 0; height: 1px; background: #ddd; margin: 15px 0;">
            <p><strong>Placa del Vehículo:</strong> ${placa}</p>
            <p><strong>Tipo de Vehículo:</strong> ${tipo}</p>
            <p><strong>Entrada:</strong> ${entradaStr}</p>
            <p><strong>Salida:</strong> ${salidaStr}</p>
            <p><strong>Tiempo de Estadia:</strong> ${tipoPago === 'Por Hora' ? `${horas}h ${minutos}m` : 'Mensualidad'}</p>
            <hr style="border: 0; height: 1px; background: #333; margin: 15px 0;">
            <p style="font-size: 1.2rem; text-align: right;"><strong>Total a Pagar: ${totalFormateado}</strong></p>
        </div>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recibo_${placa}_${new Date().toISOString()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
