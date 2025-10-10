
class SmartFormValidator {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.fields = {
            fullName: document.getElementById('fullNameField'),
            email: document.getElementById('emailField'),
            phone: document.getElementById('phoneField'),
            age: document.getElementById('ageField'),
            password: document.getElementById('passwordField'),
            confirmPassword: document.getElementById('confirmPasswordField')
        };
        this.feedbacks = {
            fullName: document.getElementById('fullNameFeedback'),
            email: document.getElementById('emailFeedback'),
            phone: document.getElementById('phoneFeedback'),
            age: document.getElementById('ageFeedback'),
            password: document.getElementById('passwordFeedback'),
            confirmPassword: document.getElementById('confirmPasswordFeedback')
        };
        this.fieldStates = {};
        this.passwordStrengthFill = document.getElementById('passwordStrengthFill');
        this.passwordStrengthText = document.getElementById('passwordStrengthText');
        this.submitButton = document.getElementById('submitButton');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.buttonText = document.getElementById('buttonText');
        
        this.initializeValidator();

        this.fields.password.addEventListener('input', () => {
            const confirmValue = this.fields.confirmPassword.value;
            if (confirmValue.length > 0) {
                this.fields.confirmPassword.value = ''; 
                this.feedbacks.confirmPassword.textContent = ''; 
                this.fields.confirmPassword.classList.remove('inputValid', 'inputInvalid');
            }
        });
    }
    
    initializeValidator() {
        this.setupEventListeners();
        this.updateSubmitButtonState();
    }

    setupEventListeners() {
        // Validate only on blur (when user leaves field)
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            
            // Validate when user leaves the field
            field.addEventListener('blur', () => {
                this.validateField(fieldName, true);
                
                // ✅ ADDED: When password field is validated, also re-check confirm password
                if (fieldName === 'password' && this.fields.confirmPassword.value) {
                    this.validateField('confirmPassword', true);
                }
                this.updateSubmitButtonState();
            });
            
            // Special handling for different fields during typing
            field.addEventListener('input', () => {
                this.handleInputTyping(fieldName);
                this.updateSubmitButtonState();
            });
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmission();
        });
    }

    handleInputTyping(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value;
        
        // Clear previous validation styles during typing
        field.classList.remove('inputValid', 'inputInvalid');  
        this.feedbacks[fieldName].textContent = '';
        this.feedbacks[fieldName].className = 'validationFeedback';
        
        // Special cases
        if (fieldName === 'password') {
            this.updatePasswordStrength(value);
            
            // Re-validate confirm password if it has content and password changed
            const confirmPasswordValue = this.fields.confirmPassword.value;
            if (confirmPasswordValue) {
                // Clear confirm password validation during password typing
                this.fields.confirmPassword.classList.remove('inputValid', 'inputInvalid');
                this.feedbacks.confirmPassword.textContent = '';
                this.feedbacks.confirmPassword.className = 'validationFeedback';
            }
        }
        
        if (fieldName === 'age') {
            // Only allow numbers in age field
            field.value = value.replace(/[^0-9]/g, ''); 
        }
        
        // ✅ ADDED: Real-time validation for confirm password
        if (fieldName === 'confirmPassword') {
            // Validate immediately if confirm password field has content
            if (value.length > 0) {
                const isValid = this.validateConfirmPassword(value);
                const message = isValid ? '✅ Passwords match!' : 'Passwords do not match';
                
                // Show immediate feedback
                if (value === this.fields.password.value) {
                    field.classList.add('inputValid');
                    this.feedbacks[fieldName].textContent = message;
                    this.feedbacks[fieldName].className = 'validationFeedback validationSuccess';
                } else {
                    field.classList.add('inputInvalid');
                    this.feedbacks[fieldName].textContent = message;
                    this.feedbacks[fieldName].className = 'validationFeedback validationError';
                }
                
                // Update field state
                this.fieldStates[fieldName] = isValid;
            }
        }
    }

    validateField(fieldName, showFeedback = false) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = false;
        let message = '';
        
        switch (fieldName) {
            case 'fullName':
                isValid = this.validateFullName(value);
                message = isValid ? '✅ Looks good!' : 'Please enter a valid full name (2-50 characters, letters only)';
                break;
                
            case 'email':
                isValid = this.validateEmail(value);
                message = isValid ? '✅ Valid email address!' : 'Please enter a valid email address';
                break;
                
            case 'phone':
                isValid = this.validatePhone(value);
                message = isValid
                ? '✅ Valid phone number!'
                : 'Please enter a valid phone number. Example: +91 XXXXXXXXXX';
                break;
                
            case 'age':
                const ageResult = this.validateAge(value);
                isValid = ageResult.valid;
                message = ageResult.message;
                break;
                
            case 'password':
                const passwordResult = this.validatePassword(value);
                isValid = passwordResult.valid;
                message = passwordResult.message;
                break;
                
            case 'confirmPassword':
                isValid = this.validateConfirmPassword(value);
                message = isValid ? '✅ Passwords match!' : 'Passwords do not match';
                break;
        }
        
        // Store validation state
        this.fieldStates[fieldName] = isValid;
        
        // Show visual feedback only if requested
        if (showFeedback) {
            this.showFieldFeedback(fieldName, isValid, message);
        }
        
        return isValid;
    }
    
    validateFullName(value) {
        return value.length >= 2 && value.length <= 50 && /^[a-zA-Z\s\-\.\']+$/.test(value);    
    }
    
    validateEmail(value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);      
    }
    
    validatePhone(value) {
        const cleanPhone = value.replace(/[\s\-\(\)]/g, '');    
        return /^[\+]?[1-9][\d]{9,14}$/.test(cleanPhone);
    }
    
    validateAge(value) {
        if (!value) {
            return { valid: false, message: 'Age is required' };
        }
        
        const age = parseInt(value);
        
        if (isNaN(age)) {
            return { valid: false, message: 'Please enter a valid number' };
        }
        
        if (age < 18) {
            return { valid: false, message: 'You must be at least 18 years old' };
        }
        
        if (age > 120) {
            return { valid: false, message: 'Please enter a realistic age' };
        }
        
        return { valid: true, message: '✅ Valid age!' };
    }
    
    validatePassword(value) {
        if (value.length < 8) {
            return { valid: false, message: 'Password must be at least 8 characters long' };
        }
        
        const strength = this.calculatePasswordStrength(value);
        
        if (strength < 3) {
            return { valid: false, message: 'Password is too weak. Include uppercase, lowercase, numbers, and special characters' };
        }
        
        return { valid: true, message: '✅ Strong password!' };
    }
    
    validateConfirmPassword(value) {
        return value === this.fields.password.value && value.length > 0;
    }
    
    calculatePasswordStrength(password) {       
        let strength = 0;                   
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        
        return strength;
    }
    
    updatePasswordStrength(password) {
        const strength = this.calculatePasswordStrength(password);
        const strengthTexts = [
            '',
            'Very Weak',
            'Weak', 
            'Fair',
            'Good',
            'Strong'
        ];
        
        this.passwordStrengthFill.className = `passwordStrengthFill strength-${strength}`;
        this.passwordStrengthText.textContent = password ? strengthTexts[strength] : '';
        this.passwordStrengthText.style.color = ['#6c757d', '#dc3545', '#fd7e14', '#ffc107', '#28a745', '#28a745'][strength];
    }
    
    showFieldFeedback(fieldName, isValid, message) {
        const field = this.fields[fieldName];
        const feedback = this.feedbacks[fieldName];
        
        // Update field styling
        field.classList.remove('inputValid', 'inputInvalid');
        if (field.value.trim()) {
            field.classList.add(isValid ? 'inputValid' : 'inputInvalid');
        }
        
        // Update feedback message
        feedback.textContent = message;
        feedback.className = `validationFeedback ${isValid ? 'validationSuccess' : 'validationError'}`;
    }
    
    updateSubmitButtonState() {
        // Check if all fields have values (not necessarily valid yet)
        const allFieldsFilled = Object.keys(this.fields).every(fieldName => {
            return this.fields[fieldName].value.trim().length > 0;
        });
        
        // Enable button if all fields are filled
        this.submitButton.disabled = !allFieldsFilled;
    }
    
    async handleFormSubmission() {
        // Validate all fields before submission
        let allFieldsValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            const isValid = this.validateField(fieldName, true);
            if (!isValid) {
                allFieldsValid = false;
            }
        });
        
        if (!allFieldsValid) {
            this.showAlert('Please fix all validation errors before submitting', 'error');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Simulate API call
            await this.simulateRegistration();
            this.showSuccessMessage();
        } catch (error) {
            this.showAlert('Registration failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }
    
    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.loadingSpinner.style.display = isLoading ? 'block' : 'none';
        this.buttonText.textContent = isLoading ? 'Creating Account...' : 'Create Account';
    }
    
    async simulateRegistration() {              
        return new Promise((resolve) => {
            setTimeout(resolve, 2200);
        });
    }
    
    showSuccessMessage() {
        const successMessage = document.getElementById('successMessage');
        const successDetails = document.getElementById('successDetails');
        
        successDetails.innerHTML = 
            `<strong>Welcome, ${this.fields.fullName.value}!</strong><br>
            Email: ${this.fields.email.value}<br>
            Phone: ${this.fields.phone.value}<br>
            Age: ${this.fields.age.value}<br>
            Registration completed at: ${new Date().toLocaleString()}`;

        this.form.style.display = 'none';       
        successMessage.style.display = 'block';

        successMessage.classList.remove('animate');
        void successMessage.offsetWidth;
        successMessage.classList.add('animate');
    }
    
    showAlert(message, type) {                  
        alert(message); // Simple implementation
    }
}

