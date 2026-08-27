try {
    const activeSession = JSON.parse(
        localStorage.getItem("activeUser")
    );

    if (
        activeSession &&
        activeSession.email &&
        activeSession.firstName
    ) {
        window.location.href = "dashboard.html";
    }

} catch (error) {

    localStorage.removeItem("activeUser");
}


const loginTab =
    document.getElementById("loginTab");

const signupTab =
    document.getElementById("signupTab");

const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const gotoSignup =
    document.getElementById("gotoSignup");

const gotoLogin =
    document.getElementById("gotoLogin");

const alertBox =
    document.getElementById("alertBox");


const firstnameInput =
    document.getElementById("first-name");

const lastnameInput =
    document.getElementById("last-name");

const phoneInput =
    document.getElementById("phone");

const phoneError =
    document.getElementById("phone-error");

const emailInput =
    document.getElementById("signup-email");

const emailError =
    document.getElementById("signup-email-error");

const passwordInput =
    document.getElementById("signup-password");

const passwordError =
    document.getElementById("signup-password-error");

const confirmPasswordInput =
    document.getElementById("confirm-password");

const confirmPasswordError =
    document.getElementById("confirm-password-error");

const passwordRequirements =
    document.getElementById("password-requirements");


const iti = window.intlTelInput(
    phoneInput,
    {
        initialCountry: "tz",
        separateDialCode: true,
        preferredCountries: [
            "tz",
            "ke",
            "ug"
        ],
        utilsScript:
            "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/utils.js"
    }
);


function hideAlert() {

    alertBox.style.display = "none";

    alertBox.innerText = "";
}


function showAlert(message) {

    alertBox.innerText = message;

    alertBox.style.display = "block";
}

function showLogin(event) {

    if (event) {
        event.preventDefault();
    }

    hideAlert();

    loginTab.classList.add("active");

    signupTab.classList.remove("active");

    loginForm.classList.add("active");

    signupForm.classList.remove("active");
}


function showSignup(event) {

    if (event) {
        event.preventDefault();
    }

    hideAlert();

    signupTab.classList.add("active");

    loginTab.classList.remove("active");

    signupForm.classList.add("active");

    loginForm.classList.remove("active");
}


loginTab.addEventListener(
    "click",
    showLogin
);

signupTab.addEventListener(
    "click",
    showSignup
);

gotoSignup.addEventListener(
    "click",
    showSignup
);

gotoLogin.addEventListener(
    "click",
    showLogin
);


function capitalizeName(value) {

    return value
        .toLowerCase()
        .replace(
            /\b\w/g,
            function(letter) {
                return letter.toUpperCase();
            }
        );
}


firstnameInput.addEventListener(
    "input",
    function() {

        this.value =
            capitalizeName(this.value);

    }
);


lastnameInput.addEventListener(
    "input",
    function() {

        this.value =
            capitalizeName(this.value);

    }
);


phoneInput.addEventListener(
    "input",
    function() {

        let numbers =
            this.value.replace(/\D/g, "");

        numbers =
            numbers.substring(0, 10);

        if (numbers.length > 6) {

            this.value =
                numbers.substring(0, 3) +
                " " +
                numbers.substring(3, 6) +
                " " +
                numbers.substring(6, 10);

        } else if (numbers.length > 3) {

            this.value =
                numbers.substring(0, 3) +
                " " +
                numbers.substring(3, 6);

        } else {

            this.value = numbers;
        }

    }
);


function validateEmail() {

    const email =
        emailInput.value.trim();

    const emailPattern =
        /^[a-zA-Z0-9._%+-]+@gmail\.com$/;


    if (email === "") {

        emailError.innerText = "";

        emailError.className =
            "validation-message";

        return false;
    }


    if (!emailPattern.test(email)) {

        emailError.innerText =
            "Invalid email";

        emailError.className =
            "validation-message error";

        return false;
    }


    emailError.innerText =
        "Valid email";

    emailError.className =
        "validation-message success";

    return true;
}


emailInput.addEventListener(
    "input",
    validateEmail
);


passwordInput.addEventListener(
    "focus",
    function() {

        passwordRequirements.classList.add(
            "show"
        );

    }
);


passwordInput.addEventListener(
    "input",
    function() {

        passwordRequirements.classList.add(
            "show"
        );

        validatePassword();

    }
);


function updateRequirement(
    id,
    valid
) {

    const requirement =
        document.getElementById(id);

    if (!requirement) {
        return;
    }


    if (valid) {

        requirement.classList.add(
            "valid"
        );

        requirement.classList.remove(
            "invalid"
        );

    } else {

        requirement.classList.remove(
            "valid"
        );

        requirement.classList.add(
            "invalid"
        );
    }
}


