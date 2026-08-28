const API_BASE_URL = "http://127.0.0.1:8000";
const rows = document.getElementById("employeeRows");
const emptyState = document.getElementById("emptyState");
const alertBox = document.getElementById("alertBox");
let employees = [];
let departments = [];

function showMessage(message, success = false) {
  alertBox.textContent = message;
  alertBox.className = success ? "alert success" : "alert";
}

function departmentName(id) {
  const department = departments.find((item) => item.department_id === id);
  return department ? department.department_name : "Unassigned";
}

function renderEmployees() {
  rows.innerHTML = "";
  emptyState.style.display = employees.length ? "none" : "block";
  employees.forEach((employee) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="name-cell">${employee.first_name} ${employee.last_name}<span class="email">${employee.email}</span></td>
      <td>${employee.phone}</td>
      <td>${employee.position}</td>
      <td class="department">${departmentName(employee.department_id)}</td>
      <td>${employee.date_joined}</td>
      <td><button class="action-delete" type="button" data-id="${employee.employee_id}">Delete</button></td>`;
    rows.appendChild(row);
  });
  document.getElementById("employeeCount").textContent = employees.length;
  const latest = employees.slice().sort((a, b) => b.date_joined.localeCompare(a.date_joined))[0];
  document.getElementById("latestJoiner").textContent = latest ? `${latest.first_name} ${latest.last_name}` : "-";
}

async function loadDirectory() {
  showMessage("Loading...");
  try {
    const [employeeResponse, departmentResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/admin/employees`),
      fetch(`${API_BASE_URL}/admin/departments`)
    ]);
    if (!employeeResponse.ok || !departmentResponse.ok) throw new Error("The directory could not be loaded.");
    employees = await employeeResponse.json();
    departments = await departmentResponse.json();
    document.getElementById("departmentCount").textContent = departments.length;
    renderEmployees();
    showMessage("Directory updated.", true);
  } catch (error) {
    showMessage(error.message);
    rows.innerHTML = "";
    emptyState.style.display = "block";
  }
}

rows.addEventListener("click", async (event) => {
  const button = event.target.closest(".action-delete");
  if (!button || !window.confirm("Delete this employee record?")) return;
  try {
    const response = await fetch(`${API_BASE_URL}/employees/${button.dataset.id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Employee could not be deleted.");
    employees = employees.filter((employee) => String(employee.employee_id) !== button.dataset.id);
    renderEmployees();
    showMessage("Employee deleted.", true);
  } catch (error) { showMessage(error.message); }
});

document.getElementById("refreshBtn").addEventListener("click", loadDirectory);
document.getElementById("logoutBtn").addEventListener("click", () => { localStorage.removeItem("activeUser"); window.location.href = "index.html"; });

try {
  const activeUser = JSON.parse(localStorage.getItem("activeUser"));
  if (activeUser && activeUser.first_name && activeUser.last_name) {
    document.getElementById("userName").textContent = `${activeUser.first_name} ${activeUser.last_name}`;
    document.getElementById("userAvatar").textContent = `${activeUser.first_name[0]}${activeUser.last_name[0]}`.toUpperCase();
  }
} catch (error) { localStorage.removeItem("activeUser"); }

loadDirectory();