// Initialize the validator when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SmartFormValidator();  

    document.querySelectorAll('.togglePassword').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = btn.parentElement.querySelector('input');
            const isPwd = input.type === "password";
            input.type = isPwd ? "text" : "password";
            btn.innerHTML = isPwd ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        });
    });

    const pwdField = document.getElementById("passwordField");
    const pwdRules = document.querySelector('.password-rules');
    pwdField.addEventListener("focus", () => {
        pwdRules.classList.add('active');
    });
    pwdField.addEventListener("blur", () => {
        if (!isPasswordStrong(pwdField.value)) {
            pwdRules.classList.remove('active');
        }
    });
    function isPasswordStrong(val) {
        return (
            val.length >= 8 &&
            /[A-Z]/.test(val) &&
            /[a-z]/.test(val) &&
            /\d/.test(val) &&
            /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]/.test(val)
        );
    }

    // In your password 'input' event logic:
    pwdField.addEventListener("input", function() {
        const val = pwdField.value;
        document.getElementById("pwdRuleLength").className = val.length >= 8 ? "valid" : "invalid";
        document.getElementById("pwdRuleUpper").className = /[A-Z]/.test(val) ? "valid" : "invalid";
        document.getElementById("pwdRuleLower").className = /[a-z]/.test(val) ? "valid" : "invalid";
        document.getElementById("pwdRuleDigit").className = /\d/.test(val) ? "valid" : "invalid";
        document.getElementById("pwdRuleSpecial").className = /[!@#$%^&*()_\-+=\[\]{};:'",.<>/?\\|]/.test(val) ? "valid" : "invalid";
        if (isPasswordStrong(pwdField.value)) {
            pwdRules.classList.remove('active');
        }
    });

    document.getElementById('closeSuccessBtn').addEventListener('click', function() {
        document.getElementById('successMessage').style.display = 'none';
        // Optional: Reset form or show form again for next registration
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registrationForm');
    const fields = ['fullNameField', 'emailField', 'phoneField', 'ageField', 'passwordField', 'confirmPasswordField'];

    // Load saved form data if present
    fields.forEach(id => {
        const saved = localStorage.getItem('form_' + id);
        if (saved !== null) document.getElementById(id).value = saved;
    });

    // Save on input
    fields.forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
        localStorage.setItem('form_' + id, e.target.value);
        });
    });

    // Clear autosave on successful form submit
    form.addEventListener('submit', () => {
        fields.forEach(id => localStorage.removeItem('form_' + id));
    });
});

document.getElementById('toggleDarkMode').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    this.textContent = document.body.classList.contains('dark-mode') ? '☀️ Dark Mode' : '🌙 Dark Mode';
});
