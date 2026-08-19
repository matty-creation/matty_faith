let activeUser = null;

    try {
      const rawData = localStorage.getItem('activeUser');
      if (rawData) activeUser = JSON.parse(rawData);
    } catch (e) {
      activeUser = null;
    }

    if (activeUser && activeUser.firstName) {
      const firstName = activeUser.firstName;
      const lastName = activeUser.lastName || '';
      document.getElementById('userName').textContent = `${firstName} ${lastName}`.trim();
      
      const firstInitial = firstName.charAt(0).toUpperCase();
      const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
      document.getElementById('userAvatar').textContent = `${firstInitial}${lastInitial}`;
    } else {
      localStorage.removeItem('activeUser');
      window.location.href = 'index.html';
    }

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('activeUser');
      window.location.href = 'index.html';
    });

    const liveTimeEl = document.getElementById('liveTime');
    const liveDateEl = document.getElementById('liveDate');
    const toggleClockBtn = document.getElementById('toggleClockBtn');
    const statusBadge = document.getElementById('statusBadge');
    const logsBody = document.getElementById('logsBody');
    const noRecordsMsg = document.getElementById('noRecordsMsg');

    const storageKeyLogs = `logs_${activeUser.email}`;
    const storageKeyShift = `shift_${activeUser.email}`;

    function updateLiveClock() {
      const now = new Date();
      liveTimeEl.textContent = now.toLocaleTimeString();
      liveDateEl.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    function getLogs() {
      return JSON.parse(localStorage.getItem(storageKeyLogs)) || [];
    }

    function saveLogs(logs) {
      localStorage.setItem(storageKeyLogs, JSON.stringify(logs));
    }

    function renderLogs() {
      const logs = getLogs();
      logsBody.innerHTML = '';

      if (logs.length === 0) {
        noRecordsMsg.style.display = 'block';
        return;
      }

      noRecordsMsg.style.display = 'none';
      logs.slice().reverse().forEach(log => {
        const row = document.createElement('tr');
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
      const activeShift = localStorage.getItem(storageKeyShift);
      if (activeShift) {
        const shiftData = JSON.parse(activeShift);
        statusBadge.textContent = `Clocked In (${shiftData.arrival})`;
        statusBadge.classList.add('working');
        toggleClockBtn.textContent = 'Clock Out';
        toggleClockBtn.classList.add('clocked-in');
      } else {
        statusBadge.textContent = 'Clocked Out';
        statusBadge.classList.remove('working');
        toggleClockBtn.textContent = 'Clock In';
        toggleClockBtn.classList.remove('clocked-in');
      }
    }

    toggleClockBtn.addEventListener('click', () => {
      const activeShift = localStorage.getItem(storageKeyShift);
      const now = new Date();

      if (!activeShift) {
        const shiftData = {
          startTimeIso: now.toISOString(),
          date: now.toLocaleDateString(),
          arrival: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        localStorage.setItem(storageKeyShift, JSON.stringify(shiftData));
      } else {
        const shiftData = JSON.parse(activeShift);
        const startTime = new Date(shiftData.startTimeIso);
        const departureTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const diffMs = now - startTime;
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hrs = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const durationStr = `${hrs}h ${mins}m`;

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
      }

      updateShiftUI();
      renderLogs();
    });

    updateShiftUI();
    renderLogs();