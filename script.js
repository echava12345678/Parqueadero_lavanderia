// Obtener referencias a los elementos del DOM
const loginSection = document.getElementById('login-section');
const workerSection = document.getElementById('worker-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const entryForm = document.getElementById('entry-form');
const exitForm = document.getElementById('exit-form');
const ratesForm = document.getElementById('rates-form');
const parkingList = document.getElementById('parking-list');
const loginError = document.getElementById('login-error');
const exitPlacaInput = document.getElementById('exit-placa');
const calculateBtn = document.getElementById('calculate-btn');
const confirmExitBtn = document.getElementById('confirm-exit-btn');
const isSpecialClientCheckbox = document.getElementById('is-special-client');
const discountOptionsDiv = document.querySelector('.discount-options');
const isMonthlyCheckbox = document.getElementById('is-monthly');
const monthlyPaymentGroup = document.getElementById('monthly-payment-group');
const entryTypeSelect = document.getElementById('entry-type');

// Variables globales para la sesión y tarifas
let currentRole = null;
let currentRates = {
    car_hour: 6000,
    moto_hour: 4000,
    car_12h: 30000,
    moto_12h: 15000,
    car_monthly: 250000,
    food_cart_monthly: 200000
};

// **Lógica de Autenticación y Visualización de Secciones**

const users = {
    admin: 'admin123',
    trabajador: 'trabajador123'
};

function showSection(section) {
    loginSection.classList.add('hidden');
    workerSection.classList.add('hidden');
    adminSection.classList.add('hidden');
    section.classList.remove('hidden');
}

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;

    if (users[username] && users[username] === password) {
        currentRole = username;
        if (username === 'admin') {
            showSection(adminSection);
            loadRates();
        } else {
            showSection(workerSection);
        }
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Usuario o contraseña incorrectos.';
    }
});

document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentRole = null;
        showSection(loginSection);
        loginForm.reset();
    });
});

// **Lógica del Trabajador**

// Cargar vehículos desde Firebase
function loadVehicles() {
    firebase.onValue(window.dbRef.vehicles, (snapshot) => {
        const vehicles = snapshot.val() || {};
        parkingList.innerHTML = '';
        const parkingKeys = Object.keys(vehicles);

        if (parkingKeys.length === 0) {
            parkingList.innerHTML = '<p style="text-align: center;">No hay vehículos parqueados.</p>';
            return;
        }

        parkingKeys.forEach(key => {
            const vehicle = vehicles[key];
            const li = document.createElement('li');
            const entryTime = new Date(vehicle.entryTime);
            const entryDate = entryTime.toLocaleDateString();
            const entryClock = entryTime.toLocaleTimeString();
            const stayDuration = getStayDuration(vehicle.entryTime);
            
            let monthlyInfo = '';
            if (vehicle.isMonthly) {
                const nextPaymentDate = new Date(entryTime);
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                monthlyInfo = ` - Mensualidad (pago el ${nextPaymentDate.toLocaleDateString()})`;
            }

            li.innerHTML = `
                <strong>Placa:</strong> ${vehicle.placa} | 
                <strong>Tipo:</strong> ${vehicle.type} | 
                <strong>Ingreso:</strong> ${entryDate} ${entryClock} ${monthlyInfo} |
                <strong>Tiempo:</strong> ${stayDuration}
            `;
            parkingList.appendChild(li);
        });
    });
}

function getStayDuration(entryTime) {
    const now = new Date();
    const entry = new Date(entryTime);
    const diff = now.getTime() - entry.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
}

// Lógica de Entrada de Vehículo
entryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const placa = e.target['entry-placa'].value.toUpperCase();
    const type = e.target['entry-type'].value;
    const isMonthly = e.target['is-monthly'].checked;
    
    firebase.push(window.dbRef.vehicles, {
        placa,
        type,
        entryTime: new Date().toISOString(),
        isMonthly,
        // Puede que necesites guardar el precio de mensualidad si cambia, para el recibo
        monthlyRate: isMonthly ? (type === 'carro' ? currentRates.car_monthly : currentRates.food_cart_monthly) : null
    }).then(() => {
        alert('Vehículo registrado correctamente.');
        entryForm.reset();
        monthlyPaymentGroup.classList.add('hidden');
        isMonthlyCheckbox.checked = false;
    }).catch(error => {
        alert('Error al registrar el vehículo: ' + error.message);
    });
});

// Mostrar/Ocultar opción de mensualidad
entryTypeSelect.addEventListener('change', (e) => {
    const type = e.target.value;
    if (type === 'carro' || type === 'carrito-comida') {
        monthlyPaymentGroup.classList.remove('hidden');
    } else {
        monthlyPaymentGroup.classList.add('hidden');
    }
});

