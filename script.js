document.addEventListener('DOMContentLoaded', () => {
    // Definición de elementos del DOM
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const adminPanel = document.getElementById('admin-panel');
    const workerPanel = document.getElementById('worker-panel');
    const entryForm = document.getElementById('entry-form');
    const exitForm = document.getElementById('exit-form');
    const resultDiv = document.getElementById('result');
    const resultText = document.getElementById('result-text');
    const activeVehiclesList = document.getElementById('active-vehicles');
    const printReceiptBtn = document.getElementById('print-receipt');
    const savePricesBtn = document.getElementById('save-prices');

    // Tarifas iniciales
    let prices = {
        carro: {
            hora: 6000,
            doceHoras: 30000,
            mes: 250000
        },
        moto: {
            hora: 4000,
            doceHoras: 15000,
            mes: 200000 // Tarifa de comida rápida
        }
    };

    // Usuarios del sistema
    const users = {
        'admin': 'admin123',
        'trabajador': 'trabajador123'
    };

    // Cargar tarifas y vehículos desde localStorage
    const storedPrices = localStorage.getItem('parkingPrices');
    if (storedPrices) {
        prices = JSON.parse(storedPrices);
        document.getElementById('car-hour').value = prices.carro.hora;
        document.getElementById('bike-hour').value = prices.moto.hora;
        document.getElementById('car-12h').value = prices.carro.doceHoras;
        document.getElementById('bike-12h').value = prices.moto.doceHoras;
        document.getElementById('car-month').value = prices.carro.mes;
        document.getElementById('food-month').value = prices.moto.mes;
    }

    let activeVehicles = JSON.parse(localStorage.getItem('activeVehicles')) || [];

    // Funciones de utilidad
    const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);

    const updateActiveVehiclesList = () => {
        activeVehiclesList.innerHTML = '';
        if (activeVehicles.length === 0) {
            activeVehiclesList.innerHTML = '<li>No hay vehículos activos.</li>';
        } else {
            activeVehicles.forEach(v => {
                const li = document.createElement('li');
                li.textContent = `Placa: ${v.plate.toUpperCase()}, Tipo: ${v.type}, Entrada: ${new Date(v.entryTime).toLocaleString()}`;
                activeVehiclesList.appendChild(li);
            });
        }
    };

    // Funciones de Autenticación
    const login = (username, password) => {
        if (users[username] === password) {
            localStorage.setItem('currentUser', username);
            showApp(username);
        } else {
            alert('Usuario o contraseña incorrectos.');
        }
    };

    const showApp = (user) => {
        loginSection.style.display = 'none';
        mainApp.style.display = 'block';
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'inline';

        if (user === 'admin') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
        }
        updateActiveVehiclesList();
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        loginSection.style.display = 'block';
        mainApp.style.display = 'none';
        btnLogin.style.display = 'inline';
        btnLogout.style.display = 'none';
        resultDiv.style.display = 'none';
    };

    // Manejadores de eventos
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });

    btnLogout.addEventListener('click', logout);
    
    // Si ya hay una sesión activa, la muestra
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showApp(currentUser);
    } else {
        loginSection.style.display = 'block';
        mainApp.style.display = 'none';
    }

    // Guardar tarifas del administrador
    savePricesBtn.addEventListener('click', () => {
        prices.carro.hora = parseInt(document.getElementById('car-hour').value);
        prices.moto.hora = parseInt(document.getElementById('bike-hour').value);
        prices.carro.doceHoras = parseInt(document.getElementById('car-12h').value);
        prices.moto.doceHoras = parseInt(document.getElementById('bike-12h').value);
        prices.carro.mes = parseInt(document.getElementById('car-month').value);
        prices.moto.mes = parseInt(document.getElementById('food-month').value);
        localStorage.setItem('parkingPrices', JSON.stringify(prices));
        alert('Tarifas actualizadas correctamente.');
    });

    // Registrar entrada de vehículo
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-entry').value.trim().toUpperCase();
        const type = document.getElementById('type-entry').value;

        // Validar si la placa ya está registrada
        if (activeVehicles.find(v => v.plate === plate)) {
            alert('¡Esta placa ya se encuentra registrada!');
            return;
        }

        const newVehicle = {
            plate,
            type,
            entryTime: new Date().toISOString()
        };
        activeVehicles.push(newVehicle);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        alert(`Entrada de ${type} con placa ${plate} registrada.`);
        entryForm.reset();
        updateActiveVehiclesList();
    });

    // Registrar salida y calcular costo
    exitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicleIndex = activeVehicles.findIndex(v => v.plate === plate);

        if (vehicleIndex === -1) {
            alert('Placa no encontrada. Por favor, verifique la placa e intente de nuevo.');
            return;
        }

        const vehicle = activeVehicles[vehicleIndex];
        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const diffInMs = exitTime - entryTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        const diffInHours = diffInMs / (1000 * 60 * 60);
        let totalCost = 0;
        let discount = 0;
        const isSpecialClient = confirm('¿Es un cliente especial y aplica descuento?');
        
        if (vehicle.type === 'mensualidad' || vehicle.type === 'comida-rapida') {
            const entryDay = entryTime.getDate();
            const currentDay = exitTime.getDate();
            let paymentDay = new Date(entryTime);
            paymentDay.setMonth(paymentDay.getMonth() + 1);
            
            const daysOverdue = Math.max(0, currentDay - entryDay);
            const monthlyPrice = vehicle.type === 'mensualidad' ? prices.carro.mes : prices.moto.mes;
            
            resultText.innerHTML = `
                <p>Placa: <strong>${vehicle.plate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Valor mensualidad: <strong>$${formatNumber(monthlyPrice)} COP</strong></p>
                <p>Día de pago próximo: <strong>${paymentDay.toLocaleDateString()}</strong></p>
                <p>Días de retraso (si aplica): <strong>${daysOverdue}</strong></p>
                <p><strong>Salida registrada. No se aplica cargo por hora.</strong></p>
            `;
            totalCost = 0;
        } else {
            const vehicleType = vehicle.type;
            const pricePerHour = prices[vehicleType].hora;
            const priceFor12Hours = prices[vehicleType].doceHoras;

            if (diffInHours <= 0.5) {
                totalCost = pricePerHour / 2;
            } else if (diffInHours > 0.5 && diffInHours <= 12) {
                totalCost = Math.ceil(diffInHours) * pricePerHour;
            } else {
                totalCost = priceFor12Hours;
            }
            
            if (isSpecialClient) {
                const discountRate = parseFloat(prompt('Ingrese el porcentaje de descuento (ej: 10 para 10%):')) / 100;
                if (!isNaN(discountRate)) {
                    discount = totalCost * discountRate;
                    totalCost -= discount;
                }
            }

            resultText.innerHTML = `
                <p>Placa: <strong>${vehicle.plate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Tiempo de estadía: <strong>${Math.floor(diffInHours)} horas y ${diffInMinutes % 60} minutos</strong></p>
                <p>Costo calculado (sin descuento): <strong>$${formatNumber(totalCost + discount)} COP</strong></p>
            `;
            
            if (discount > 0) {
                resultText.innerHTML += `<p>Descuento aplicado: <strong>$${formatNumber(discount)} COP</strong></p>`;
            }
            
            resultText.innerHTML += `<p>Total a pagar: <strong>$${formatNumber(totalCost)} COP</strong></p>`;
            
        }

        resultDiv.style.display = 'block';

        // Remover el vehículo de la lista y actualizar localStorage
        activeVehicles.splice(vehicleIndex, 1);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        updateActiveVehiclesList();
        
        // Almacenar datos para el recibo
        localStorage.setItem('lastReceipt', JSON.stringify({
            plate: vehicle.plate,
            type: vehicle.type,
            entryTime,
            exitTime,
            costoFinal: totalCost,
            descuento: discount,
            esMensualidad: (vehicle.type === 'mensualidad' || vehicle.type === 'comida-rapida'),
            costoOriginal: totalCost + discount
        }));
    });

    // Descargar recibo de pago
    printReceiptBtn.addEventListener('click', () => {
        const receiptData = JSON.parse(localStorage.getItem('lastReceipt'));
        if (!receiptData) {
            alert('No hay un recibo para descargar.');
            return;
        }

        const entryDate = new Date(receiptData.entryTime);
        const exitDate = new Date(receiptData.exitTime);
        const diffInMs = exitDate - entryDate;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMinutes / 60);
        const remainingMinutes = diffInMinutes % 60;
        
        const receiptContent = `
            Parqueadero El Reloj - Recibo de Pago
            -------------------------------------
            Placa: ${receiptData.plate}
            Tipo de Vehículo: ${receiptData.type}
            
            Fecha de Entrada: ${entryDate.toLocaleString()}
            Fecha de Salida: ${exitDate.toLocaleString()}
            
            ${!receiptData.esMensualidad ? `Tiempo de estadía: ${diffInHours} horas y ${remainingMinutes} minutos` : 'Servicio Mensual'}
            
            Costo Original: $${formatNumber(receiptData.costoOriginal)} COP
            Descuento aplicado: $${formatNumber(receiptData.descuento)} COP
            
            Total a Pagar: $${formatNumber(receiptData.costoFinal)} COP
            
            ¡Gracias por su visita!
        `;
        
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Recibo_${receiptData.plate}_${new Date().toLocaleDateString()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    updateActiveVehiclesList();
});
