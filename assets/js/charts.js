// Chart.js Configuration and Initialization
// Advanced Chart Components for ParkinsonDetect

class ChartManager {
    constructor() {
        this.charts = {};
        this.defaultColors = {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#27ae60',
            danger: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
    }

    // Initialize all dashboard charts
    initializeDashboardCharts(analysisHistory) {
        this.initializeTrendChart(analysisHistory);
        this.initializeRiskGaugeChart(analysisHistory);
        this.initializeDistributionChart(analysisHistory);
        this.initializeWindowAnalysisChart(analysisHistory);
        this.initializeMonthlyAnalysisChart(analysisHistory);
    }

    // MSE Score Trend Line Chart
    initializeTrendChart(history) {
        const ctx = document.getElementById('trendChart');
        if (!ctx || !history.length) return;

        const sortedHistory = [...history].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const labels = sortedHistory.map(item => new Date(item.timestamp).toLocaleDateString());
        const scores = sortedHistory.map(item => item.score);
        const threshold = 1.376;

        // Color points based on threshold
        const pointColors = scores.map(score => score > threshold ? this.defaultColors.danger : this.defaultColors.success);

        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'MSE Reconstruction Score',
                    data: scores,
                    borderColor: this.defaultColors.primary,
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointColors,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }, {
                    label: 'Risk Threshold (1.376)',
                    data: Array(labels.length).fill(threshold),
                    borderColor: this.defaultColors.danger,
                    borderDash: [10, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'MSE Score',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Analysis Date',
                            font: { size: 14, weight: 'bold' }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Motion Pattern Analysis - Score Progression',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0) {
                                    const score = context.raw;
                                    const status = score > threshold ? 'Above threshold (Risk detected)' : 'Below threshold (Healthy pattern)';
                                    return status;
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Risk Assessment Gauge Chart
    initializeRiskGaugeChart(history) {
        const ctx = document.getElementById('riskGaugeChart');
        if (!ctx || !history.length) return;

        const latestScore = history[0]?.score || 0;
        const threshold = 1.376;
        const maxScore = Math.max(2.0, latestScore * 1.5); // Dynamic max based on latest score

        // Calculate risk percentage
        const riskPercentage = Math.min(100, (latestScore / threshold) * 100);

        this.charts.riskGaugeChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [riskPercentage, 100 - riskPercentage],
                    backgroundColor: [
                        latestScore > threshold ? this.defaultColors.danger : this.defaultColors.success,
                        '#e9ecef'
                    ],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                rotation: -90,
                circumference: 180,
                plugins: {
                    title: {
                        display: true,
                        text: 'Current Risk Assessment',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            },
            plugins: [{
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    const centerX = chart.width / 2;
                    const centerY = chart.height / 2;

                    ctx.save();
                    ctx.font = 'bold 24px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillStyle = latestScore > threshold ? this.defaultColors.danger : this.defaultColors.success;
                    ctx.fillText(`${latestScore.toFixed(3)}`, centerX, centerY - 10);
                    
                    ctx.font = '14px Arial';
                    ctx.fillStyle = '#666';
                    ctx.fillText('MSE Score', centerX, centerY + 15);
                    
                    const status = latestScore > threshold ? 'Risk Detected' : 'Healthy Pattern';
                    ctx.fillText(status, centerX, centerY + 35);
                    ctx.restore();
                }
            }]
        });
    }

    // Analysis Results Distribution Chart
    initializeDistributionChart(history) {
        const ctx = document.getElementById('distributionChart');
        if (!ctx) return;

        const healthyCount = history.filter(item => item.result === 'healthy').length;
        const riskCount = history.filter(item => item.result === 'at-risk').length;

        this.charts.distributionChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Healthy Patterns', 'Risk Patterns'],
                datasets: [{
                    data: [healthyCount, riskCount],
                    backgroundColor: [this.defaultColors.success, this.defaultColors.danger],
                    borderWidth: 3,
                    borderColor: '#ffffff',
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Analysis Results Distribution',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((context.raw / total) * 100).toFixed(1);
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Window Count Analysis Bar Chart
    initializeWindowAnalysisChart(history) {
        const ctx = document.getElementById('windowAnalysisChart');
        if (!ctx || !history.length) return;

        // Group by window count
        const windowCounts = {};
        history.forEach(item => {
            const windows = item.windows || 0;
            windowCounts[windows] = (windowCounts[windows] || 0) + 1;
        });

        const labels = Object.keys(windowCounts).sort((a, b) => a - b);
        const data = labels.map(label => windowCounts[label]);

        this.charts.windowAnalysisChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(l => `${l} Windows`),
                datasets: [{
                    label: 'Number of Analyses',
                    data: data,
                    backgroundColor: this.defaultColors.info,
                    borderColor: this.defaultColors.primary,
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
                            text: 'Frequency',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Analysis Windows',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Analysis Complexity Distribution',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                return 'Higher window counts indicate longer or more complex motion data';
                            }
                        }
                    }
                }
            }
        });
    }

    // Monthly Analysis Frequency Chart
    initializeMonthlyAnalysisChart(history) {
        const ctx = document.getElementById('monthlyAnalysisChart');
        if (!ctx || !history.length) return;

        // Group by month
        const monthlyData = {};
        history.forEach(item => {
            const date = new Date(item.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthlyData).sort();
        const labels = sortedMonths.map(month => {
            const [year, monthNum] = month.split('-');
            const date = new Date(year, monthNum - 1);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        });
        const data = sortedMonths.map(month => monthlyData[month]);

        this.charts.monthlyAnalysisChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Analyses per Month',
                    data: data,
                    borderColor: this.defaultColors.secondary,
                    backgroundColor: 'rgba(118, 75, 162, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: this.defaultColors.secondary,
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
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
                            text: 'Number of Analyses',
                            font: { size: 14, weight: 'bold' }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Month',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Analysis Frequency Over Time',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    // Individual Analysis Comparison Chart
    initializeComparisonChart(currentAnalysis, history) {
        const ctx = document.getElementById('comparisonChart');
        if (!ctx || !currentAnalysis) return;

        const recentAnalyses = history.slice(0, 10).reverse();
        const labels = recentAnalyses.map((_, index) => `Analysis ${index + 1}`);
        const scores = recentAnalyses.map(item => item.score);
        const threshold = 1.376;

        // Highlight current analysis
        const pointColors = scores.map((score, index) => {
            if (index === scores.length - 1) return this.defaultColors.warning; // Current analysis
            return score > threshold ? this.defaultColors.danger : this.defaultColors.success;
        });

        this.charts.comparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'MSE Scores',
                    data: scores,
                    backgroundColor: pointColors.map(color => color + '80'), // Add transparency
                    borderColor: pointColors,
                    borderWidth: 2,
                    borderRadius: 4
                }, {
                    label: 'Risk Threshold',
                    data: Array(labels.length).fill(threshold),
                    type: 'line',
                    borderColor: this.defaultColors.danger,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    borderWidth: 2
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
                            text: 'MSE Score',
                            font: { size: 14, weight: 'bold' }
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Recent Analysis Comparison',
                        font: { size: 16, weight: 'bold' }
                    },
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: function(context) {
                                if (context.datasetIndex === 0) {
                                    const isLatest = context.dataIndex === context.dataset.data.length - 1;
                                    if (isLatest) return '← Current Analysis';
                                    
                                    const score = context.raw;
                                    return score > threshold ? 'Above threshold' : 'Below threshold';
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    // Update charts with new data
    updateCharts(analysisHistory) {
        // Destroy existing charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};

        // Reinitialize with new data
        this.initializeDashboardCharts(analysisHistory);
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    // Get chart statistics for insights
    getChartStatistics(history) {
        if (!history.length) return null;

        const scores = history.map(item => item.score);
        const threshold = 1.376;
        
        return {
            totalAnalyses: history.length,
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            minScore: Math.min(...scores),
            maxScore: Math.max(...scores),
            stdDeviation: this.calculateStandardDeviation(scores),
            healthyCount: history.filter(item => item.result === 'healthy').length,
            riskCount: history.filter(item => item.result === 'at-risk').length,
            consistencyScore: this.calculateConsistencyScore(scores),
            trend: this.calculateTrend(scores)
        };
    }

    // Helper function to calculate standard deviation
    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
        const squaredDifferences = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDifference = squaredDifferences.reduce((sum, value) => sum + value, 0) / values.length;
        return Math.sqrt(avgSquaredDifference);
    }

    // Helper function to calculate consistency score (lower std dev = higher consistency)
    calculateConsistencyScore(scores) {
        const stdDev = this.calculateStandardDeviation(scores);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        // Normalize consistency score (0-100, where 100 is perfectly consistent)
        return Math.max(0, Math.min(100, 100 - (stdDev / avgScore) * 100));
    }

    // Helper function to calculate trend (positive = improving, negative = declining)
    calculateTrend(scores) {
        if (scores.length < 2) return 0;
        
        const recentScores = scores.slice(0, Math.min(5, scores.length));
        const olderScores = scores.slice(Math.min(5, scores.length), Math.min(10, scores.length));
        
        if (olderScores.length === 0) return 0;
        
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((sum, score) => sum + score, 0) / olderScores.length;
        
        // Return percentage change (negative means improvement for MSE scores)
        return ((recentAvg - olderAvg) / olderAvg) * 100;
    }
}

// Export the ChartManager class
window.ChartManager = ChartManager;