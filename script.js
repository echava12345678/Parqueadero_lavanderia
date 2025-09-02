import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
const { jsPDF } = window.jspdf;

// Configuración de Firebase - REEMPLAZA CON TU PROPIA CONFIGURACIÓN SI ES NECESARIO
const firebaseConfig = {
    apiKey: "AIzaSyC81uKipArf__Mp9ernUh88E7kzjePdryA",
    authDomain: "parqueadero-fb51c.firebaseapp.com",
    projectId: "parqueadero-fb51c",
    storageBucket: "parqueadero-fb51c.firebasestorage.app",
    messagingSenderId: "76380635067",
    appId: "1:76380635067:web:657d27d21af6d5ac764e9e",
    measurementId: "G-RFPH0N835J"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.db = db;

// Pega tu código Base64 del logo aquí.
const logoBase64 = "data:image/png;base64,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";

document.addEventListener('DOMContentLoaded', async () => {
    // Definición de la función de utilidad al inicio del script
    const formatNumber = (num) => new Intl.NumberFormat('es-CO').format(num);
    const parseNumber = (str) => parseInt(str.replace(/\./g, '')) || 0;

    // Constantes de lavandería
    const LAVANDERIA_PRECIO_KG_9 = 30000;
    const PROMOCION_LAVADOS_GRATIS = 5;

    // Definición de elementos del DOM del parqueadero
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
    const plateEntryInput = document.getElementById('plate-entry');
    const plateLabel = document.getElementById('plate-label');
    const otherPriceLabel = document.getElementById('other-price-label');
    const vehicleSearchInput = document.getElementById('vehicle-search-input');
    const laundrySearchInput = document.getElementById('laundry-search-input');

    // Definición de elementos del DOM de lavandería
    const laundryEntryForm = document.getElementById('laundry-entry-form');
    const laundryClientName = document.getElementById('laundry-client-name');
    const laundryLoads = document.getElementById('laundry-loads');
    const laundryList = document.getElementById('laundry-list');

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
        },
        'otros-noche': {
            'pequeño': { min: 10000, max: 15000, noche: 12000 },
            'mediano': { min: 15100, max: 20000, noche: 18000 },
            'grande': { min: 20100, max: 30000, noche: 25000 }
        }
    };

    // Usuarios del sistema
    const users = {
        'admin': 'admin123',
        'trabajador': 'trabajador123'
    };
    
    // Declaración de la variable para vehículos activos
    let activeVehicles = [];
    let activeLaundryOrders = [];
    let deliveredLaundryOrders = []; // Nuevo array para los pedidos entregados

    const showNotification = (message, type = 'info') => {
        notificationArea.textContent = message;
        notificationArea.className = `message ${type}-message`;
        notificationArea.style.display = 'block';
        notificationArea.classList.add('fade-in');
        setTimeout(() => {
            notificationArea.style.display = 'none';
        }, 5000);
    };

    const showAnimation = (iconClass, type, text) => {
        const animationDiv = document.createElement('div');
        animationDiv.className = `animation-container ${type}-animation`;
        animationDiv.innerHTML = `<i class="${iconClass} pulse-animation"></i><br><p>${text}</p>`;
        mainApp.appendChild(animationDiv);
        setTimeout(() => {
            animationDiv.remove();
        }, 3000);
    };

    const updateActiveVehiclesList = (filterType = 'all', searchTerm = '') => {
        activeVehiclesList.innerHTML = '';
        const filteredVehicles = activeVehicles.filter(v => {
            const matchesFilter = (filterType === 'all') || 
                                (filterType === 'mensualidad' && v.type.includes('mensualidad')) ||
                                (filterType === 'otros-noche' && v.type.includes('otros-noche')) ||
                                (v.type === filterType);
            const matchesSearch = v.plate.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesFilter && matchesSearch;
        });

        if (filteredVehicles.length === 0) {
            activeVehiclesList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay vehículos activos de este tipo.</li>';
        } else {
            filteredVehicles.forEach(v => {
                const li = document.createElement('li');
                let extraInfo = '';
                let displayPlate = v.plate;
                if (v.type.includes('mensualidad')) {
                    const entryDate = new Date(v.entryTime);
                    const nextPaymentDate = new Date(entryDate);
                    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
                    extraInfo = `<br>Próximo pago: <strong>${nextPaymentDate.toLocaleDateString('es-CO')}</strong>`;
                }
                if (v.type.includes('otros')) {
                    displayPlate = v.description;
                }
                li.innerHTML = `<span>Placa/Descripción: <strong>${displayPlate}</strong></span> <span>Tipo: ${v.type}</span> <span>Entrada: ${new Date(v.entryTime).toLocaleString()}${extraInfo}</span>`;
                activeVehiclesList.appendChild(li);
            });
        }
    };

    const updateActiveLaundryList = (searchTerm = '') => {
        laundryList.innerHTML = '';
        const filteredOrders = activeLaundryOrders.filter(order => {
            const matchesSearch = order.clientName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        if (filteredOrders.length === 0) {
            laundryList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay pedidos de lavandería activos.</li>';
        } else {
            filteredOrders.forEach(order => {
                const li = document.createElement('li');
                const statusClass = `laundry-status-${order.status}`;
                const statusText = order.status === 'pending' ? 'Pendiente' : (order.status === 'ready' ? 'Lista' : 'Entregada');
                
                const promotionInfo = order.isFree ? `<span class="laundry-promotion-badge"><i class="fas fa-gift"></i> ¡Lavado Gratis!</span>` : '';
                
                let actionButtons = '';
                if (order.status === 'delivered') {
                    actionButtons = `<button class="download-invoice-button" data-id="${order.id}"><i class="fas fa-file-invoice"></i> Descargar Factura</button>`;
                } else {
                    actionButtons = `
                        <button class="status-button ready-button" data-id="${order.id}" ${order.status === 'ready' ? 'disabled' : ''}>
                            <i class="fas fa-check-circle"></i> Lista
                        </button>
                        <button class="status-button delivered-button" data-id="${order.id}" ${order.status !== 'ready' ? 'disabled' : ''}>
                            <i class="fas fa-handshake"></i> Entregada
                        </button>
                    `;
                }

                li.innerHTML = `
                    <span>Cliente: <strong>${order.clientName}</strong></span>
                    <span>Lavadoras: ${order.loads}</span>
                    <span>Entrada: ${new Date(order.entryTime).toLocaleString()}</span>
                    <span>Estado: <strong class="${statusClass}">${statusText}</strong> ${promotionInfo}</span>
                    <div class="laundry-actions">${actionButtons}</div>
                `;
                laundryList.appendChild(li);
            });

            // Agrega los event listeners a los nuevos botones
            document.querySelectorAll('.ready-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    await updateDoc(doc(db, "laundryOrders", id), { status: 'ready' });
                    showNotification('El pedido ha sido marcado como "Listo".', 'success');
                    showAnimation('fas fa-thumbs-up', 'ready', '¡Pedido Listo!');
                    loadData();
                });
            });

            document.querySelectorAll('.delivered-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const id = e.currentTarget.dataset.id;
                    const order = activeLaundryOrders.find(o => o.id === id);
                    if (order) {
                        const totalCost = order.isFree ? 0 : (order.loads * LAVANDERIA_PRECIO_KG_9);
                        const originalCost = order.loads * LAVANDERIA_PRECIO_KG_9;
                        const receiptData = {
                            clientName: order.clientName,
                            loads: order.loads,
                            entryTime: order.entryTime,
                            exitTime: new Date().toISOString(),
                            costoFinal: totalCost,
                            costoOriginal: originalCost,
                            isFree: order.isFree
                        };
                        
                        // Actualiza el estado a 'delivered' en lugar de eliminarlo
                        await updateDoc(doc(db, "laundryOrders", id), { status: 'delivered', ...receiptData });
                        showNotification('El pedido ha sido marcado como "Entregado" y el recibo está listo para descargar.', 'success');
                        showAnimation('fas fa-handshake', 'delivered', '¡Pedido Entregado!');
                        loadData();
                    }
                });
            });

            document.querySelectorAll('.download-invoice-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const id = e.currentTarget.dataset.id;
                    const order = activeLaundryOrders.find(o => o.id === id);
                    if (order) {
                        const receiptData = {
                            clientName: order.clientName,
                            loads: order.loads,
                            entryTime: order.entryTime,
                            exitTime: order.exitTime,
                            costoFinal: order.costoFinal,
                            costoOriginal: order.costoOriginal,
                            isFree: order.isFree
                        };
                        generateLaundryReceipt(receiptData);
                    }
                });
            });
        }
    };
    
    // Función para generar la factura en PDF
    const generateLaundryReceipt = (data) => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString('es-CO');
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        // Logo y título
        doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text("Factura de Lavandería", 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("Parqueadero y Lavandería El Reloj", 105, 28, null, null, 'center');
        doc.text(`Fecha de Emisión: ${currentDate}`, 105, 35, null, null, 'center');

        // Línea divisoria
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        // Información del cliente y pedido
        let y = 55;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('Detalles del Pedido', 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Cliente: ${data.clientName}`, 20, y);
        y += 7;
        doc.text(`Cantidad de lavadoras: ${data.loads}`, 20, y);
        y += 7;
        doc.text(`Fecha de Entrada: ${new Date(data.entryTime).toLocaleString('es-CO')}`, 20, y);
        y += 7;
        doc.text(`Fecha de Salida: ${new Date(data.exitTime).toLocaleString('es-CO')}`, 20, y);
        y += 10;

        // Detalles de costo y promoción
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 10;
        
        if (data.isFree) {
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(46, 204, 113); // Color verde
            doc.text('¡LAVADO GRATIS!', 105, y, null, null, 'center');
            y += 7;
            doc.text('Aplica promoción por cliente frecuente.', 105, y, null, null, 'center');
            y += 10;
        } else {
            doc.text(`Costo por lavadora: $${formatNumber(LAVANDERIA_PRECIO_KG_9)} COP`, 20, y);
            y += 10;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text(`TOTAL A PAGAR: $${formatNumber(data.costoFinal)} COP`, 20, y);
        y += 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');

        // Pie de página
        doc.line(20, y, 190, y);
        y += 10;
        doc.text("Gracias por preferir nuestros servicios.", 105, y, null, null, 'center');
        y += 5;
        doc.text("Parqueadero El Reloj - Medellín, Colombia", 105, y, null, null, 'center');

        // Guardar el documento
        doc.save(`Factura_Lavanderia_${data.clientName.replace(/ /g, '_')}.pdf`);
    };

    // Cargar tarifas y vehículos desde localStorage y Firestore
    const loadData = async () => {
        // Cargar datos de parqueadero
        const storedPrices = localStorage.getItem('parkingPrices');
        if (storedPrices) {
            prices = JSON.parse(storedPrices);
        }
        if (prices.carro) {
            document.getElementById('car-half-hour').value = prices.carro.mediaHora;
            document.getElementById('car-hour').value = prices.carro.hora;
            document.getElementById('car-12h').value = prices.carro.doceHoras;
            document.getElementById('car-month').value = prices.carro.mes;
        }
        if (prices.moto) {
            document.getElementById('bike-half-hour').value = prices.moto.mediaHora;
            document.getElementById('bike-hour').value = prices.moto.hora;
            document.getElementById('bike-12h').value = prices.moto.doceHoras;
            document.getElementById('bike-month').value = prices.moto.mes;
        }
        if (prices['otros-mensualidad']) {
            document.getElementById('other-small-min').value = prices['otros-mensualidad'].pequeño.min;
            document.getElementById('other-small-max').value = prices['otros-mensualidad'].pequeño.max;
            document.getElementById('other-small-default').value = prices['otros-mensualidad'].pequeño.mes;
            document.getElementById('other-medium-min').value = prices['otros-mensualidad'].mediano.min;
            document.getElementById('other-medium-max').value = prices['otros-mensualidad'].mediano.max;
            document.getElementById('other-medium-default').value = prices['otros-mensualidad'].mediano.mes;
            document.getElementById('other-large-min').value = prices['otros-mensualidad'].grande.min;
            document.getElementById('other-large-max').value = prices['otros-mensualidad'].grande.max;
            document.getElementById('other-large-default').value = prices['otros-mensualidad'].grande.mes;
        }
        if (prices['otros-noche']) {
            document.getElementById('other-night-small-min').value = prices['otros-noche'].pequeño.min;
            document.getElementById('other-night-small-max').value = prices['otros-noche'].pequeño.max;
            document.getElementById('other-night-small-default').value = prices['otros-noche'].pequeño.noche;
            document.getElementById('other-night-medium-min').value = prices['otros-noche'].mediano.min;
            document.getElementById('other-night-medium-max').value = prices['otros-noche'].mediano.max;
            document.getElementById('other-night-medium-default').value = prices['otros-noche'].mediano.noche;
            document.getElementById('other-night-large-min').value = prices['otros-noche'].grande.min;
            document.getElementById('other-night-large-max').value = prices['otros-noche'].grande.max;
            document.getElementById('other-night-large-default').value = prices['otros-noche'].grande.noche;
        }
        
        const vehiclesCol = collection(db, 'activeVehicles');
        const vehicleSnapshot = await getDocs(vehiclesCol);
        activeVehicles = vehicleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateActiveVehiclesList();

        // Cargar datos de lavandería
        const laundryCol = collection(db, 'laundryOrders');
        const laundrySnapshot = await getDocs(laundryCol);
        activeLaundryOrders = laundrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateActiveLaundryList();
    };

    // Filtros de vehículos activos
    document.querySelectorAll('.filter-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterType = button.dataset.filter;
            updateActiveVehiclesList(filterType, vehicleSearchInput.value);
        });
    });

    // Event listener para el buscador de vehículos
    vehicleSearchInput.addEventListener('input', (e) => {
        const currentFilter = document.querySelector('.filter-button.active').dataset.filter;
        updateActiveVehiclesList(currentFilter, e.target.value);
    });

    // Event listener para el buscador de lavandería
    laundrySearchInput.addEventListener('input', (e) => {
        updateActiveLaundryList(e.target.value);
    });

    // Manejo de pestañas principales
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
                vehicleSearchInput.value = '';
            }
            if (targetTabId === 'laundry-tab') {
                updateActiveLaundryList();
                document.querySelector('.laundry-button[data-laundry-tab="laundry-register-tab"]').click();
                laundrySearchInput.value = '';
            }
        });
    });

    // Manejo de pestañas de lavandería
    const laundryButtons = document.querySelectorAll('.laundry-button');
    const laundryContents = document.querySelectorAll('.laundry-content');

    laundryButtons.forEach(button => {
        button.addEventListener('click', () => {
            laundryButtons.forEach(btn => btn.classList.remove('active'));
            laundryContents.forEach(content => content.style.display = 'none');

            button.classList.add('active');
            const targetTabId = button.dataset.laundryTab;
            document.getElementById(targetTabId).style.display = 'block';
            document.getElementById(targetTabId).classList.add('fade-in');

            if (targetTabId === 'laundry-active-tab') {
                updateActiveLaundryList();
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
        prices.carro = {
            mediaHora: parseNumber(document.getElementById('car-half-hour').value),
            hora: parseNumber(document.getElementById('car-hour').value),
            doceHoras: parseNumber(document.getElementById('car-12h').value),
            mes: parseNumber(document.getElementById('car-month').value)
        };
        prices.moto = {
            mediaHora: parseNumber(document.getElementById('bike-half-hour').value),
            hora: parseNumber(document.getElementById('bike-hour').value),
            doceHoras: parseNumber(document.getElementById('bike-12h').value),
            mes: parseNumber(document.getElementById('bike-month').value)
        };
        prices['otros-mensualidad'] = {
            'pequeño': { min: parseNumber(document.getElementById('other-small-min').value), max: parseNumber(document.getElementById('other-small-max').value), mes: parseNumber(document.getElementById('other-small-default').value) },
            'mediano': { min: parseNumber(document.getElementById('other-medium-min').value), max: parseNumber(document.getElementById('other-medium-max').value), mes: parseNumber(document.getElementById('other-medium-default').value) },
            'grande': { min: parseNumber(document.getElementById('other-large-min').value), max: parseNumber(document.getElementById('other-large-max').value), mes: parseNumber(document.getElementById('other-large-default').value) }
        };
        prices['otros-noche'] = {
            'pequeño': { min: parseNumber(document.getElementById('other-night-small-min').value), max: parseNumber(document.getElementById('other-night-small-max').value), noche: parseNumber(document.getElementById('other-night-small-default').value) },
            'mediano': { min: parseNumber(document.getElementById('other-night-medium-min').value), max: parseNumber(document.getElementById('other-night-medium-max').value), noche: parseNumber(document.getElementById('other-night-medium-default').value) },
            'grande': { min: parseNumber(document.getElementById('other-night-large-min').value), max: parseNumber(document.getElementById('other-night-large-max').value), noche: parseNumber(document.getElementById('other-night-large-default').value) }
        };

        localStorage.setItem('parkingPrices', JSON.stringify(prices));
        showNotification('Tarifas actualizadas correctamente.', 'success');
        loadData();
    });

    // Mostrar/ocultar campos de otros vehículos y cambiar placeholder
    vehicleTypeEntry.addEventListener('change', () => {
        const selectedType = vehicleTypeEntry.value;
        if (selectedType === 'otros-mensualidad' || selectedType === 'otros-noche') {
            othersTypeContainer.style.display = 'flex';
            plateLabel.textContent = "Descripción:";
            plateEntryInput.placeholder = "Ej: Puesto de comida, Carro de helados";
            if (selectedType === 'otros-mensualidad') {
                otherPriceLabel.textContent = "Precio (Mensualidad):";
                othersMonthlyPrice.placeholder = "Precio acordado";
            } else {
                otherPriceLabel.textContent = "Precio (Por Noche):";
                othersMonthlyPrice.placeholder = "Precio acordado";
            }
        } else {
            othersTypeContainer.style.display = 'none';
            plateLabel.textContent = "Placa:";
            plateEntryInput.placeholder = "Ej: ABC-123";
        }
    });

    // Registrar entrada de vehículo
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-entry').value.trim().toUpperCase();
        const type = document.getElementById('type-entry').value;
        let description = '';
        if (['otros-mensualidad', 'otros-noche'].includes(type)) {
            description = plate;
        }
        const q = query(collection(db, 'activeVehicles'), where("plate", "==", plate));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty && !['otros-mensualidad', 'otros-noche'].includes(type)) {
            showNotification(`¡La placa ${plate} ya se encuentra registrada!`, 'error');
            return;
        }
        let otherVehicleSize = null;
        let otherPrice = null;
        if (type === 'otros-mensualidad' || type === 'otros-noche') {
            otherVehicleSize = othersVehicleSize.value;
            const priceValue = othersMonthlyPrice.value;
            if (!priceValue) {
                showNotification("Por favor, ingrese un precio para el vehículo.", 'error');
                return;
            }
            otherPrice = parseNumber(priceValue);
            const sizePrices = prices[type][otherVehicleSize];
            if (otherPrice < sizePrices.min || otherPrice > sizePrices.max) {
                showNotification(`El precio debe estar entre $${formatNumber(sizePrices.min)} y $${formatNumber(sizePrices.max)} COP.`, 'error');
                return;
            }
        }
        const newVehicle = { plate, description, type, entryTime: new Date().toISOString(), price: otherPrice, size: otherVehicleSize };
        try {
            const docRef = await addDoc(collection(db, 'activeVehicles'), newVehicle);
            showNotification(`Entrada de ${type} con placa ${plate} registrada.`, 'success');
            entryForm.reset();
            othersTypeContainer.style.display = 'none';
            await loadData();
        } catch (e) {
            console.error("Error al añadir documento: ", e);
            showNotification("Error al registrar el vehículo. Por favor, intente de nuevo.", 'error');
        }
    });

    // Controlar visibilidad de la sección de cliente especial
    let currentCalculatedCost = 0;
    document.getElementById('plate-exit').addEventListener('input', () => {
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate);
        if (vehicle && !['mensualidad', 'moto-mensualidad', 'otros-mensualidad', 'otros-noche'].includes(vehicle.type)) {
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
        if (!vehicle || ['mensualidad', 'moto-mensualidad', 'otros-mensualidad', 'otros-noche'].includes(vehicle.type)) {
            exitCostDisplay.innerHTML = '';
            specialClientSection.style.display = 'none';
            return;
        }
        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const durationInMinutes = (exitTime - entryTime) / (1000 * 60);

        let cost = 0;
        const pricesByVehicle = prices[vehicle.type];
        if (durationInMinutes <= 30) {
            cost = pricesByVehicle.mediaHora;
        } else if (durationInMinutes <= 720) { // 12 horas
            const hours = Math.ceil(durationInMinutes / 60);
            if (hours > 1 && hours < 12) {
                cost = (hours - 1) * pricesByVehicle.hora + pricesByVehicle.hora;
            } else {
                cost = pricesByVehicle.hora;
            }
        } else {
            const days = Math.floor(durationInMinutes / (60 * 24));
            const remainingMinutes = durationInMinutes % (60 * 24);
            const remainingHours = Math.ceil(remainingMinutes / 60);
            cost = days * pricesByVehicle.doceHoras + (remainingHours > 0 ? pricesByVehicle.doceHoras : 0);
        }
        
        let adjustment = 0;
        if (specialClientCheckbox.checked) {
            const adjustmentValue = parseNumber(specialClientAdjustment.value);
            if (!isNaN(adjustmentValue)) {
                adjustment = adjustmentValue;
            }
        }
        
        currentCalculatedCost = Math.max(0, cost - adjustment);
        
        exitCostDisplay.innerHTML = `<p><strong>Costo Estimado:</strong> $${formatNumber(currentCalculatedCost)} COP</p>`;
        exitCostDisplay.className = 'result-box';
        exitCostDisplay.style.display = 'block';
    };

    specialClientCheckbox.addEventListener('change', updateCalculatedCost);
    specialClientAdjustment.addEventListener('input', updateCalculatedCost);
    document.getElementById('plate-exit').addEventListener('input', updateCalculatedCost);

    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate);

        if (!vehicle) {
            showNotification('No se encontró un vehículo con esa placa/descripción.', 'error');
            return;
        }
        
        try {
            // Elimina el documento de la base de datos
            await deleteDoc(doc(db, "activeVehicles", vehicle.id));

            // Prepara los datos del recibo
            const exitTime = new Date();
            const entryTime = new Date(vehicle.entryTime);
            const durationInMinutes = (exitTime - entryTime) / (1000 * 60);
            
            const cost = ['mensualidad', 'moto-mensualidad', 'otros-mensualidad', 'otros-noche'].includes(vehicle.type) ? (vehicle.price || prices[vehicle.type][vehicle.size].mes || prices[vehicle.type][vehicle.size].noche) : currentCalculatedCost;

            const receiptData = {
                plate: vehicle.plate,
                type: vehicle.type,
                entryTime: vehicle.entryTime,
                exitTime: exitTime.toISOString(),
                duration: `${Math.floor(durationInMinutes / 60)}h ${Math.round(durationInMinutes % 60)}min`,
                cost: cost,
                description: vehicle.description || vehicle.plate
            };

            // Guarda la información del recibo en localStorage para usarla en el botón de impresión
            localStorage.setItem('lastReceipt', JSON.stringify(receiptData));

            // Muestra el resultado
            let resultHtml = `<h3>Recibo</h3>`;
            if (vehicle.type.includes('otros')) {
                resultHtml += `<p><strong>Descripción:</strong> ${receiptData.description}</p>`;
            } else {
                resultHtml += `<p><strong>Placa:</strong> ${receiptData.plate}</p>`;
            }
            
            if (['mensualidad', 'moto-mensualidad', 'otros-mensualidad', 'otros-noche'].includes(vehicle.type)) {
                resultHtml += `<p><strong>Tipo:</strong> ${vehicle.type}</p>`;
                resultHtml += `<p><strong>Costo Mensual:</strong> $${formatNumber(cost)} COP</p>`;
            } else {
                resultHtml += `<p><strong>Tipo:</strong> ${vehicle.type}</p>`;
                resultHtml += `<p><strong>Duración:</strong> ${receiptData.duration}</p>`;
                resultHtml += `<p><strong>Costo Final:</strong> $${formatNumber(cost)} COP</p>`;
            }
            resultContent.innerHTML = resultHtml;
            resultDiv.style.display = 'block';

            showNotification('Salida de vehículo registrada exitosamente.', 'success');
            exitForm.reset();
            specialClientSection.style.display = 'none';
            exitCostDisplay.innerHTML = '';
            await loadData();
        } catch (e) {
            console.error("Error al eliminar documento: ", e);
            showNotification("Error al registrar la salida. Por favor, intente de nuevo.", 'error');
        }
    });

    // Registrar pedido de lavandería
    laundryEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientName = laundryClientName.value.trim();
        const loads = parseInt(laundryLoads.value);

        // Contar el número de lavados pagados del cliente
        const laundryHistoryCol = collection(db, 'laundryHistory');
        const q = query(laundryHistoryCol, where("clientName", "==", clientName));
        const historySnapshot = await getDocs(q);
        const paidWashesCount = historySnapshot.docs.filter(doc => !doc.data().isFree).length;
        
        const isFreeWash = (paidWashesCount >= PROMOCION_LAVADOS_GRATIS);
        
        let newOrder = {
            clientName,
            loads,
            entryTime: new Date().toISOString(),
            status: 'pending',
            isFree: isFreeWash
        };

        if (isFreeWash) {
            // Registrar el lavado gratis en el historial y el pedido activo
            try {
                // Registro del lavado gratis
                await addDoc(collection(db, 'laundryHistory'), { ...newOrder, exitTime: new Date().toISOString(), costoFinal: 0, costoOriginal: loads * LAVANDERIA_PRECIO_KG_9 });
                
                // Elimina el pedido de la lista de activos
                newOrder.status = 'delivered';
                newOrder.costoFinal = 0;
                newOrder.costoOriginal = loads * LAVANDERIA_PRECIO_KG_9;
                
                // Simula la descarga del recibo
                generateLaundryReceipt(newOrder);

                showNotification(`¡${clientName} recibe un lavado gratis! Pedido registrado y facturado.`, 'success');
            } catch (e) {
                console.error("Error al registrar el lavado gratis: ", e);
                showNotification("Error al registrar el pedido. Por favor, intente de nuevo.", 'error');
            }
        } else {
            // Si no es gratis, se registra como pedido activo y pendiente
            try {
                await addDoc(collection(db, 'laundryOrders'), newOrder);
                showNotification('Pedido de lavandería registrado.', 'success');
            } catch (e) {
                console.error("Error al añadir documento: ", e);
                showNotification("Error al registrar el pedido. Por favor, intente de nuevo.", 'error');
            }
        }
        
        laundryEntryForm.reset();
        await loadData();
    });

    // Cargar los datos iniciales al cargar la página
    loadData();

    // Función para generar recibo de parqueadero
    const generateParkingReceipt = (data) => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString('es-CO');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        doc.addImage(logoBase64, 'PNG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text("Recibo de Parqueadero", 105, 20, null, null, 'center');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text("Parqueadero El Reloj", 105, 28, null, null, 'center');
        doc.text(`Fecha de Emisión: ${currentDate}`, 105, 35, null, null, 'center');
        doc.setLineWidth(0.5);
        doc.line(20, 45, 190, 45);

        let y = 55;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text('Detalles del Vehículo', 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(`Placa/Descripción: ${data.description}`, 20, y);
        y += 7;
        doc.text(`Tipo: ${data.type}`, 20, y);
        y += 7;
        doc.text(`Hora de Entrada: ${new Date(data.entryTime).toLocaleString('es-CO')}`, 20, y);
        y += 7;
        doc.text(`Hora de Salida: ${new Date(data.exitTime).toLocaleString('es-CO')}`, 20, y);
        y += 10;
        
        doc.setLineWidth(0.3);
        doc.line(20, y, 190, y);
        y += 10;
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(44, 62, 80);
        doc.text(`Total a Pagar: $${formatNumber(data.cost)} COP`, 20, y);
        y += 20;

        doc.line(20, y, 190, y);
        y += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("Gracias por preferir nuestros servicios.", 105, y, null, null, 'center');
        y += 5;
        doc.text("Parqueadero El Reloj - Medellín, Colombia", 105, y, null, null, 'center');

        doc.save(`Recibo_Parqueadero_${data.plate || data.description}.pdf`);
    };

    printReceiptBtn.addEventListener('click', () => {
        const receiptData = JSON.parse(localStorage.getItem('lastReceipt'));
        if (receiptData) {
            generateParkingReceipt(receiptData);
        } else {
            showNotification('No hay un recibo reciente para descargar.', 'error');
        }
    });

});
