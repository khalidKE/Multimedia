const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const filePreview = document.getElementById('filePreview');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileLabel = document.getElementById('fileLabel');
const fileDescription = document.getElementById('fileDescription');
const uploadBtn = document.getElementById('uploadBtn');
const searchInput = document.getElementById('searchInput');
const fileTypeFilter = document.getElementById('fileTypeFilter');
const sortOrder = document.getElementById('sortOrder');
const gridView = document.getElementById('gridView');
const listView = document.getElementById('listView');
const emptyState = document.getElementById('emptyState');
const previewModal = document.getElementById('previewModal');
const modalTitle = document.getElementById('modalTitle');
const modalPreview = document.getElementById('modalPreview');
const closeModal = document.querySelector('.close-modal');
const toast = document.getElementById('toast');
const tabBtns = document.querySelectorAll('.tab-btn');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');

let selectedFile = null;
let files = [];
let filteredFiles = [];
let currentView = 'grid';
let currentTheme = localStorage.getItem('theme') || 'light';
let currentLang = localStorage.getItem('lang') || 'ar';

const translations = {
    ar: {
        appTitle: 'نظام إدارة الملفات',
        uploadTitle: 'رفع ملف جديد',
        dropAreaText: 'اسحب الملفات هنا أو انقر للاختيار',
        browseBtn: 'اختر ملفًا',
        labelField: 'العنوان',
        labelPlaceholder: 'أدخل عنوانًا للملف',
        descriptionField: 'الوصف',
        descriptionPlaceholder: 'أدخل وصفًا للملف (اختياري)',
        uploadBtn: 'رفع الملف',
        uploadingBtn: 'جاري الرفع...',
        galleryTitle: 'معرض الملفات',
        searchPlaceholder: 'ابحث عن ملف...',
        filterAll: 'كل الأنواع',
        filterImages: 'صور',
        filterVideos: 'فيديو',
        filterAudio: 'صوت',
        filterDocuments: 'مستندات',
        sortNewest: 'الأحدث',
        sortOldest: 'الأقدم',
        gridView: 'عرض شبكي',
        listView: 'عرض قائمة',
        noFilesTitle: 'لا توجد ملفات',
        noFilesDesc: 'قم برفع ملفات لعرضها هنا',
        downloadBtn: 'تنزيل',
        noDescription: 'لا يوجد وصف',
        imageType: 'صورة',
        videoType: 'فيديو',
        audioType: 'صوت',
        fileType: 'ملف',
        downloadFile: 'تنزيل الملف',
        downloadPreview: 'يمكنك تنزيل هذا الملف لعرضه',
        toastUploadError: 'الرجاء اختيار ملف للرفع',
        toastLabelError: 'الرجاء إضافة عنوان للملف',
        toastUploadSuccess: 'تم رفع الملف {filename} بنجاح',
        toastDeleteSuccess: 'تم حذف الملف بنجاح',
        toastDownloading: 'جاري تنزيل {filename}',
        bytes: 'بايت',
        kb: 'كيلوبايت',
        mb: 'ميجابايت'
    },
    en: {
        appTitle: 'File Management System',
        uploadTitle: 'Upload New File',
        dropAreaText: 'Drag files here or click to browse',
        browseBtn: 'Choose File',
        labelField: 'Title',
        labelPlaceholder: 'Enter a title for the file',
        descriptionField: 'Description',
        descriptionPlaceholder: 'Enter a description for the file (optional)',
        uploadBtn: 'Upload File',
        uploadingBtn: 'Uploading...',
        galleryTitle: 'File Gallery',
        searchPlaceholder: 'Search for a file...',
        filterAll: 'All Types',
        filterImages: 'Images',
        filterVideos: 'Videos',
        filterAudio: 'Audio',
        filterDocuments: 'Documents',
        sortNewest: 'Newest',
        sortOldest: 'Oldest',
        gridView: 'Grid View',
        listView: 'List View',
        noFilesTitle: 'No Files',
        noFilesDesc: 'Upload files to see them here',
        downloadBtn: 'Download',
        noDescription: 'No description',
        imageType: 'Image',
        videoType: 'Video',
        audioType: 'Audio',
        fileType: 'File',
        downloadFile: 'Download File',
        downloadPreview: 'You can download this file to view it',
        toastUploadError: 'Please select a file to upload',
        toastLabelError: 'Please add a title for the file',
        toastUploadSuccess: 'File {filename} uploaded successfully',
        toastDeleteSuccess: 'File deleted successfully',
        toastDownloading: 'Downloading {filename}',
        bytes: 'bytes',
        kb: 'KB',
        mb: 'MB'
    }
};

function init() {
    loadFiles();
    setupEventListeners();
    applyTheme();
    applyLanguage();
}

function loadFiles() {
    const savedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]');
    files = savedFiles;
    applyFilters();
}

