// ParkinsonDetect - Main JavaScript Application
// Configuration
const API_CONFIG = {
    baseUrl: 'https://parkinsonapi.ewr.appspot.com',
    authToken: 'imsabbar777',
    endpoints: {
        predict: '/predict'
    }
};

// Application State
let appState = {
    currentUser: null,
    selectedFile: null,
    analysisHistory: [],
    isLoggedIn: false
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Show preloader for minimum 1.5 seconds
    setTimeout(() => {
        hidePreloader();
        initializeApp();
    }, 1500);
});

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }
}

function showPreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
        preloader.classList.remove('fade-out');
    }
}

function initializeApp() {
    // Load user session
    loadUserSession();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Load analysis history
    loadAnalysisHistory();
    
    // Initialize charts if on dashboard
    if (document.getElementById('dashboard-content')) {
        initializeCharts();
    }
}

// Event Listeners
function initializeEventListeners() {
    // Navigation with smooth scrolling
    document.addEventListener('click', handleNavigation);
    
    // Smooth scroll links
    document.querySelectorAll('.scroll-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active nav link
                updateActiveScrollLink(targetId);
                
                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Avatar dropdown
    const userAvatar = document.getElementById('userAvatar');
    const avatarDropdown = document.getElementById('avatarDropdown');
    
    if (userAvatar && avatarDropdown) {
        userAvatar.addEventListener('click', toggleAvatarDropdown);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!userAvatar.contains(event.target) && !avatarDropdown.contains(event.target)) {
                closeAvatarDropdown();
            }
        });
    }
    
    // File upload
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    // Upload area drag and drop
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        setupDragAndDrop(uploadArea);
    }
    
    // Forms
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const contactForm = document.getElementById('contactForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
    
    // Analysis button
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeData);
    }
}

// Navigation Functions
function handleNavigation(event) {
    const target = event.target;
    
    // Handle old nav-link with data-page (keep for backwards compatibility with modals)
    if (target.classList.contains('nav-link') && target.getAttribute('data-page')) {
        event.preventDefault();
        const page = target.getAttribute('data-page');
        
        // Only handle dashboard and profile links this way
        if (page === 'dashboard') {
            showDashboard();
        } else if (page === 'profile') {
            showProfile();
        }
    }
    
    // Smooth scrolling is handled by the scroll-link event listeners
}

function updateActiveScrollLink(targetId) {
    const navLinks = document.querySelectorAll('.scroll-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[href="${targetId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Functions for dashboard and profile (for logged-in users)
function showDashboard() {
    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }
    
    // For now, redirect to external dashboard or show modal
    alert('Tableau de bord - Fonctionnalité en développement');
    closeAvatarDropdown();
}

function showProfile() {
    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }
    
    // For now, redirect to external profile or show modal
    alert('Profil utilisateur - Fonctionnalité en développement');
    closeAvatarDropdown();
}

// Contact form handler
function handleContactForm(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const contactData = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
    };
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        alert('Merci pour votre message! Nous vous répondrons bientôt.');
        event.target.reset();
        
        // Reset button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Avatar Dropdown Functions
function toggleAvatarDropdown() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

function closeAvatarDropdown() {
    const dropdown = document.getElementById('avatarDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

function generateAvatarInitials(name) {
    return name.split(' ')
               .map(word => word.charAt(0))
               .join('')
               .toUpperCase()
               .substring(0, 2);
}

// Authentication
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    // Validate credentials
    if (validateLogin(credentials)) {
        // Simulate successful login
        appState.currentUser = {
            id: 'user_' + Date.now(),
            name: 'Dr. Sarah Johnson',
            email: credentials.email,
            joinDate: new Date().toISOString()
        };
        
        appState.isLoggedIn = true;
        saveUserSession();
        closeModal('loginModal');
        navigateToPage('dashboard');
        showNotification('Connexion réussie!', 'success');
    } else {
        showNotification('Identifiants invalides. Veuillez réessayer.', 'error');
    }
}

function handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        dateOfBirth: formData.get('dateOfBirth'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        terms: formData.get('terms')
    };
    
    // Validate form
    if (validateSignup(userData)) {
        // Simulate user registration
        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
            joinDate: new Date().toISOString(),
            analyses: []
        };
        
        // Save user data
        saveUserData(newUser);
        
        appState.currentUser = newUser;
        appState.isLoggedIn = true;
        saveUserSession();
        
        closeModal('signupModal');
        navigateToPage('dashboard');
        showNotification('Compte créé avec succès!', 'success');
    }
}

function validateLogin(credentials) {
    if (!credentials.email || !credentials.password) {
        showNotification('Veuillez remplir tous les champs.', 'error');
        return false;
    }
    
    if (!isValidEmail(credentials.email)) {
        showNotification('Veuillez entrer une adresse e-mail valide.', 'error');
        return false;
    }
    
    if (credentials.password.length < 6) {
        showNotification('Le mot de passe doit contenir au moins 6 caractères.', 'error');
        return false;
    }
    
    // In a real app, this would check against a database
    return true;
}