// Lógica de Salida de Vehículo
calculateBtn.addEventListener('click', () => {
    const placa = exitPlacaInput.value.toUpperCase();
    if (!placa) {
        alert('Por favor, ingrese una placa.');
        return;
    }

    firebase.onValue(window.dbRef.vehicles, (snapshot) => {
        const vehicles = snapshot.val() || {};
        const vehicleEntry = Object.entries(vehicles).find(([key, value]) => value.placa === placa);

        if (!vehicleEntry) {
            alert('Vehículo no encontrado. Verifique la placa.');
            return;
        }

        const [vehicleKey, vehicleData] = vehicleEntry;
        const entryTime = new Date(vehicleData.entryTime);
        const now = new Date();
        const diffInMinutes = (now.getTime() - entryTime.getTime()) / (1000 * 60);

        const totalPriceSpan = document.getElementById('total-price');
        const stayTimeSpan = document.getElementById('stay-time');
        const paymentDetailsDiv = document.getElementById('payment-details');
        
        // Calcular el costo
        let totalCost = 0;
        let stayHours = Math.floor(diffInMinutes / 60);
        let stayMinutes = Math.floor(diffInMinutes % 60);
        
        if (vehicleData.isMonthly) {
            const nextPaymentDate = new Date(entryTime);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            stayHours = Math.floor((now.getTime() - entryTime.getTime()) / (1000 * 60 * 60)); // En horas para la mensualidad
            totalCost = vehicleData.monthlyRate;
            totalPriceSpan.textContent = `Mensualidad: ${totalCost.toLocaleString('es-CO')} COP`;
            stayTimeSpan.textContent = `Vence: ${nextPaymentDate.toLocaleDateString()}`;
            paymentDetailsDiv.classList.remove('hidden');
            confirmExitBtn.classList.remove('hidden');
        } else {
            if (stayHours < 12) {
                if (diffInMinutes <= 30) {
                    totalCost = vehicleData.type === 'carro' ? currentRates.car_hour / 2 : currentRates.moto_hour / 2;
                } else {
                    const hours = diffInMinutes / 60;
                    totalCost = Math.ceil(hours) * (vehicleData.type === 'carro' ? currentRates.car_hour : currentRates.moto_hour);
                }
            } else {
                totalCost = vehicleData.type === 'carro' ? currentRates.car_12h : currentRates.moto_12h;
            }

            // Aplicar descuento si es cliente especial
            if (isSpecialClientCheckbox.checked) {
                const discountPercentage = document.getElementById('discount-percentage').value || 0;
                totalCost = totalCost * (1 - (discountPercentage / 100));
            }

            totalPriceSpan.textContent = `${totalCost.toLocaleString('es-CO')} COP`;
            stayTimeSpan.textContent = `${stayHours}h ${stayMinutes}m`;
            paymentDetailsDiv.classList.remove('hidden');
            confirmExitBtn.classList.remove('hidden');
        }
        
        // Almacenar datos temporales para el recibo
        window.tempVehicleData = {
            ...vehicleData,
            totalCost,
            exitTime: now.toISOString(),
            stayTime: `${stayHours}h ${stayMinutes}m`,
            key: vehicleKey
        };

        // Escuchar el botón de confirmación de salida
        confirmExitBtn.onclick = () => {
            generateReceipt(window.tempVehicleData);
            firebase.remove(window.dbRef.vehicles.child(window.tempVehicleData.key)).then(() => {
                alert('Salida registrada y recibo generado.');
                exitForm.reset();
                paymentDetailsDiv.classList.add('hidden');
                confirmExitBtn.classList.add('hidden');
            }).catch(error => {
                alert('Error al registrar la salida: ' + error.message);
            });
        };
    }, {
        onlyOnce: true
    });
});

isSpecialClientCheckbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        discountOptionsDiv.classList.remove('hidden');
    } else {
        discountOptionsDiv.classList.add('hidden');
    }
});

// Función para generar el recibo en PDF
function generateReceipt(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Parqueadero", 105, 20, null, null, "center");
    
    doc.setFontSize(16);
    doc.text("Recibo de Pago", 105, 30, null, null, "center");

    const entryDate = new Date(data.entryTime).toLocaleString('es-CO');
    const exitDate = new Date(data.exitTime).toLocaleString('es-CO');

    const tableData = [
        ["Placa", data.placa],
        ["Tipo de Vehículo", data.type],
        ["Hora de Entrada", entryDate],
        ["Hora de Salida", exitDate],
        ["Tiempo de Estancia", data.isMonthly ? `Vence: ${new Date(data.entryTime).setMonth(new Date(data.entryTime).getMonth() + 1)}` : data.stayTime],
        ["Total a Pagar", `${data.totalCost.toLocaleString('es-CO')} COP`]
    ];
    
    doc.autoTable({
        startY: 40,
        head: [['Concepto', 'Detalle']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [76, 175, 80] },
    });
    
    doc.save(`Recibo_Parqueadero_${data.placa}.pdf`);
}

// Cargar vehículos al iniciar la sección del trabajador
if (!workerSection.classList.contains('hidden')) {
    loadVehicles();
}

// **Lógica del Administrador**

// Cargar tarifas desde Firebase al iniciar sesión del administrador
function loadRates() {
    firebase.onValue(window.dbRef.rates, (snapshot) => {
        const rates = snapshot.val();
        if (rates) {
            currentRates = rates;
            document.getElementById('car-hour').value = rates.car_hour;
            document.getElementById('moto-hour').value = rates.moto_hour;
            document.getElementById('car-12h').value = rates.car_12h;
            document.getElementById('moto-12h').value = rates.moto_12h;
            document.getElementById('car-monthly').value = rates.car_monthly;
            document.getElementById('food-cart-monthly').value = rates.food_cart_monthly;
        }
    }, {
        onlyOnce: true
    });
}

// Actualizar tarifas en Firebase
ratesForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newRates = {
        car_hour: Number(e.target['car-hour'].value),
        moto_hour: Number(e.target['moto-hour'].value),
        car_12h: Number(e.target['car-12h'].value),
        moto_12h: Number(e.target['moto-12h'].value),
        car_monthly: Number(e.target['car-monthly'].value),
        food_cart_monthly: Number(e.target['food-cart-monthly'].value)
    };
    
    firebase.update(window.dbRef.rates, newRates).then(() => {
        currentRates = newRates;
        alert('Tarifas actualizadas correctamente.');
    }).catch(error => {
        alert('Error al actualizar las tarifas: ' + error.message);
    });
});
