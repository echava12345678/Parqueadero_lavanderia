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
    const othersTypeContainer = document.getElementById('others-type-container');
    const vehicleTypeEntry = document.getElementById('type-entry');
    const othersVehicleSize = document.getElementById('others-vehicle-size');
    const othersMonthlyPrice = document.getElementById('others-monthly-price');
    const specialClientSection = document.getElementById('special-client-section');
    const specialClientAdjustment = document.getElementById('special-client-adjustment');
    const exitCostDisplay = document.getElementById('exit-cost-display');

    // Tarifas iniciales con estructura completa
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
            'pequeño': { min: 100000, max: 150000, mes: 120000 },
            'mediano': { min: 151000, max: 200000, mes: 180000 },
            'grande': { min: 201000, max: 300000, mes: 250000 }
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
    
            // *** CORRECCIÓN CLAVE AQUÍ ***
            // Se añaden verificaciones para la estructura anidada de 'otros-mensualidad'
            if (prices['otros-mensualidad'] && prices['otros-mensualidad'].pequeño) {
                document.getElementById('other-small-min').value = formatNumber(prices['otros-mensualidad'].pequeño.min);
                document.getElementById('other-small-max').value = formatNumber(prices['otros-mensualidad'].pequeño.max);
                document.getElementById('other-small-default').value = formatNumber(prices['otros-mensualidad'].pequeño.mes);
                document.getElementById('other-medium-min').value = formatNumber(prices['otros-mensualidad'].mediano.min);
                document.getElementById('other-medium-max').value = formatNumber(prices['otros-mensualidad'].mediano.max);
                document.getElementById('other-medium-default').value = formatNumber(prices['otros-mensualidad'].mediano.mes);
                document.getElementById('other-large-min').value = formatNumber(prices['otros-mensualidad'].grande.min);
                document.getElementById('other-large-max').value = formatNumber(prices['otros-mensualidad'].grande.max);
                document.getElementById('other-large-default').value = formatNumber(prices['otros-mensualidad'].grande.mes);
            }
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

    const updateActiveVehiclesList = (filterType = 'all') => {
        activeVehiclesList.innerHTML = '';
        const filteredVehicles = activeVehicles.filter(v => {
            if (filterType === 'all') return true;
            if (filterType === 'mensualidad') {
                return v.type.includes('mensualidad');
            }
            return v.type === filterType;
        });

        if (filteredVehicles.length === 0) {
            activeVehiclesList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay vehículos activos de este tipo.</li>';
        } else {
            filteredVehicles.forEach(v => {
                const li = document.createElement('li');
                let extraInfo = '';
                if (v.type.includes('mensualidad')) {
                    const entryDate = new Date(v.entryTime);
                    const nextPaymentDate = new Date(entryDate);
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    extraInfo = `<br>Próximo pago: <strong>${nextPaymentDate.toLocaleDateString('es-CO')}</strong>`;
                }
                li.innerHTML = `<span>Placa: <strong>${v.plate.toUpperCase()}</strong></span> <span>Tipo: ${v.type}</span> <span>Entrada: ${new Date(v.entryTime).toLocaleString()}${extraInfo}</span>`;
                activeVehiclesList.appendChild(li);
            });
        }
    };
    
    // Filtros de vehículos activos
    document.querySelectorAll('.filter-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterType = button.dataset.filter;
            updateActiveVehiclesList(filterType);
        });
    });

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
                updateActiveVehiclesList('all');
                document.querySelector('.filter-button[data-filter="all"]').classList.add('active');
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
        updateActiveVehiclesList('all');
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

        // *** CORRECCIÓN CLAVE AQUÍ ***
        // Se asegura que la estructura anidada exista antes de guardar
        if (!prices['otros-mensualidad']) prices['otros-mensualidad'] = {};
        if (!prices['otros-mensualidad'].pequeño) prices['otros-mensualidad'].pequeño = {};
        if (!prices['otros-mensualidad'].mediano) prices['otros-mensualidad'].mediano = {};
        if (!prices['otros-mensualidad'].grande) prices['otros-mensualidad'].grande = {};

        prices['otros-mensualidad'].pequeño.min = parseValue('other-small-min');
        prices['otros-mensualidad'].pequeño.max = parseValue('other-small-max');
        prices['otros-mensualidad'].pequeño.mes = parseValue('other-small-default');
        prices['otros-mensualidad'].mediano.min = parseValue('other-medium-min');
        prices['otros-mensualidad'].mediano.max = parseValue('other-medium-max');
        prices['otros-mensualidad'].mediano.mes = parseValue('other-medium-default');
        prices['otros-mensualidad'].grande.min = parseValue('other-large-min');
        prices['otros-mensualidad'].grande.max = parseValue('other-large-max');
        prices['otros-mensualidad'].grande.mes = parseValue('other-large-default');
        
        localStorage.setItem('parkingPrices', JSON.stringify(prices));
        showNotification('Tarifas actualizadas correctamente.', 'success');
        
        loadData();
    });

    // Mostrar/ocultar campos de otros vehículos
    vehicleTypeEntry.addEventListener('change', () => {
        if (vehicleTypeEntry.value === 'otros-mensualidad') {
            othersTypeContainer.style.display = 'flex';
        } else {
            othersTypeContainer.style.display = 'none';
        }
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

        let otherVehicleSize = null;
        let otherMonthlyPrice = null;
        if (type === 'otros-mensualidad') {
            otherVehicleSize = othersVehicleSize.value;
            otherMonthlyPrice = parseInt(othersMonthlyPrice.value.replace(/\./g, '')) || 0;
            const sizePrices = prices['otros-mensualidad'][otherVehicleSize];
            if (otherMonthlyPrice < sizePrices.min || otherMonthlyPrice > sizePrices.max) {
                 showNotification(`El precio debe estar entre $${formatNumber(sizePrices.min)} y $${formatNumber(sizePrices.max)} COP.`, 'error');
                return;
            }
        }

        const newVehicle = {
            plate,
            type,
            entryTime: new Date().toISOString(),
            monthlyPrice: otherMonthlyPrice,
            size: otherVehicleSize
        };
        activeVehicles.push(newVehicle);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        showNotification(`Entrada de ${type} con placa ${plate} registrada.`, 'success');
        entryForm.reset();
        othersTypeContainer.style.display = 'none';
        updateActiveVehiclesList();
    });

    // Controlar visibilidad de la sección de cliente especial
    let currentCalculatedCost = 0;
    document.getElementById('plate-exit').addEventListener('input', () => {
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate);
        if (vehicle && !['mensualidad', 'moto-mensualidad', 'otros-mensualidad'].includes(vehicle.type)) {
            specialClientSection.style.display = 'flex';
        } else {
            specialClientSection.style.display = 'none';
            specialClientCheckbox.checked = false;
        }
    });

    // Calcular costo en tiempo real con ajustes de cliente especial
    const updateCalculatedCost = () => {
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate);
        if (!vehicle) {
            exitCostDisplay.innerHTML = '';
            return;
        }

        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const diffInMs = exitTime - entryTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));

        let totalCost = 0;
        let originalCost = 0;

        if (diffInMinutes <= 30) {
            totalCost = 0;
        } else {
            const vehicleType = vehicle.type;
            const pricePerHour = prices[vehicleType].hora;
            const priceFor12Hours = prices[vehicleType].doceHoras;
            
            const totalHours = Math.ceil(diffInMinutes / 60);
            totalCost = totalHours * pricePerHour;
            
            if (diffInMinutes >= 720) {
                totalCost = priceFor12Hours;
            }
        }
        originalCost = totalCost;

        if (specialClientCheckbox.checked) {
            const adjustmentValue = parseFloat(specialClientAdjustment.value) || 0;
            totalCost = originalCost + adjustmentValue;
            if (adjustmentValue < 0) {
                showNotification(`Descuento de $${formatNumber(Math.abs(adjustmentValue))} COP aplicado.`, 'info');
            } else if (adjustmentValue > 0) {
                showNotification(`Aumento de $${formatNumber(adjustmentValue)} COP aplicado.`, 'info');
            }
        } else {
            notificationArea.style.display = 'none';
        }

        currentCalculatedCost = totalCost;
        exitCostDisplay.innerHTML = `Total a Pagar: <strong>$${formatNumber(totalCost)} COP</strong>`;
    };

    specialClientCheckbox.addEventListener('change', updateCalculatedCost);
    specialClientAdjustment.addEventListener('input', updateCalculatedCost);

    document.getElementById('plate-exit').addEventListener('input', updateCalculatedCost);

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
        let originalCost = 0;
        const isSpecialClient = specialClientCheckbox.checked;
        const adjustmentValue = parseFloat(specialClientAdjustment.value) || 0;

        let resultHTML = '';
        let receiptData = {};

        if (['mensualidad', 'moto-mensualidad', 'otros-mensualidad'].includes(vehicle.type)) {
            let monthlyPrice = 0;
            if (vehicle.type === 'mensualidad') {
                monthlyPrice = prices.carro.mes;
            } else if (vehicle.type === 'moto-mensualidad') {
                monthlyPrice = prices.moto.mes;
            } else {
                monthlyPrice = vehicle.monthlyPrice;
            }

            const nextPaymentDate = new Date(vehicle.entryTime);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);

            resultHTML = `
                <p>Placa: <strong>${vehicle.plate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Valor mensualidad: <strong>$${formatNumber(monthlyPrice)} COP</strong></p>
                <p>Día de pago próximo: <strong>${nextPaymentDate.toLocaleDateString('es-CO')}</strong></p>
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
                proximoPago: nextPaymentDate
            };

        } else { // Carros y Motos por hora
            const vehicleType = vehicle.type;
            const pricePerHour = prices[vehicleType].hora;
            const priceFor12Hours = prices[vehicleType].doceHoras;

            if (diffInMinutes <= 30) {
                totalCost = 0;
                resultHTML = `
                    <p>Placa: <strong>${vehicle.plate}</strong></p>
                    <p>Tipo: <strong>${vehicle.type}</strong></p>
                    <p>Tiempo de estadía: <strong>${diffInMinutes} minutos</strong></p>
                    <p class="info-message">El vehículo no ha superado la media hora de estadía.</p>
                    <p>Total a pagar: <strong>$0 COP</strong></p>
                `;
                
                receiptData = {
                    plate: vehicle.plate,
                    type: vehicle.type,
                    entryTime,
                    exitTime,
                    costoFinal: 0,
                    descuento: 0,
                    esGratis: true,
                    tiempoEstadia: `${diffInMinutes} minutos`
                };

            } else {
                const totalHours = Math.ceil(diffInMinutes / 60);
                totalCost = totalHours * pricePerHour;
                
                if (diffInMinutes >= 720) {
                    totalCost = priceFor12Hours;
                }
                originalCost = totalCost;
                
                if (isSpecialClient) {
                    totalCost = originalCost + adjustmentValue;
                }

                const totalHoursDisplay = Math.floor(diffInMinutes / 60);
                const totalMinutesDisplay = diffInMinutes % 60;

                resultHTML = `
                    <p>Placa: <strong>${vehicle.plate}</strong></p>
                    <p>Tipo: <strong>${vehicle.type}</strong></p>
                    <p>Tiempo de estadía: <strong>${totalHoursDisplay} horas y ${totalMinutesDisplay} minutos</strong></p>
                    <p>Costo calculado (sin ajuste): <strong>$${formatNumber(originalCost)} COP</strong></p>
                `;
                
                if (isSpecialClient) {
                    resultHTML += `<p>Ajuste por cliente especial: <strong>${adjustmentValue >= 0 ? '+' : ''}$${formatNumber(adjustmentValue)} COP</strong></p>`;
                }
                
                resultHTML += `<p>Total a pagar: <strong>$${formatNumber(totalCost)} COP</strong></p>`;

                receiptData = {
                    plate: vehicle.plate,
                    type: vehicle.type,
                    entryTime,
                    exitTime,
                    costoFinal: totalCost,
                    descuento: adjustmentValue < 0 ? Math.abs(adjustmentValue) : 0,
                    esGratis: false,
                    esMensualidad: false,
                    costoOriginal: originalCost,
                    ajusteEspecial: adjustmentValue,
                    tiempoEstadia: `${totalHoursDisplay} horas y ${totalMinutesDisplay} minutos`
                };
            }
        }

        resultContent.innerHTML = resultHTML;
        resultDiv.style.display = 'block';
        resultDiv.classList.add('fade-in');

        activeVehicles.splice(vehicleIndex, 1);
        localStorage.setItem('activeVehicles', JSON.stringify(activeVehicles));
        updateActiveVehiclesList();
        exitForm.reset();
        specialClientCheckbox.checked = false;
        specialClientSection.style.display = 'none';
        specialClientAdjustment.value = '';
        exitCostDisplay.innerHTML = '';

        localStorage.setItem('lastReceipt', JSON.stringify(receiptData));
    });

    // Descargar recibo de pago en PDF
    printReceiptBtn.addEventListener('click', () => {
        const receiptData = JSON.parse(localStorage.getItem('lastReceipt'));
        if (!receiptData) {
            showNotification('No hay un recibo para descargar. Finalice una salida primero.', 'info');
            return;
        }

        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setTextColor(44, 62, 80);

        doc.setFontSize(22);
        doc.text('Parqueadero El Reloj', 105, 20, null, null, 'center');
        doc.setFontSize(16);

        if (receiptData.esGratis) {
            doc.text('Salida Gratis', 105, 30, null, null, 'center');
        } else {
            doc.text('Recibo de Pago', 105, 30, null, null, 'center');
        }
        
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
        
        if (receiptData.esGratis) {
            doc.text(`Tiempo de Estadía: ${receiptData.tiempoEstadia}`, 20, y);
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(231, 76, 60); 
            doc.text('NO COMPLETÓ LA MEDIA HORA', 105, y, null, null, 'center');
            y += 7;
            doc.text('SU SALIDA ES GRATIS', 105, y, null, null, 'center');
            y += 10;
            doc.setFontSize(16);
            doc.text('TOTAL A PAGAR: $0 COP', 105, y, null, null, 'center');
            y += 20;
        } else if (!receiptData.esMensualidad) {
            doc.text(`Tiempo de Estadía: ${receiptData.tiempoEstadia}`, 20, y);
            y += 7;
            doc.text(`Costo Original: $${formatNumber(receiptData.costoOriginal)} COP`, 20, y);
            y += 7;
            doc.text(`Ajuste Especial: ${receiptData.ajusteEspecial >= 0 ? '+' : ''}$${formatNumber(receiptData.ajusteEspecial)} COP`, 20, y);
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 152, 219);
            doc.text(`TOTAL A PAGAR: $${formatNumber(receiptData.costoFinal)} COP`, 20, y);
            y += 20;
        } else {
            doc.text(`Tipo de Servicio: Mensualidad`, 20, y);
            y += 7;
            doc.text(`Valor Mensualidad: $${formatNumber(receiptData.costoOriginal)} COP`, 20, y);
            y += 7;
            doc.text(`Próximo Día de Pago: ${new Date(receiptData.proximoPago).toLocaleDateString('es-CO')}`, 20, y);
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 152, 219);
            doc.text(`TOTAL A PAGAR: $${formatNumber(receiptData.costoFinal)} COP`, 20, y);
            y += 20;
        }

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
