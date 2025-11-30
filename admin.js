// Replace with your deployed Apps Script Web App URL
const API_URL = 'https://script.google.com/macros/s/AKfycbxHdg1auYBlj94-kRPslawLBWZWT8zyzSvpP-CQ6ig3hwJ006r0SehE1cRqzHvGVRnoTw/exec';

document.addEventListener('DOMContentLoaded', () => {
  const tabItems = document.getElementById('tabItems');
  const tabRequests = document.getElementById('tabRequests');
  const itemsTabContent = document.getElementById('itemsTabContent');
  const requestsTabContent = document.getElementById('requestsTabContent');

  function setActiveTab(tab) {
    if (tab === 'items') {
      tabItems.classList.add('active');
      tabRequests.classList.remove('active');
      itemsTabContent.style.display = 'block';
      requestsTabContent.style.display = 'none';
    } else {
      tabRequests.classList.add('active');
      tabItems.classList.remove('active');
      itemsTabContent.style.display = 'none';
      requestsTabContent.style.display = 'block';
      loadRequests();
    }
  }

  tabItems.addEventListener('click', () => setActiveTab('items'));
  tabRequests.addEventListener('click', () => setActiveTab('requests'));

  // Form submit: Add Item
  const itemForm = document.getElementById('itemForm');
  const itemStatus = document.getElementById('itemStatus');

  itemForm.addEventListener('submit', (e) => {
    e.preventDefault();
    itemStatus.textContent = 'Uploading item...';

    const formData = new FormData(itemForm);
    formData.append('action', 'addItem');

    fetch(API_URL, {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          itemStatus.textContent = '✅ ' + (data.message || 'Item added.');
          itemForm.reset();
        } else {
          itemStatus.textContent = '❌ ' + (data.message || 'Failed to add item.');
        }
      })
      .catch((err) => {
        console.error(err);
        itemStatus.textContent = '❌ Error: ' + err.message;
      });
  });

  // Requests table
  const requestsTableBody = document.querySelector('#requestsTable tbody');
  const requestsStatus = document.getElementById('requestsStatus');
  const refreshRequestsBtn = document.getElementById('refreshRequestsBtn');

  function loadRequests() {
    requestsStatus.textContent = 'Loading requests...';

    fetch(API_URL + '?action=getRequests')
      .then((res) => res.json())
      .then((data) => {
        if (!data.success) {
          requestsStatus.textContent = '❌ ' + (data.message || 'Unable to load requests');
          return;
        }

        requestsStatus.textContent = '';
        requestsTableBody.innerHTML = '';

        if (!data.requests.length) {
          requestsStatus.textContent = 'No requests yet.';
          return;
        }

        data.requests.forEach((req) => {
          const tr = document.createElement('tr');

          const tdTs = document.createElement('td');
          tdTs.textContent = req.timestamp || '';
          tr.appendChild(tdTs);

          const tdName = document.createElement('td');
          tdName.textContent = req.customerName || '';
          tr.appendChild(tdName);

          const tdMobile = document.createElement('td');
          tdMobile.textContent = req.mobile || '';
          tr.appendChild(tdMobile);

          const tdAddr = document.createElement('td');
          tdAddr.textContent = req.address || '';
          tr.appendChild(tdAddr);

          const tdItems = document.createElement('td');
          tdItems.textContent = req.itemNames || req.itemIDs || '';
          tr.appendChild(tdItems);

          const tdStatus = document.createElement('td');
          tdStatus.textContent = req.status || 'New';
          tr.appendChild(tdStatus);

          requestsTableBody.appendChild(tr);
        });
      })
      .catch((err) => {
        console.error(err);
        requestsStatus.textContent = '❌ Error: ' + err.message;
      });
  }

  refreshRequestsBtn.addEventListener('click', loadRequests);

  // Default tab
  setActiveTab('items');
});
