const activeUserData = localStorage.getItem("activeUser");

if (!activeUserData) {
    window.location.href = "index.html";
}

let user;

try {
    user = JSON.parse(activeUserData);
} catch (error) {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}

if (!user || !user.email) {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
}

// Elements
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

function getInitials(firstName, lastName) {
    const first = firstName ? firstName.charAt(0).toUpperCase() : "";
    const last = lastName ? lastName.charAt(0).toUpperCase() : "";
    return (first + last) || "U";
}

// Automatically populates user details upon entering page
function displayUser() {
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "User";

    // Fallback: Use username, or generate one from email prefix, or default to "user"
    const username = user.username || (user.email ? user.email.split("@")[0] : "User");

    if (headerUserName) headerUserName.innerText = fullName;
    if (profileFullName) profileFullName.innerText = fullName;
    if (profileUsername) profileUsername.innerText = `@${username}`;

    if (firstNameInput) firstNameInput.value = firstName;
    if (lastNameInput) lastNameInput.value = lastName;
    if (usernameInput) usernameInput.value = username;
    if (emailInput) emailInput.value = user.email || "";
    if (phoneInput) phoneInput.value = user.phone || user.phoneNumber || "";
    if (departmentInput) departmentInput.value = user.department || user.sector || "";

    const initials = getInitials(firstName, lastName);
    if (headerAvatar) headerAvatar.innerText = initials;
    if (profileAvatar) profileAvatar.innerText = initials;

    if (user.profilePhoto) {
        setProfilePhoto(user.profilePhoto);
    }
}


function setProfilePhoto(photo) {
    if (headerAvatar) {
        headerAvatar.innerHTML = "";
        const headerImage = document.createElement("img");
        headerImage.src = photo;
        headerImage.alt = "Profile Photo";
        headerAvatar.appendChild(headerImage);
    }

    if (profileAvatar) {
        profileAvatar.innerHTML = "";
        const profileImage = document.createElement("img");
        profileImage.src = photo;
        profileImage.alt = "Profile Photo";
        profileAvatar.appendChild(profileImage);
    }
}

function enableEditing() {
    editing = true;
    if (departmentInput) departmentInput.readOnly = false;
    if (phoneInput) phoneInput.readOnly = false;
    
    editProfileBtn.innerText = "Save Changes";
    successMessage.style.display = "none";
    if (departmentInput) departmentInput.focus();
}

function saveProfile() {
    const newDepartment = departmentInput ? departmentInput.value.trim() : "";
    const newPhone = phoneInput ? phoneInput.value.trim() : "";

    user.department = newDepartment;
    user.phone = newPhone;

    localStorage.setItem("activeUser", JSON.stringify(user));
    localStorage.setItem(`user_${user.email}`, JSON.stringify(user));

    editing = false;
    if (departmentInput) departmentInput.readOnly = true;
    if (phoneInput) phoneInput.readOnly = true;
    
    editProfileBtn.innerText = "Edit Profile";

    successMessage.innerText = "Profile changes saved successfully.";
    successMessage.style.display = "block";

    setTimeout(function() {
        successMessage.style.display = "none";
    }, 3000);
}

// Event Listeners
if (editProfileBtn) {
    editProfileBtn.addEventListener("click", function(event) {
        event.preventDefault();
        if (!editing) {
            enableEditing();
        } else {
            saveProfile();
        }
    });
}

if (profileForm) {
    profileForm.addEventListener("submit", function(event) {
        event.preventDefault();
    });
}

if (uploadInput) {
    uploadInput.addEventListener("change", function() {
        const file = this.files[0];
        if (!file || !file.type.startsWith("image/")) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const photo = event.target.result;
            user.profilePhoto = photo;
            localStorage.setItem("activeUser", JSON.stringify(user));
            localStorage.setItem(`user_${user.email}`, JSON.stringify(user));

            setProfilePhoto(photo);
            successMessage.innerText = "Profile photo updated successfully.";
            successMessage.style.display = "block";
            setTimeout(() => { successMessage.style.display = "none"; }, 3000);
        };
        reader.readAsDataURL(file);
    });
}

// Camera controls
if (openCameraBtn) {
    openCameraBtn.addEventListener("click", async function() {
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            videoFeed.srcObject = cameraStream;
            cameraModal.style.display = "flex";
        } catch (error) {
            alert("Camera access was not allowed or is unavailable.");
        }
    });
}

if (captureBtn) {
    captureBtn.addEventListener("click", function() {
        if (!cameraStream) return;
        const width = videoFeed.videoWidth;
        const height = videoFeed.videoHeight;
        photoCanvas.width = width;
        photoCanvas.height = height;

        const context = photoCanvas.getContext("2d");
        context.drawImage(videoFeed, 0, 0, width, height);

        const photo = photoCanvas.toDataURL("image/jpeg");
        user.profilePhoto = photo;

        localStorage.setItem("activeUser", JSON.stringify(user));
        localStorage.setItem(`user_${user.email}`, JSON.stringify(user));

        setProfilePhoto(photo);
        closeCamera();
        
        successMessage.innerText = "Profile photo updated successfully.";
        successMessage.style.display = "block";
        setTimeout(() => { successMessage.style.display = "none"; }, 3000);
    });
}

function closeCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (videoFeed) videoFeed.srcObject = null;
    if (cameraModal) cameraModal.style.display = "none";
}

if (closeCameraBtn) closeCameraBtn.addEventListener("click", closeCamera);

if (cameraModal) {
    cameraModal.addEventListener("click", function(event) {
        if (event.target === cameraModal) closeCamera();
    });
}

// Theme controls
function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (themeToggleBtn) themeToggleBtn.innerText = "Switch to Light Mode";
    } else {
        document.body.classList.remove("dark-mode");
        if (themeToggleBtn) themeToggleBtn.innerText = "Switch to Dark Mode";
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        const darkMode = document.body.classList.contains("dark-mode");
        localStorage.setItem("theme", darkMode ? "dark" : "light");
        themeToggleBtn.innerText = darkMode ? "Switch to Light Mode" : "Switch to Dark Mode";
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    displayUser();
    loadTheme();
});