function validateSignup(userData) {
    // Check required fields
    if (!userData.name || !userData.email || !userData.password || !userData.dateOfBirth) {
        showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
        return false;
    }
    
    // Name validation
    if (userData.name.trim().length < 2) {
        showNotification('Le nom doit contenir au moins 2 caractères.', 'error');
        return false;
    }
    
    // Email validation
    if (!isValidEmail(userData.email)) {
        showNotification('Veuillez entrer une adresse e-mail valide.', 'error');
        return false;
    }
    
    // Age validation (must be at least 18)
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    if (age < 18) {
        showNotification('Vous devez être âgé d\'au moins 18 ans pour vous inscrire.', 'error');
        return false;
    }
    
    if (age > 120) {
        showNotification('Veuillez vérifier votre date de naissance.', 'error');
        return false;
    }
    
    // Password validation
    if (userData.password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères.', 'error');
        return false;
    }
    
    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        showNotification('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.', 'error');
        return false;
    }
    
    // Confirm password
    if (userData.password !== userData.confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas.', 'error');
        return false;
    }
    
    // Terms acceptance
    if (!userData.terms) {
        showNotification('Veuillez accepter les conditions d\'utilisation.', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    // Enhanced email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
}

function logout() {
    appState.currentUser = null;
    appState.isLoggedIn = false;
    localStorage.removeItem('userSession');
    
    // Close avatar dropdown if open
    closeAvatarDropdown();
    
    // Update UI for logged out state
    updateUIForLoggedInUser();
    
    // Navigate to home page
    navigateToPage('home');
    
    showNotification('Déconnexion réussie.', 'success');
}

// Session Management
function saveUserSession() {
    const sessionData = {
        user: appState.currentUser,
        isLoggedIn: appState.isLoggedIn,
        timestamp: Date.now()
    };
    localStorage.setItem('userSession', JSON.stringify(sessionData));
}

function loadUserSession() {
    const sessionData = localStorage.getItem('userSession');
    if (sessionData) {
        const parsed = JSON.parse(sessionData);
        
        // Check if session is still valid (24 hours)
        const isExpired = Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000;
        
        if (!isExpired) {
            appState.currentUser = parsed.user;
            appState.isLoggedIn = parsed.isLoggedIn;
            updateUIForLoggedInUser();
        } else {
            localStorage.removeItem('userSession');
        }
    }
}

function updateUIForLoggedInUser() {
    if (appState.isLoggedIn && appState.currentUser) {
        // Hide login/signup buttons
        const headerActions = document.getElementById('headerActions');
        if (headerActions) {
            headerActions.style.display = 'none';
        }
        
        // Show avatar dropdown
        const avatarContainer = document.getElementById('userAvatarContainer');
        if (avatarContainer) {
            avatarContainer.style.display = 'block';
        }
        
        // Update avatar initials
        const avatarInitials = document.getElementById('avatarInitials');
        if (avatarInitials) {
            avatarInitials.textContent = generateAvatarInitials(appState.currentUser.name);
        }
        
        // Update dropdown user info
        const dropdownUserName = document.getElementById('dropdownUserName');
        const dropdownUserEmail = document.getElementById('dropdownUserEmail');
        
        if (dropdownUserName) {
            dropdownUserName.textContent = appState.currentUser.name;
        }
        
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = appState.currentUser.email;
        }
    } else {
        // Show login/signup buttons
        const headerActions = document.getElementById('headerActions');
        if (headerActions) {
            headerActions.style.display = 'flex';
        }
        
        // Hide avatar dropdown
        const avatarContainer = document.getElementById('userAvatarContainer');
        if (avatarContainer) {
            avatarContainer.style.display = 'none';
        }
    }
}

// File Handling
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.zip')) {
        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            showNotification('File size must be less than 50MB.', 'error');
            return;
        }
        
        appState.selectedFile = file;
        updateUploadUI(file);
        document.getElementById('analyzeBtn').disabled = false;
    } else {
        showNotification('Please select a valid ZIP file containing sensor data.', 'error');
    }
}

function updateUploadUI(file) {
    const uploadText = document.querySelector('.upload-text');
    const uploadSubtext = document.querySelector('.upload-subtext');
    const uploadArea = document.querySelector('.upload-area');
    
    if (uploadText && uploadSubtext && uploadArea) {
        uploadText.textContent = file.name;
        uploadSubtext.textContent = `File size: ${(file.size / 1024 / 1024).toFixed(2)} MB`;
        uploadArea.style.borderColor = '#27ae60';
        uploadArea.style.background = 'linear-gradient(135deg, #d4edda, #c3e6cb)';
    }
}

