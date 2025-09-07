// ParkinsonDetect - Main JavaScript Application
// Configuration
const API_CONFIG = {
    baseUrl: 'https://parkinsonapi.ewr.appspot.com',
    authToken: 'imsabbar777',
    endpoints: {
        predict: '/predict'
    }
};

// Initialize Data Manager
const dataManager = new DataManager();

// Application State
let appState = {
    currentUser: null,
    selectedFile: null,
    analysisHistory: [],
    isLoggedIn: false,
    dataSource: 'server' // 'server' or 'localStorage' for fallback
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app immediately for faster user experience
    initializeApp();
    
    // Show preloader for minimum 1.5 seconds
    setTimeout(() => {
        hidePreloader();
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

// Scroll-triggered animations using Intersection Observer
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing after animation to improve performance
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with scroll animation classes
    const animatedElements = document.querySelectorAll(
        '.fade-in-on-scroll, .fade-in-left, .fade-in-right, .fade-in-scale, .stagger-item'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

function initializeApp() {
    // Load user session
    loadUserSession();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Load analysis history
    loadAnalysisHistory();
    
    // Initialize scroll animations
    initScrollAnimations();
    
    // Update UI based on login status
    updateUIForLoggedInUser();
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
    
    // Forms (removed handleLogin and handleSignup - now handled by auth.js)
    const contactForm = document.getElementById('contactForm');
    
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
        
        // Only handle profile links this way
        if (page === 'profile') {
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

// Enhanced Profile Management
function showProfile() {
    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }
    
    const profileHTML = createProfileHTML();
    showCustomModal('profile', 'Profil utilisateur', profileHTML);
    
    closeAvatarDropdown();
}

function createProfileHTML() {
    const user = appState.currentUser;
    const age = calculateAge(user.dateOfBirth);
    const memberSince = formatDate(user.joinDate);
    const totalAnalyses = appState.analysisHistory.length;
    const avgScore = calculateAverageScore(true);
    const healthyRate = calculateHealthyRate();
    
    return `
        <div class="profile-content">
            <!-- Enhanced Profile Header -->
            <div class="profile-header-enhanced">
                <div class="profile-avatar-large">
                    <div class="avatar-ring">
                        <div class="avatar-inner">
                            ${generateAvatarInitials(user.name)}
                        </div>
                    </div>
                    <div class="avatar-status online"></div>
                </div>
                <div class="profile-info-main">
                    <h1 class="profile-name">${user.name}</h1>
                    <p class="profile-email">${user.email}</p>
                    <div class="profile-badges">
                        <span class="badge badge-member">🏆 Membre depuis ${memberSince}</span>
                        ${totalAnalyses >= 10 ? '<span class="badge badge-expert">🥇 Expert Analyste</span>' : ''}
                        ${healthyRate >= 80 ? '<span class="badge badge-healthy">💪 Santé Excellente</span>' : ''}
                    </div>
                </div>
                <div class="profile-actions-quick">
                    <button class="btn-profile btn-primary" onclick="editProfile()">
                        ✏️ Modifier
                    </button>
                    <button class="btn-profile btn-secondary" onclick="exportProfileData()">
                        📊 Exporter
                    </button>
                </div>
            </div>
            
            <!-- Enhanced Stats Grid -->
            <div class="profile-stats-grid">
                <div class="stat-card-profile primary">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-number">${totalAnalyses}</div>
                        <div class="stat-label">Analyses Effectuées</div>
                        <div class="stat-trend ${totalAnalyses > 5 ? 'positive' : 'neutral'}">
                            ${totalAnalyses > 5 ? '↗️ Actif' : '↔️ Débutant'}
                        </div>
                    </div>
                </div>
                
                <div class="stat-card-profile success">
                    <div class="stat-icon">🎯</div>
                    <div class="stat-content">
                        <div class="stat-number">${avgScore.toFixed(3)}</div>
                        <div class="stat-label">Score Moyen</div>
                        <div class="stat-trend ${avgScore < 1.0 ? 'positive' : avgScore < 1.5 ? 'neutral' : 'negative'}">
                            ${avgScore < 1.0 ? '✅ Excellent' : avgScore < 1.5 ? '⚠️ Correct' : '❌ À surveiller'}
                        </div>
                    </div>
                </div>
                
                <div class="stat-card-profile info">
                    <div class="stat-icon">💪</div>
                    <div class="stat-content">
                        <div class="stat-number">${healthyRate}%</div>
                        <div class="stat-label">Taux de Santé</div>
                        <div class="stat-trend ${healthyRate >= 80 ? 'positive' : healthyRate >= 60 ? 'neutral' : 'negative'}">
                            ${healthyRate >= 80 ? '💚 Excellent' : healthyRate >= 60 ? '💛 Bon' : '❤️ À surveiller'}
                        </div>
                    </div>
                </div>
                
                <div class="stat-card-profile warning">
                    <div class="stat-icon">🕰️</div>
                    <div class="stat-content">
                        <div class="stat-number">${age}</div>
                        <div class="stat-label">Années</div>
                        <div class="stat-trend neutral">
                            🎂 Né(e) en ${new Date(user.dateOfBirth).getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Enhanced Information Cards -->
            <div class="profile-cards-grid">
                <div class="info-card-enhanced">
                    <div class="card-header">
                        <h3>📄 Informations Personnelles</h3>
                        <button class="btn-mini btn-outline" onclick="editProfile()">✏️</button>
                    </div>
                    <div class="card-content">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-icon">👤</span>
                                <div class="info-details">
                                    <label>Nom complet</label>
                                    <value>${user.name}</value>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">📧</span>
                                <div class="info-details">
                                    <label>Adresse e-mail</label>
                                    <value>${user.email}</value>
                                </div>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">🎂</span>
                                <div class="info-details">
                                    <label>Date de naissance</label>
                                    <value>${formatDate(user.dateOfBirth)} (${age} ans)</value>
                                </div>
                            </div>
                            ${user.medicalId ? `
                            <div class="info-item">
                                <span class="info-icon">🏥</span>
                                <div class="info-details">
                                    <label>ID Médical</label>
                                    <value>${user.medicalId}</value>
                                </div>
                            </div>` : ''}
                        </div>
                    </div>
                </div>
                
                <div class="info-card-enhanced">
                    <div class="card-header">
                        <h3>📊 Statistiques d'Analyse</h3>
                        <button class="btn-mini btn-outline" onclick="window.location.href='analyze.html'">➕</button>
                    </div>
                    <div class="card-content">
                        <div class="stats-overview">
                            <div class="overview-item">
                                <div class="overview-number">${totalAnalyses}</div>
                                <div class="overview-label">Analyses totales</div>
                            </div>
                            <div class="overview-divider"></div>
                            <div class="overview-item">
                                <div class="overview-number">${appState.analysisHistory.filter(a => (a.result === 'Sain' || a.result === 'healthy')).length}</div>
                                <div class="overview-label">Résultats sains</div>
                            </div>
                            <div class="overview-divider"></div>
                            <div class="overview-item">
                                <div class="overview-number">${totalAnalyses > 0 ? formatDate(appState.analysisHistory[0].timestamp) : 'Aucune'}</div>
                                <div class="overview-label">Dernière analyse</div>
                            </div>
                        </div>
                        
                        <div class="progress-section">
                            <div class="progress-item">
                                <label>Taux de santé</label>
                                <div class="progress-bar-profile">
                                    <div class="progress-fill" style="width: ${healthyRate}%; background: ${healthyRate >= 80 ? '#27ae60' : healthyRate >= 60 ? '#f39c12' : '#e74c3c'}"></div>
                                </div>
                                <span class="progress-value">${healthyRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Enhanced Profile Actions -->
            <div class="profile-actions-grid">
                <button class="action-card" onclick="changePassword()">
                    <div class="action-icon">🔒</div>
                    <div class="action-content">
                        <h4>Changer le Mot de Passe</h4>
                        <p>Modifier vos informations de connexion</p>
                    </div>
                    <div class="action-arrow">→</div>
                </button>
                
                <button class="action-card" onclick="exportProfileData()">
                    <div class="action-icon">💾</div>
                    <div class="action-content">
                        <h4>Exporter les Données</h4>
                        <p>Télécharger toutes vos données</p>
                    </div>
                    <div class="action-arrow">→</div>
                </button>
                
                <button class="action-card danger" onclick="deleteAccount()">
                    <div class="action-icon">🗑️</div>
                    <div class="action-content">
                        <h4>Supprimer le Compte</h4>
                        <p>Action irréversible - soyez prudent</p>
                    </div>
                    <div class="action-arrow">→</div>
                </button>
            </div>
        </div>
    `;
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
    if (!name) return 'U';
    return name.split(' ')
               .map(word => word.charAt(0))
               .join('')
               .toUpperCase()
               .substring(0, 2);
}

// Enhanced Authentication with Proper User Management
function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const credentials = {
        email: formData.get('email'),
        password: formData.get('password'),
        remember: formData.get('remember')
    };
    
    // Validate credentials
    if (validateLogin(credentials)) {
        // Check against stored users
        const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
        const user = storedUsers.find(u => u.email === credentials.email);
        
        if (user && verifyPassword(credentials.password, user.password)) {
            // Successful login
            appState.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                joinDate: user.joinDate,
                medicalId: user.medicalId || null,
                analyses: user.analyses || []
            };
            
            appState.isLoggedIn = true;
            
            // Load user's analysis history
            appState.analysisHistory = user.analyses || [];
            
            saveUserSession(credentials.remember);
            closeModal('loginModal');
            updateUIForLoggedInUser();
            showNotification('Connexion réussie! Bienvenue ' + user.name.split(' ')[0], 'success');
            
            // Redirect to dashboard or analysis page
            setTimeout(() => {
                showDashboard();
            }, 1000);
        } else {
            showNotification('Email ou mot de passe incorrect.', 'error');
        }
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
        medicalId: formData.get('medicalId') || null,
        terms: formData.get('terms')
    };
    
    // Validate form
    if (validateSignup(userData)) {
        // Check if user already exists
        const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
        const existingUser = storedUsers.find(u => u.email === userData.email);
        
        if (existingUser) {
            showNotification('Un compte avec cette adresse email existe déjà.', 'error');
            return;
        }
        
        // Create new user
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: userData.name,
            email: userData.email,
            dateOfBirth: userData.dateOfBirth,
            password: hashPassword(userData.password), // Simple hash for demo
            medicalId: userData.medicalId,
            joinDate: new Date().toISOString(),
            analyses: [],
            profile: {
                totalAnalyses: 0,
                lastAnalysis: null,
                averageScore: 0,
                riskAssessments: { healthy: 0, atRisk: 0 }
            }
        };
        
        // Save user data
        storedUsers.push(newUser);
        localStorage.setItem('usersData', JSON.stringify(storedUsers));
        
        // Auto login after signup
        appState.currentUser = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            dateOfBirth: newUser.dateOfBirth,
            joinDate: newUser.joinDate,
            medicalId: newUser.medicalId,
            analyses: []
        };
        
        appState.isLoggedIn = true;
        appState.analysisHistory = [];
        
        saveUserSession(false);
        closeModal('signupModal');
        updateUIForLoggedInUser();
        
        showNotification('Compte créé avec succès! Bienvenue ' + userData.name.split(' ')[0] + '!', 'success');
        
        // Show welcome message and redirect
        setTimeout(() => {
            showNotification('Votre profil a été créé. Vous pouvez maintenant commencer à analyser vos données de mouvement.', 'info');
            showProfile();
        }, 2000);
    }
}

// Enhanced validation with better security
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
    
    return true;
}