function setupEventListeners() {
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('active');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('active');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('active');

        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileSelect(e.target.files[0]);
        }
    });

    uploadBtn.addEventListener('click', handleUpload);

    searchInput.addEventListener('input', applyFilters);
    fileTypeFilter.addEventListener('change', applyFilters);
    sortOrder.addEventListener('change', applyFilters);

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.getAttribute('data-view');
            toggleView(view);
        });
    });

    closeModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === previewModal) {
            previewModal.style.display = 'none';
        }
    });

    themeToggle.addEventListener('click', toggleTheme);

    langToggle.addEventListener('click', toggleLanguage);
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    applyTheme();
}

function applyTheme() {
    document.body.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'ar' ? 'en' : 'ar';
    localStorage.setItem('lang', currentLang);
    applyLanguage();
}

function applyLanguage() {
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

    langToggle.innerHTML = `<span>${currentLang === 'ar' ? 'EN' : 'عربي'}</span>`;

    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        if (translations[currentLang][key]) {
            element.textContent = translations[currentLang][key];
        }
    });

    document.querySelectorAll('[data-lang-placeholder]').forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (translations[currentLang][key]) {
            element.placeholder = translations[currentLang][key];
        }
    });

    updateSelectOptions(fileTypeFilter, ['filterAll', 'filterImages', 'filterVideos', 'filterAudio', 'filterDocuments']);
    updateSelectOptions(sortOrder, ['sortNewest', 'sortOldest']);

    renderFiles();
}

function updateSelectOptions(selectElement, keys) {
    const options = selectElement.options;
    for (let i = 0; i < options.length; i++) {
        const key = options[i].getAttribute('data-lang');
        if (key && translations[currentLang][key]) {
            options[i].textContent = translations[currentLang][key];
        }
    }
}

function handleFileSelect(file) {
    selectedFile = file;

    filePreview.style.display = 'block';
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);

    const fileIconElement = document.querySelector('.file-icon');
    fileIconElement.className = 'file-icon fas';

    if (file.type.startsWith('image/')) {
        fileIconElement.classList.add('fa-image');
    } else if (file.type.startsWith('video/')) {
        fileIconElement.classList.add('fa-video');
    } else if (file.type.startsWith('audio/')) {
        fileIconElement.classList.add('fa-music');
    } else {
        fileIconElement.classList.add('fa-file-alt');
    }
}

function handleUpload() {
    if (!selectedFile) {
        showToast(translations[currentLang].toastUploadError, 'error');
        return;
    }

    if (!fileLabel.value.trim()) {
        showToast(translations[currentLang].toastLabelError, 'error');
        return;
    }

    try {
        const fileUrl = URL.createObjectURL(selectedFile);

        let thumbnail = '';
        if (selectedFile.type.startsWith('image/')) {
            thumbnail = fileUrl;
        }

        const newFile = {
            id: Date.now().toString(),
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            label: fileLabel.value,
            description: fileDescription.value,
            url: fileUrl,
            uploadTime: Date.now(),
            thumbnail
        };

        files.unshift(newFile);
        localStorage.setItem('uploadedFiles', JSON.stringify(files));

        selectedFile = null;
        filePreview.style.display = 'none';
        fileLabel.value = '';
        fileDescription.value = '';
        fileInput.value = '';

        showToast(translations[currentLang].toastUploadSuccess.replace('{filename}', newFile.name), 'success');

        applyFilters();

    } catch (error) {
        showToast(translations[currentLang].toastUploadError, 'error');
        console.error(error);
    }
}

function applyFilters() {
    const query = searchInput.value.toLowerCase();
    const type = fileTypeFilter.value;
    const order = sortOrder.value;

    let result = files.filter(file =>
        file.label.toLowerCase().includes(query) ||
        file.description.toLowerCase().includes(query) ||
        file.name.toLowerCase().includes(query)
    );

    if (type !== 'all') {
        result = result.filter(file => {
            if (type === 'image') return file.type.startsWith('image/');
            if (type === 'video') return file.type.startsWith('video/');
            if (type === 'audio') return file.type.startsWith('audio/');
            if (type === 'document') return !file.type.startsWith('image/') &&
                !file.type.startsWith('video/') &&
                !file.type.startsWith('audio/');
            return true;
        });
    }

    if (order === 'newest') {
        result.sort((a, b) => b.uploadTime - a.uploadTime);
    } else {
        result.sort((a, b) => a.uploadTime - b.uploadTime);
    }

    filteredFiles = result;
    renderFiles();
}

