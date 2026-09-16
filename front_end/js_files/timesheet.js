let activeUser = null;
const API_BASE_URL = "http://127.0.0.1:8000";

try {
  const rawData = localStorage.getItem("activeUser");

  if (rawData) {
    activeUser = JSON.parse(rawData);
  }
} catch (error) {
  activeUser = null;
}

if (activeUser && activeUser.email) {

  const firstName = activeUser.first_name || "";
  const lastName = activeUser.last_name || "";

  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  if (userName) {
    userName.textContent = `${firstName} ${lastName}`.trim() || activeUser.email;
  }

  if (userAvatar) {
    const firstInitial = firstName
      ? firstName.charAt(0).toUpperCase()
      : activeUser.email.charAt(0).toUpperCase();

    const lastInitial = lastName
      ? lastName.charAt(0).toUpperCase()
      : "";

    userAvatar.textContent = `${firstInitial}${lastInitial}`;
  }

} else {
  localStorage.removeItem("activeUser");
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
    });
}

const timesheetBody = document.getElementById("timesheetBody");
const emptyMsg = document.getElementById("emptyMsg");
const totalHoursVal = document.getElementById("totalHoursVal");
const totalShiftsVal = document.getElementById("totalShiftsVal");
const avgShiftVal = document.getElementById("avgShiftVal");
const filterSelect = document.getElementById("filterSelect");

async function getLogs() {
  const response = await fetch(`${API_BASE_URL}/attendance/`);

  if (!response.ok) {
    throw new Error("Failed to load attendance records");
  }

  const records = await response.json();

  return records.filter(function (record) {
    return record.employee_id === activeUser.employee_id;
  });
}

function formatMinutesToHours(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

async function renderTimesheet() {
  let logs;

  try {
    logs = await getLogs();
  } catch (error) {
    console.error("Timesheet loading error:", error);
    logs = [];
  }

  timesheetBody.innerHTML = "";

  const selectedFilter = filterSelect.value;

  const filteredLogs = logs.filter(function (log) {
    if (selectedFilter === "all") {
      return true;
    }

    return log.attendance_date === selectedFilter;
  });

  if (filteredLogs.length === 0) {
    emptyMsg.style.display = "block";

    totalHoursVal.textContent = "0h 0m";
    totalShiftsVal.textContent = "0";
    avgShiftVal.textContent = "0h 0m";

        return;
    }

  emptyMsg.style.display = "none";

  let accumulatedMinutes = 0;

  filteredLogs
    .slice()
    .reverse()
    .forEach(function (log) {
      const timeIn = log.time_in ? log.time_in.slice(0, 5) : "-";
      const timeOut = log.time_out ? log.time_out.slice(0, 5) : "-";
      const timeInParts = log.time_in ? log.time_in.split(":").map(Number) : [];
      const timeOutParts = log.time_out ? log.time_out.split(":").map(Number) : [];
      const minutes = log.time_in && log.time_out
        ? (timeOutParts[0] * 60 + timeOutParts[1]) -
          (timeInParts[0] * 60 + timeInParts[1])
        : 0;
      const duration = formatMinutesToHours(minutes);

          accumulatedMinutes += minutes;

          const row = document.createElement("tr");

          row.innerHTML = `
                <td>${log.attendance_date}</td>
                <td>${timeIn}</td>
                <td>${timeOut}</td>
                <td><strong>${duration}</strong></td>
            `;

          timesheetBody.appendChild(row);
        });

  totalShiftsVal.textContent = filteredLogs.length;

  totalHoursVal.textContent =
    formatMinutesToHours(accumulatedMinutes);

  const averageMinutes = Math.round(
    accumulatedMinutes / filteredLogs.length
  );

  avgShiftVal.textContent =
    formatMinutesToHours(averageMinutes);
}

async function populateFilterOptions() {
  let logs;

  try {
    logs = await getLogs();
  } catch (error) {
    console.error("Timesheet filter loading error:", error);
    return;
  }

  const dates = [
    ...new Set(
      logs.map(function (log) {
        return log.attendance_date;
      })
    )
  ];

  dates.forEach(function (date) {
    const option = document.createElement("option");

    option.value = date;
    option.textContent = date;

      filterSelect.appendChild(option);
    });
}

if (filterSelect) {
  filterSelect.addEventListener(
    "change",
    renderTimesheet
  );
}

populateFilterOptions().then(renderTimesheet);