function validateSignup(userData) {
    // Check required fields
    if (!userData.name || !userData.email || !userData.password || !userData.dateOfBirth) {
        showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
        return false;
    }
    
    // Name validation - improved
    if (userData.name.trim().length < 2) {
        showNotification('Le nom doit contenir au moins 2 caractères.', 'error');
        return false;
    }
    
    if (userData.name.trim().length > 50) {
        showNotification('Le nom ne peut pas dépasser 50 caractères.', 'error');
        return false;
    }
    
    // Check for valid name format (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-ZÀ-ſ\s\-\']+$/.test(userData.name.trim())) {
        showNotification('Le nom ne peut contenir que des lettres, espaces, traits d\'union et apostrophes.', 'error');
        return false;
    }
    
    // Email validation
    if (!isValidEmail(userData.email)) {
        showNotification('Veuillez entrer une adresse e-mail valide.', 'error');
        return false;
    }
    
    // Age validation (must be at least 18, max 120)
    const birthDate = new Date(userData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
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
    
    // Password validation - enhanced
    if (userData.password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères.', 'error');
        return false;
    }
    
    if (userData.password.length > 128) {
        showNotification('Le mot de passe ne peut pas dépasser 128 caractères.', 'error');
        return false;
    }
    
    // Password strength validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
        showNotification('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.', 'error');
        return false;
    }
    
    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwertyui', 'abc12345', 'password123'];
    if (weakPasswords.includes(userData.password.toLowerCase())) {
        showNotification('Ce mot de passe est trop courant. Veuillez en choisir un plus sécurisé.', 'error');
        return false;
    }
    
    // Confirm password
    if (userData.password !== userData.confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas.', 'error');
        return false;
    }
    
    // Medical ID validation (optional)
    if (userData.medicalId && userData.medicalId.trim()) {
        if (!/^[A-Z0-9\-]{5,20}$/.test(userData.medicalId.trim())) {
            showNotification('L\'ID médical doit contenir 5-20 caractères (lettres majuscules, chiffres, tirets).', 'error');
            return false;
        }
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

// Enhanced Authentication with DataManager
// All authentication now uses the DataManager for consistent JSON-based storage

// Logout function
function logout() {
    appState.currentUser = null;
    appState.isLoggedIn = false;
    localStorage.removeItem('userSession');
    
    // Close avatar dropdown if open
    closeAvatarDropdown();
    
    // Update UI for logged out state
    updateUIForLoggedInUser();
    
    // Navigate to home page
    if (typeof navigateToPage === 'function') {
        navigateToPage('home');
    } else {
        window.location.href = 'index.html';
    }
    
    showNotification('Déconnexion réussie.', 'success');
}

// Enhanced session management with remember me functionality
function saveUserSession(rememberMe = false) {
    const sessionData = {
        user: appState.currentUser,
        isLoggedIn: appState.isLoggedIn,
        timestamp: Date.now(),
        rememberMe: rememberMe
    };
    
    if (rememberMe) {
        // Store for 30 days if remember me is checked
        sessionData.expiryTime = Date.now() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('userSession', JSON.stringify(sessionData));
    } else {
        // Store for 24 hours only
        sessionData.expiryTime = Date.now() + (24 * 60 * 60 * 1000);
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    }
}

async function loadUserSession() {
    // Check both localStorage (remember me) and sessionStorage
    let sessionData = localStorage.getItem('userSession');
    let isFromLocalStorage = true;
    
    if (!sessionData) {
        sessionData = sessionStorage.getItem('userSession');
        isFromLocalStorage = false;
    }
    
    if (sessionData) {
        const parsed = JSON.parse(sessionData);
        
        // Check if session is still valid
        const isExpired = Date.now() > parsed.expiryTime;
        
        if (!isExpired && parsed.user) {
            // Verify user still exists in DataManager
            try {
                const user = await dataManager.findUserById(parsed.user.id);
                if (user) {
                    appState.currentUser = {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        dateOfBirth: user.dateOfBirth,
                        joinDate: user.joinDate,
                        medicalId: user.medicalId || null
                    };
                    appState.isLoggedIn = true;
                    
                    // Load user's analysis history
                    appState.analysisHistory = await dataManager.getUserAnalyses(user.id);
                    
                    updateUIForLoggedInUser();
                } else {
                    // User no longer exists, clean up session
                    if (isFromLocalStorage) {
                        localStorage.removeItem('userSession');
                    } else {
                        sessionStorage.removeItem('userSession');
                    }
                }
            } catch (error) {
                console.error('Error verifying user session:', error);
                appState.analysisHistory = [];
            }
        } else {
            // Session expired, clean up
            if (isFromLocalStorage) {
                localStorage.removeItem('userSession');
            } else {
                sessionStorage.removeItem('userSession');
            }
        }
    }
}

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Contact form handler

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
        
        // Hide login banner if on analyze page
        const loginBanner = document.getElementById('loginBanner');
        if (loginBanner) {
            loginBanner.style.display = 'none';
        }
        
        // Update save button visibility
        updateSaveButtonVisibility();
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
        
        // Show login banner if on analyze page
        const loginBanner = document.getElementById('loginBanner');
        if (loginBanner) {
            loginBanner.style.display = 'block';
        }
        
        // Update save button visibility
        updateSaveButtonVisibility();
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
        showNotification('Veuillez sélectionner un fichier d\'abord.', 'error');
        return;
    }

    // Store analysis start time for duration calculation
    window.analysisStartTime = Date.now();
    
    // Show loading with enhanced feedback
    showLoading(true);
    disableAnalyzeButton(true);
    
    // Hide result card if previously shown
    const resultCard = document.getElementById('resultCard');
    if (resultCard) {
        resultCard.style.display = 'none';
    }

    const formData = new FormData();
    formData.append('file', appState.selectedFile);

    try {
        showNotification('Connexion au système d\'analyse...', 'info');
        
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
        
        // Validate API response
        if (!result || typeof result.score === 'undefined') {
            throw new Error('Réponse API invalide');
        }
        
        displayResults(result);
        
    } catch (error) {
        console.error('Analysis error:', error);
        
        // Fallback to mock data for demo purposes
        showNotification('Utilisation de données de démonstration pour l\'analyse...', 'warning');
        
        // Add realistic delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
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
    const movementType = document.getElementById('movementType');
    const scoreValue = document.getElementById('scoreValue');
    const windowsCount = document.getElementById('windowsCount');
    const thresholdValue = document.getElementById('thresholdValue');
    const statusIcon = document.getElementById('statusIcon');
    const scoreBar = document.getElementById('scoreBar');
    const scoreIndicator = document.getElementById('scoreIndicator');
    const scoreInterpretation = document.getElementById('scoreInterpretation');
    const summaryContent = document.getElementById('summaryContent');
    const analysisTime = document.getElementById('analysisTime');
    
    // Store analysis start time for duration calculation
    const analysisEndTime = Date.now();
    const analysisStartTime = window.analysisStartTime || analysisEndTime;
    const analysisTimeDuration = ((analysisEndTime - analysisStartTime) / 1000).toFixed(1);
    
    // Update basic result values
    if (scoreValue) scoreValue.textContent = data.score.toFixed(6);
    if (windowsCount) windowsCount.textContent = data.windows;
    if (thresholdValue) thresholdValue.textContent = data.threshold.toFixed(3);
    if (analysisTime) analysisTime.textContent = `${analysisTimeDuration}s`;
    
    // Determine result classification
    const isHealthy = data.label === "Sain" || data.label === "Healthy" || data.score < data.threshold;
    
    // Update result label and status icon with enhanced styling
    if (movementType) movementType.textContent = "Mouvement";
    if (resultLabel) {
        if (isHealthy) {
            resultLabel.textContent = "Normal";
            resultLabel.className = "result-classification healthy";
            if (statusIcon) statusIcon.textContent = "✅";
        } else {
            resultLabel.textContent = "Atypique";
            resultLabel.className = "result-classification risk";
            if (statusIcon) statusIcon.textContent = "⚠️";
        }
    }
    
    // Update result circle styling
    const resultCircle = document.querySelector('.result-circle-enhanced');
    if (resultCircle) {
        if (isHealthy) {
            resultCircle.classList.remove('risk');
        } else {
            resultCircle.classList.add('risk');
        }
    }
    
    // Animate score bar and indicator
    if (scoreBar && scoreIndicator) {
        const maxThreshold = Math.max(data.threshold * 1.5, 2.0);
        const scorePercentage = Math.min((data.score / maxThreshold) * 100, 100);
        
        setTimeout(() => {
            scoreBar.style.width = scorePercentage + '%';
            scoreIndicator.style.left = scorePercentage + '%';
        }, 500);
    }
    
    // Update score interpretation
    if (scoreInterpretation) {
        if (isHealthy) {
            scoreInterpretation.textContent = "Score faible indique des mouvements normaux";
            scoreInterpretation.className = "score-interpretation-enhanced";
        } else {
            scoreInterpretation.textContent = "Score élevé suggère des anomalies de mouvement";
            scoreInterpretation.className = "score-interpretation-enhanced risk";
        }
    }
    
    // Update analysis summary
    if (summaryContent) {
        const summaryText = summaryContent.querySelector('.summary-text');
        const qualityMetric = summaryContent.querySelector('.quality-good');
        
        if (summaryText) {
            if (isHealthy) {
                summaryText.innerHTML = `
                    L'analyse de vos données de mouvement indique des <strong>schémas de mouvement normaux</strong>. 
                    Le score de reconstruction de <strong>${data.score.toFixed(6)}</strong> est inférieur au seuil de <strong>${data.threshold.toFixed(3)}</strong>, 
                    suggérant que vos mouvements sont cohérents avec des mouvements sains.
                `;
            } else {
                summaryText.innerHTML = `
                    L'analyse a détecté des <strong>schémas de mouvement atypiques</strong>. 
                    Le score de reconstruction de <strong>${data.score.toFixed(6)}</strong> dépasse le seuil de <strong>${data.threshold.toFixed(3)}</strong>. 
                    Nous recommandons de consulter un professionnel de santé pour une évaluation plus approfondie.
                `;
            }
        }
        
        if (qualityMetric) {
            // Assess data quality based on window count and score consistency
            if (data.windows >= 3 && data.score > 0) {
                qualityMetric.textContent = "Excellente";
                qualityMetric.className = "metric-value quality-good";
            } else if (data.windows >= 2) {
                qualityMetric.textContent = "Bonne";
                qualityMetric.className = "metric-value quality-medium";
                qualityMetric.style.color = "#f39c12";
            } else {
                qualityMetric.textContent = "Acceptable";
                qualityMetric.className = "metric-value quality-low";
                qualityMetric.style.color = "#e67e22";
            }
        }
    }
    
    // Store result data globally for saving/downloading
    window.currentAnalysisResult = {
        score: data.score,
        label: isHealthy ? "Sain" : "Risque de Parkinson",
        windows: data.windows,
        threshold: data.threshold,
        timestamp: new Date().toISOString(),
        fileName: appState.selectedFile ? appState.selectedFile.name : 'Unknown',
        analysisTime: analysisTimeDuration
    };
    
    // Show results with animation
    if (resultCard) {
        resultCard.style.display = 'block';
        
        // Trigger animation after a short delay
        setTimeout(() => {
            resultCard.style.animation = 'slideUpFadeIn 0.8s ease-out';
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
            // Add staggered animation to detail cards
            const detailCards = document.querySelectorAll('.detail-card');
            detailCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
                }, 300 + (index * 100));
            });
        }, 100);
    }
    
    // Update button visibility based on login status
    updateSaveButtonVisibility();
    
    // Show success notification
    showNotification('Analyse terminée avec succès!', 'success');
}

