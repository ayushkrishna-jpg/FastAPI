console.log('base.js script loaded');

function showAlert(message, type = 'danger') {
    console.log(`showAlert called: ${message} (type: ${type})`);
    const alertContainer = document.getElementById('alert-container');
    if (alertContainer) {
        // Prevent duplicate alerts with the same message
        const existingAlerts = alertContainer.querySelectorAll('.alert');
        for (let alert of existingAlerts) {
            if (alert.textContent.includes(message)) {
                console.log('Duplicate alert skipped');
                return;
            }
        }

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert" style="box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,.125);">
                ${message.replace(/\n/g, '<br>')}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        `;
        alertContainer.append(wrapper);
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alert = wrapper.querySelector('.alert');
            if (alert && typeof $ !== 'undefined') {
                $(alert).alert('close');
            } else if (wrapper.parentNode) {
                wrapper.remove();
            }
        }, 3000);
    } else {
        console.error('alert-container not found in DOM!');
    }
}

function parseErrorMessage(errorData) {
    let errorMessage = 'An error occurred';
    if (errorData && errorData.detail) {
        if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map(err => {
                // Remove 'body.' prefix from location if it exists
                let field = err.loc ? err.loc.filter(l => l !== 'body').join('.') : 'error';
                return `${field}: ${err.msg}`;
            }).join('\n');
        } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
        } else {
            errorMessage = JSON.stringify(errorData.detail);
        }
    } else if (errorData && errorData.message) {
        errorMessage = errorData.message;
    }
    return errorMessage;
}

// Add Todo JS
const todoForm = document.getElementById('todoForm');
if (todoForm) {
    todoForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        const payload = {
            title: data.title,
            description: data.description,
            priority: parseInt(data.priority),
            complete: false
        };

        try {
            const response = await fetch('/todos/todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getCookie('access_token')}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                form.reset(); // Clear the form
            } else {
                // Handle error
                const errorData = await response.json();
                showAlert(`Error: ${parseErrorMessage(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.');
        }
    });

    // Real-time validation for todo form
    const inputs = todoForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (!input.value && input.hasAttribute('required')) {
                showAlert(`${input.name} is required`, 'warning');
            }
        });
    });
}

// Edit Todo JS
const editTodoForm = document.getElementById('editTodoForm');
if (editTodoForm) {
    editTodoForm.addEventListener('submit', async function (event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        var url = window.location.pathname;
        const todoId = url.substring(url.lastIndexOf('/') + 1);

        const payload = {
            title: data.title,
            description: data.description,
            priority: parseInt(data.priority),
            complete: data.complete === "on"
        };

        try {
            const token = getCookie('access_token');
            console.log(token)
            if (!token) {
                throw new Error('Authentication token not found');
            }

            console.log(`${todoId}`)

            const response = await fetch(`/todos/todo/${todoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                window.location.href = '/todos/todo-page'; // Redirect to the todo page
            } else {
                // Handle error
                const errorData = await response.json();
                showAlert(`Error: ${parseErrorMessage(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.');
        }
    });

    const editInputs = editTodoForm.querySelectorAll('input, textarea, select');
    editInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (!input.value && input.hasAttribute('required')) {
                showAlert(`${input.name} is required`, 'warning');
            }
        });
    });

    document.getElementById('deleteButton').addEventListener('click', async function () {
        var url = window.location.pathname;
        const todoId = url.substring(url.lastIndexOf('/') + 1);

        try {
            const token = getCookie('access_token');
            if (!token) {
                throw new Error('Authentication token not found');
            }

            const response = await fetch(`/todos/todo/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Handle success
                window.location.href = '/todos/todo-page'; // Redirect to the todo page
            } else {
                // Handle error
                const errorData = await response.json();
                showAlert(`Error: ${parseErrorMessage(errorData)}`);
            }
        } catch (error) {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.');
        }
    });
}

// Login JS
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const payload = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            payload.append(key, value);
        }

        try {
            const response = await fetch('/auth/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            if (response.ok) {
                // Handle success (e.g., redirect to dashboard)
                const data = await response.json();
                console.log('Login successful');
                // Delete any cookies available
                logout();
                // Save token to cookie
                document.cookie = `access_token=${data.access_token}; path=/`;
                window.location.href = '/todos/todo-page'; // Change this to your desired redirect page
            } else {
                // Handle error
                const errorData = await response.json();
                console.error('Login Failed:', errorData);
                showAlert(`Error: ${parseErrorMessage(errorData)}`);
            }
        } catch (error) {
            console.error('Login Exception:', error);
            showAlert('An error occurred. Please try again.');
        }
    });

    // Real-time validation for login form
    const loginInputs = loginForm.querySelectorAll('input');
    loginInputs.forEach(input => {
        input.addEventListener('blur', function () {
            if (!input.value && input.hasAttribute('required')) {
                showAlert(`${input.name} is required`, 'warning');
            }
        });
    });
}

// Register JS
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.password2) {
            showAlert("Passwords do not match");
            return;
        }

        const payload = {
            email: data.email,
            username: data.username,
            first_name: data.firstname,
            last_name: data.lastname,
            role: data.role,
            phone_number: data.phone_number,
            password: data.password
        };

        console.log('Registering with payload:', payload);

        try {
            const response = await fetch('/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                console.log('Registration successful');
                window.location.href = '/auth/login-page';
            } else {
                // Handle error
                const errorData = await response.json();
                console.error('Registration Failed:', errorData);
                showAlert(`Error: ${parseErrorMessage(errorData)}`);
            }
        } catch (error) {
            console.error('Registration Exception:', error);
            showAlert('An error occurred. Please try again.');
        }
    });

    // Real-time field validation for the register form
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', function () {
            const name = input.name;
            const value = input.value;
            let error = '';

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const phoneRegex = /^\d{10}$/;

            if (!value && input.hasAttribute('required')) {
                error = `${name} is required`;
            } else if (name === 'email') {
                if (value.length < 5) {
                    error = 'Email must be at least 5 characters long';
                } else if (!emailRegex.test(value)) {
                    error = 'Please enter a valid email address';
                }
            } else if (name === 'username' && value.length < 3) {
                error = 'Username must be at least 3 characters long';
            } else if (name === 'password' && value.length < 6) {
                error = 'Password must be at least 6 characters long';
            } else if (name === 'phone_number' && !phoneRegex.test(value)) {
                error = 'Phone number must be exactly 10 digits';
            } else if (name === 'password2') {
                const passwordInput = registerForm.querySelector('input[name="password"]');
                if (passwordInput && value !== passwordInput.value) {
                    error = 'Passwords do not match';
                }
            }

            if (error) {
                showAlert(error, 'warning');
            }
        });
    });
}





// Helper function to get a cookie by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

function logout() {
    // Get all cookies
    const cookies = document.cookie.split(";");

    // Iterate through all cookies and delete each one
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        // Set the cookie's expiry date to a past date to delete it
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    // Redirect to the login page
    window.location.href = '/auth/login-page';
};