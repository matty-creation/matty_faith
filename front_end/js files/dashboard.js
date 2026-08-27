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

const liveTimeEl = document.getElementById("liveTime");
const liveDateEl = document.getElementById("liveDate");
const toggleClockBtn = document.getElementById("toggleClockBtn");
const statusBadge = document.getElementById("statusBadge");
const logsBody = document.getElementById("logsBody");
const noRecordsMsg = document.getElementById("noRecordsMsg");

const storageKeyLogs = `logs_${activeUser.email}`;
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

setInterval(updateLiveClock, 1000);
updateLiveClock();

function getLogs() {
  try {
      return JSON.parse(localStorage.getItem(storageKeyLogs)) || [];
    } catch (error) {
      return [];
    }
}

function saveLogs(logs) {
  localStorage.setItem(storageKeyLogs, JSON.stringify(logs));
}

function renderLogs() {
  const logs = getLogs();

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

      row.innerHTML = `
                <td>${log.date}</td>
                <td>${log.arrival}</td>
                <td>${log.departure}</td>
                <td><strong>${log.duration}</strong></td>
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

          statusBadge.textContent = `Clocked In (${shiftData.arrival})`;
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
          date: now.toLocaleDateString(),
              arrival: now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            };

          localStorage.setItem(
            storageKeyShift,
            JSON.stringify(shiftData)
          );
        } else {
          try {
              const shiftData = JSON.parse(activeShift);

              const startTime = new Date(
                shiftData.startTimeIso
              );

              const departureTime = now.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              });

              const diffMs = now - startTime;

              const totalMinutes = Math.floor(
                diffMs / (1000 * 60)
              );

              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;

              const durationStr = `${hours}h ${minutes}m`;

              const newLog = {
                date: shiftData.date,
                arrival: shiftData.arrival,
                departure: departureTime,
                duration: durationStr
              };

              const logs = getLogs();

              logs.push(newLog);

              saveLogs(logs);

              localStorage.removeItem(storageKeyShift);
            } catch (error) {
              console.error(
                "Error processing attendance:",
                error
              );

              localStorage.removeItem(storageKeyShift);
            }
        }

      updateShiftUI();
      renderLogs();
    });
}

updateShiftUI();
renderLogs();