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
    const exportDataBtn = document.getElementById('export-data-btn');
    const carLessThan30Min = document.getElementById('car-less-than-30min');
    const bikeLessThan30Min = document.getElementById('bike-less-than-30min');
     const transactionTableBody = document.getElementById('transaction-table-body');
    
    const recordsList = document.getElementById('records-list');
const recordsSearchInput = document.getElementById('records-search');
    const recordsFilterButtons = document.querySelectorAll('.records-filter-button');
     recordsFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            recordsFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filterType = button.dataset.type;
            const searchTerm = recordsSearchInput.value.trim();
            displayRecords(filterType, searchTerm);
        });
    });

      if (recordsSearchInput) {
        recordsSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            const activeFilterButton = document.querySelector('.records-filter-button.active');
            const filterType = activeFilterButton ? activeFilterButton.dataset.type : 'all';
            displayRecords(filterType, searchTerm);
        });
    }

    if(vehicleSearchInput) {
        vehicleSearchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim().toUpperCase();
            if (searchTerm === '') {
                updateActiveVehiclesList('all');
            } else {
                const filteredVehicles = activeVehicles.filter(vehicle => 
                    (vehicle.plate && vehicle.plate.toUpperCase().includes(searchTerm)) ||
                    (vehicle.description && vehicle.description.toUpperCase().includes(searchTerm))
                );
                updateActiveVehiclesList('all', filteredVehicles);
            }
        });
    }

    // Definición de elementos del DOM de lavandería
    const laundryEntryForm = document.getElementById('laundry-entry-form');
    const laundryClientName = document.getElementById('laundry-client-name');
    const laundryLoads = document.getElementById('laundry-loads');
    const laundryList = document.getElementById('laundry-list');

    // Tarifas iniciales con estructura completa
    let prices = {
        carro: {
              menos30Min: 0,
            mediaHora: 3000,
            hora: 6000,
            doceHoras: 30000,
            mes: 250000
        },
        moto: {
           menos30Min: 0,
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
        },
        'carro-12h': {
            doceHoras: 30000,
            mediaHora: 3000 // Mantener para el cálculo intermedio si es necesario
        },
        'moto-12h': {
            doceHoras: 15000,
            mediaHora: 2000 // Mantener para el cálculo intermedio si es necesario
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
let allRecords = []; // Variable para guardar todas las transacciones

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

    const updateActiveVehiclesList = (filterType = 'all', vehicleList = null) => {
        activeVehiclesList.innerHTML = '';
        const vehiclesToDisplay = vehicleList || activeVehicles.filter(v => {
            if (filterType === 'all') return true;
            if (filterType === 'mensualidad') {
                return v.type.includes('mensualidad');
            }
            if (filterType === 'otros-noche') {
                return v.type.includes('otros-noche');
            }
            if (filterType === '12h') {
                return v.type.includes('12h');
            }
            return v.type === filterType;
        });

        if (vehiclesToDisplay.length === 0) {
            activeVehiclesList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay vehículos activos de este tipo.</li>';
        } else {
            vehiclesToDisplay.forEach(v => {
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
    

    const updateActiveLaundryList = () => {
        laundryList.innerHTML = '';
        if (activeLaundryOrders.length === 0) {
            laundryList.innerHTML = '<li><i class="fas fa-info-circle"></i> No hay pedidos de lavandería activos.</li>';
        } else {
            activeLaundryOrders.forEach(order => {
                const li = document.createElement('li');
                const statusClass = `laundry-status-${order.status}`;
                const statusText = order.status === 'pending' ? 'Pendiente' : (order.status === 'ready' ? 'Lista' : 'Entregada');
                const actionButtons = `
                    <button class="status-button ready-button" data-id="${order.id}" ${order.status === 'ready' ? 'disabled' : ''}>
                        <i class="fas fa-check-circle"></i> Lista
                    </button>
                    <button class="status-button delivered-button" data-id="${order.id}" ${order.status !== 'ready' ? 'disabled' : ''}>
                        <i class="fas fa-handshake"></i> Entregada
                    </button>
                `;

                li.innerHTML = `
                    <span>Cliente: <strong>${order.clientName}</strong></span>
                    <span>Lavadoras: ${order.loads}</span>
                    <span>Entrada: ${new Date(order.entryTime).toLocaleString()}</span>
                    <span>Estado: <strong class="${statusClass}">${statusText}</strong></span>
                    <div class="laundry-actions">${actionButtons}</div>
                `;
                laundryList.appendChild(li);
            });

            // Agrega los event listeners a los nuevos botones
          laundryList.addEventListener('click', async (e) => {
        const targetButton = e.target;
        if (targetButton.classList.contains('ready-button')) {
            const id = targetButton.dataset.id;
            try {
                await updateDoc(doc(db, "laundryOrders", id), { status: "ready" });
                showNotification('Pedido listo para entrega.', 'success');
                await loadData();
            } catch (e) {
                console.error("Error al marcar pedido como listo: ", e);
                showNotification("Error al actualizar el estado del pedido.", 'error');
            }
        }
    
        if (targetButton.classList.contains('delivered-button')) {
            const id = targetButton.dataset.id;
            const clientName = targetButton.dataset.clientName;
            const loads = parseInt(targetButton.dataset.loads);
            const isFree = targetButton.dataset.free === 'true';

            const regularPrice = prices?.laundry?.regular || 0;
        const amount = isFree ? 0 : regularPrice * loads;
    
            // Crear el objeto del registro de historial
            const newRecord = {
                type: 'lavandería',
                clientName: clientName,
                loads: loads,
                amount: isFree ? 0 : prices.laundry.regular * loads,
                entryTime: new Date(targetButton.dataset.entryTime).toISOString(),
                exitTime: new Date().toISOString(),
                isFree: isFree,
                // Clave para evitar duplicados: guarda el ID del pedido de lavandería
                laundryOrderId: id
            };
    
            try {
                // Primero, verifica si el registro ya existe en el historial
                const q = query(collection(db, "transactionHistory"), where("laundryOrderId", "==", id));
                const querySnapshot = await getDocs(q);
    
                if (querySnapshot.empty) {
                    // Si no existe, lo agrega
                    await updateDoc(doc(db, "laundryOrders", id), { status: "delivered", completionTime: new Date().toISOString() });
                    await addDoc(collection(db, "transactionHistory"), newRecord);
                    showNotification(`Pedido de ${clientName} entregado y registrado en el historial.`, 'success');
                } else {
                    // Si ya existe, solo actualiza el estado del pedido de lavandería y muestra una notificación
                    await updateDoc(doc(db, "laundryOrders", id), { status: "delivered", completionTime: new Date().toISOString() });
                    showNotification(`El pedido de ${clientName} ya ha sido registrado en el historial.`, 'info');
                }
    
                await loadData();
            } catch (e) {
                console.error("Error al marcar pedido como entregado y registrar: ", e);
                showNotification("Error al registrar la entrega del pedido.", 'error');
            }
        }
    });
}
    };
    
    // Cargar tarifas y vehículos desde localStorage y Firestore
   const loadData = async () => {
        // Cargar datos de parqueadero
        const storedPrices = localStorage.getItem('parkingPrices');
        if (storedPrices) {
            prices = JSON.parse(storedPrices);
        }

        // Utiliza una función para manejar la asignación de valores de forma segura
        const setInputValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value;
            }
        };

        if (prices.carro) {
            setInputValue('car-less-than-30min', prices.carro.menos30Min);
            setInputValue('car-half-hour', prices.carro.mediaHora);
            setInputValue('car-hour', prices.carro.hora);
            setInputValue('car-12h', prices.carro.doceHoras);
            setInputValue('car-month', prices.carro.mes);
        }
        if (prices.moto) {
            setInputValue('bike-less-than-30min', prices.moto.menos30Min);
            setInputValue('bike-half-hour', prices.moto.mediaHora);
            setInputValue('bike-hour', prices.moto.hora);
            setInputValue('bike-12h', prices.moto.doceHoras);
            setInputValue('bike-month', prices.moto.mes);
        }
        if (prices['otros-mensualidad']) {
            setInputValue('other-small-min', prices['otros-mensualidad'].pequeño.min);
            setInputValue('other-small-max', prices['otros-mensualidad'].pequeño.max);
            setInputValue('other-small-default', prices['otros-mensualidad'].pequeño.mes);
            setInputValue('other-medium-min', prices['otros-mensualidad'].mediano.min);
            setInputValue('other-medium-max', prices['otros-mensualidad'].mediano.max);
            setInputValue('other-medium-default', prices['otros-mensualidad'].mediano.mes);
            setInputValue('other-large-min', prices['otros-mensualidad'].grande.min);
            setInputValue('other-large-max', prices['otros-mensualidad'].grande.max);
            setInputValue('other-large-default', prices['otros-mensualidad'].grande.mes);
        }
        if (prices['otros-noche']) {
            setInputValue('other-night-small-min', prices['otros-noche'].pequeño.min);
            setInputValue('other-night-small-max', prices['otros-noche'].pequeño.max);
            setInputValue('other-night-small-default', prices['otros-noche'].pequeño.noche);
            setInputValue('other-night-medium-min', prices['otros-noche'].mediano.min);
            setInputValue('other-night-medium-max', prices['otros-noche'].mediano.max);
            setInputValue('other-night-medium-default', prices['otros-noche'].mediano.noche);
            setInputValue('other-night-large-min', prices['otros-noche'].grande.min);
            setInputValue('other-night-large-max', prices['otros-noche'].grande.max);
            setInputValue('other-night-large-default', prices['otros-noche'].grande.noche);
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
    
    // Cargar historial de transacciones
        const recordsCol = collection(db, 'transactionHistory');
        const recordsSnapshot = await getDocs(recordsCol);
        allRecords = recordsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Historial de Registros cargado:", allRecords);
        displayRecords();
    };

      const loadRecords = async () => {
        const parkingRecordsCol = collection(db, 'parkingRecords');
        const laundryRecordsCol = collection(db, 'laundryRecords');
        
        const parkingSnapshot = await getDocs(parkingRecordsCol);
        const laundrySnapshot = await getDocs(laundryRecordsCol);
        
        const parkingRecords = parkingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'parqueadero' }));
        const laundryRecords = laundrySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'lavanderia' }));
        
        allRecords = [...parkingRecords, ...laundryRecords];
        displayRecords();
    };

     const displayRecords = (filterType = 'all', searchTerm = '') => {
        const recordsTableBody = document.getElementById('transaction-table-body');
        if (!recordsTableBody) return;

        recordsTableBody.innerHTML = '';
        
        const filteredRecords = allRecords.filter(record => {
            let matchesFilter = true;
            if (filterType !== 'all') {
                matchesFilter = record.type === filterType;
            }

            let matchesSearch = true;
            if (searchTerm) {
                const lowerCaseSearch = searchTerm.toLowerCase();
                matchesSearch = (record.plate && record.plate.toLowerCase().includes(lowerCaseSearch)) ||
                                (record.description && record.description.toLowerCase().includes(lowerCaseSearch)) ||
                                (record.clientName && record.clientName.toLowerCase().includes(lowerCaseSearch));
            }
            return matchesFilter && matchesSearch;
        });

        if (filteredRecords.length === 0) {
            recordsTableBody.innerHTML = '<tr><td colspan="6" class="no-records-message">No se encontraron registros.</td></tr>';
            return;
        }

        filteredRecords.sort((a, b) => new Date(b.exitTime || b.entryTime) - new Date(a.exitTime || a.entryTime));
        
        filteredRecords.forEach(record => {
            const row = document.createElement('tr');
            let recordTypeDisplay = '';
            let plateOrClient = record.plate || record.clientName || 'N/A';
            let detailsDisplay = '';
            let totalCostDisplay = record.costoFinal ? `$${formatNumber(record.costoFinal)} COP` : 'Gratis';
            
            if (record.type === 'parqueadero') {
                recordTypeDisplay = 'Parqueadero';
                detailsDisplay = record.description || 'N/A';
            } else if (record.type === 'lavanderia') {
                recordTypeDisplay = 'Lavandería';
                detailsDisplay = record.loads ? `Cargas: ${record.loads}` : 'N/A';
            }

            row.innerHTML = `
                <td>${recordTypeDisplay}</td>
                <td>${plateOrClient}</td>
                <td>${new Date(record.entryTime).toLocaleString('es-CO')}</td>
                <td>${new Date(record.exitTime).toLocaleString('es-CO')}</td>
                <td>${totalCostDisplay}</td>
                <td class="action-buttons-cell">
                    <button class="view-receipt-btn" data-id="${record.id}" data-type="${record.type}"><i class="fas fa-file-pdf"></i></button>
                    <button class="delete-record-btn" data-id="${record.id}" data-type="${record.type}"><i class="fas fa-trash"></i></button>
                </td>
            `;
            recordsTableBody.appendChild(row);
        });

        document.querySelectorAll('.view-receipt-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const recordId = e.target.closest('button').dataset.id;
                const recordType = e.target.closest('button').dataset.type;
                const record = allRecords.find(r => r.id === recordId);
                if (record) {
                    if (recordType === 'parqueadero') {
                        const receiptData = {
                            plate: record.plate,
                            type: record.type,
                            entryTime: new Date(record.entryTime),
                            exitTime: new Date(record.exitTime),
                            costoFinal: record.costoFinal,
                            descuento: record.descuento,
                            esGratis: record.esGratis,
                            esMensualidad: record.esMensualidad,
                            costoOriginal: record.costoOriginal,
                            ajusteEspecial: record.ajusteEspecial,
                            tiempoEstadia: record.tiempoEstadia,
                            esNoche: record.esNoche,
                            proximoPago: record.proximoPago
                        };
                        generateReceipt(receiptData);
                    } else if (recordType === 'lavanderia') {
                        const receiptData = {
                            clientName: record.clientName,
                            loads: record.loads,
                            entryTime: new Date(record.entryTime).toISOString(),
                            exitTime: new Date(record.exitTime).toISOString(),
                            costoFinal: record.costoFinal,
                            costoOriginal: record.costoOriginal,
                            isFree: record.isFree
                        };
                        generateLaundryReceipt(receiptData);
                    }
                }
            });
        });

        document.querySelectorAll('.delete-record-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                deleteRecord(id);
            });
        });
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
        } else if (targetTabId === 'laundry-tab') {
            updateActiveLaundryList();
            document.querySelector('.laundry-button[data-laundry-tab="laundry-register-tab"]').click();
        } else if (targetTabId === 'records-tab') {
            const activeFilterButton = document.querySelector('.records-filter-button.active');
            const filterType = activeFilterButton ? activeFilterButton.dataset.type : 'all';
            displayRecords(filterType, recordsSearchInput.value);
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
            menos30Min: parseNumber(document.getElementById('car-less-than-30min').value),
            mediaHoraMenos: parseNumber(carLessThan30Min.value),
            mediaHora: parseNumber(document.getElementById('car-half-hour').value),
            hora: parseNumber(document.getElementById('car-hour').value),
            doceHoras: parseNumber(document.getElementById('car-12h').value),
            mes: parseNumber(document.getElementById('car-month').value)
        };
        prices.moto = {
            menos30Min: parseNumber(document.getElementById('bike-less-than-30min').value),
            mediaHoraMenos: parseNumber(bikeLessThan30Min.value),
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

        // Actualizar precios de 12h
        prices['carro-12h'] = { doceHoras: parseNumber(document.getElementById('car-12h').value) };
        prices['moto-12h'] = { doceHoras: parseNumber(document.getElementById('bike-12h').value) };

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
        const newVehicle = {
            plate,
            description,
            type,
            entryTime: new Date().toISOString(),
            price: otherPrice,
            size: otherVehicleSize
        };
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

     const updateCalculatedCost = () => {
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate);
        const exitCostDisplay = document.getElementById('exit-cost-display');
        const specialClientSection = document.getElementById('special-client-section');
        const specialClientCheckbox = document.getElementById('special-client');

        // Salir si no se encuentra el vehículo o si es un tipo con tarifa fija
        if (!vehicle || ['mensualidad', 'moto-mensualidad', 'otros-mensualidad', 'otros-noche'].includes(vehicle.type)) {
            exitCostDisplay.innerHTML = '';
            specialClientCheckbox.checked = false;
            specialClientSection.style.display = 'none';
            return;
        }

        specialClientSection.style.display = 'flex';

        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const diffInMs = exitTime - entryTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));

        let totalCost = 0;
        const baseType = vehicle.type.includes('12h') ? vehicle.type.replace('-12h', '') : vehicle.type;
        const rates = prices[baseType];

        if (diffInMinutes <= 30) {
                totalCost = rates.menos30Min; // Usar el nuevo precio
                originalCost = totalCost;

                resultHTML = `
                    <p>Placa: <strong>${vehicle.plate}</strong></p>
                    <p>Tipo: <strong>${vehicle.type}</strong></p>
                    <p>Tiempo de estadía: <strong>${diffInMinutes} minutos</strong></p>
                    <p>Total a pagar: <strong>$${formatNumber(totalCost)} COP</strong></p>
                `;
                
                receiptData = {
                    plate: vehicle.plate,
                    type: vehicle.type,
                    entryTime,
                    exitTime,
                    costoFinal: totalCost,
                    descuento: 0,
                    esGratis: false,
                    tiempoEstadia: `${diffInMinutes} minutos`
                };

            } else if (diffInMinutes >= 720) { // 12 horas o más
                totalCost = rates.doceHoras;
                originalCost = totalCost;

            } else if (diffInMinutes <= 60) { // Entre 31 y 60 minutos
                totalCost = rates.mediaHora;
                originalCost = totalCost;

            } else { // Más de una hora y menos de 12 horas
                const totalHours = Math.ceil(diffInMinutes / 60);
                totalCost = totalHours * rates.hora;
                originalCost = totalCost;
            }
        
        let originalCost = totalCost;

        if (specialClientCheckbox.checked) {
            const adjustmentValue = parseNumber(document.getElementById('special-client-adjustment-exit').value) || 0;
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

    // Registrar salida y calcular costo
    exitForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const plate = document.getElementById('plate-exit').value.trim().toUpperCase();
        const vehicle = activeVehicles.find(v => v.plate === plate || v.description === plate);

        if (!vehicle) {
            showNotification('Placa/Descripción no encontrada. Por favor, verifique e intente de nuevo.', 'error');
            return;
        }

        const exitTime = new Date();
        const entryTime = new Date(vehicle.entryTime);
        const diffInMs = exitTime - entryTime;
        const diffInMinutes = Math.round(diffInMs / (1000 * 60));
        
        let totalCost = 0;
        let originalCost = 0;
        const isSpecialClient = specialClientCheckbox.checked;
        const adjustmentValue = parseNumber(specialClientAdjustment.value) || 0;

        let resultHTML = '';
        let receiptData = {};
        let displayPlate = vehicle.plate;
        if (vehicle.type.includes('otros')) {
            displayPlate = vehicle.description;
        }

        if (['mensualidad', 'moto-mensualidad', 'otros-mensualidad'].includes(vehicle.type)) {
            let monthlyPrice = 0;
            if (vehicle.type === 'mensualidad') {
                monthlyPrice = prices.carro.mes;
            } else if (vehicle.type === 'moto-mensualidad') {
                monthlyPrice = prices.moto.mes;
            } else {
                monthlyPrice = vehicle.price;
            }

            const nextPaymentDate = new Date(vehicle.entryTime);
            nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            const formattedNextPaymentDate = nextPaymentDate.toLocaleDateString('es-CO');

            resultHTML = `
                <p>Placa/Descripción: <strong>${displayPlate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Valor mensualidad: <strong>$${formatNumber(monthlyPrice)} COP</strong></p>
                <p>Día de pago próximo: <strong>${formattedNextPaymentDate}</strong></p>
                <p class="info-message"><strong>Salida registrada. No se aplica cargo por hora.</strong></p>
            `;
            totalCost =monthlyPrice;
            
            receiptData = {
                plate: displayPlate,
                type: vehicle.type,
                entryTime,
                exitTime,
                costoFinal:totalCost,
                descuento: 0,
                esMensualidad: true,
                costoOriginal: monthlyPrice,
                proximoPago: nextPaymentDate
            };
        } else if (vehicle.type === 'otros-noche') {
            const nightPrice = vehicle.price;
            resultHTML = `
                <p>Descripción: <strong>${displayPlate}</strong></p>
                <p>Tipo: <strong>${vehicle.type}</strong></p>
                <p>Valor por noche: <strong>$${formatNumber(nightPrice)} COP</strong></p>
                <p class="info-message"><strong>Salida registrada. Tarifa plana nocturna.</strong></p>
            `;
            totalCost = nightPrice;
            
            receiptData = {
                plate: displayPlate,
                type: vehicle.type,
                entryTime,
                exitTime,
                costoFinal: totalCost,
                esGratis: false,
                esMensualidad: false,
                esNoche: true,
                costoOriginal: nightPrice
            };
        } else { // Carros y Motos (Por hora y 12 horas)
            const baseType = vehicle.type.includes('12h') ? vehicle.type.replace('-12h', '') : vehicle.type;
            const rates = prices[baseType];

            let totalCost = 0;
            let originalCost = 0;
            let adjustmentValue = 0;
            let esGratis = false;

            if (diffInMinutes <= 30) {
                totalCost = rates.menos30Min;
                originalCost = totalCost; // Se define el costo original
                adjustmentValue = 0; // Se define el ajuste en 0
                esGratis = false;
                
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
                    descuento: 0,
                    esGratis: false,
                     costoOriginal: originalCost,
                    ajusteEspecial: adjustmentValue,
                    tiempoEstadia: `${diffInMinutes} minutos`
                };
            } else {
                if (diffInMinutes >= 720) { // 12 horas en minutos
                    totalCost = rates.doceHoras;
                } else if (diffInMinutes <= 60) {
                    totalCost = rates.mediaHora;
                } else {
                    const totalHours = Math.ceil(diffInMinutes / 60);
                    totalCost = totalHours * rates.hora;
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

        // Actualizar el costo en la sección de salida
        exitCostDisplay.innerHTML = `Total a Pagar: <strong>$${formatNumber(totalCost)} COP</strong>`;

     try {
            // Guardar el registro en el historial antes de eliminarlo
            await addDoc(collection(db, 'transactionHistory'), {
                ...receiptData,
                type: 'parqueadero',
                entryTime: new Date(receiptData.entryTime).toISOString(),
                exitTime: new Date(receiptData.exitTime).toISOString(),
                plate: receiptData.plate,
                description: vehicle.description || null,
                id: vehicle.id // Opcional, para referencia
            });
            await deleteDoc(doc(window.db, "activeVehicles", vehicle.id));
            showNotification(`Salida de ${displayPlate} registrada.`, 'success');
            await loadData();
        } catch (e) {
            console.error("Error al guardar o eliminar documento: ", e);
            showNotification("Error al registrar la salida. Por favor, intente de nuevo.", 'error');
        }

        exitForm.reset();
        specialClientCheckbox.checked = false;
        specialClientSection.style.display = 'none';
        specialClientAdjustment.value = '';
        exitCostDisplay.innerHTML = '';

        localStorage.setItem('lastReceipt', JSON.stringify(receiptData));
    });

    // Descargar recibo de pago en PDF


        const generateReceipt = (receiptData) => {
        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setTextColor(44, 62, 80);

        doc.setFontSize(22);
        doc.text('Parqueadero Villa_laundrycoffee', 105, 20, null, null, 'center');
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

        if (receiptData.esNoche || receiptData.esMensualidad) {
            doc.text(`Descripción: ${receiptData.plate}`, 20, y);
            y += 7;
        } else {
            doc.text(`Placa: ${receiptData.plate}`, 20, y);
            y += 7;
        }
        
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
        } else if (receiptData.esMensualidad) {
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
        } else if (receiptData.esNoche) {
             doc.text(`Tarifa Plana por Noche: $${formatNumber(receiptData.costoOriginal)} COP`, 20, y);
            y += 10;
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(52, 152, 219);
            doc.text(`TOTAL A PAGAR: $${formatNumber(receiptData.costoFinal)} COP`, 20, y);
            y += 20;
        } else {
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
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('¡Gracias por su visita!', 105, y, null, null, 'center');
        y += 5;
        doc.text('Medellín, Antioquia, Colombia', 105, y, null, null, 'center');

        doc.save(`Recibo_Parqueadero_${receiptData.plate}.pdf`);
        showNotification('Recibo PDF generado con éxito.', 'success');
    };
    // Descargar recibo de pago en PDF
    printReceiptBtn.addEventListener('click', () => {
        const receiptData = JSON.parse(localStorage.getItem('lastReceipt'));
        if (!receiptData) {
            showNotification('No hay un recibo para descargar. Finalice una salida primero.', 'info');
            return;
        }
        // Llama a la función ahora que está definida globalmente
        generateReceipt(receiptData);
    });

    // Registrar pedido de lavandería
    laundryEntryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
       const clientNameRaw = laundryClientName.value.trim(); // Se define aquí
        const clientNameNormalized = clientNameRaw.toLowerCase(); // Se usa aquí
        const loads = parseInt(laundryLoads.value);

        const clientsCol = collection(db, 'laundryClients');
        const clientQuery = query(clientsCol, where("normalizedName", "==", clientNameNormalized));
        const clientSnapshot = await getDocs(clientQuery);
        
        let isFree = false;
        let clientDocId = null;

        if (clientSnapshot.empty) {
            // Cliente nuevo, crea el perfil
            const newClientData = { name: clientNameRaw, normalizedName: clientNameNormalized, loadsCount: loads };
            const docRef = await addDoc(clientsCol, newClientData);
            clientDocId = docRef.id;
            showNotification(`Cliente nuevo registrado: ${clientNameRaw}.`, 'info');
        } else {
            // Cliente existente, actualiza el contador de lavadas
            const clientDoc = clientSnapshot.docs[0];
            const currentLoads = clientDoc.data().loadsCount;
            clientDocId = clientDoc.id;

            if (currentLoads >= PROMOCION_LAVADOS_GRATIS) {
                isFree = true;
                // Reinicia el contador para el próximo ciclo
                await updateDoc(doc(db, "laundryClients", clientDocId), { loadsCount: loads });
                showNotification(`¡Lavado gratis para ${clientNameRaw}! Se ha aplicado la promoción.`, 'success');
            } else {
                // Incrementa el contador
                await updateDoc(doc(db, "laundryClients", clientDocId), { loadsCount: currentLoads + loads });
                showNotification(`Se han sumado ${loads} lavadas a la cuenta de ${clientNameRaw}.`, 'info');
            }
        }
        
        const newOrder = {
           clientName: clientNameRaw,
            loads,
            entryTime: new Date().toISOString(),
            status: 'pending',
            isFree: isFree,
            clientDocId: clientDocId
        };

        try {
            await addDoc(collection(db, 'laundryOrders'), newOrder);
            showNotification(`Pedido de lavandería para ${clientNameRaw} registrado.`, 'success');
            laundryEntryForm.reset();
            laundryLoads.value = '1';
            await loadData();
        } catch (e) {
            console.error("Error al añadir pedido: ", e);
            showNotification("Error al registrar el pedido de lavandería.", 'error');
        }
    });

    // Función para generar recibo de lavandería
    const generateLaundryReceipt = (data) => {
        const doc = new jsPDF();
        doc.setFont('helvetica');
        doc.setTextColor(44, 62, 80);
        const imgWidth = 40;
        const imgHeight = 40;
        const pageWidth = doc.internal.pageSize.getWidth();
        const xPos = (pageWidth / 2) - (imgWidth / 2);
        // doc.addImage(logoBase64, 'PNG', xPos, 5, imgWidth, imgHeight);
        doc.setFontSize(22);
        doc.text('Parqueadero y Lavandería', 105, 50, null, null, 'center');
        doc.setFontSize(16);
        doc.text('Recibo de Lavandería', 105, 60, null, null, 'center');
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 65, 190, 65);
        let y = 75;
        doc.setFontSize(12);
        doc.setTextColor(52, 73, 94);
        doc.text(`Cliente: ${data.clientName}`, 20, y);
        y += 7;
        doc.text(`Cantidad de lavadoras: ${data.loads}`, 20, y);
        y += 7;
        doc.text(`Fecha de Entrada: ${new Date(data.entryTime).toLocaleString('es-CO')}`, 20, y);
        y += 7;
        doc.text(`Fecha de Salida: ${new Date(data.exitTime).toLocaleString('es-CO')}`, 20, y);
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
            doc.text(`Costo por lavadora: $${formatNumber(data.costoOriginal / data.loads)} COP`, 20, y);
            y += 10;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(52, 152, 219);
        doc.text(`TOTAL A PAGAR: $${formatNumber(data.costoFinal)} COP`, 20, y);
        y += 20;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('¡Gracias por su preferencia!', 105, y, null, null, 'center');
        y += 5;
        doc.text('Medellín, Antioquia, Colombia', 105, y, null, null, 'center');
        doc.save(`Recibo_Lavanderia_${data.clientName}.pdf`);
    };
     // FUNCIÓN PARA EXPORTAR DATOS A EXCEL
   const exportToExcelBtn = document.getElementById('export-data-btn');
    if (exportToExcelBtn) {
        exportToExcelBtn.addEventListener('click', () => {
            if (allRecords.length === 0) {
                showNotification("No hay registros para exportar.", 'info');
                return;
            }

            const dataToExport = allRecords.map(record => {
                let typeDisplay = record.type === 'parqueadero' ? 'Parqueadero' : 'Lavandería';
                let plateOrClient = record.plate || record.clientName || 'N/A';
                let details = record.description || record.loads ? `Cargas: ${record.loads}` : 'N/A';
                
                return {
                    'Tipo de Transacción': typeDisplay,
                    'Placa/Cliente': plateOrClient,
                    'Detalles': details,
                    'Fecha de Entrada': new Date(record.entryTime).toLocaleString('es-CO'),
                    'Fecha de Salida': new Date(record.exitTime || record.entryTime).toLocaleString('es-CO'),
                    'Costo Final (COP)': record.costoFinal,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');
            XLSX.writeFile(workbook, 'Registros_Transacciones.xlsx');
            showNotification('Registros exportados a Excel exitosamente.', 'success');
        });
    }

    // NUEVA FUNCIÓN PARA MOSTRAR LOS REGISTROS EN LA PÁGINA
    const loadTransactionHistory = async () => {
        try {
            // Obtenemos los registros y los ordenamos por fecha de salida descendente
            const transactionsCol = collection(db, 'transactionHistory');
            const q = query(transactionsCol, orderBy('exitTime', 'desc'));
            const querySnapshot = await getDocs(q);
            
            const transactions = querySnapshot.docs.map(doc => doc.data());

            if (transactions.length === 0) {
                transactionTableBody.innerHTML = `<tr><td colspan="6">No hay registros de transacciones.</td></tr>`;
                return;
            }

            transactionTableBody.innerHTML = '';
            transactions.forEach(t => {
                const row = document.createElement('tr');
                const entryDate = new Date(t.entryTime).toLocaleString('es-CO');
                const exitDate = new Date(t.exitTime).toLocaleString('es-CO');
                let subject = t.plate || t.clientName;
                let details = '';

                if (t.type === 'Parqueadero') {
                    details = `Tipo: ${t.vehicleType}, Duración: ${t.durationMinutes} min, Costo: $${formatNumber(t.finalCost)}`;
                } else if (t.type === 'Lavandería') {
                    details = `Lavadoras: ${t.loads}, Costo: $${formatNumber(t.finalCost)}`;
                }

                row.innerHTML = `
                    <td>${t.type}</td>
                    <td>${subject}</td>
                    <td>${entryDate}</td>
                    <td>${exitDate}</td>
                    <td>$${formatNumber(t.finalCost)}</td>
                    <td>${details}</td>
                `;
                transactionTableBody.appendChild(row);
            });

        } catch (e) {
            console.error("Error al cargar el historial: ", e);
            transactionTableBody.innerHTML = `<tr><td colspan="6">Error al cargar los registros.</td></tr>`;
        }
    };
    const deleteRecord = async (id) => {
        if (!confirm(`¿Estás seguro de que quieres eliminar este registro? Esta acción es irreversible.`)) {
            return;
        }
        try {
            await deleteDoc(doc(db, "transactionHistory", id));
            showNotification('Registro eliminado exitosamente.', 'success');
            await loadData();
        } catch (e) {
            console.error("Error al eliminar el registro: ", e);
            showNotification("Error al eliminar el registro. Intente de nuevo.", 'error');
        }
    };
    // Event listeners para los filtros y buscador de registros
    document.querySelectorAll('.records-filter-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.records-filter-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayRecords(button.dataset.type, recordsSearchInput.value);
        });
    });

    recordsSearchInput.addEventListener('input', (e) => {
        const activeFilterButton = document.querySelector('.records-filter-button.active');
        const filterType = activeFilterButton ? activeFilterButton.dataset.type : 'all';
        displayRecords(filterType, e.target.value);
    });

    loadRecords(); // Llama a esta función al inicio para cargar todos los registros


    // Llamada inicial para cargar los datos y actualizar la lista de vehículos.
    await loadData();
});
