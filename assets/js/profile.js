// Profile page functionality - Enhanced Version

// Global state management
const ProfileState = {
    isLoading: false,
    currentUser: null,
    analyses: [],
    charts: {},
    preferences: {}
};

// Enhanced initialization with loading states
document.addEventListener('DOMContentLoaded', function() {
    showPageLoader();
    
    // Wait for ParkinsonDetect to be available
    waitForParkinsonDetect(() => {
        setTimeout(() => {
            initializeProfilePage();
        }, 500); // Small delay for smooth loading
    });
});

// Wait for ParkinsonDetect to be available
function waitForParkinsonDetect(callback) {
    if (typeof window.ParkinsonDetect !== 'undefined' && window.ParkinsonDetect.isLoggedIn) {
        callback();
    } else {
        console.log('Waiting for ParkinsonDetect to be available...');
        setTimeout(() => waitForParkinsonDetect(callback), 100);
    }
}

function initializeProfilePage() {
    console.log('Initializing profile page...');
    
    // Check if user is logged in
    if (!ParkinsonDetect.isLoggedIn()) {
        console.log('User not logged in, redirecting to login page');
        hidePageLoader();
        window.location.href = 'login.html';
        return;
    }

    console.log('Profile page: User is logged in, loading profile data...');

    // Load all profile data
    Promise.all([
        loadUserProfile(),
        loadUserStatistics(),
        loadAnalysisHistory()
    ]).then(() => {
        console.log('Profile page: All data loaded successfully');
        
        // Only call functions that exist
        try {
            if (typeof initializeCharts === 'function') initializeCharts();
            if (typeof initializeTooltips === 'function') initializeTooltips();
            if (typeof initializeProgressRings === 'function') initializeProgressRings();
            if (typeof addFloatingActionButton === 'function') addFloatingActionButton();
            if (typeof showInsightsPanel === 'function') showInsightsPanel();
            
            // Initialize scroll animations
            if (typeof initScrollAnimations === 'function') {
                initScrollAnimations();
            }
        } catch (error) {
            console.error('Error initializing profile components:', error);
        }
        
        // Hide loader after everything is loaded
        hidePageLoader();
    }).catch(error => {
        console.error('Error initializing profile:', error);
        hidePageLoader(); // Make sure to hide loader on error
        showNotification('Error loading profile data', 'error');
        
        // If user data issue, redirect to login
        if (error.message && error.message.includes('No user logged in')) {
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }
    });
}

// Enhanced page loader
function showPageLoader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
        preloader.style.opacity = '1';
    }
}

function hidePageLoader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

function loadUserProfile() {
    return new Promise((resolve, reject) => {
        try {
            console.log('Loading user profile...');
            
            // Check if ParkinsonDetect.getCurrentUser exists
            if (typeof ParkinsonDetect.getCurrentUser !== 'function') {
                console.error('ParkinsonDetect.getCurrentUser is not available');
                return reject(new Error('Authentication service not available'));
            }
            
            const currentUser = ParkinsonDetect.getCurrentUser();
            console.log('Current user from ParkinsonDetect:', currentUser);
            
            if (!currentUser) {
                console.error('No current user found');
                return reject(new Error('No user logged in'));
            }

            ProfileState.currentUser = currentUser;
            console.log('Profile state updated with user:', currentUser.name);

            // Update profile information with animation
            updateElementWithAnimation('profileName', currentUser.name);
            updateElementWithAnimation('profileEmail', currentUser.email);
            
            const initials = getInitials(currentUser.name);
            updateElementWithAnimation('profileAvatarInitials', initials);
            
            // Calculate and display age with validation
            const birthDate = new Date(currentUser.dateOfBirth);
            if (isValidDate(birthDate)) {
                const age = calculateAge(birthDate);
                updateElementWithAnimation('userAge', age);
            } else {
                updateElementWithAnimation('userAge', 'N/A');
            }
            
            // Member since with fallback
            const memberSince = formatDate(currentUser.registrationDate || currentUser.joinDate || currentUser.dateOfBirth || new Date());
            updateElementWithAnimation('memberSince', memberSince);
            
            console.log('User profile loaded successfully');
            resolve();
        } catch (error) {
            console.error('Error loading user profile:', error);
            reject(error);
        }
    });
}

