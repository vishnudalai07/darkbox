// Global variables
let responseData = null;

// DOM elements
const form = document.getElementById('designerForm');
const submitBtn = document.getElementById('submitBtn');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const tableWrapper = document.getElementById('tableWrapper');
const downloadBtn = document.getElementById('downloadBtn');
const retryBtn = document.getElementById('retryBtn');
const errorText = document.getElementById('errorText');

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    animateOnLoad();
});

function initializeEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Download button
    downloadBtn.addEventListener('click', downloadCSV);
    
    // Retry button
    retryBtn.addEventListener('click', handleRetry);
    
    // Input animations
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });
}

function animateOnLoad() {
    // Add staggered animation to form elements
    const formGroups = document.querySelectorAll('.form-group');
    formGroups.forEach((group, index) => {
        group.style.opacity = '0';
        group.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            group.style.transition = 'all 0.6s ease';
            group.style.opacity = '1';
            group.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

function handleInputFocus(e) {
    const inputGroup = e.target.closest('.form-group');
    inputGroup.style.transform = 'scale(1.02)';
    inputGroup.style.transition = 'transform 0.3s ease';
}

function handleInputBlur(e) {
    const inputGroup = e.target.closest('.form-group');
    inputGroup.style.transform = 'scale(1)';
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(form);
    const data = {
        driveLink: formData.get('driveLink'),
        jobDescription: formData.get('jobDescription'),
        webhookUrl: formData.get('webhookUrl')
    };
    
    // Validate form data
    if (!validateFormData(data)) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        // Send POST request to webhook
        const response = await sendWebhookRequest(data);
        
        // Handle successful response
        handleSuccessResponse(response);
        
    } catch (error) {
        // Handle error
        handleErrorResponse(error);
    }
}

function validateFormData(data) {
    const errors = [];
    
    // Validate Google Drive link
    if (!isValidGoogleDriveUrl(data.driveLink)) {
        errors.push('Please enter a valid Google Drive folder link');
    }
    
    // Validate job description
    if (data.jobDescription.trim().length < 10) {
        errors.push('Job description must be at least 10 characters long');
    }
    
    // Validate webhook URL
    if (!isValidUrl(data.webhookUrl)) {
        errors.push('Please enter a valid webhook URL');
    }
    
    if (errors.length > 0) {
        showValidationErrors(errors);
        return false;
    }
    
    return true;
}

function isValidGoogleDriveUrl(url) {
    const driveRegex = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;
    return driveRegex.test(url);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function showValidationErrors(errors) {
    const errorMessage = errors.join('\n');
    alert(`Please fix the following errors:\n\n${errorMessage}`);
}

function showLoadingState() {
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    hideResults();
    hideError();
}

function hideLoadingState() {
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
}

async function sendWebhookRequest(data) {
    const requestPayload = {
        google_drive_link: data.driveLink,
        job_description: data.jobDescription,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
    };
    
    const response = await fetch(data.webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    return responseData;
}

function handleSuccessResponse(data) {
    hideLoadingState();
    responseData = data;
    
    // Display the table
    displayTable(data);
    showResults();
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Show success animation
    showSuccessAnimation();
}

function handleErrorResponse(error) {
    hideLoadingState();
    console.error('Request failed:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error: Unable to connect to the webhook. Please check your internet connection and webhook URL.';
    } else if (error.message.includes('HTTP 404')) {
        errorMessage = 'Webhook not found (404). Please verify the webhook URL is correct.';
    } else if (error.message.includes('HTTP 500')) {
        errorMessage = 'Server error (500). The webhook service is experiencing issues. Please try again later.';
    } else if (error.message.includes('HTTP')) {
        errorMessage = `Request failed: ${error.message}`;
    }
    
    showError(errorMessage);
}

function displayTable(data) {
    // Clear previous table
    tableWrapper.innerHTML = '';
    
    // Handle different data formats
    let tableData = [];
    
    if (Array.isArray(data)) {
        tableData = data;
    } else if (data && typeof data === 'object') {
        if (data.results && Array.isArray(data.results)) {
            tableData = data.results;
        } else if (data.data && Array.isArray(data.data)) {
            tableData = data.data;
        } else {
            // Convert object to array
            tableData = [data];
        }
    }
    
    if (tableData.length === 0) {
        tableWrapper.innerHTML = '<div class="table-loading">No data to display</div>';
        return;
    }
    
    // Create table
    const table = document.createElement('table');
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Get all unique keys from the data
    const allKeys = new Set();
    tableData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => allKeys.add(key));
        }
    });
    
    const keys = Array.from(allKeys);
    
    if (keys.length === 0) {
        // Handle primitive data
        keys.push('Value');
        tableData = tableData.map((item, index) => ({ 
            'Index': index + 1, 
            'Value': item 
        }));
        keys.unshift('Index');
    }
    
    // Create header cells
    keys.forEach(key => {
        const th = document.createElement('th');
        th.textContent = formatHeaderText(key);
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    tableData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        keys.forEach(key => {
            const td = document.createElement('td');
            let value = '';
            
            if (typeof item === 'object' && item !== null) {
                value = item[key] || '';
            } else {
                value = key === 'Value' ? item : (key === 'Index' ? index + 1 : '');
            }
            
            // Format the value
            td.textContent = formatCellValue(value);
            row.appendChild(td);
        });
        
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    
    // Add table animation
    table.style.opacity = '0';
    table.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        table.style.transition = 'all 0.6s ease';
        table.style.opacity = '1';
        table.style.transform = 'translateY(0)';
    }, 100);
}

