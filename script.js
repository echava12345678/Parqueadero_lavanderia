const { jsPDF } = window.jspdf;

document.addEventListener('DOMContentLoaded', () => {
    // Definición de la función de utilidad al inicio del script
    const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);

    // Definición de elementos del DOM
    const loginSection = document.getElementById('login-section');
    const mainApp = document.getElementById('main-app');
    const loginForm = document.getElementById('login-form');
    const btnLogin = document.getElementById('btn-login');
    const btnLogout = document.getElementById('btn-logout');
    const adminTabButton = document.getElementById('admin-tab-button');
    const entryForm = document.getElementById('entry-form');
    const exitForm = document.getElementById('exit-form');
    const resultDiv = document.getElementById('result');
    const resultContent = document.getElementById('result-content');
    const activeVehiclesList = document.getElementById('active-vehicles');
    const printReceiptBtn = document.getElementById('print-receipt');
    const savePricesBtn = document.getElementById('save-prices');
    const notificationArea = document.getElementById('notification-area');
    const loginMessage = document.getElementById('login-message');
    const specialClientCheckbox = document.getElementById('special-client');

    // Tarifas iniciales
    let prices = {
        carro: {
            mediaHora: 3000,
            hora: 6000,
            doceHoras: 30000,
            mes: 250000
        },
        moto: {
            mediaHora: 2000,
            hora: 4000,
            doceHoras: 15000,
            mes: 150000 
        },
        'otros-mensualidad': {
            mes: 200000
        }
    };

    // Usuarios del sistema
    const users = {
        'admin': 'admin123',
        'trabajador': 'trabajador123'
    };
    
    // Declaración de la variable para vehículos activos
    let activeVehicles = [];

    // Cargar tarifas y vehículos desde localStorage
    const loadData = () => {
        const storedPrices = localStorage.getItem('parkingPrices');
        if (storedPrices) {
            prices = JSON.parse(storedPrices);
            
            const carHalfHourInput = document.getElementById('car-half-hour');
            if (carHalfHourInput && prices.carro && prices.carro.mediaHora !== undefined) carHalfHourInput.value = formatNumber(prices.carro.mediaHora);
            
            const carHourInput = document.getElementById('car-hour');
            if (carHourInput && prices.carro && prices.carro.hora !== undefined) carHourInput.value = formatNumber(prices.carro.hora);
            
            const car12hInput = document.getElementById('car-12h');
            if (car12hInput && prices.carro && prices.carro.doceHoras !== undefined) car12hInput.value = formatNumber(prices.carro.doceHoras);
            
            const carMonthInput = document.getElementById('car-month');
            if (carMonthInput && prices.carro && prices.carro.mes !== undefined) carMonthInput.value = formatNumber(prices.carro.mes);
            
            const bikeHalfHourInput = document.getElementById('bike-half-hour');
            if (bikeHalfHourInput && prices.moto && prices.moto.mediaHora !== undefined) bikeHalfHourInput.value = formatNumber(prices.moto.mediaHora);
            
            const bikeHourInput = document.getElementById('bike-hour');
            if (bikeHourInput && prices.moto && prices.moto.hora !== undefined) bikeHourInput.value = formatNumber(prices.moto.hora);
            
            const bike12hInput = document.getElementById('bike-12h');
            if (bike12hInput && prices.moto && prices.moto.doceHoras !== undefined) bike12hInput.value = formatNumber(prices.moto.doceHoras);
            
            const bikeMonthInput = document.getElementById('bike-month');
            if (bikeMonthInput && prices.moto && prices.moto.mes !== undefined) bikeMonthInput.value = formatNumber(prices.moto.mes);
    
            const foodMonthInput = document.getElementById('food-month');
            if (foodMonthInput && prices['otros-mensualidad'] && prices['otros-mensualidad'].mes !== undefined) foodMonthInput.value = formatNumber(prices['otros-mensualidad'].mes);
        }

        activeVehicles = JSON.parse(localStorage.getItem('activeVehicles')) || [];
    };

    loadData();

    const showNotification = (message, type = 'info') => {
        notificationArea.textContent = message;
        notificationArea.className = `message ${type}-message`;
        notificationArea.style.display = 'block';
        notificationArea.classList.add('fade-in');
        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, 5000);
    };

    const updateActiveVehiclesList = () => {
        activeVehiclesList.innerHTML = '';
        if (activeVehicles.length === 0) {
            activeVehiclesList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay vehículos activos.</li>';
        } else {
            activeVehicles.forEach(v => {
                const li = document.createElement('li');
                li.innerHTML = `<span>Placa: <strong>${v.plate.toUpperCase()}</strong></span> <span>Tipo: ${v.type}</span> <span>Entrada: ${new Date(v.entryTime).toLocaleString()}</span>`;
                activeVehiclesList.appendChild(li);
            });
        }
    };

    // Manejo de pestañas
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');

            button.classList.add('active');
            const targetTabId = button.dataset.tab;
            document.getElementById(targetTabId).style.display = 'block';
            document.getElementById(targetTabId).classList.add('fade-in');

            if (targetTabId === 'active-vehicles-tab') {
                updateActiveVehiclesList();
            }
        });
    });

    // Funciones de Autenticación
    const login = (username, password) => {
        if (users[username] === password) {
            localStorage.setItem('currentUser', username);
            loginMessage.style.display = 'none';
            showApp(username);
        } else {
            loginMessage.textContent = 'Usuario o contraseña incorrectos.';
            loginMessage.className = 'message error-message fade-in';
            loginMessage.style.display = 'block';
        }
    };

    const showApp = (user) => {
        loginSection.style.display = 'none';
        mainApp.style.display = 'block';
        btnLogin.style.display = 'none';
        btnLogout.style.display = 'inline';

        if (user === 'admin') {
            adminTabButton.style.display = 'inline-flex';
        } else {
            adminTabButton.style.display = 'none';
        }
        document.querySelector('.tab-button[data-tab="entry-exit-tab"]').click();
        updateActiveVehiclesList();
    };

    const logout = () => {
        localStorage.removeItem('currentUser');
        loginSection.style.display = 'block';
        mainApp.style.display = 'none';
        btnLogin.style.display = 'inline';
        btnLogout.style.display = 'none';
        resultDiv.style.display = 'none';
        loginForm.reset();
    };

    // Manejadores de eventos
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        login(username, password);
    });

    btnLogout.addEventListener('click', logout);
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        showApp(currentUser);
    } else {
        loginSection.style.display = 'block';
        mainApp.style.display = 'none';
    }

    // Guardar tarifas del administrador
    savePricesBtn.addEventListener('click', () => {
        const parseValue = (id) => {
            const element = document.getElementById(id);
            if (!element) return 0;
            const value = element.value.replace(/\./g, '');
            return parseInt(value) || 0;
        };
        
        if (!prices.carro) prices.carro = {};
        prices.carro.mediaHora = parseValue('car-half-hour');
        prices.carro.hora = parseValue('car-hour');
        prices.carro.doceHoras = parseValue('car-12h');
        prices.carro.mes = parseValue('car-month');
        
        if (!prices.moto) prices.moto = {};
        prices.moto.mediaHora = parseValue('bike-half-hour');
        prices.moto.hora = parseValue('bike-hour');
        prices.moto.doceHoras = parseValue('bike-12h');
        prices.moto.mes = parseValue('bike-month');

        if (!prices['otros-mensualidad']) prices['otros-mensualidad'] = {};
        prices['otros-mensualidad'].mes = parseValue('food-month');
        
        localStorage.setItem('parkingPrices', JSON.stringify(prices));
        showNotification('Tarifas actualizadas correctamente.', 'success');
        
        loadData();
    });

    // Registrar entrada de vehículo
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-entry').value.trim().toUpperCase();
        const type = document.getElementById('type-entry').value;

        if (activeVehicles.find(v => v.plate === plate)) {
            showNotification(`¡La placa ${plate} ya se encuentra registrada!`, 'error');
            return;
        }

        const newVehicle = {
            plate,
            type,
            entryTime: new Date().toISOString()
        };
        activeVehicles.push(newVehicle);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        showNotification(`Entrada de ${type} con placa ${plate} registrada.`, 'success');
        entryForm.reset();
        updateActiveVehiclesList();
    });

    // Registrar salida y calcular costo
    exitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicleIndex = activeVehicles.findIndex(v => v.plate === plate);

        if (vehicleIndex === -1) {
            showNotification('Placa no encontrada. Por favor, verifique la placa e intente de nuevo.', 'error');
            return;
        }

        const vehicle = activeVehicles[vehicleIndex];
        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const diffInMs = exitTime - entryTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        
        let totalCost = 0;
        let discount = 0;
        const isSpecialClient = specialClientCheckbox.checked;

        let resultHTML = '';
        let receiptData = {};

        if (['mensualidad', 'moto-mensualidad', 'otros-mensualidad'].includes(vehicle.type)) {
            const entryDay = entryTime.getDate();
            let paymentDay = new Date(entryTime);
            paymentDay.setMonth(paymentDay.getMonth() + 1);
            
            if (exitTime.getTime() > paymentDay.getTime() && exitTime.getDate() >= entryDay) {
                 paymentDay.setMonth(paymentDay.getMonth() + 1);
            } else if (exitTime.getTime() > paymentDay.getTime()) {
                 paymentDay.setMonth(paymentDay.getMonth() + 1);
            }
            
            let monthlyPrice;
            if (vehicle.type === 'mensualidad') {
                monthlyPrice = prices.carro.mes;
            } else if (vehicle.type === 'moto-mensualidad') {
                monthlyPrice = prices.moto.mes;
            } else {
                monthlyPrice = prices['otros-mensualidad'].mes;
            }

            resultHTML = `
                <p>Placa: <strong>${vehicle.plate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Valor mensualidad: <strong>$${formatNumber(monthlyPrice)} COP</strong></p>
                <p>Día de pago próximo: <strong>${paymentDay.toLocaleDateString('es-CO')}</strong></p>
                <p class="info-message"><strong>Salida registrada. No se aplica cargo por hora.</strong></p>
            `;
            totalCost = 0;
            
            receiptData = {
                plate: vehicle.plate,
                type: vehicle.type,
                entryTime,
                exitTime,
                costoFinal: 0,
                descuento: 0,
                esMensualidad: true,
                costoOriginal: monthlyPrice,
                proximoPago: paymentDay
            };

        } else { // Carros y Motos por hora
            const vehicleType = vehicle.type;
            const priceHalfHour = prices[vehicleType].mediaHora;
            const pricePerHour = prices[vehicleType].hora;
            const priceFor12Hours = prices[vehicleType].doceHoras;

            // Lógica de cobro por tiempo corregida
            if (diffInMinutes <= 30) {
                totalCost = 0;
                resultHTML = `
                    <p>Placa: <strong>${vehicle.plate}</strong></p>
                    <p>Tipo: <strong>${vehicle.type}</strong></p>
                    <p>Tiempo de estadía: <strong>${diffInMinutes} minutos</strong></p>
                    <p class="info-message">El vehículo no ha superado la media hora de estadía.</p>
                    <p>Total a pagar: <strong>$${formatNumber(totalCost)} COP</strong></p>
                `;
                resultContent.innerHTML = resultHTML;
                resultDiv.style.display = 'block';
                resultDiv.classList.add('fade-in');

                activeVehicles.splice(vehicleIndex, 1);
                localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
                updateActiveVehiclesList();
                exitForm.reset();
                specialClientCheckbox.checked = false;

                // No se genera recibo porque no hay cobro
                return;
            } else {
                const totalHours = Math.ceil(diffInMinutes / 60);
                totalCost = totalHours * pricePerHour;
            }
            
            if (diffInMinutes >= 720) { // 12 horas * 60 minutos
                totalCost = priceFor12Hours;
            }

            let originalCost = totalCost;

            if (isSpecialClient) {
                const discountRateInput = prompt('Ingrese el porcentaje de descuento (ej: 10 para 10%):');
                const discountRate = parseFloat(discountRateInput) / 100;
                if (!isNaN(discountRate) && discountRate >= 0 && discountRate <= 1) {
                    discount = originalCost * discountRate;
                    totalCost -= discount;
                    showNotification(`Se aplicó un descuento del ${discountRate * 100}% (${formatNumber(discount)} COP).`, 'info');
                } else {
                    showNotification('Porcentaje de descuento inválido. No se aplicó descuento.', 'error');
                }
            }

            const totalHoursDisplay = Math.floor(diffInMinutes / 60);
            const totalMinutesDisplay = diffInMinutes % 60;

            resultHTML = `
                <p>Placa: <strong>${vehicle.plate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Tiempo de estadía: <strong>${totalHoursDisplay} horas y ${totalMinutesDisplay} minutos</strong></p>
                <p>Costo calculado (sin descuento): <strong>$${formatNumber(originalCost)} COP</strong></p>
            `;
            
            if (discount > 0) {
                resultHTML += `<p>Descuento aplicado: <strong>$${formatNumber(discount)} COP</strong></p>`;
            }
            
            resultHTML += `<p>Total a pagar: <strong>$${formatNumber(totalCost)} COP</strong></p>`;

            receiptData = {
                plate: vehicle.plate,
                type: vehicle.type,
                entryTime,
                exitTime,
                costoFinal: totalCost,
                descuento: discount,
                esMensualidad: false,
                costoOriginal: originalCost,
                tiempoEstadia: `${totalHoursDisplay} horas y ${totalMinutesDisplay} minutos`
            };
        }

        resultContent.innerHTML = resultHTML;
        resultDiv.style.display = 'block';
        resultDiv.classList.add('fade-in');

        activeVehicles.splice(vehicleIndex, 1);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        updateActiveVehiclesList();
        exitForm.reset();
        specialClientCheckbox.checked = false;

        localStorage.setItem('lastReceipt', JSON.stringify(receiptData));
    });

    // Descargar recibo de pago en PDF
    printReceiptBtn.addEventListener('click', () => {
        const receiptData = JSON.parse(localStorage.getItem('lastReceipt'));
        if (!receiptData) {
            showNotification('No hay un recibo para descargar.', 'error');
            return;
        }
        
        if (receiptData.costoFinal === 0) {
            showNotification('No se puede generar recibo de un servicio gratuito.', 'info');
            return;
        }

        const doc = new jsPDF();

        // Configuración general
        doc.setFont('helvetica');
        doc.setFontSize(12);

        // Título
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text('Parqueadero El Reloj', 105, 20, null, null, 'center');
        doc.setFontSize(16);
        doc.setTextColor(52, 152, 219);
        doc.text('Recibo de Pago', 105, 30, null, null, 'center');

        // Separador
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);

        let y = 45;
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);

        doc.text(`Placa: ${receiptData.plate}`, 20, y);
        y += 7;
        doc.text(`Tipo de Vehículo: ${receiptData.type.replace('-', ' ').toUpperCase()}`, 20, y);
        y += 10;
        doc.text(`Fecha de Entrada: ${new Date(receiptData.entryTime).toLocaleString('es-CO')}`, 20, y);
        y += 7;
        doc.text(`Fecha de Salida: ${new Date(receiptData.exitTime).toLocaleString('es-CO')}`, 20, y);
        y += 10;

        if (!receiptData.esMensualidad) {
            doc.text(`Tiempo de Estadía: ${receiptData.tiempoEstadia}`, 20, y);
            y += 7;
            doc.text(`Costo Original: $${formatNumber(receiptData.costoOriginal)} COP`, 20, y);
            y += 7;
            doc.text(`Descuento Aplicado: $${formatNumber(receiptData.descuento)} COP`, 20, y);
            y += 10;
        } else {
            doc.text(`Tipo de Servicio: Mensualidad`, 20, y);
            y += 7;
            doc.text(`Valor Mensualidad: $${formatNumber(receiptData.costoOriginal)} COP`, 20, y);
            y += 7;
            doc.text(`Próximo Día de Pago: ${new Date(receiptData.proximoPago).toLocaleDateString('es-CO')}`, 20, y);
            y += 10;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text(`TOTAL A PAGAR: $${formatNumber(receiptData.costoFinal)} COP`, 20, y);
        y += 20;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('¡Gracias por su visita!', 105, y, null, null, 'center');
        y += 5;
        doc.text('Medellín, Antioquia, Colombia', 105, y, null, null, 'center');

        doc.save(`Recibo_Parqueadero_${receiptData.plate}.pdf`);
        showNotification('Recibo PDF generado con éxito.', 'success');
    });

    updateActiveVehiclesList();
});