// Enhanced statistics loading with loading states
function loadUserStatistics() {
    return new Promise((resolve) => {
        try {
            // Show loading state
            showStatsLoading();
            
            // Check if getAnalysisHistory method exists
            let analyses = [];
            if (typeof ParkinsonDetect.getAnalysisHistory === 'function') {
                analyses = ParkinsonDetect.getAnalysisHistory();
            } else {
                console.warn('ParkinsonDetect.getAnalysisHistory not available, using empty array');
            }
            
            ProfileState.analyses = analyses;
            
            const stats = calculateStatistics(analyses);
            
            // Update statistics with smooth animations
            setTimeout(() => {
                animateCounter('totalAnalyses', stats.totalAnalyses, 0, 1000);
                animateCounter('averageScore', stats.averageScore, 0, 1000, 3);
                animateCounter('healthyCount', stats.healthyCount, 0, 1200);
                animateCounter('riskCount', stats.riskCount, 0, 1400);
                
                // Update enhanced dashboard statistics
                updateDashboardStatistics(analyses, stats);
                
                hideStatsLoading();
                resolve();
            }, 300);
        } catch (error) {
            console.error('Error loading statistics:', error);
            hideStatsLoading();
            resolve(); // Don't reject to allow other operations to continue
        }
    });
}

// Helper function to calculate statistics
function calculateStatistics(analyses) {
    const totalAnalyses = analyses.length;
    const healthyCount = analyses.filter(a => a.result === 'Sain' || a.result === 'healthy').length;
    const riskCount = analyses.filter(a => a.result === 'Risque de Parkinson' || a.result === 'at-risk').length;
    
    let averageScore = 0;
    if (totalAnalyses > 0) {
        const totalScore = analyses.reduce((sum, a) => sum + parseFloat(a.mseScore || a.score || 0), 0);
        averageScore = totalScore / totalAnalyses;
    }
    
    return {
        totalAnalyses,
        averageScore,
        healthyCount,
        riskCount
    };
}

// Enhanced dashboard statistics update
function updateDashboardStatistics(analyses, stats) {
    try {
        // Update percentages
        const healthyPercentage = stats.totalAnalyses > 0 ? Math.round((stats.healthyCount / stats.totalAnalyses) * 100) : 0;
        const riskPercentage = stats.totalAnalyses > 0 ? Math.round((stats.riskCount / stats.totalAnalyses) * 100) : 0;
        
        updateElementWithAnimation('healthyPercentage', healthyPercentage + '%');
        updateElementWithAnimation('riskPercentage', riskPercentage + '%');
        
        // Update trends
        updateTrends(analyses);
        
        // Update chart insights
        updateChartInsights(analyses);
    } catch (error) {
        console.error('Error updating dashboard statistics:', error);
    }
}

