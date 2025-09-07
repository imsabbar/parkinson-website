// Authentication functionality for login and signup pages

// Wait for both DOM and ParkinsonDetect to be available
function waitForParkinsonDetect(callback) {
    if (typeof window.ParkinsonDetect !== 'undefined') {
        callback();
    } else {
        setTimeout(() => waitForParkinsonDetect(callback), 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    waitForParkinsonDetect(initializeAuthPage);
});

function initializeAuthPage() {
    // Check if user is already logged in
    if (typeof ParkinsonDetect !== 'undefined' && ParkinsonDetect.isLoggedIn()) {
        // Redirect to profile if already logged in
        window.location.href = 'profile.html';
        return;
    }

    // Initialize form handlers
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        initializeLoginForm();
    }

    if (signupForm) {
        initializeSignupForm();
    }
}

function initializeLoginForm() {
    const form = document.getElementById('loginForm');
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const remember = document.getElementById('remember')?.checked || false;

        // Validate inputs
        if (!email || !password) {
            showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳</span> Connexion...';
        submitBtn.disabled = true;

        try {
            const result = await ParkinsonDetect.login(email, password, remember);
            
            if (result.success) {
                showNotification('Connexion réussie!', 'success');
                
                // Redirect after a short delay
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } else {
                showNotification(result.message || 'Échec de la connexion', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Erreur de connexion', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Add input validation
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('input', function() {
        if (this.value.length > 0 && this.value.length < 8) {
            this.setCustomValidity('Le mot de passe doit contenir au moins 8 caractères');
        } else {
            this.setCustomValidity('');
        }
    });
}

function initializeSignupForm() {
    const form = document.getElementById('signupForm');
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const dobInput = document.getElementById('signupDob');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    const termsCheckbox = document.getElementById('terms');

    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
            validatePasswordMatch();
        });
    }

    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }

    // Date of birth validation
    if (dobInput) {
        dobInput.addEventListener('change', function() {
            const age = calculateAge(new Date(this.value));
            if (age < 18) {
                this.setCustomValidity('Vous devez être âgé d\'au moins 18 ans');
            } else {
                this.setCustomValidity('');
            }
        });
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            dateOfBirth: dobInput.value,
            password: passwordInput.value,
            confirmPassword: confirmPasswordInput.value
        };

        // Validate form
        if (!validateSignupForm(formData)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳</span> Création du compte...';
        submitBtn.disabled = true;

        try {
            const result = await ParkinsonDetect.signup({
                name: formData.name,
                email: formData.email,
                dateOfBirth: formData.dateOfBirth,
                password: formData.password
            });
            
            if (result.success) {
                showNotification('Compte créé avec succès!', 'success');
                
                // Auto-login after successful signup
                setTimeout(async () => {
                    const loginResult = await ParkinsonDetect.login(formData.email, formData.password, true);
                    if (loginResult.success) {
                        window.location.href = 'profile.html';
                    } else {
                        window.location.href = 'login.html';
                    }
                }, 1500);
            } else {
                showNotification(result.message || 'Échec de la création du compte', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Erreur lors de la création du compte', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Input validation
    nameInput.addEventListener('blur', function() {
        if (this.value.trim().length < 2) {
            this.setCustomValidity('Le nom doit contenir au moins 2 caractères');
        } else {
            this.setCustomValidity('');
        }
    });

    emailInput.addEventListener('blur', validateEmail);
}

function validateSignupForm(data) {
    // Name validation
    if (!data.name || data.name.length < 2) {
        showNotification('Le nom doit contenir au moins 2 caractères', 'error');
        return false;
    }

    // Email validation
    if (!data.email || !isValidEmail(data.email)) {
        showNotification('Veuillez entrer une adresse e-mail valide', 'error');
        return false;
    }

    // Date of birth validation
    if (!data.dateOfBirth) {
        showNotification('Veuillez entrer votre date de naissance', 'error');
        return false;
    }

    const age = calculateAge(new Date(data.dateOfBirth));
    if (age < 18) {
        showNotification('Vous devez être âgé d\'au moins 18 ans', 'error');
        return false;
    }

    // Password validation
    if (!data.password || data.password.length < 8) {
        showNotification('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return false;
    }

    if (data.password !== data.confirmPassword) {
        showNotification('Les mots de passe ne correspondent pas', 'error');
        return false;
    }

    // Terms validation
    const termsCheckbox = document.getElementById('terms');
    if (!termsCheckbox.checked) {
        showNotification('Vous devez accepter les conditions d\'utilisation', 'error');
        return false;
    }

    return true;
}

function updatePasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (!strengthIndicator || !strengthFill || !strengthText) return;

    let strength = 0;
    let requirements = [];

    // Check password requirements
    if (password.length >= 8) {
        strength += 25;
    } else {
        requirements.push('8 caractères minimum');
    }

    if (/[a-z]/.test(password)) {
        strength += 25;
    } else {
        requirements.push('minuscule');
    }

    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        requirements.push('majuscule');
    }

    if (/\d/.test(password)) {
        strength += 25;
    } else {
        requirements.push('chiffre');
    }

    // Update visual indicator
    strengthFill.style.width = strength + '%';
    
    if (strength < 50) {
        strengthFill.className = 'strength-fill weak';
        strengthText.textContent = requirements.length > 0 ? 'Manque: ' + requirements.join(', ') : 'Faible';
    } else if (strength < 75) {
        strengthFill.className = 'strength-fill medium';
        strengthText.textContent = requirements.length > 0 ? 'Manque: ' + requirements.join(', ') : 'Moyen';
    } else if (strength < 100) {
        strengthFill.className = 'strength-fill good';
        strengthText.textContent = requirements.length > 0 ? 'Manque: ' + requirements.join(', ') : 'Bon';
    } else {
        strengthFill.className = 'strength-fill strong';
        strengthText.textContent = 'Excellent';
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;

    if (confirmPassword && password !== confirmPassword) {
        document.getElementById('signupConfirmPassword').setCustomValidity('Les mots de passe ne correspondent pas');
    } else {
        document.getElementById('signupConfirmPassword').setCustomValidity('');
    }
}

function validateEmail(event) {
    const email = event.target.value.trim();
    if (email && !isValidEmail(email)) {
        event.target.setCustomValidity('Veuillez entrer une adresse e-mail valide');
    } else {
        event.target.setCustomValidity('');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);

    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
}