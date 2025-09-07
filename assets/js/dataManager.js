/**
 * Data Management System for ParkinsonDetect
 * Handles server-side JSON data storage and retrieval
 */

class DataManager {
    constructor() {
        this.baseURL = '/assets/js/data/';
        this.endpoints = {
            users: 'users.json',
            analyses: 'analyses.json'
        };
    }

    /**
     * Load JSON data from localStorage with fallback to JSON files
     * @param {string} endpoint - The data endpoint (users, analyses)
     * @returns {Promise<Object>} The JSON data
     */
    async loadData(endpoint) {
        try {
            // Always try localStorage first (where real data is stored)
            const localData = localStorage.getItem(`parkinson_${endpoint}`);
            
            if (localData) {
                console.log(`📦 Loading ${endpoint} data from localStorage`);
                return JSON.parse(localData);
            }
            
            // If no localStorage data, load initial structure from JSON files (read-only)
            try {
                const response = await fetch(this.baseURL + this.endpoints[endpoint]);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`📄 Loading initial ${endpoint} structure from JSON file`);
                    
                    // Save initial structure to localStorage for future use
                    localStorage.setItem(`parkinson_${endpoint}`, JSON.stringify(data));
                    return data;
                }
            } catch (fetchError) {
                console.log(`📄 Could not load initial ${endpoint} JSON file, using defaults`);
            }
            