function setupDragAndDrop(uploadArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('dragover');
        }, false);
    });

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.name.endsWith('.zip')) {
                if (file.size <= 50 * 1024 * 1024) {
                    appState.selectedFile = file;
                    updateUploadUI(file);
                    document.getElementById('analyzeBtn').disabled = false;
                } else {
                    showNotification('File size must be less than 50MB.', 'error');
                }
            } else {
                showNotification('Please select a valid ZIP file containing sensor data.', 'error');
            }
        }
    }
}

// Analysis Functions
async function analyzeData() {
    if (!appState.selectedFile) {
        showNotification('Please select a file first.', 'error');
        return;
    }

    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }

    // Show loading
    showLoading(true);
    disableAnalyzeButton(true);

    const formData = new FormData();
    formData.append('file', appState.selectedFile);

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.predict}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_CONFIG.authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        displayResults(result);
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Fallback to mock data for demo purposes
        showNotification('Using demo data for analysis...', 'info');
        const mockResult = generateMockResult();
        displayResults(mockResult);
    } finally {
        showLoading(false);
        disableAnalyzeButton(false);
    }
}

function generateMockResult() {
    return {
        score: 0.09340519458055496,
        threshold: 1.3764445960521698,
        windows: Math.floor(Math.random() * 5) + 2,
        label: Math.random() > 0.3 ? "Sain" : "Parkinson"
    };
}

function displayResults(data) {
    const resultCard = document.getElementById('resultCard');
    const resultLabel = document.getElementById('resultLabel');
    const scoreValue = document.getElementById('scoreValue');
    const windowsCount = document.getElementById('windowsCount');
    const thresholdValue = document.getElementById('thresholdValue');

    // Update result values
    if (scoreValue) scoreValue.textContent = data.score.toFixed(6);
    if (windowsCount) windowsCount.textContent = data.windows;
    if (thresholdValue) thresholdValue.textContent = data.threshold.toFixed(3);

    // Update result label and styling
    if (resultLabel) {
        if (data.label === "Sain" || data.label === "Healthy") {
            resultLabel.textContent = "Healthy Motion Patterns";
            resultLabel.className = "result-score score-healthy";
        } else {
            resultLabel.textContent = "Abnormal Patterns Detected";
            resultLabel.className = "result-score score-risk";
        }
    }

    // Show results
    if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth' });
    }
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

function disableAnalyzeButton(disable) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = disable;
        analyzeBtn.textContent = disable ? 'Analyzing...' : 'Analyze Motion Data';
    }
}

// Results Management
function saveResults() {
    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }

    const scoreElement = document.getElementById('scoreValue');
    const labelElement = document.getElementById('resultLabel');
    const windowsElement = document.getElementById('windowsCount');
    const thresholdElement = document.getElementById('thresholdValue');

    if (!scoreElement || !labelElement) {
        showNotification('No results to save.', 'error');
        return;
    }

    const resultData = {
        id: 'analysis_' + Date.now(),
        timestamp: new Date().toISOString(),
        fileName: appState.selectedFile ? appState.selectedFile.name : 'Unknown',
        score: parseFloat(scoreElement.textContent),
        label: labelElement.textContent,
        windows: parseInt(windowsElement ? windowsElement.textContent : '0'),
        threshold: parseFloat(thresholdElement ? thresholdElement.textContent : '0'),
        result: labelElement.textContent.includes('Healthy') ? 'healthy' : 'at-risk'
    };

    // Save to analysis history
    appState.analysisHistory.unshift(resultData);
    saveAnalysisHistory();
    
    // Update dashboard if visible
    updateDashboardStats();
    updateAnalysisTable();

    showNotification('Results saved to your profile!', 'success');
}