// Update trends for stats cards
function updateTrends(analyses) {
    try {
        if (analyses.length === 0) return;
        
        // Calculate monthly trend
        const now = new Date();
        const thisMonth = analyses.filter(a => {
            const date = new Date(a.timestamp);
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;
        
        updateElementWithAnimation('monthlyTrend', `+${thisMonth} ce mois`);
        
        // Calculate score trend
        if (analyses.length >= 3) {
            const recentAnalyses = analyses.slice(-3);
            const previousAnalyses = analyses.slice(-6, -3);
            
            if (previousAnalyses.length > 0) {
                const recentAvg = recentAnalyses.reduce((sum, a) => sum + parseFloat(a.mseScore || a.score || 0), 0) / recentAnalyses.length;
                const previousAvg = previousAnalyses.reduce((sum, a) => sum + parseFloat(a.mseScore || a.score || 0), 0) / previousAnalyses.length;
                
                let trendText = 'Stable';
                if (recentAvg < previousAvg) {
                    trendText = 'En amélioration';
                } else if (recentAvg > previousAvg) {
                    trendText = 'Variable';
                }
                
                updateElementWithAnimation('scoreTrend', trendText);
            }
        }
    } catch (error) {
        console.error('Error updating trends:', error);
    }
}

// Update chart insights
function updateChartInsights(analyses) {
    try {
        if (analyses.length === 0) return;
        
        // Sort by date to get the latest
        const sortedAnalyses = [...analyses].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const lastAnalysis = sortedAnalyses[0];
        const lowestScore = Math.min(...analyses.map(a => parseFloat(a.mseScore || a.score || 0))).toFixed(3);
        
        updateElementWithAnimation('lastAnalysisDate', formatDate(lastAnalysis.timestamp));
        updateElementWithAnimation('lowestScore', lowestScore);
    } catch (error) {
        console.error('Error updating chart insights:', error);
    }
}

function loadAnalysisHistory() {
    return new Promise((resolve) => {
        try {
            // Check if getAnalysisHistory method exists
            let analyses = [];
            if (typeof ParkinsonDetect.getAnalysisHistory === 'function') {
                analyses = ParkinsonDetect.getAnalysisHistory();
            } else {
                console.warn('ParkinsonDetect.getAnalysisHistory not available, using empty array');
            }
            
            const tableBody = document.querySelector('#analysisTable tbody');
            const emptyState = document.getElementById('emptyState');

            if (analyses.length === 0) {
                if (tableBody) tableBody.style.display = 'none';
                if (emptyState) emptyState.style.display = 'block';
                resolve();
                return;
            }

            if (tableBody) tableBody.style.display = '';
            if (emptyState) emptyState.style.display = 'none';

            // Sort analyses by date (newest first)
            analyses.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Enhanced table rows with better status badges
            if (tableBody) {
                tableBody.innerHTML = analyses.map((analysis, index) => {
                    const isHealthy = analysis.result === 'Sain' || analysis.result === 'healthy';
                    const statusClass = isHealthy ? 'healthy' : 'risk';
                    const statusIcon = isHealthy ? '✅' : '⚠️';
                    const statusText = isHealthy ? 'Sain' : 'À risque';
                    
                    return `
                        <tr data-analysis-id="${analysis.id}" style="animation-delay: ${index * 0.1}s">
                            <td data-tooltip="${formatDateTime(analysis.timestamp)}">
                                ${formatDateTime(analysis.timestamp)}
                            </td>
                            <td data-tooltip="${analysis.fileName}">
                                <span class="file-name">${truncateFileName(analysis.fileName, 20)}</span>
                            </td>
                            <td data-tooltip="MSE Reconstruction Score">
                                <span class="score-value">${parseFloat(analysis.mseScore || analysis.score || 0).toFixed(3)}</span>
                            </td>
                            <td>
                                <span class="status-badge ${statusClass}" data-tooltip="${statusText}">
                                    ${statusIcon} ${statusText}
                                </span>
                            </td>
                            <td data-tooltip="Analysis windows">
                                ${analysis.totalWindows || analysis.windows || '-'}
                            </td>
                            <td>
                                <button class="btn btn-sm btn-outline" onclick="viewAnalysisDetails('${analysis.id}')" title="Voir les détails">
                                    👁️
                                </button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
            
            // Add row click handlers for better UX
            addTableRowHandlers();
            resolve();
        } catch (error) {
            console.error('Error loading analysis history:', error);
            resolve();
        }
    });
}

function initializeCharts() {
    try {
        // Check if getAnalysisHistory method exists
        let analyses = [];
        if (typeof ParkinsonDetect.getAnalysisHistory === 'function') {
            analyses = ParkinsonDetect.getAnalysisHistory();
        }
        
        if (analyses.length === 0) {
            // Show empty chart state
            showEmptyChartState();
            return;
        }

        // Sort analyses by date
        analyses.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Initialize all charts
        initializeTrendChart(analyses);
        initializeDistributionChart(analyses);
        initializeMonthlyChart(analyses);
    } catch (error) {
        console.error('Error initializing charts:', error);
        showEmptyChartState();
    }
}

function initializeTrendChart(analyses) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const chartData = {
        labels: analyses.map(a => formatDate(a.timestamp)),
        datasets: [{
            label: 'Score MSE',
            data: analyses.map(a => parseFloat(a.mseScore || a.score || 0)),
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };

    new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Score MSE'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

function initializeDistributionChart(analyses) {
    const canvas = document.getElementById('distributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Use consistent result checking like elsewhere in the code
    const healthyCount = analyses.filter(a => a.result === 'Sain' || a.result === 'healthy').length;
    const riskCount = analyses.filter(a => a.result === 'Risque de Parkinson' || a.result === 'at-risk').length;

    const chartData = {
        labels: ['Résultats sains', 'Résultats à risque'],
        datasets: [{
            data: [healthyCount, riskCount],
            backgroundColor: ['#27ae60', '#e74c3c'],
            borderWidth: 0
        }]
    };

    new Chart(ctx, {
        type: 'doughnut',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function showEmptyChartState() {
    const chartContainers = document.querySelectorAll('.chart-wrapper');
    chartContainers.forEach(container => {
        container.innerHTML = `
            <div class="empty-chart-state">
                <div class="empty-chart-icon">📊</div>
                <p>Aucune donnée à afficher</p>
                <small>Effectuez des analyses pour voir vos graphiques</small>
            </div>
        `;
    });
}

function editProfile() {
    // Simple implementation - could be expanded to a modal
    const currentUser = ParkinsonDetect.getCurrentUser();
    
    const newName = prompt('Nouveau nom:', currentUser.name);
    if (newName && newName.trim() !== currentUser.name) {
        ParkinsonDetect.updateUserProfile({ name: newName.trim() });
        loadUserProfile();
        showNotification('Profil mis à jour!', 'success');
    }
}

function editAvatar() {
    showNotification('Fonctionnalité de modification d\'avatar bientôt disponible!', 'info');
}

function exportProfileData() {
    const userData = ParkinsonDetect.exportUserData();
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `parkinson-detect-profile-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Données exportées!', 'success');
}

function exportAnalysisHistory() {
    const analyses = ParkinsonDetect.getAnalysisHistory();
    
    if (analyses.length === 0) {
        showNotification('Aucune analyse à exporter', 'info');
        return;
    }

    // Convert to CSV
    const headers = ['Date', 'Fichier', 'Score MSE', 'Résultat', 'Fenêtres'];
    const csvContent = [
        headers.join(','),
        ...analyses.map(a => [
            formatDateTime(a.timestamp),
            a.fileName,
            a.mseScore,
            a.result,
            a.totalWindows || ''
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analyses-historique-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('Historique exporté!', 'success');
}

function clearAnalysisHistory() {
    if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique d\'analyses? Cette action est irréversible.')) {
        ParkinsonDetect.clearAnalysisHistory();
        loadUserStatistics();
        loadAnalysisHistory();
        showEmptyChartState();
        showNotification('Historique effacé', 'success');
    }
}

function deleteAccount() {
    const confirmed = confirm('Êtes-vous absolument sûr de vouloir supprimer votre compte? Cette action est irréversible et supprimera toutes vos données.');
    
    if (confirmed) {
        const password = prompt('Veuillez entrer votre mot de passe pour confirmer:');
        if (password) {
            const currentUser = ParkinsonDetect.getCurrentUser();
            if (ParkinsonDetect.verifyPassword(password, currentUser.passwordHash)) {
                ParkinsonDetect.deleteUserAccount();
                alert('Votre compte a été supprimé.');
                window.location.href = 'index.html';
            } else {
                showNotification('Mot de passe incorrect', 'error');
            }
        }
    }
}

function updateChartPeriod(period) {
    // Update active button
    document.querySelectorAll('.chart-controls .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Filter analyses based on period
    let analyses = ParkinsonDetect.getAnalysisHistory();
    const now = new Date();
    
    if (period === '7d') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        analyses = analyses.filter(a => new Date(a.timestamp) >= sevenDaysAgo);
    } else if (period === '30d') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        analyses = analyses.filter(a => new Date(a.timestamp) >= thirtyDaysAgo);
    }

    // Reinitialize charts with filtered data
    if (analyses.length > 0) {
        initializeTrendChart(analyses);
    } else {
        showEmptyChartState();
    }
}

// Utility functions
function getInitials(name) {
    return name.split(' ')
        .map(part => part.charAt(0).toUpperCase())
        .slice(0, 2)
        .join('');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR') + ' ' + date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

// Enhanced notification system
function showNotification(message, type = 'info', duration = 5000) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(450px)';
            setTimeout(() => notification.remove(), 400);
        }
    }, duration);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}

function getNotificationIcon(type) {
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return icons[type] || icons.info;
}

// Enhanced animation helpers
function updateElementWithAnimation(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.style.opacity = '0.5';
    element.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
        element.textContent = value;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 150);
}

function animateCounter(elementId, targetValue, startValue = 0, duration = 1000, decimals = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startTime = performance.now();
    const range = targetValue - startValue;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (range * easeOutQuart);
        
        element.textContent = currentValue.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Loading states
function showStatsLoading() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.classList.add('loading');
        const content = card.querySelector('.stat-content h3');
        if (content) {
            content.innerHTML = '<div class="loading-skeleton" style="width: 60px; height: 30px;"></div>';
        }
    });
}

function hideStatsLoading() {
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
        card.classList.remove('loading');
    });
}

