let user = null;

try {
    const rawData = localStorage.getItem("activeUser");

    if (!rawData) {
        window.location.href = "index.html";
    } else {
        user = JSON.parse(rawData);
    }
} catch (error) {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}

if (!user || !user.email) {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}

const headerUserName = document.getElementById("headerUserName");
const headerAvatar = document.getElementById("headerAvatar");
const profileAvatar = document.getElementById("profileAvatar");
const profileFullName = document.getElementById("profileFullName");
const profileUsername = document.getElementById("profileUsername");

const firstNameInput = document.getElementById("prof-firstName");
const lastNameInput = document.getElementById("prof-lastName");
const usernameInput = document.getElementById("prof-username");
const emailInput = document.getElementById("prof-email");
const phoneInput = document.getElementById("prof-phone");
const departmentInput = document.getElementById("prof-department");

const editProfileBtn = document.getElementById("editProfileBtn");
const profileForm = document.getElementById("profileForm");
const successMessage = document.getElementById("successMessage");

const themeToggleBtn = document.getElementById("themeToggleBtn");

const uploadInput = document.getElementById("uploadInput");
const openCameraBtn = document.getElementById("openCameraBtn");
const closeCameraBtn = document.getElementById("closeCameraBtn");
const captureBtn = document.getElementById("captureBtn");

const cameraModal = document.getElementById("cameraModal");
const videoFeed = document.getElementById("videoFeed");
const photoCanvas = document.getElementById("photoCanvas");

let cameraStream = null;
let editing = false;

function getUserValue(snakeCase, camelCase = null) {
    if (user[snakeCase] !== undefined && user[snakeCase] !== null) {
        return user[snakeCase];
    }

    if (camelCase && user[camelCase] !== undefined) {
        return user[camelCase];
    }

    return "";
}

function getInitials(firstName, lastName) {
    const first = firstName
        ? firstName.charAt(0).toUpperCase()
        : "";

    const last = lastName
        ? lastName.charAt(0).toUpperCase()
        : "";

    return (first + last) || "U";
}

function displayUser() {
    const firstName = getUserValue("first_name", "firstName");
    const lastName = getUserValue("last_name", "lastName");
    const email = user.email || "";
    const phone = getUserValue("phone", "phoneNumber");
    const position = user.position || "";
    const department = user.department || user.sector || "";

    const username =
        user.username ||
        email.split("@")[0];

    const fullName =
        `${firstName} ${lastName}`.trim() || "User";

    if (headerUserName) {
        headerUserName.textContent = fullName;
    }

    if (profileFullName) {
        profileFullName.textContent = fullName;
    }

    if (profileUsername) {
        profileUsername.textContent = `@${username}`;
    }

    if (firstNameInput) {
        firstNameInput.value = firstName;
    }

    if (lastNameInput) {
        lastNameInput.value = lastName;
    }

    if (usernameInput) {
        usernameInput.value = username;
    }

    if (emailInput) {
        emailInput.value = email;
    }

    if (phoneInput) {
        phoneInput.value = phone;
    }

    if (departmentInput) {
        departmentInput.value = department || position;
    }

    const initials = getInitials(firstName, lastName);

    if (headerAvatar) {
        headerAvatar.textContent = initials;
    }

    if (profileAvatar) {
        profileAvatar.textContent = initials;
    }

    if (user.profilePhoto) {
        setProfilePhoto(user.profilePhoto);
    }
}

function setProfilePhoto(photo) {
    if (headerAvatar) {
        headerAvatar.innerHTML = "";

        const image = document.createElement("img");
        image.src = photo;
        image.alt = "Profile Photo";

        headerAvatar.appendChild(image);
    }

    if (profileAvatar) {
        profileAvatar.innerHTML = "";

        const image = document.createElement("img");
        image.src = photo;
        image.alt = "Profile Photo";

        profileAvatar.appendChild(image);
    }
}

function enableEditing() {
    editing = true;

    firstNameInput.readOnly = false;
    lastNameInput.readOnly = false;
    phoneInput.readOnly = false;
    departmentInput.readOnly = false;

    editProfileBtn.textContent = "Save Changes";

    successMessage.style.display = "none";

    firstNameInput.focus();
}