            // If both fail, create default structure
            const defaultData = this.getDefaultData(endpoint);
            localStorage.setItem(`parkinson_${endpoint}`, JSON.stringify(defaultData));
            return defaultData;
            
        } catch (error) {
            console.error(`Error loading ${endpoint} data:`, error);
            return this.getDefaultData(endpoint);
        }
    }

    /**
     * Save JSON data to localStorage with proper structure
     * @param {string} endpoint - The data endpoint
     * @param {Object} data - The data to save
     */
    async saveData(endpoint, data) {
        try {
            const jsonData = {
                ...data,
                metadata: {
                    ...data.metadata,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            localStorage.setItem(`parkinson_${endpoint}`, JSON.stringify(jsonData));
            console.log(`✅ Data saved to localStorage: ${endpoint}`);
            console.log(`📊 Total ${endpoint}:`, data[endpoint]?.length || 0);
            return { success: true, message: 'Data saved successfully' };
        } catch (error) {
            console.error(`❌ Error saving ${endpoint} data:`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get default data structure for endpoints
     * @param {string} endpoint - The endpoint name
     * @returns {Object} Default data structure
     */
    getDefaultData(endpoint) {
        const defaults = {
            users: {
                users: [],
                metadata: {
                    version: "1.0",
                    lastUpdated: new Date().toISOString(),
                    totalUsers: 0,
                    dataSchema: "v1"
                },
                config: {
                    maxUsers: 10000,
                    passwordMinLength: 8,
                    sessionExpiryDays: 30,
                    analysisRetentionDays: 365
                }
            },
            analyses: {
                analyses: [],
                metadata: {
                    version: "1.0",
                    lastUpdated: new Date().toISOString(),
                    totalAnalyses: 0,
                    dataSchema: "v1"
                },
                statistics: {
                    totalHealthy: 0,
                    totalAtRisk: 0,
                    averageScore: 0,
                    mostCommonFileTypes: [],
                    dailyAnalyses: []
                }
            }
        };
        return defaults[endpoint] || {};
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<Object|null>} User object or null
     */
    async findUserByEmail(email) {
        const userData = await this.loadData('users');
        return userData.users.find(user => user.email === email) || null;
    }

    /**
     * Find user by ID
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User object or null
     */
    async findUserById(userId) {
        const userData = await this.loadData('users');
        return userData.users.find(user => user.id === userId) || null;
    }

    /**
     * Create new user
     * @param {Object} userInfo - User information
     * @returns {Promise<Object>} Result object with success status
     */
    async createUser(userInfo) {
        try {
            const userData = await this.loadData('users');
            
            // Check if user already exists
            const existingUser = userData.users.find(user => user.email === userInfo.email);
            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }
            
            // Create new user with server-side structure
            const newUser = {
                id: this.generateUserId(),
                name: userInfo.name,
                email: userInfo.email,
                dateOfBirth: userInfo.dateOfBirth,
                password: this.hashPassword(userInfo.password), // Server-side hashing
                joinDate: new Date().toISOString(),
                medicalId: userInfo.medicalId || null,
                profile: {
                    totalAnalyses: 0,
                    lastAnalysis: null,
                    averageScore: 0,
                    riskAssessments: { healthy: 0, atRisk: 0 }
                },
                analyses: [], // User's analysis IDs (references to analyses.json)
                settings: {
                    notifications: true,
                    dataRetention: true,
                    privacyLevel: 'standard'
                },
                metadata: {
                    createdAt: new Date().toISOString(),
                    lastLogin: null,
                    loginCount: 0,
                    ipAddress: null // Would be set server-side
                }
            };
            
            userData.users.push(newUser);
            userData.metadata.totalUsers = userData.users.length;
            
            const saveResult = await this.saveData('users', userData);
            if (saveResult.success) {
                return { success: true, user: newUser, message: 'User created successfully' };
            } else {
                return { success: false, message: 'Failed to save user data' };
            }
        } catch (error) {
            console.error('Error creating user:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Update user data
     * @param {string} userId - User ID
     * @param {Object} updates - Updates to apply
     * @returns {Promise<Object>} Result object
     */
    async updateUser(userId, updates) {
        try {
            const userData = await this.loadData('users');
            const userIndex = userData.users.findIndex(user => user.id === userId);
            
            if (userIndex === -1) {
                return { success: false, message: 'User not found' };
            }
            
            // Apply updates
            userData.users[userIndex] = {
                ...userData.users[userIndex],
                ...updates,
                metadata: {
                    ...userData.users[userIndex].metadata,
                    lastUpdated: new Date().toISOString()
                }
            };
            
            const saveResult = await this.saveData('users', userData);
            return saveResult.success ? 
                { success: true, user: userData.users[userIndex] } : 
                { success: false, message: 'Failed to update user' };
        } catch (error) {
            console.error('Error updating user:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Save analysis result
     * @param {string} userId - User ID
     * @param {Object} analysisData - Analysis result data
     * @returns {Promise<Object>} Result object
     */
    async saveAnalysis(userId, analysisData) {
        try {
            // Save to analyses.json
            const analysesData = await this.loadData('analyses');
            const analysisId = this.generateAnalysisId();
            
            const analysis = {
                id: analysisId,
                userId: userId,
                timestamp: new Date().toISOString(),
                fileName: analysisData.fileName,
                score: analysisData.score,
                label: analysisData.label,
                windows: analysisData.windows,
                threshold: analysisData.threshold,
                result: analysisData.result,
                analysisTime: analysisData.analysisTime,
                fileSize: analysisData.fileSize || 0,
                metadata: {
                    ipAddress: null, // Would be set server-side
                    userAgent: navigator.userAgent,
                    apiVersion: '1.0'
                }
            };
            
            analysesData.analyses.push(analysis);
            analysesData.metadata.totalAnalyses = analysesData.analyses.length;
            
            // Update statistics
            this.updateAnalysisStatistics(analysesData, analysis);
            
            await this.saveData('analyses', analysesData);
            
            // Update user's analysis references
            const userData = await this.loadData('users');
            const userIndex = userData.users.findIndex(user => user.id === userId);
            
            if (userIndex !== -1) {
                userData.users[userIndex].analyses.push(analysisId);
                userData.users[userIndex].profile.totalAnalyses++;
                userData.users[userIndex].profile.lastAnalysis = analysis.timestamp;
                
                // Recalculate average score
                const userAnalyses = analysesData.analyses.filter(a => a.userId === userId);
                const avgScore = userAnalyses.reduce((sum, a) => sum + a.score, 0) / userAnalyses.length;
                userData.users[userIndex].profile.averageScore = avgScore;
                
                await this.saveData('users', userData);
            }
            
            return { success: true, analysis: analysis };
        } catch (error) {
            console.error('Error saving analysis:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Get user's analyses
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of analysis objects
     */
    async getUserAnalyses(userId) {
        try {
            const analysesData = await this.loadData('analyses');
            return analysesData.analyses.filter(analysis => analysis.userId === userId);
        } catch (error) {
            console.error('Error getting user analyses:', error);
            return [];
        }
    }

    /**
     * Update analysis statistics
     * @param {Object} analysesData - Analyses data object
     * @param {Object} newAnalysis - New analysis to include in stats
     */
    updateAnalysisStatistics(analysesData, newAnalysis) {
        const stats = analysesData.statistics;
        
        if (newAnalysis.result === 'healthy' || newAnalysis.label === 'Sain') {
            stats.totalHealthy++;
        } else {
            stats.totalAtRisk++;
        }
        
        // Recalculate average score
        const allScores = analysesData.analyses.map(a => a.score);
        allScores.push(newAnalysis.score);
        stats.averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
        
        // Update daily analyses
        const today = new Date().toDateString();
        const todayEntry = stats.dailyAnalyses.find(entry => entry.date === today);
        if (todayEntry) {
            todayEntry.count++;
        } else {
            stats.dailyAnalyses.push({ date: today, count: 1 });
        }
        
        // Keep only last 30 days
        stats.dailyAnalyses = stats.dailyAnalyses.slice(-30);
    }

    /**
     * Generate unique user ID
     * @returns {string} Unique user ID
     */
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generate unique analysis ID
     * @returns {string} Unique analysis ID
     */
    generateAnalysisId() {
        return 'analysis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Simple password hashing (in production, use proper bcrypt)
     * @param {string} password - Plain text password
     * @returns {string} Hashed password
     */
    hashPassword(password) {
        // Simple hash for demo - use proper bcrypt in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    /**
     * Verify password
     * @param {string} password - Plain text password
     * @param {string} hashedPassword - Hashed password
     * @returns {boolean} Password match result
     */
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }
}

// Export for use in main application
window.DataManager = DataManager;