// Validation helpers
function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
}

function truncateFileName(fileName, maxLength = 30) {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4);
    
    return `${truncatedName}...${extension}`;
}

// Enhanced table interactions
function addTableRowHandlers() {
    const rows = document.querySelectorAll('#analysisTable tbody tr');
    rows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.target.closest('button')) return; // Don't trigger on button clicks
            
            // Highlight selected row
            rows.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
            
            // Show quick analysis preview
            const analysisId = this.dataset.analysisId;
            showAnalysisPreview(analysisId);
        });
    });
}

// Quick analysis preview
function showAnalysisPreview(analysisId) {
    const analysis = ProfileState.analyses.find(a => a.id === analysisId);
    if (!analysis) return;
    
    const previewPanel = document.getElementById('analysisPreview') || createAnalysisPreviewPanel();
    const isHealthy = analysis.result === 'Sain' || analysis.result === 'healthy';
    
    previewPanel.innerHTML = `
        <div class="preview-header">
            <h4>Analysis Preview</h4>
            <button onclick="closeAnalysisPreview()" class="close-btn">×</button>
        </div>
        <div class="preview-content">
            <div class="preview-item">
                <label>File:</label>
                <span>${analysis.fileName}</span>
            </div>
            <div class="preview-item">
                <label>Date:</label>
                <span>${formatDateTime(analysis.timestamp)}</span>
            </div>
            <div class="preview-item">
                <label>Score:</label>
                <span class="score-highlight">${parseFloat(analysis.mseScore || analysis.score || 0).toFixed(3)}</span>
            </div>
            <div class="preview-item">
                <label>Result:</label>
                <span class="status-badge ${isHealthy ? 'healthy' : 'risk'}">
                    ${isHealthy ? '✅ Healthy' : '⚠️ At Risk'}
                </span>
            </div>
        </div>
    `;
    
    previewPanel.style.display = 'block';
    setTimeout(() => previewPanel.classList.add('show'), 10);
}

