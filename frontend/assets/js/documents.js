// Document management
class DocumentManager {
    constructor() {
        this.documents = [];
        this.init();
    }

    init() {
        // Will be initialized when needed
    }

    async loadDocuments() {
        try {
            this.documents = await api.getDocuments();
            this.renderDocuments();
            this.updateStats();
        } catch (error) {
            showToast('Failed to load documents', 'error');
            console.error('Load documents error:', error);
        }
    }

    renderDocuments() {
        const container = document.getElementById('documents-list');
        if (!container) return;

        if (this.documents.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                    <h3>No documents yet</h3>
                    <p>Upload your first document to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.documents.map(doc => `
            <div class="document-item" onclick="viewDocument(${doc.id})">
                <div class="document-info">
                    <div class="document-icon">
                        <i class="fas ${this.getFileIcon(doc.content_type)}"></i>
                    </div>
                    <div class="document-details">
                        <h3>${doc.original_filename}</h3>
                        <p>${this.formatFileSize(doc.file_size)} • ${this.formatDate(doc.created_at)}</p>
                    </div>
                </div>
                <div class="document-status">
                    <span class="status-badge ${doc.processing_status}">
                        ${doc.processing_status}
                    </span>
                    <div class="document-actions">
                        ${doc.processed ? `<button class="btn-icon" onclick="event.stopPropagation(); viewInsights(${doc.id})" title="View Insights">
                            <i class="fas fa-eye"></i>
                        </button>` : ''}
                        ${!doc.processed && doc.processing_status === 'pending' ? `<button class="btn-icon" onclick="event.stopPropagation(); processDocument(${doc.id})" title="Process Document">
                            <i class="fas fa-play"></i>
                        </button>` : ''}
                        <button class="btn-icon danger" onclick="event.stopPropagation(); deleteDocument(${doc.id})" title="Delete Document">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRecentDocuments() {
        const container = document.getElementById('recent-documents-list');
        if (!container) return;

        const recentDocs = this.documents
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);

        if (recentDocs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No recent documents</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentDocs.map(doc => `
            <div class="document-item" onclick="viewDocument(${doc.id})">
                <div class="document-info">
                    <div class="document-icon">
                        <i class="fas ${this.getFileIcon(doc.content_type)}"></i>
                    </div>
                    <div class="document-details">
                        <h3>${doc.original_filename}</h3>
                        <p>${this.formatDate(doc.created_at)}</p>
                    </div>
                </div>
                <div class="document-status">
                    <span class="status-badge ${doc.processing_status}">
                        ${doc.processing_status}
                    </span>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalDocs = this.documents.length;
        const processedDocs = this.documents.filter(doc => doc.processed).length;
        const pendingDocs = this.documents.filter(doc => !doc.processed).length;

        const totalEl = document.getElementById('total-documents');
        const processedEl = document.getElementById('processed-documents');
        const pendingEl = document.getElementById('pending-documents');

        if (totalEl) totalEl.textContent = totalDocs;
        if (processedEl) processedEl.textContent = processedDocs;
        if (pendingEl) pendingEl.textContent = pendingDocs;
    }

    getFileIcon(contentType) {
        const iconMap = {
            'application/pdf': 'fa-file-pdf',
            'text/plain': 'fa-file-alt',
            'application/msword': 'fa-file-word',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word'
        };
        return iconMap[contentType] || 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    async deleteDocument(id) {
        if (!confirm('Are you sure you want to delete this document?')) {
            return;
        }

        try {
            await api.deleteDocument(id);
            showToast('Document deleted successfully', 'success');
            await this.loadDocuments();
        } catch (error) {
            showToast('Failed to delete document', 'error');
            console.error('Delete document error:', error);
        }
    }

    async processDocument(id) {
        try {
            await api.processDocument(id);
            showToast('Document processing started', 'info');
            
            // Reload documents to update status
            setTimeout(() => {
                this.loadDocuments();
            }, 1000);
            
        } catch (error) {
            showToast('Failed to start processing', 'error');
            console.error('Process document error:', error);
        }
    }

    async viewInsights(id) {
        try {
            const insights = await api.getDocumentInsights(id);
            const document = this.documents.find(doc => doc.id === id);
            
            this.showInsightsModal(document, insights);
            
        } catch (error) {
            showToast('Failed to load insights', 'error');
            console.error('Load insights error:', error);
        }
    }

    showInsightsModal(document, insights) {
        const modal = document.getElementById('document-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = `Insights: ${document.original_filename}`;
        
        body.innerHTML = `
            <div class="insight-section">
                <h3><i class="fas fa-file-alt"></i> Summary</h3>
                <div class="insight-content">
                    ${insights.summary}
                </div>
            </div>

            <div class="insight-section">
                <h3><i class="fas fa-list"></i> Key Points</h3>
                <div class="insight-content">
                    <ul class="key-points">
                        ${insights.key_points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="insight-section">
                <h3><i class="fas fa-tags"></i> Named Entities</h3>
                <div class="insight-content">
                    <div class="entities">
                        ${insights.entities.map(entity => `<span class="entity-tag">${entity}</span>`).join('')}
                    </div>
                </div>
            </div>

            <div class="insight-section">
                <h3><i class="fas fa-heart"></i> Sentiment Analysis</h3>
                <div class="insight-content">
                    <span class="sentiment ${insights.sentiment}">
                        <i class="fas ${this.getSentimentIcon(insights.sentiment)}"></i>
                        ${insights.sentiment.charAt(0).toUpperCase() + insights.sentiment.slice(1)}
                    </span>
                </div>
            </div>

            <div class="insight-section">
                <h3><i class="fas fa-chart-bar"></i> Statistics</h3>
                <div class="insight-content">
                    <p><strong>Word Count:</strong> ${insights.word_count.toLocaleString()}</p>
                    <p><strong>File Size:</strong> ${this.formatFileSize(document.file_size)}</p>
                    <p><strong>Processed:</strong> ${this.formatDate(document.updated_at || document.created_at)}</p>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    getSentimentIcon(sentiment) {
        const iconMap = {
            'positive': 'fa-smile',
            'negative': 'fa-frown',
            'neutral': 'fa-meh'
        };
        return iconMap[sentiment] || 'fa-meh';
    }
}

// Global functions for onclick handlers
async function viewDocument(id) {
    await documentManager.viewInsights(id);
}

async function viewInsights(id) {
    await documentManager.viewInsights(id);
}

async function deleteDocument(id) {
    await documentManager.deleteDocument(id);
}

async function processDocument(id) {
    await documentManager.processDocument(id);
}

function closeModal() {
    document.getElementById('document-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('document-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize document manager
const documentManager = new DocumentManager();
