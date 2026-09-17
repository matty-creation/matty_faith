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
    userName.textContent = `${firstName} ${lastName}`.trim();
  }

  if (userAvatar) {
      const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    userAvatar.textContent = `${firstInitial}${lastInitial}`;
  }

  const adminNav = document.getElementById("adminNav");
  const adminPositions = [
    "admin",
    "administrator",
    "system administrator"
  ];

  if (
    adminNav &&
    adminPositions.includes((activeUser.position || "").toLowerCase().trim())
  ) {
    adminNav.hidden = false;
    adminNav.href = window.location.hostname === "localhost"
      ? "http://localhost:5173/"
      : "/admin/";
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

const liveTimeEl = document.getElementById("liveTime");
const liveDateEl = document.getElementById("liveDate");
const toggleClockBtn = document.getElementById("toggleClockBtn");
const statusBadge = document.getElementById("statusBadge");
const logsBody = document.getElementById("logsBody");
const noRecordsMsg = document.getElementById("noRecordsMsg");

const storageKeyShift = `shift_${activeUser.email}`;

function updateLiveClock() {
  const now = new Date();

  if (liveTimeEl) {
      liveTimeEl.textContent = now.toLocaleTimeString();
    }

  if (liveDateEl) {
    liveDateEl.textContent = now.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

function formatDuration(timeIn, timeOut) {
  if (!timeIn || !timeOut) {
    return "-";
  }

  const start = timeIn.split(":").map(Number);
  const end = timeOut.split(":").map(Number);
  const minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);

  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

setInterval(updateLiveClock, 1000);
updateLiveClock();

async function getAttendance() {
  const response = await fetch(`${API_BASE_URL}/attendance/`);

  if (!response.ok) {
    throw new Error("Failed to load attendance records");
  }

  const records = await response.json();

  return records.filter(function (record) {
    return record.employee_id === activeUser.employee_id;
  });
}

async function renderLogs() {
  let logs;

  try {
    logs = await getAttendance();
  } catch (error) {
    console.error("Attendance loading error:", error);
    logs = [];
  }

  if (!logsBody) {
    return;
  }

  logsBody.innerHTML = "";

  if (logs.length === 0) {
      if (noRecordsMsg) {
        noRecordsMsg.style.display = "block";
      }

        return;
    }

  if (noRecordsMsg) {
    noRecordsMsg.style.display = "none";
  }

  logs
    .slice()
    .reverse()
    .forEach(function (log) {
      const row = document.createElement("tr");
      const timeIn = log.time_in ? log.time_in.slice(0, 5) : "-";
      const timeOut = log.time_out ? log.time_out.slice(0, 5) : "-";
      const duration = formatDuration(log.time_in, log.time_out);

      row.innerHTML = `
                <td>${log.attendance_date}</td>
                <td>${timeIn}</td>
                <td>${timeOut}</td>
                <td><strong>${duration}</strong></td>
            `;

          logsBody.appendChild(row);
        });
}

function updateShiftUI() {
  if (!statusBadge || !toggleClockBtn) {
    return;
  }

  const activeShift = localStorage.getItem(storageKeyShift);

  if (activeShift) {
      try {
          const shiftData = JSON.parse(activeShift);

          statusBadge.textContent = `Clocked In (${shiftData.timeIn.slice(0, 5)})`;
        statusBadge.classList.add("working");

        toggleClockBtn.textContent = "Clock Out";
        toggleClockBtn.classList.add("clocked-in");
      } catch (error) {
        localStorage.removeItem(storageKeyShift);

        statusBadge.textContent = "Clocked Out";
        statusBadge.classList.remove("working");

        toggleClockBtn.textContent = "Clock In";
        toggleClockBtn.classList.remove("clocked-in");
      }
    } else {
    statusBadge.textContent = "Clocked Out";
    statusBadge.classList.remove("working");

    toggleClockBtn.textContent = "Clock In";
    toggleClockBtn.classList.remove("clocked-in");
  }
}

if (toggleClockBtn) {
  toggleClockBtn.addEventListener("click", function () {
    const activeShift = localStorage.getItem(storageKeyShift);
    const now = new Date();

      if (!activeShift) {
        const shiftData = {
          startTimeIso: now.toISOString(),
          date: now.toISOString().slice(0, 10),
          timeIn: now.toTimeString().slice(0, 8)
        };

          localStorage.setItem(
            storageKeyShift,
            JSON.stringify(shiftData)
          );
        } else {
          try {
              const shiftData = JSON.parse(activeShift);

              fetch(`${API_BASE_URL}/attendance/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  employee_id: activeUser.employee_id,
                  attendance_date: shiftData.date,
                  time_in: shiftData.timeIn,
                  time_out: now.toTimeString().slice(0, 8),
                  status: "Present"
                })
              })
                .then(function (response) {
                  if (!response.ok) {
                    throw new Error("Failed to save attendance record");
                  }

                  localStorage.removeItem(storageKeyShift);
                  updateShiftUI();
                  return renderLogs();
                })
                .catch(function (error) {
                  console.error("Attendance saving error:", error);
                });
            } catch (error) {
              console.error(
                "Error processing attendance:",
                error
              );

              localStorage.removeItem(storageKeyShift);
            }
        }

      updateShiftUI();
      if (!activeShift) {
        renderLogs();
      }
    });
}

updateShiftUI();
renderLogs();