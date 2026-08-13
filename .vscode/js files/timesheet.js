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

    const timesheetBody = document.getElementById('timesheetBody');
    const emptyMsg = document.getElementById('emptyMsg');
    const totalHoursVal = document.getElementById('totalHoursVal');
    const totalShiftsVal = document.getElementById('totalShiftsVal');
    const avgShiftVal = document.getElementById('avgShiftVal');
    const filterSelect = document.getElementById('filterSelect');

    const storageKeyLogs = `logs_${activeUser.email}`;

    function parseMinutesFromDuration(durationStr) {
      if (!durationStr) return 0;
      const hMatch = durationStr.match(/(\d+)h/);
      const mMatch = durationStr.match(/(\d+)m/);
      const hours = hMatch ? parseInt(hMatch[1]) : 0;
      const minutes = mMatch ? parseInt(mMatch[1]) : 0;
      return (hours * 60) + minutes;
    }

    function formatMinutesToHours(totalMinutes) {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}h ${m}m`;
    }

    function renderTimesheet() {
      const logs = JSON.parse(localStorage.getItem(storageKeyLogs)) || [];
      timesheetBody.innerHTML = '';

      if (logs.length === 0) {
        emptyMsg.style.display = 'block';
        totalHoursVal.textContent = '0h 0m';
        totalShiftsVal.textContent = '0';
        avgShiftVal.textContent = '0h 0m';
        return;
      }

      emptyMsg.style.display = 'none';

      let accumulatedMinutes = 0;
      const selectedFilter = filterSelect.value;

      const filteredLogs = logs.filter(log => {
        if (selectedFilter === 'all') return true;
        return log.date === selectedFilter;
      });

      filteredLogs.slice().reverse().forEach(log => {
        const minutes = parseMinutesFromDuration(log.duration);
        accumulatedMinutes += minutes;

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${log.date}</td>
          <td>${log.arrival}</td>
          <td>${log.departure}</td>
          <td><strong>${log.duration}</strong></td>
        `;
        timesheetBody.appendChild(row);
      });

      totalShiftsVal.textContent = filteredLogs.length;
      totalHoursVal.textContent = formatMinutesToHours(accumulatedMinutes);

      if (filteredLogs.length > 0) {
        const avgMinutes = Math.round(accumulatedMinutes / filteredLogs.length);
        avgShiftVal.textContent = formatMinutesToHours(avgMinutes);
      } else {
        avgShiftVal.textContent = '0h 0m';
      }
    }

    function populateFilterOptions() {
      const logs = JSON.parse(localStorage.getItem(storageKeyLogs)) || [];
      const dates = [...new Set(logs.map(log => log.date))];
      
      dates.forEach(d => {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = d;
        filterSelect.appendChild(opt);
      });
    }

    filterSelect.addEventListener('change', renderTimesheet);

    populateFilterOptions();
    renderTimesheet();