function renderFiles() {
    if (filteredFiles.length === 0) {
        gridView.innerHTML = '';
        listView.innerHTML = '';
        emptyState.style.display = 'block';
    } else {
        emptyState.style.display = 'none';

        gridView.innerHTML = filteredFiles.map(file => `
            <div class="file-card">
                <div class="file-preview-area" data-id="${file.id}" onclick="openPreviewModal('${file.id}')">
                    ${renderFilePreview(file)}
                </div>
                <div class="file-card-content">
                    <div class="file-card-header">
                        <span class="file-badge">${getFileTypeInArabic(file.type)}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                    </div>
                    <h3 class="file-card-title">${file.label}</h3>
                    <p class="file-card-description">${file.description || translations[currentLang].noDescription}</p>
                    <p class="file-card-date">${formatDate(file.uploadTime)}</p>
                    <div class="file-card-actions">
                        <button class="btn btn-sm btn-danger" onclick="deleteFile('${file.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="downloadFile('${file.id}')">
                            <i class="fas fa-download"></i> ${translations[currentLang].downloadBtn}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        listView.innerHTML = filteredFiles.map(file => `
            <div class="file-list-item">
                <div class="file-list-preview" data-id="${file.id}" onclick="openPreviewModal('${file.id}')">
                    ${file.type.startsWith('image/')
                ? `<img src="${file.url}" alt="${file.label}">`
                : getFileIconHTML(file.type)}
                </div>
                <div class="file-list-content">
                    <div class="file-card-header">
                        <span class="file-badge">${getFileTypeInArabic(file.type)}</span>
                        <span class="file-size">${formatFileSize(file.size)}</span>
                    </div>
                    <h3 class="file-card-title">${file.label}</h3>
                    <p class="file-card-description">${file.description || translations[currentLang].noDescription}</p>
                    <p class="file-card-date">${formatDate(file.uploadTime)}</p>
                    <div class="file-list-actions">
                        <button class="btn btn-sm btn-danger" onclick="deleteFile('${file.id}')">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="downloadFile('${file.id}')">
                            <i class="fas fa-download"></i> ${translations[currentLang].downloadBtn}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function toggleView(view) {
    currentView = view;

    tabBtns.forEach(btn => {
        if (btn.getAttribute('data-view') === view) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    if (view === 'grid') {
        gridView.style.display = 'grid';
        listView.style.display = 'none';
    } else {
        gridView.style.display = 'none';
        listView.style.display = 'block';
    }
}

function renderFilePreview(file) {
    if (file.type.startsWith('image/')) {
        return `<img src="${file.url}" alt="${file.label}">`;
    } else if (file.type.startsWith('video/')) {
        return `<i class="fas fa-video"></i>`;
    } else if (file.type.startsWith('audio/')) {
        return `<i class="fas fa-music"></i>`;
    } else {
        return `<i class="fas fa-file-alt"></i>`;
    }
}

function getFileIconHTML(fileType) {
    if (fileType.startsWith('image/')) {
        return `<i class="fas fa-image"></i>`;
    } else if (fileType.startsWith('video/')) {
        return `<i class="fas fa-video"></i>`;
    } else if (fileType.startsWith('audio/')) {
        return `<i class="fas fa-music"></i>`;
    } else {
        return `<i class="fas fa-file-alt"></i>`;
    }
}

function getFileTypeInArabic(fileType) {
    const key = fileType.startsWith('image/') ? 'imageType' :
        fileType.startsWith('video/') ? 'videoType' :
            fileType.startsWith('audio/') ? 'audioType' : 'fileType';

    return translations[currentLang][key];
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' ' + translations[currentLang].bytes;
    if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' ' + translations[currentLang].kb;
    return (bytes / 1048576).toFixed(2) + ' ' + translations[currentLang].mb;
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function deleteFile(id) {
    files = files.filter(file => file.id !== id);
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
    showToast(translations[currentLang].toastDeleteSuccess, 'success');
    applyFilters();
}

function downloadFile(id) {
    const file = files.find(file => file.id === id);
    if (file) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast(translations[currentLang].toastDownloading.replace('{filename}', file.name), 'success');
    }
}

function openPreviewModal(id) {
    const file = files.find(file => file.id === id);
    if (!file) return;

    modalTitle.textContent = file.label;

    if (file.type.startsWith('image/')) {
        modalPreview.innerHTML = `<img src="${file.url}" alt="${file.label}">`;
    } else if (file.type.startsWith('video/')) {
        modalPreview.innerHTML = `<video src="${file.url}" controls></video>`;
    } else if (file.type.startsWith('audio/')) {
        modalPreview.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-music" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <audio src="${file.url}" controls style="width: 100%;"></audio>
            </div>
        `;
    } else {
        modalPreview.innerHTML = `
            <div style="text-align: center;">
                <i class="fas fa-file-alt" style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <p>${translations[currentLang].downloadPreview}</p>
                <button class="btn btn-primary" style="margin-top: 1rem;" onclick="downloadFile('${file.id}')">
                    <i class="fas fa-download"></i> ${translations[currentLang].downloadFile}
                </button>
            </div>
        `;
    }

    previewModal.style.display = 'block';
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

window.deleteFile = deleteFile;
window.downloadFile = downloadFile;
window.openPreviewModal = openPreviewModal;

init();