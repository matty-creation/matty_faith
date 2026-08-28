
let activeUser = null;

try {
  const rawData = localStorage.getItem("activeUser");

  if (rawData) {
    activeUser = JSON.parse(rawData);
  }
} catch (error) {
  activeUser = null;
}

if (
  activeUser &&
  activeUser.employee_id &&
  activeUser.first_name &&
  activeUser.last_name &&
  activeUser.email
) {
  const firstName = activeUser.first_name;
  const lastName = activeUser.last_name;

  const userName = document.getElementById("userName");
  const userAvatar = document.getElementById("userAvatar");

  if (userName) {
    userName.textContent = `${firstName} ${lastName}`.trim();
  }

  if (userAvatar) {
      const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

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

const storageKeyLogs = `logs_${activeUser.email}`;

function parseMinutesFromDuration(durationStr) {
  if (!durationStr) {
    return 0;
  }

  const hMatch = durationStr.match(/(\d+)h/);
  const mMatch = durationStr.match(/(\d+)m/);

  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const minutes = mMatch ? parseInt(mMatch[1], 10) : 0;

  return (hours * 60) + minutes;
}

function formatMinutesToHours(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function getLogs() {
  try {
    return JSON.parse(
      localStorage.getItem(storageKeyLogs)
    ) || [];
  } catch (error) {
    return [];
  }
}

function renderTimesheet() {
  const logs = getLogs();

  timesheetBody.innerHTML = "";

  const selectedFilter = filterSelect.value;

  const filteredLogs = logs.filter(function (log) {
    if (selectedFilter === "all") {
      return true;
    }

    return log.date === selectedFilter;
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
      const minutes = parseMinutesFromDuration(
        log.duration
      );

          accumulatedMinutes += minutes;

          const row = document.createElement("tr");

          row.innerHTML = `
                <td>${log.date}</td>
                <td>${log.arrival}</td>
                <td>${log.departure}</td>
                <td><strong>${log.duration}</strong></td>
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

function populateFilterOptions() {
  const logs = getLogs();

  const dates = [
    ...new Set(
      logs.map(function (log) {
        return log.date;
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

populateFilterOptions();
renderTimesheet();