function saveProfile() {
    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const phone = phoneInput.value.trim();
    const department = departmentInput.value.trim();

    if (!firstName || !lastName) {
        showMessage("First name and last name are required.");
        return;
    }

    const phoneNumber = phone.replace(/\D/g, "");

    if (phoneNumber.length !== 10) {
        showMessage("Phone number must contain exactly 10 digits.");
        return;
    }

    user.first_name = firstName;
    user.last_name = lastName;
    user.phone = phoneNumber;
    user.department = department;

    user.firstName = firstName;
    user.lastName = lastName;

    localStorage.setItem(
        "activeUser",
        JSON.stringify(user)
    );

    localStorage.setItem(
        `user_${user.email}`,
        JSON.stringify(user)
    );

    editing = false;

    firstNameInput.readOnly = true;
    lastNameInput.readOnly = true;
    phoneInput.readOnly = true;
    departmentInput.readOnly = true;

    editProfileBtn.textContent = "Edit Profile";

    displayUser();

    showMessage("Profile changes saved successfully.");
}

function showMessage(message) {
    successMessage.textContent = message;
    successMessage.style.display = "block";

    setTimeout(function () {
        successMessage.style.display = "none";
    }, 3000);
}

if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function (event) {
        event.preventDefault();

        if (!editing) {
            enableEditing();
        } else {
            saveProfile();
        }
    });
}

if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        if (editing) {
            saveProfile();
        }
    });
}

if (uploadInput) {
    uploadInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            showMessage("Please select a valid image.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const photo = event.target.result;

            user.profilePhoto = photo;

            localStorage.setItem(
                "activeUser",
                JSON.stringify(user)
            );

            localStorage.setItem(
                `user_${user.email}`,
                JSON.stringify(user)
            );

            setProfilePhoto(photo);

            showMessage(
                "Profile photo updated successfully."
            );
        };

        reader.readAsDataURL(file);
    });
}

if (openCameraBtn) {
    openCameraBtn.addEventListener(
        "click",
        async function () {

            try {
                cameraStream =
                    await navigator.mediaDevices.getUserMedia({
                        video: true
                    });

                videoFeed.srcObject = cameraStream;

                cameraModal.style.display = "flex";

            } catch (error) {
                showMessage(
                    "Camera access was not allowed or is unavailable."
                );
            }
        }
    );
}

if (captureBtn) {
    captureBtn.addEventListener("click", function () {

        if (!cameraStream) {
            return;
        }

        const width = videoFeed.videoWidth;
        const height = videoFeed.videoHeight;

        photoCanvas.width = width;
        photoCanvas.height = height;

        const context =
            photoCanvas.getContext("2d");

        context.drawImage(
            videoFeed,
            0,
            0,
            width,
            height
        );

        const photo =
            photoCanvas.toDataURL("image/jpeg");

        user.profilePhoto = photo;

        localStorage.setItem(
            "activeUser",
            JSON.stringify(user)
        );

        localStorage.setItem(
            `user_${user.email}`,
            JSON.stringify(user)
        );

        setProfilePhoto(photo);

        closeCamera();

        showMessage(
            "Profile photo updated successfully."
        );
    });
}

function closeCamera() {
    if (cameraStream) {
        cameraStream
            .getTracks()
            .forEach(track => track.stop());

        cameraStream = null;
    }

    if (videoFeed) {
        videoFeed.srcObject = null;
    }

    if (cameraModal) {
        cameraModal.style.display = "none";
    }
}

if (closeCameraBtn) {
    closeCameraBtn.addEventListener(
        "click",
        closeCamera
    );
}

if (cameraModal) {
    cameraModal.addEventListener(
        "click",
        function (event) {
            if (event.target === cameraModal) {
                closeCamera();
            }
        }
    );
}

function loadTheme() {
    const savedTheme =
        localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");

        themeToggleBtn.textContent =
            "Switch to Light Mode";
    } else {
        document.body.classList.remove("dark-mode");

        themeToggleBtn.textContent =
            "Switch to Dark Mode";
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "dark-mode"
            );

            const darkMode =
                document.body.classList.contains(
                    "dark-mode"
                );

            localStorage.setItem(
                "theme",
                darkMode ? "dark" : "light"
            );

            themeToggleBtn.textContent =
                darkMode
                    ? "Switch to Light Mode"
                    : "Switch to Dark Mode";
        }
    );
}

displayUser();
loadTheme();