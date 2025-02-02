// Инициализация EmailJS
emailjs.init('yWviMmSiIG6mGUzzn');

// Тема
const themeSwitcher = document.querySelector('.theme-switcher');
const setTheme = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
    themeSwitcher.textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

themeSwitcher.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
});

// Загрузка сохраненной темы
const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme === 'dark');

// Яндекс.Карты
ymaps.ready(initMap);
let map, placemark;

function initMap() {
    map = new ymaps.Map('yandex-map', {
        center: [52.9651, 36.0785],
        zoom: 13,
        controls: ['zoomControl']
    });

    map.events.add('click', e => {
        const coords = e.get('coords');
        if (placemark) map.geoObjects.remove(placemark);
        
        placemark = new ymaps.Placemark(coords, {}, {
            iconLayout: 'default#image',
            iconImageHref: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
            iconImageSize: [40, 40],
            iconImageOffset: [-20, -40]
        });
        
        map.geoObjects.add(placemark);
        document.getElementById('coordinates').value = 
            coords[0].toFixed(6) + ', ' + coords[1].toFixed(6);
    });
}

// Drag and Drop обработчики
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('photoUpload');

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function highlight() {
    dropArea.classList.add('dragover');
}

function unhighlight() {
    dropArea.classList.remove('dragover');
}

['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            handleFile(file);
        } else {
            alert('Пожалуйста, загрузите изображение');
        }
    }
}

function handleFile(file) {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    
    const event = new Event('change');
    fileInput.dispatchEvent(event);
}

// Загрузка изображения
async function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload?key=e44380d130f1b5c5bc3395308cd5da5a', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        return data.data.url;
    } catch (error) {
        throw new Error('Ошибка загрузки изображения');
    }
}

// Отправка формы
document.getElementById('myForm').addEventListener('submit', async e => {
    e.preventDefault();
    
    try {
        const formData = {
            trashType: document.querySelector('input[name="trashType"]:checked').value,
            address: document.querySelector('[name="address"]').value,
            coordinates: document.getElementById('coordinates').value,
            name: document.querySelector('[name="name"]').value,
            phone: document.querySelector('[name="phone"]').value,
            email: document.querySelector('[name="email"]').value,
            photo_url: await uploadImage(document.getElementById('photoUpload').files[0]),
            theme: document.documentElement.getAttribute('data-theme') || 'light'
        };

        await emailjs.send(
            'eco_ChistoGorod2025',
            'template_confirmation',
            formData
        );

        showNotification();
        resetForm();
    } catch (error) {
        alert(`Ошибка: ${error.message}`);
    }
});

function resetForm() {
    document.getElementById('myForm').reset();
    document.getElementById('selectedFile').textContent = '';
    if (placemark) map.geoObjects.remove(placemark);
    document.getElementById('coordinates').value = '';
}

function showNotification() {
    const notification = document.getElementById('notification');

    // Сначала делаем элемент видимым для расчета размеров
    notification.style.display = 'flex';
    notification.style.visibility = 'hidden';

    // Принудительный рефлоу для применения стилей
    void notification.offsetWidth;

    // Показываем с анимацией
    notification.style.visibility = 'visible';
    notification.style.opacity = '1';

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 300);
    }, 2700);
}

// Обработчик файлов
document.getElementById('photoUpload').addEventListener('change', function() {
    document.getElementById('selectedFile').textContent = this.files[0]?.name || '';
});

document.addEventListener('DOMContentLoaded', function() {
    emailjs.init('yWviMmSiIG6mGUzzn');

  document.getElementById('myForm').addEventListener('submit', async e => {
    e.preventDefault();

        const formData = {
            name: this.name.value,
            trashType: this.trashType.value,
            address: this.address.value,
            requestDate: new Date().toLocaleDateString('ru-RU'),
            email: this.email.value
        };

        emailjs.send('eco_ChistoGorod2025', 'template_w8n27yf', formData)
            .then(function(response) {
                console.log('SUCCESS!', response.status, response.text);
                document.getElementById('notification').style.display = 'flex';
                setTimeout(() => {
                    document.getElementById('notification').style.display = 'none';
                }, 100);
            }, function(error) {
                console.log('FAILED...', error);
                alert('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте еще раз.');
            });
    });
});

 