function formatHeaderText(text) {
    return text
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/_/g, ' ')
        .trim();
}

function formatCellValue(value) {
    if (value === null || value === undefined) {
        return '';
    }
    
    if (typeof value === 'object') {
        return JSON.stringify(value);
    }
    
    return String(value);
}

function downloadCSV() {
    if (!responseData) {
        alert('No data available to download');
        return;
    }
    
    // Prepare data for CSV
    let csvData = [];
    
    if (Array.isArray(responseData)) {
        csvData = responseData;
    } else if (responseData && typeof responseData === 'object') {
        if (responseData.results && Array.isArray(responseData.results)) {
            csvData = responseData.results;
        } else if (responseData.data && Array.isArray(responseData.data)) {
            csvData = responseData.data;
        } else {
            csvData = [responseData];
        }
    }
    
    if (csvData.length === 0) {
        alert('No data available to download');
        return;
    }
    
    // Get all unique keys
    const allKeys = new Set();
    csvData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
            Object.keys(item).forEach(key => allKeys.add(key));
        }
    });
    
    let keys = Array.from(allKeys);
    
    if (keys.length === 0) {
        keys = ['Index', 'Value'];
        csvData = csvData.map((item, index) => ({ 
            'Index': index + 1, 
            'Value': item 
        }));
    }
    
    // Create CSV content
    let csvContent = '';
    
    // Add header
    csvContent += keys.map(key => `"${formatHeaderText(key)}"`).join(',') + '\n';
    
    // Add data rows
    csvData.forEach(item => {
        const row = keys.map(key => {
            let value = '';
            
            if (typeof item === 'object' && item !== null) {
                value = item[key] || '';
            } else {
                value = key === 'Value' ? item : '';
            }
            
            // Escape quotes and wrap in quotes
            const escapedValue = String(value).replace(/"/g, '""');
            return `"${escapedValue}"`;
        });
        
        csvContent += row.join(',') + '\n';
    });
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `designer-app-results-${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show download success animation
        showDownloadAnimation();
    } else {
        alert('Your browser does not support file downloads');
    }
}

function showResults() {
    resultsSection.style.display = 'block';
    errorSection.style.display = 'none';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    resultsSection.style.display = 'none';
    
    // Scroll to error
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorSection.style.display = 'none';
}

function handleRetry() {
    hideError();
    // Reset form if needed
    form.scrollIntoView({ behavior: 'smooth' });
}

function showSuccessAnimation() {
    // Create success notification
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(72, 187, 120, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            animation: slideInRight 0.5s ease-out;
        ">
            <i class="fas fa-check-circle"></i>
            Data processed successfully!
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

function showDownloadAnimation() {
    // Create download notification
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 600;
            animation: slideInRight 0.5s ease-out;
        ">
            <i class="fas fa-download"></i>
            CSV file downloaded!
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Handle form validation in real-time
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
});

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error styling
    field.classList.remove('error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    
    let isValid = true;
    let errorMessage = '';
    
    if (fieldName === 'driveLink' && value) {
        if (!isValidGoogleDriveUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid Google Drive folder link';
        }
    } else if (fieldName === 'webhookUrl' && value) {
        if (!isValidUrl(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }
    } else if (fieldName === 'jobDescription' && value) {
        if (value.length < 10) {
            isValid = false;
            errorMessage = 'Job description must be at least 10 characters long';
        }
    }
    
    if (!isValid) {
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = errorMessage;
        errorDiv.style.cssText = `
            color: #f56565;
            font-size: 0.875rem;
            margin-top: 4px;
            display: flex;
            align-items: center;
            gap: 6px;
        `;
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i>${errorMessage}`;
        
        field.parentNode.appendChild(errorDiv);
    }
}

// Add error styling to CSS
const errorStyle = document.createElement('style');
errorStyle.textContent = `
    .form-input.error,
    .form-textarea.error {
        border-color: #f56565 !important;
        box-shadow: 0 0 0 3px rgba(245, 101, 101, 0.1) !important;
    }
`;
document.head.appendChild(errorStyle);