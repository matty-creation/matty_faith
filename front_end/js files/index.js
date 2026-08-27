
const API_BASE_URL = "http://127.0.0.1:8000";

try {
    const activeSession = JSON.parse(
        localStorage.getItem("activeUser")
    );

    if (
        activeSession &&
        (activeSession.employee_id || activeSession.email)
    ) {
        window.location.href = "dashboard.html";
    }
} catch (error) {
    localStorage.removeItem("activeUser");
}

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const gotoSignup = document.getElementById("gotoSignup");
const gotoLogin = document.getElementById("gotoLogin");

const alertBox = document.getElementById("alertBox");

const phoneInput = document.getElementById("phone");

function hideAlert() {
    if (alertBox) {
        alertBox.style.display = "none";
        alertBox.innerText = "";
    }
}

function showAlert(message) {
    if (alertBox) {
        alertBox.innerText = message;
        alertBox.style.display = "block";
    }
}

function showLogin() {
    hideAlert();

    if (loginTab) {
        loginTab.classList.add("active");
    }

    if (signupTab) {
        signupTab.classList.remove("active");
    }

    if (loginForm) {
        loginForm.classList.add("active");
    }

    if (signupForm) {
        signupForm.classList.remove("active");
    }
}

function showSignup() {
    hideAlert();

    if (signupTab) {
        signupTab.classList.add("active");
    }

    if (loginTab) {
        loginTab.classList.remove("active");
    }

    if (signupForm) {
        signupForm.classList.add("active");
    }

    if (loginForm) {
        loginForm.classList.remove("active");
    }
}

if (loginTab) {
    loginTab.addEventListener("click", showLogin);
}

if (signupTab) {
    signupTab.addEventListener("click", showSignup);
}

if (gotoSignup) {
    gotoSignup.addEventListener("click", showSignup);
}

if (gotoLogin) {
    gotoLogin.addEventListener("click", showLogin);
}

