// Upload handling
class UploadManager {
    constructor() {
        this.uploadQueue = [];
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('file-input');

        if (uploadZone && fileInput) {
            // Click to upload
            uploadZone.addEventListener('click', () => fileInput.click());

            // File input change
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });

            // Drag and drop
            uploadZone.addEventListener('dragover', this.handleDragOver.bind(this));
            uploadZone.addEventListener('dragleave', this.handleDragLeave.bind(this));
            uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        e.currentTarget.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.addToQueue(file);
            }
        });
        
        this.showQueue();
        this.processQueue();
    }

    validateFile(file) {
        // Check file type
        if (!CONFIG.SUPPORTED_TYPES.includes(file.type)) {
            showToast(`File type ${file.type} is not supported`, 'error');
            return false;
        }

        // Check file size
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showToast(`File ${file.name} is too large (max ${CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`, 'error');
            return false;
        }

        return true;
    }

    addToQueue(file) {
        const uploadItem = {
            id: Date.now() + Math.random(),
            file: file,
            status: 'queued',
            progress: 0
        };

        this.uploadQueue.push(uploadItem);
        this.renderQueueItem(uploadItem);
    }

    showQueue() {
        const queueContainer = document.getElementById('upload-queue');
        if (queueContainer && this.uploadQueue.length > 0) {
            queueContainer.style.display = 'block';
        }
    }

    renderQueueItem(item) {
        const queueList = document.getElementById('upload-list');
        if (!queueList) return;

        const itemElement = document.createElement('div');
        itemElement.className = 'upload-item';
        itemElement.id = `upload-item-${item.id}`;
        
        itemElement.innerHTML = `
            <div class="upload-item-info">
                <i class="fas fa-file"></i>
                <div>
                    <div class="upload-filename">${item.file.name}</div>
                    <div class="upload-filesize">${this.formatFileSize(item.file.size)}</div>
                </div>
            </div>
            <div class="upload-status">
                <div class="upload-progress">
                    <div class="upload-progress-bar"></div>
                </div>
                <span class="upload-status-text">Queued</span>
            </div>
        `;

        queueList.appendChild(itemElement);
    }

    async processQueue() {
        for (const item of this.uploadQueue) {
            if (item.status === 'queued') {
                await this.uploadFile(item);
            }
        }
    }

    async uploadFile(item) {
        const itemElement = document.getElementById(`upload-item-${item.id}`);
        const progressBar = itemElement.querySelector('.upload-progress-bar');
        const statusText = itemElement.querySelector('.upload-status-text');

        try {
            // Update status
            item.status = 'uploading';
            statusText.textContent = 'Uploading...';
            progressBar.style.width = '10%';

            // Upload file
            const response = await api.uploadDocument(item.file);
            
            // Update progress
            progressBar.style.width = '100%';
            statusText.textContent = 'Uploaded';
            item.status = 'completed';

            showToast(`${item.file.name} uploaded successfully!`, 'success');

            // Auto-process the document
            setTimeout(async () => {
                try {
                    await api.processDocument(response.id);
                    showToast(`Processing ${item.file.name}...`, 'info');
                } catch (error) {
                    console.error('Auto-process failed:', error);
                }
            }, 1000);

        } catch (error) {
            item.status = 'failed';
            statusText.textContent = 'Failed';
            progressBar.style.width = '0%';
            progressBar.style.background = '#dc3545';
            
            showToast(`Upload failed: ${error.message}`, 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    clearQueue() {
        this.uploadQueue = [];
        const queueList = document.getElementById('upload-list');
        if (queueList) {
            queueList.innerHTML = '';
        }
        
        const queueContainer = document.getElementById('upload-queue');
        if (queueContainer) {
            queueContainer.style.display = 'none';
        }
    }
}

// Initialize upload manager
const uploadManager = new UploadManager();