function createAnalysisPreviewPanel() {
    const panel = document.createElement('div');
    panel.id = 'analysisPreview';
    panel.className = 'analysis-preview-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        right: 30px;
        transform: translateY(-50%) translateX(400px);
        width: 350px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        z-index: 1000;
        display: none;
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(panel);
    return panel;
}

function closeAnalysisPreview() {
    const panel = document.getElementById('analysisPreview');
    if (panel) {
        panel.classList.remove('show');
        setTimeout(() => panel.style.display = 'none', 300);
    }
    
    // Remove selected state from table rows
    document.querySelectorAll('#analysisTable tbody tr').forEach(row => {
        row.classList.remove('selected');
    });
}

// Initialize tooltips - Safe implementation
function initializeTooltips() {
    try {
        // Tooltips are handled by CSS, but we can add dynamic content here if needed
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            if (element && element.style) {
                element.style.transition = 'all 0.3s ease';
            }
        });
    } catch (error) {
        console.error('Error initializing tooltips:', error);
    }
}

// Initialize progress rings for statistics - Safe implementation
function initializeProgressRings() {
    try {
        // Add progress rings to stat cards for visual enhancement
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            if (card && !card.querySelector('.progress-ring')) {
                const progressRing = document.createElement('div');
                progressRing.className = 'progress-ring';
                progressRing.style.cssText = '--progress: 0deg';
                
                const statIcon = card.querySelector('.stat-icon');
                if (statIcon) {
                    statIcon.appendChild(progressRing);
                }
            }
        });
    } catch (error) {
        console.error('Error initializing progress rings:', error);
    }
}

// Add floating action button - Safe implementation
function addFloatingActionButton() {
    try {
        if (document.querySelector('.fab')) return; // Already exists
        
        const fab = document.createElement('button');
        fab.className = 'fab';
        fab.innerHTML = '↑';
        fab.title = 'Scroll to top';
        fab.onclick = () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        };
        
        document.body.appendChild(fab);
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                fab.style.opacity = '1';
                fab.style.pointerEvents = 'auto';
            } else {
                fab.style.opacity = '0';
                fab.style.pointerEvents = 'none';
            }
        });
    } catch (error) {
        console.error('Error adding floating action button:', error);
    }
}

// Show data insights panel - Safe implementation
function showInsightsPanel() {
    try {
        const analyses = ProfileState.analyses;
        if (!analyses || analyses.length === 0) return;
        
        const insights = generateInsights(analyses);
        
        // Find or create insights panel
        let insightsPanel = document.querySelector('.insights-panel');
        if (!insightsPanel) {
            insightsPanel = document.createElement('div');
            insightsPanel.className = 'insights-panel';
            
            // Insert after stats section
            const statsSection = document.querySelector('.stats-section');
            if (statsSection && statsSection.parentNode) {
                statsSection.parentNode.insertBefore(insightsPanel, statsSection.nextSibling);
            }
        }
        
        if (insightsPanel) {
            insightsPanel.innerHTML = `
                <div class="insights-title">AI Insights</div>
                <div class="insights-content">${insights}</div>
            `;
        }
    } catch (error) {
        console.error('Error showing insights panel:', error);
    }
}