function formatName(value) {
    return value
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim()
        .split(" ")
        .map(function (word) {
            if (!word) {
                return "";
            }

            return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(" ");
}

const firstNameInput = document.getElementById("first-name");
const lastNameInput = document.getElementById("last-name");

if (firstNameInput) {
    firstNameInput.addEventListener("input", function () {
        const value = this.value;

        if (value.length > 0) {
            this.value =
                value.charAt(0).toUpperCase() +
                value.slice(1);
        }
    });
}

if (lastNameInput) {
    lastNameInput.addEventListener("input", function () {
        const value = this.value;

        if (value.length > 0) {
            this.value =
                value.charAt(0).toUpperCase() +
                value.slice(1);
        }
    });
}

if (phoneInput) {
    phoneInput.addEventListener("input", function (event) {
        let numbers = event.target.value.replace(/\D/g, "");

        numbers = numbers.substring(0, 10);

        if (numbers.length <= 3) {
            event.target.value = numbers;
        } else if (numbers.length <= 6) {
            event.target.value =
                numbers.substring(0, 3) +
                " " +
                numbers.substring(3);
        } else {
            event.target.value =
                numbers.substring(0, 3) +
                " " +
                numbers.substring(3, 6) +
                " " +
                numbers.substring(6);
        }
    });
}

function bindPasswordToggle(toggleId, inputId) {
    const toggleButton =
        document.getElementById(toggleId);

    const passwordInput =
        document.getElementById(inputId);

    if (toggleButton && passwordInput) {
        toggleButton.addEventListener(
            "click",
            function () {
                if (passwordInput.type === "password") {
                    passwordInput.type = "text";
                    toggleButton.textContent = "🙈";
                } else {
                    passwordInput.type = "password";
                    toggleButton.textContent = "👁️";
                }
            }
        );
    }
}

bindPasswordToggle(
    "toggleLoginPassword",
    "login-password"
);

bindPasswordToggle(
    "toggleSignupPassword",
    "signup-password"
);

bindPasswordToggle(
    "toggleConfirmPassword",
    "confirm-password"
);

function validateName(name, fieldName) {
    name = name.trim();

    if (!name) {
        return fieldName + " is required.";
    }

    if (!/^[A-Z]/.test(name)) {
        return (
            fieldName +
            " must start with a capital letter."
        );
    }

    if (!/^[A-Za-z ]+$/.test(name)) {
        return (
            fieldName +
            " can contain letters and spaces only."
        );
    }

    return null;
}

function validateEmail(email) {
    email = email.trim().toLowerCase();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        return (
            "Please enter a valid email address, " +
            "for example: john@example.com."
        );
    }

    return null;
}

function validatePhone(phone) {
    const phoneNumber =
        phone.replace(/\D/g, "");

    if (!/^\d{10}$/.test(phoneNumber)) {
        return "Phone number must contain exactly 10 digits.";
    }

    return null;
}

function validatePassword(password) {
    if (password.length < 6) {
        return "Password must be at least 6 characters.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }

    if (!/[!@#$%^&*(),.?":{}|<>\_\-]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    return null;
}

function displayBackendError(data) {
    if (!data || !data.detail) {
        return "Something went wrong. Please try again.";
    }

    if (typeof data.detail === "string") {
        return data.detail;
    }

    if (Array.isArray(data.detail)) {
        return data.detail
            .map(function (error) {
                return error.msg || "Validation error.";
            })
            .join(" ");
    }

    return "Please check your information and try again.";
}

if (signupForm) {
    signupForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            hideAlert();

            const firstNameInput =
                document.getElementById("first-name");

            const lastNameInput =
                document.getElementById("last-name");

            const phoneInput =
                document.getElementById("phone");

            const emailInput =
                document.getElementById("signup-email");

            const addressInput =
                document.getElementById("address");

            const positionInput =
                document.getElementById("position");

            const dateJoinedInput =
                document.getElementById("date-joined");

            const passwordInput =
                document.getElementById("signup-password");

            const confirmPasswordInput =
                document.getElementById("confirm-password");

            const firstName =
                formatName(firstNameInput.value);

            const lastName =
                formatName(lastNameInput.value);

            const phone =
                phoneInput.value.trim();

            const email =
                emailInput.value
                    .trim()
                    .toLowerCase();

            const address =
                addressInput.value.trim();

            const position =
                positionInput.value.trim();

            const dateJoined =
                dateJoinedInput.value;

            const password =
                passwordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;

            firstNameInput.value = firstName;
            lastNameInput.value = lastName;

            if (
                !firstName ||
                !lastName ||
                !phone ||
                !email ||
                !address ||
                !position ||
                !dateJoined ||
                !password ||
                !confirmPassword
            ) {
                showAlert(
                    "Please fill in all required fields."
                );
                return;
            }

            let error = validateName(
                firstName,
                "First name"
            );

            if (error) {
                showAlert(error);
                return;
            }

            error = validateName(
                lastName,
                "Last name"
            );

            if (error) {
                showAlert(error);
                return;
            }

            error = validateEmail(email);

            if (error) {
                showAlert(error);
                return;
            }

            error = validatePhone(phone);

            if (error) {
                showAlert(error);
                return;
            }

            error = validatePassword(password);

            if (error) {
                showAlert(error);
                return;
            }

            if (password !== confirmPassword) {
                showAlert(
                    "Passwords do not match."
                );
                return;
            }

            const phoneNumber =
                phone.replace(/\D/g, "");

            const payload = {
                first_name: firstName,
                last_name: lastName,
                email: email,
                phone: phoneNumber,
                position: position,
                date_joined: dateJoined,
                password: password
            };

            try {
                const response = await fetch(
                    `${API_BASE_URL}/employees/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify(payload)
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    showAlert(
                        displayBackendError(data)
                    );
                    return;
                }

                localStorage.setItem(
                    "activeUser",
                    JSON.stringify(data)
                );

                showAlert(
                    "Account created successfully!"
                );

                setTimeout(function () {
                    window.location.href =
                        "dashboard.html";
                }, 800);

            } catch (error) {
                console.error(
                    "Registration Error:",
                    error
                );

                showAlert(
                    "Could not connect to the backend server. Make sure FastAPI is running."
                );
            }
        }
    );
}

if (loginForm) {
    loginForm.addEventListener(
        "submit",
        async function (event) {
            event.preventDefault();

            hideAlert();

            const email =
                document
                    .getElementById("login-email")
                    .value
                    .trim()
                    .toLowerCase();

            const password =
                document
                    .getElementById("login-password")
                    .value;

            if (!email || !password) {
                showAlert(
                    "Please enter your email and password."
                );
                return;
            }

            const emailError =
                validateEmail(email);

            if (emailError) {
                showAlert(emailError);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/employees/login`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    showAlert(
                        displayBackendError(data)
                    );
                    return;
                }

                localStorage.setItem(
                    "activeUser",
                    JSON.stringify(data)
                );

                showAlert(
                    "Login successful!"
                );

                setTimeout(function () {
                    window.location.href =
                        "dashboard.html";
                }, 500);

            } catch (error) {
                console.error(
                    "Login Error:",
                    error
                );

                showAlert(
                    "Could not connect to the backend server. Make sure FastAPI is running."
                );
            }
        }
    );
}