function validatePassword() {

    const password =
        passwordInput.value;


    const lengthCheck =
        password.length >= 6 &&
        password.length <= 20;


    const caseCheck =
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password);


    const numberCheck =
        /[0-9]/.test(password);


    const specialCheck =
        /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(
            password
        );


    const spaceCheck =
        !/\s/.test(password);


    updateRequirement(
        "length-check",
        lengthCheck
    );

    updateRequirement(
        "case-check",
        caseCheck
    );

    updateRequirement(
        "number-check",
        numberCheck
    );

    updateRequirement(
        "special-check",
        specialCheck
    );

    updateRequirement(
        "space-check",
        spaceCheck
    );


    const valid =
        lengthCheck &&
        caseCheck &&
        numberCheck &&
        specialCheck &&
        spaceCheck


    if (password === "") {

        passwordError.innerText = "";

        passwordError.style.display =
            "none";

    } else if (!valid) {

        passwordError.innerText =
            "Password does not meet all requirements.";

        passwordError.style.display =
            "block";

        passwordError.className =
            "validation-message error";

    } else {

        passwordError.innerText =
            "Password is valid.";

        passwordError.style.display =
            "block";

        passwordError.className =
            "validation-message success";
    }


    return valid;
}


function validateConfirmPassword() {

    const password =
        passwordInput.value;

    const confirmPassword =
        confirmPasswordInput.value;


    if (confirmPassword === "") {

        confirmPasswordError.innerText = "";

        confirmPasswordError.style.display =
            "none";

        return false;
    }


    if (password !== confirmPassword) {

        confirmPasswordError.innerText =
            "Passwords do not match.";

        confirmPasswordError.style.display =
            "block";

        confirmPasswordError.className =
            "validation-message error";

        return false;
    }


    confirmPasswordError.innerText =
        "Passwords match.";

    confirmPasswordError.style.display =
        "block";

    confirmPasswordError.className =
        "validation-message success";

    return true;
}


confirmPasswordInput.addEventListener(
    "input",
    validateConfirmPassword
);


const passwordToggles =
    document.querySelectorAll(
        ".password-toggle"
    );


passwordToggles.forEach(
    function(toggle) {

        toggle.addEventListener(
            "click",
            function() {

                const targetId =
                    this.getAttribute(
                        "data-target"
                    );

                const target =
                    document.getElementById(
                        targetId
                    );

                const eye =
                    this.querySelector(
                        ".eye-icon"
                    );


                if (
                    target.type ===
                    "password"
                ) {

                    target.type = "text";

                    eye.innerText = "🙈";

                    this.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                } else {

                    target.type =
                        "password";

                    eye.innerText = "👁";

                    this.setAttribute(
                        "aria-label",
                        "Show password"
                    );
                }

            }
        );

    }
);


signupForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        hideAlert();


        const firstName =
            capitalizeName(
                firstnameInput.value.trim()
            );


        const lastName =
            capitalizeName(
                lastnameInput.value.trim()
            );


        const email =
            emailInput.value
                .toLowerCase()
                .trim();


        const password =
            passwordInput.value;


        const confirmPassword =
            confirmPasswordInput.value;


        const phoneNumber =
            phoneInput.value.replace(
                /\D/g,
                ""
            );


        if (firstName === "") {

            showAlert(
                "Please enter your first name."
            );

            firstnameInput.focus();

            return;
        }


        if (lastName === "") {

            showAlert(
                "Please enter your last name."
            );

            lastnameInput.focus();

            return;
        }


        if (phoneNumber.length !== 10) {

            phoneError.innerText =
                "Phone number must contain exactly 10 digits.";

            phoneError.style.display =
                "block";

            phoneError.className =
                "validation-message error";

            phoneInput.focus();

            return;
        }


        phoneError.innerText =
            "Valid phone number.";

        phoneError.style.display =
            "block";

        phoneError.className =
            "validation-message success";


        if (!validateEmail()) {

            emailInput.focus();

            return;
        }


        if (!validatePassword()) {

            passwordInput.focus();

            passwordRequirements.classList.add(
                "show"
            );

            return;
        }


        if (!validateConfirmPassword()) {

            confirmPasswordInput.focus();

            return;
        }


        const existingUser =
            localStorage.getItem(
                `user_${email}`
            );


        if (existingUser) {

            showAlert(
                "An account with this email already exists. Please sign in."
            );

            return;
        }


        const userData = {

            firstName: firstName,

            lastName: lastName,

            phone: phoneNumber,

            countryCode:
                iti
                    .getSelectedCountryData()
                    .dialCode,

            email: email,

            password: password
        };


        localStorage.setItem(
            `user_${email}`,
            JSON.stringify(userData)
        );


        localStorage.setItem(
            "activeUser",
            JSON.stringify(userData)
        );


        window.location.href =
            "dashboard.html";

    }
);


loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        hideAlert();


        const email =
            document
                .getElementById("login-email")
                .value
                .toLowerCase()
                .trim();


        const password =
            document
                .getElementById("login-password")
                .value;


        const storedUser =
            localStorage.getItem(
                `user_${email}`
            );


        if (!storedUser) {

            showAlert(
                "No account found with this email. Please register first."
            );

            return;
        }


        let userData;


        try {

            userData =
                JSON.parse(storedUser);

        } catch (error) {

            showAlert(
                "Account data error. Please register again."
            );

            return;
        }


        if (
            userData.password !==
            password
        ) {

            showAlert(
                "Incorrect password. Please try again."
            );

            return;
        }


        localStorage.setItem(
            "activeUser",
            JSON.stringify(userData)
        );


        window.location.href =
            "dashboard.html";

    }
);