function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
        if (show) {
            loadingSpinner.style.display = 'block';
            loadingSpinner.innerHTML = `
                <div class="loading-enhanced">
                    <div class="spinner"></div>
                    <div class="loading-text">✨ Analyse de vos données de mouvement...</div>
                    <div class="loading-progress">
                        <div class="progress-bar"></div>
                    </div>
                    <p style="font-size: 0.9rem; color: #666; margin: 10px 0 0 0; text-align: center;">
                        🔍 Analyse en cours des schémas d'accéléromètre et gyroscope
                    </p>
                </div>
            `;
            // Add animation class
            loadingSpinner.classList.add('fade-in-animation');
        } else {
            loadingSpinner.style.display = 'none';
            loadingSpinner.classList.remove('fade-in-animation');
        }
    }
}

function disableAnalyzeButton(disable) {
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.disabled = disable;
        analyzeBtn.textContent = disable ? 'Analyse en cours...' : '✨ Analyser les Données de Mouvement';
    }
}

// Enhanced Results Management with Server Data Sync
async function saveResults() {
    if (!appState.isLoggedIn) {
        showLoginModal();
        return;
    }

    // Use stored result data from displayResults function
    const currentResult = window.currentAnalysisResult;
    if (!currentResult) {
        showNotification('Aucun résultat à sauvegarder.', 'error');
        return;
    }

    const resultData = {
        fileName: currentResult.fileName,
        score: currentResult.score,
        label: currentResult.label,
        windows: currentResult.windows,
        threshold: currentResult.threshold,
        result: currentResult.label,
        analysisTime: currentResult.analysisTime,
        fileSize: appState.selectedFile ? appState.selectedFile.size : 0
    };

    try {
        // Save to server-side data management
        const saveResult = await dataManager.saveAnalysis(appState.currentUser.id, resultData);
        
        if (saveResult.success) {
            // Refresh analysis history from server
            appState.analysisHistory = await dataManager.getUserAnalyses(appState.currentUser.id);
            
            // Update dashboard if visible
            updateDashboardStats();
            updateAnalysisTable();

            showNotification('Résultats sauvegardés dans votre profil!', 'success');
            
            // Update button state
            const saveBtn = document.getElementById('saveResultsBtn');
            if (saveBtn) {
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Sauvegardé!</span>';
                saveBtn.disabled = true;
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.disabled = false;
                }, 2000);
            }
        } else {
            showNotification('Erreur lors de la sauvegarde: ' + saveResult.message, 'error');
        }
    } catch (error) {
        console.error('Error saving results:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

function downloadReport() {
    // Use stored result data from displayResults function
    const currentResult = window.currentAnalysisResult;
    if (!currentResult) {
        showNotification('Aucun résultat à télécharger.', 'error');
        return;
    }

    const reportData = {
        // Analysis Metadata
        analysisInfo: {
            analysisId: 'analysis_' + Date.now(),
            timestamp: currentResult.timestamp,
            analysisTime: currentResult.analysisTime + 's',
            platform: 'ParkinsonDetect v1.0',
            apiVersion: '2024.1'
        },
        
        // Patient Information
        patientInfo: {
            patientId: appState.currentUser ? appState.currentUser.id : 'anonymous',
            patientName: appState.currentUser ? appState.currentUser.name : 'Utilisateur Anonyme',
            age: appState.currentUser ? calculateAge(appState.currentUser.dateOfBirth) : 'N/A',
            medicalId: appState.currentUser ? (appState.currentUser.medicalId || 'Non renseigné') : 'N/A'
        },
        
        // File Information
        fileInfo: {
            fileName: currentResult.fileName,
            fileSize: appState.selectedFile ? (appState.selectedFile.size / 1024).toFixed(2) + ' KB' : 'Unknown',
            uploadDate: new Date().toISOString()
        },
        
        // Analysis Results
        results: {
            mseScore: currentResult.score,
            threshold: currentResult.threshold,
            classification: currentResult.label,
            confidence: currentResult.score < currentResult.threshold ? 'High' : 'Medium',
            riskLevel: currentResult.label === 'Sain' ? 'Low Risk' : 'Elevated Risk',
            windowsAnalyzed: currentResult.windows,
            interpretation: currentResult.label === 'Sain' ? 
                'Les schémas de mouvement analysés sont conformes aux mouvements normaux.' :
                'Les schémas de mouvement présentent des anomalies nécessitant une évaluation médicale.'
        },
        
        // Technical Details
        technicalDetails: {
            methodology: 'Autoencoder-based pattern analysis',
            samplingRate: '20Hz',
            windowSize: '100 samples',
            features: ['Accelerometer X/Y/Z', 'Gyroscope X/Y/Z'],
            processedBy: 'Advanced Pattern Recognition System'
        },
        
        // Recommendations
        recommendations: {
            nextSteps: currentResult.label === 'Sain' ? 
                ['Continuer le monitoring régulier', 'Maintenir un mode de vie actif'] :
                ['Consulter un neurologue', 'Effectuer des tests cliniques supplémentaires'],
            followUp: 'Recommandé dans 3-6 mois',
            additionalTests: currentResult.label !== 'Sain' ? 
                ['DaTscan', 'Examen neurologique complet', 'Tests cognitifs'] : 
                ['Aucun test supplémentaire nécessaire actuellement']
        },
        
        // Legal Disclaimers
        disclaimers: {
            medical: 'Cet outil est destiné à des fins de recherche et d\'information uniquement. Les résultats ne remplacent pas un diagnostic médical professionnel.',
            usage: 'Ces résultats doivent être interprétés par un professionnel de santé qualifié.',
            privacy: 'Les données sont traitées conformément aux réglementations sur la protection des données.',
            research: 'Basé sur des études cliniques validées. Les résultats individuels peuvent varier.'
        }
    };

    const reportJson = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(reportJson);
    
    const exportFileName = `rapport_parkinson_${currentResult.fileName.replace('.zip', '')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    
    // Show download success notification
    showNotification('Rapport détaillé téléchargé avec succès!', 'success');
    
    // Update button state temporarily
    const downloadBtn = event.target.closest('.btn-enhanced');
    if (downloadBtn) {
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span class="btn-icon">✓</span><span class="btn-text">Téléchargé!</span>';
        
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
        }, 2000);
    }
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
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedHistory = appState.analysisHistory.slice(startIndex, endIndex);
    
    if (paginatedHistory.length === 0) {
        // Show empty state
        const emptyState = document.getElementById('tableEmptyState');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        return;
    }
    
    // Hide empty state
    const emptyState = document.getElementById('tableEmptyState');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    paginatedHistory.forEach((analysis, index) => {
        const row = createAnalysisTableRow(analysis);
        // Add staggered animation
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        tableBody.appendChild(row);
        
        // Animate in
        setTimeout(() => {
            row.style.transition = 'all 0.4s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, index * 50);
    });
    
    // Update pagination
    const totalPages = Math.ceil(appState.analysisHistory.length / itemsPerPage);
    updatePaginationUI(totalPages);
}

function createAnalysisTableRow(analysis) {
    const row = document.createElement('tr');
    row.className = 'table-row';
    
    const date = new Date(analysis.timestamp).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const isHealthy = analysis.result === 'Sain' || analysis.result === 'healthy' || analysis.label === 'Sain';
    const statusClass = isHealthy ? 'status-healthy' : 'status-risk';
    const statusText = isHealthy ? 'Sain' : 'À Risque';
    const statusIcon = isHealthy ? '✅' : '⚠️';
    
    // Truncate filename if too long
    const displayFileName = analysis.fileName.length > 25 ? 
        analysis.fileName.substring(0, 22) + '...' : 
        analysis.fileName;
    
    row.innerHTML = `
        <td class="table-cell date-cell">
            <div class="cell-content">
                <span class="cell-main">${date.split(' ')[0]}</span>
                <span class="cell-sub">${date.split(' ')[1] || ''}</span>
            </div>
        </td>
        <td class="table-cell file-cell">
            <div class="cell-content">
                <span class="file-icon">🗄</span>
                <span class="cell-main" title="${analysis.fileName}">${displayFileName}</span>
            </div>
        </td>
        <td class="table-cell score-cell">
            <div class="cell-content">
                <span class="score-value">${analysis.score.toFixed(6)}</span>
                <div class="score-bar-mini">
                    <div class="score-fill-mini" style="width: ${Math.min((analysis.score / 2) * 100, 100)}%"></div>
                </div>
            </div>
        </td>
        <td class="table-cell result-cell">
            <div class="status-badge ${statusClass}">
                <span class="status-icon">${statusIcon}</span>
                <span class="status-text">${statusText}</span>
            </div>
        </td>
        <td class="table-cell windows-cell">
            <div class="cell-content">
                <span class="windows-count">${analysis.windows || analysis.totalWindows || 'N/A'}</span>
                <span class="windows-label">segments</span>
            </div>
        </td>
        <td class="table-cell actions-cell">
            <div class="action-buttons-mini">
                <button onclick="viewAnalysisDetails('${analysis.id}')" class="btn-mini btn-primary" title="Voir détails">
                    👁️
                </button>
                <button onclick="downloadAnalysisReport('${analysis.id}')" class="btn-mini btn-secondary" title="Télécharger">
                    💾
                </button>
                <button onclick="deleteAnalysisConfirm('${analysis.id}')" class="btn-mini btn-danger" title="Supprimer">
                    🗑️
                </button>
            </div>
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

// Enhanced Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer; margin-left: 10px;">×</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        max-width: 400px;
        min-width: 300px;
        animation: slideInRight 0.3s ease-out;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Custom modal system for dashboard and profile
function showCustomModal(id, title, content) {
    // Remove existing custom modal if any
    const existingModal = document.getElementById('customModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        padding: 20px;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            border-radius: 15px;
            width: 100%;
            max-width: 1200px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        ">
            <div class="modal-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 30px;
                border-bottom: 1px solid #e9ecef;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border-radius: 15px 15px 0 0;
            ">
                <h2 style="margin: 0; font-size: 1.5rem;">${title}</h2>
                <button onclick="closeCustomModal()" style="
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 5px;
                ">×</button>
            </div>
            <div class="modal-body" style="padding: 30px;">
                ${content}
            </div>
        </div>
    `;
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeCustomModal();
        }
    });
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function closeCustomModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.remove();
        document.body.style.overflow = 'auto';
    }
}

// Profile helper functions
function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
}

function calculateAverageScore(returnNumber = false) {
    if (appState.analysisHistory.length === 0) {
        return returnNumber ? 0 : '0.000';
    }
    
    const total = appState.analysisHistory.reduce((sum, analysis) => sum + analysis.score, 0);
    const average = total / appState.analysisHistory.length;
    
    return returnNumber ? average : average.toFixed(3);
}

function calculateHealthyRate() {
    if (appState.analysisHistory.length === 0) return 0;
    
    const healthyCount = appState.analysisHistory.filter(a => a.result === 'healthy').length;
    return Math.round((healthyCount / appState.analysisHistory.length) * 100);
}

// Profile action functions
function editProfile() {
    showNotification('Fonctionnalité de modification du profil en développement.', 'info');
}

function changePassword() {
    showNotification('Fonctionnalité de changement de mot de passe en développement.', 'info');
}

function exportProfileData() {
    const profileData = {
        user: appState.currentUser,
        analysisHistory: appState.analysisHistory,
        statistics: {
            totalAnalyses: appState.analysisHistory.length,
            averageScore: calculateAverageScore(true),
            healthyRate: calculateHealthyRate(),
            lastAnalysis: appState.analysisHistory.length > 0 ? appState.analysisHistory[0].timestamp : null
        },
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(profileData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `parkinson_profile_${appState.currentUser.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Données du profil exportées avec succès!', 'success');
}

function deleteAccount() {
    if (confirm('\u00cates-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.')) {
        // Remove user from stored users
        const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
        const filteredUsers = storedUsers.filter(u => u.id !== appState.currentUser.id);
        localStorage.setItem('usersData', JSON.stringify(filteredUsers));
        
        // Logout
        logout();
        closeCustomModal();
        
        showNotification('Compte supprimé avec succès.', 'success');
    }
}

// Data export functions
function exportAnalysisHistory() {
    if (appState.analysisHistory.length === 0) {
        showNotification('Aucune donnée d\'analyse à exporter.', 'error');
        return;
    }
    
    const csvData = convertToCSV(appState.analysisHistory);
    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvData);
    
    const exportFileDefaultName = `analysis_history_${new Date().toISOString().split('T')[0]}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Historique exporté avec succès!', 'success');
}

function convertToCSV(data) {
    const headers = ['Date', 'Fichier', 'Score MSE', 'Résultat', 'Fenêtres', 'Seuil', 'Taille Fichier'];
    const csvContent = [headers.join(',')];
    
    data.forEach(analysis => {
        const row = [
            new Date(analysis.timestamp).toLocaleString(),
            analysis.fileName,
            analysis.score,
            analysis.result,
            analysis.windows,
            analysis.threshold,
            analysis.fileSize || 0
        ];
        csvContent.push(row.join(','));
    });
    
    return csvContent.join('\n');
}

function clearAnalysisHistory() {
    if (confirm('\u00cates-vous sûr de vouloir effacer tout l\'historique d\'analyses?')) {
        appState.analysisHistory = [];
        
        // Update user data in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
        const userIndex = storedUsers.findIndex(u => u.id === appState.currentUser.id);
        
        if (userIndex !== -1) {
            storedUsers[userIndex].analyses = [];
            localStorage.setItem('usersData', JSON.stringify(storedUsers));
        }
        
        updateDashboardStats();
        updateAnalysisTable();
        
        showNotification('Historique effacé avec succès.', 'success');
    }
}

// Navigation function
function navigateToPage(page) {
    switch(page) {
        case 'dashboard':
            showDashboard();
            break;
        case 'profile':
            showProfile();
            break;
        case 'home':
            window.location.href = 'index.html';
            break;
        default:
            console.log('Navigation to:', page);
    }
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('fr-FR');
}

// Enhanced Authentication Functions
async function performLogin(email, password, remember = false) {
    try {
        // Use server-side data management
        const user = await dataManager.findUserByEmail(email);
        
        if (!user) {
            return { success: false, message: 'Aucun compte trouvé avec cette adresse email.' };
        }
        
        // Verify password using server-side method
        if (!dataManager.verifyPassword(password, user.password)) {
            return { success: false, message: 'Mot de passe incorrect.' };
        }
        
        // Update login metadata
        await dataManager.updateUser(user.id, {
            metadata: {
                ...user.metadata,
                lastLogin: new Date().toISOString(),
                loginCount: (user.metadata.loginCount || 0) + 1
            }
        });
        
        // Successful login
        appState.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            dateOfBirth: user.dateOfBirth,
            joinDate: user.joinDate,
            medicalId: user.medicalId || null
        };
        
        appState.isLoggedIn = true;
        
        // Load user's analysis history from server
        appState.analysisHistory = await dataManager.getUserAnalyses(user.id);
        
        // Save session
        saveUserSession(remember);
        
        return { success: true, user: appState.currentUser };
        
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Erreur lors de la connexion.' };
    }
}

async function performSignup(userData) {
    try {
        // Use server-side data management
        const result = await dataManager.createUser({
            name: userData.name.trim(),
            email: userData.email.trim().toLowerCase(),
            dateOfBirth: userData.dateOfBirth,
            password: userData.password,
            medicalId: userData.medicalId || null
        });
        
        return result;
        
    } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'Erreur lors de la création du compte.' };
    }
}

// Password utilities
function hashPassword(password) {
    // Simple hash for demo - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
}

function verifyPassword(password, hashedPassword) {
    return hashPassword(password) === hashedPassword;
}

// Session management
function saveUserSession(remember) {
    const sessionData = {
        user: appState.currentUser,
        isLoggedIn: appState.isLoggedIn,
        expiryTime: Date.now() + (remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000) // 30 days or 1 day
    };
    
    if (remember) {
        localStorage.setItem('userSession', JSON.stringify(sessionData));
    } else {
        sessionStorage.setItem('userSession', JSON.stringify(sessionData));
    }
}

// Analysis management
function deleteAnalysisById(analysisId) {
    try {
        // Remove from current session
        appState.analysisHistory = appState.analysisHistory.filter(a => a.id !== analysisId);
        
        // Update stored user data
        if (appState.currentUser) {
            const storedUsers = JSON.parse(localStorage.getItem('usersData') || '[]');
            const userIndex = storedUsers.findIndex(u => u.id === appState.currentUser.id);
            
            if (userIndex !== -1) {
                storedUsers[userIndex].analyses = appState.analysisHistory;
                localStorage.setItem('usersData', JSON.stringify(storedUsers));
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error deleting analysis:', error);
        return false;
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
    showNotification,
    showProfile,
    login: performLogin,
    signup: performSignup,
    isLoggedIn: () => appState.isLoggedIn,
    getCurrentUser: () => appState.currentUser,
    getAnalysisHistory: () => appState.analysisHistory,
    deleteAnalysis: deleteAnalysisById,
    // Add DataManager methods for profile page
    dataManager: dataManager
};

// Additional utility functions
function updateSaveButtonVisibility() {
    const saveBtn = document.getElementById('saveResultsBtn');
    const loginBtn = document.getElementById('loginToSaveBtn');
    
    if (appState.isLoggedIn) {
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        if (saveBtn) saveBtn.style.display = 'none';
        if (loginBtn) loginBtn.style.display = 'inline-flex';
    }
}

// Call this function to update save button visibility
function saveAnalysisResults() {
    saveResults();
}

// Hide banner function
function hideBanner() {
    const banner = document.getElementById('loginBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

// Additional helper functions for enhanced dashboard
function filterAnalyses(filterType) {
    const table = document.getElementById('analysisTable');
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        if (filterType === 'all') {
            row.style.display = '';
        } else {
            const statusBadge = row.querySelector('.status-badge');
            const isHealthy = statusBadge && statusBadge.classList.contains('status-healthy');
            
            if (filterType === 'healthy' && isHealthy) {
                row.style.display = '';
            } else if (filterType === 'risk' && !isHealthy) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
    
    // Update empty state
    updateTableEmptyState();
}

function updateTableEmptyState() {
    const table = document.getElementById('analysisTable');
    const emptyState = document.getElementById('tableEmptyState');
    const visibleRows = table.querySelectorAll('tbody tr:not([style*="display: none"])');
    
    if (emptyState) {
        if (visibleRows.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }
}

function downloadAnalysisReport(analysisId) {
    const analysis = appState.analysisHistory.find(a => a.id === analysisId);
    if (!analysis) {
        showNotification('Analyse non trouvée', 'error');
        return;
    }
    
    const reportData = {
        analysis: analysis,
        user: appState.currentUser,
        exportDate: new Date().toISOString(),
        reportType: 'individual_analysis'
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const fileName = `analyse_${analysis.id}_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', fileName);
    linkElement.click();
    
    showNotification('Rapport téléchargé avec succès!', 'success');
}

function deleteAnalysisConfirm(analysisId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette analyse? Cette action est irréversible.')) {
        if (deleteAnalysisById(analysisId)) {
            updateAnalysisTable();
            updateDashboardStats();
            showNotification('Analyse supprimée avec succès', 'success');
        } else {
            showNotification('Erreur lors de la suppression', 'error');
        }
    }
}

// Pagination functions
let currentPage = 1;
const itemsPerPage = 10;

function changePage(direction) {
    const totalItems = appState.analysisHistory.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    currentPage += direction;
    
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    
    updateAnalysisTable();
    updatePaginationUI(totalPages);
}

function updatePaginationUI(totalPages) {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const paginationInfo = document.getElementById('paginationInfo');
    
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    if (paginationInfo) paginationInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}