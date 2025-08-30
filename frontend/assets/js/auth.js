// Authentication handling
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuth();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', this.handleRegister.bind(this));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await api.login({ email, password });
            
            api.setToken(response.access_token);
            this.currentUser = response.user;
            
            showToast('Login successful!', 'success');
            this.showApp();
            
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        try {
            await api.register({ username, email, password });
            
            showToast('Registration successful! Please login.', 'success');
            showLogin();
            
        } catch (error) {
            showToast(error.message, 'error');
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            this.showAuth();
            return;
        }

        try {
            api.setToken(token);
            this.currentUser = await api.getProfile();
            this.showApp();
        } catch (error) {
            console.error('Auth check failed:', error);
            this.logout();
        }
    }

    showAuth() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('navbar').style.display = 'none';
        this.hideAllPages();
    }

    showApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('navbar').style.display = 'block';
        document.getElementById('nav-user').style.display = 'flex';
        document.getElementById('username').textContent = this.currentUser.username;
        
        // Show dashboard by default
        showPage('dashboard');
        loadDashboard();
    }

    hideAllPages() {
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.style.display = 'none');
    }

    logout() {
        api.removeToken();
        this.currentUser = null;
        this.showAuth();
        showToast('Logged out successfully', 'info');
    }
}

// Auth utility functions
function showLogin() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
}

function showRegister() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
}

function logout() {
    authManager.logout();
}

// Initialize auth manager
const authManager = new AuthManager();