function generateInsights(analyses) {
    if (analyses.length === 0) return 'No analysis data available for insights.';
    
    const stats = calculateStatistics(analyses);
    const recentAnalyses = analyses.slice(0, 5);
    const trend = calculateTrend(recentAnalyses);
    
    let insights = [];
    
    // Performance insights
    if (stats.averageScore < 1.0) {
        insights.push('✅ Your motion patterns show consistently healthy characteristics.');
    } else if (stats.averageScore > 1.5) {
        insights.push('⚠️ Your recent analyses show patterns that may require attention.');
    } else {
        insights.push('ℹ️ Your motion patterns are within normal variation ranges.');
    }
    
    // Trend insights
    if (trend === 'improving') {
        insights.push('📈 Your recent motion patterns show improvement over time.');
    } else if (trend === 'declining') {
        insights.push('📉 Consider consulting with a healthcare professional about recent changes.');
    }
    
    // Frequency insights
    if (stats.totalAnalyses >= 10) {
        insights.push('🏆 Excellent commitment to regular monitoring!');
    } else if (stats.totalAnalyses >= 5) {
        insights.push('💪 Good progress with regular analysis tracking.');
    }
    
    return insights.join('<br><br>');
}

function calculateTrend(recentAnalyses) {
    if (recentAnalyses.length < 3) return 'insufficient-data';
    
    const scores = recentAnalyses.map(a => parseFloat(a.mseScore || a.score || 0));
    const firstHalf = scores.slice(0, Math.ceil(scores.length / 2));
    const secondHalf = scores.slice(Math.ceil(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    if (secondAvg < firstAvg * 0.9) return 'improving';
    if (secondAvg > firstAvg * 1.1) return 'declining';
    return 'stable';
}

// Monthly activity chart
function initializeMonthlyChart(analyses) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Group analyses by month
    const monthlyData = {};
    analyses.forEach(analysis => {
        const date = new Date(analysis.timestamp);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(month => monthlyData[month]);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(month => {
                const [year, monthNum] = month.split('-');
                const date = new Date(year, monthNum - 1);
                return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
            }),
            datasets: [{
                label: 'Analyses par mois',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: '#667eea',
                borderWidth: 1,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Nombre d\'analyses'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mois'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// View analysis details function
function viewAnalysisDetails(analysisId) {
    try {
        let analysis = null;
        if (typeof ParkinsonDetect.getAnalysisHistory === 'function') {
            analysis = ParkinsonDetect.getAnalysisHistory().find(a => a.id === analysisId);
        }
        
        if (analysis) {
            // Create a simple modal-like alert with better formatting
            const details = `
╔═══════════════════════════════════════════════════════════╗
║                     DÉTAILS DE L'ANALYSE                 ║
╠═══════════════════════════════════════════════════════════╣
║ Date: ${formatDateTime(analysis.timestamp)}                           
║ Fichier: ${analysis.fileName}                               
║ Score MSE: ${parseFloat(analysis.mseScore || analysis.score || 0).toFixed(3)}                           
║ Résultat: ${analysis.result}                               
║ Fenêtres analysées: ${analysis.totalWindows || analysis.windows || 'N/A'}                    
╚═══════════════════════════════════════════════════════════╝
            `;
            alert(details);
        } else {
            showNotification('Analyse non trouvée', 'error');
        }
    } catch (error) {
        console.error('Error viewing analysis details:', error);
        showNotification('Erreur lors de l\'affichage des détails', 'error');
    }
}

// Refresh profile function
function refreshProfile() {
    try {
        const btn = event.target.closest('button');
        if (!btn) return;
        
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span>⏳</span> Actualisation...';
        btn.disabled = true;

        // Simulate refresh delay
        setTimeout(() => {
            initializeProfilePage();
            btn.innerHTML = originalText;
            btn.disabled = false;
            showNotification('Profil actualisé!', 'success');
        }, 1000);
    } catch (error) {
        console.error('Error refreshing profile:', error);
        showNotification('Erreur lors de l\'actualisation', 'error');
    }
}