function downloadReport() {
    const scoreElement = document.getElementById('scoreValue');
    const labelElement = document.getElementById('resultLabel');
    const windowsElement = document.getElementById('windowsCount');
    const thresholdElement = document.getElementById('thresholdValue');

    if (!scoreElement || !labelElement) {
        showNotification('No results to download.', 'error');
        return;
    }

    const reportData = {
        patientId: appState.currentUser ? appState.currentUser.id : 'anonymous',
        patientName: appState.currentUser ? appState.currentUser.name : 'Anonymous User',
        analysisDate: new Date().toISOString(),
        fileName: appState.selectedFile ? appState.selectedFile.name : 'Unknown',
        score: scoreElement.textContent,
        result: labelElement.textContent,
        windows: windowsElement ? windowsElement.textContent : 'N/A',
        threshold: thresholdElement ? thresholdElement.textContent : 'N/A',
        methodology: 'Autoencoder-based anomaly detection',
        samplingRate: '20Hz',
        windowSize: '100 samples',
        disclaimer: 'This tool is for research and educational purposes only. Results should not be used as a substitute for professional medical advice.'
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `parkinson_analysis_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Data Management
function saveAnalysisHistory() {
    localStorage.setItem('analysisHistory', JSON.stringify(appState.analysisHistory));
}

function loadAnalysisHistory() {
    const historyData = localStorage.getItem('analysisHistory');
    if (historyData) {
        appState.analysisHistory = JSON.parse(historyData);
    }
}

function saveUserData(userData) {
    const usersData = JSON.parse(localStorage.getItem('usersData') || '[]');
    usersData.push(userData);
    localStorage.setItem('usersData', JSON.stringify(usersData));
}

// Dashboard Functions
function updateDashboardStats() {
    const history = appState.analysisHistory;
    
    // Calculate statistics
    const totalAnalyses = history.length;
    const averageScore = history.length > 0 ? 
        (history.reduce((sum, item) => sum + item.score, 0) / history.length).toFixed(3) : 
        '0.000';
    
    const healthyCount = history.filter(item => item.result === 'healthy').length;
    const riskCount = history.filter(item => item.result === 'at-risk').length;
    
    // Update UI elements
    updateStatElement('total-analyses', totalAnalyses);
    updateStatElement('average-score', averageScore);
    updateStatElement('healthy-count', healthyCount);
    updateStatElement('risk-count', riskCount);
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function updateAnalysisTable() {
    const tableBody = document.querySelector('#analysisTable tbody');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    
    appState.analysisHistory.slice(0, 10).forEach(analysis => {
        const row = createAnalysisTableRow(analysis);
        tableBody.appendChild(row);
    });
}

function createAnalysisTableRow(analysis) {
    const row = document.createElement('tr');
    
    const date = new Date(analysis.timestamp).toLocaleDateString();
    const statusClass = analysis.result === 'healthy' ? 'status-healthy' : 'status-risk';
    const statusText = analysis.result === 'healthy' ? 'Healthy' : 'At Risk';
    
    row.innerHTML = `
        <td>${date}</td>
        <td>${analysis.score.toFixed(3)}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>${analysis.windows}</td>
        <td>${analysis.fileName}</td>
        <td>
            <button onclick="viewAnalysisDetails('${analysis.id}')" class="btn btn-sm">
                View Details
            </button>
        </td>
    `;
    
    return row;
}

function viewAnalysisDetails(analysisId) {
    const analysis = appState.analysisHistory.find(a => a.id === analysisId);
    if (analysis) {
        // Show analysis details in a modal or navigate to details page
        showAnalysisDetailsModal(analysis);
    }
}

// Chart Initialization
function initializeCharts() {
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded. Charts will not be displayed.');
        return;
    }

    // Initialize trend chart
    initializeTrendChart();
    
    // Initialize distribution chart
    initializeDistributionChart();
}

function initializeTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const history = appState.analysisHistory.slice().reverse();
    const labels = history.map(item => new Date(item.timestamp).toLocaleDateString());
    const scores = history.map(item => item.score);
    const threshold = 1.376;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'MSE Score',
                data: scores,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Threshold',
                data: Array(labels.length).fill(threshold),
                borderColor: '#e74c3c',
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'MSE Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Analysis Date'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Motion Score Trend Over Time'
                },
                legend: {
                    display: true
                }
            }
        }
    });
}

function initializeDistributionChart() {
    const ctx = document.getElementById('distributionChart');
    if (!ctx) return;

    const history = appState.analysisHistory;
    const healthyCount = history.filter(item => item.result === 'healthy').length;
    const riskCount = history.filter(item => item.result === 'at-risk').length;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Healthy', 'At Risk'],
            datasets: [{
                data: [healthyCount, riskCount],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Analysis Results Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Clear form data when closing
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

function showLoginModal() {
    showModal('loginModal');
}

function showSignupModal() {
    showModal('signupModal');
}

function showAnalysisDetailsModal(analysis) {
    // Implementation for showing detailed analysis information
    const modalContent = `
        <h3>Analysis Details</h3>
        <p><strong>Date:</strong> ${new Date(analysis.timestamp).toLocaleString()}</p>
        <p><strong>File:</strong> ${analysis.fileName}</p>
        <p><strong>Score:</strong> ${analysis.score.toFixed(6)}</p>
        <p><strong>Result:</strong> ${analysis.label}</p>
        <p><strong>Windows:</strong> ${analysis.windows}</p>
        <p><strong>Threshold:</strong> ${analysis.threshold}</p>
    `;
    
    // You would implement a generic modal here
    showNotification(modalContent, 'info');
}

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString();
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString();
}

// Export functions for global access
window.ParkinsonDetect = {
    navigateToPage,
    showLoginModal,
    showSignupModal,
    showModal,
    closeModal,
    logout,
    analyzeData,
    saveResults,
    downloadReport,
    showNotification
};