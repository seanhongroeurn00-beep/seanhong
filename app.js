const API_URL = 'http://192.168.100.1:3000/api'; // Host IP endpoint definition
let masterPeopleList = [];

// Static province metadata matching your backend relational constraints keys
const provincesList = [
    { id: 1, kh: 'ខេត្តបាត់ដំបង', eng: 'Battambang' },
    { id: 2, kh: 'ខេត្តកំពង់ចាម', eng: 'Kampong Cham' },
    { id: 3, kh: 'ខេត្តកំពង់ឆ្នាំង', eng: 'Kampong Chhnang' },
    { id: 4, kh: 'ខេត្តកំពង់ស្ពឺ', eng: 'Kampong Speu' },
    { id: 5, kh: 'ខេត្តកំពង់ធំ', eng: 'Kampong Thom' },
    { id: 6, kh: 'ខេត្តកំពត', eng: 'Kampot' },
    { id: 7, kh: 'ខេត្តកណ្ដាល', eng: 'Kandal' },
    { id: 8, kh: 'ខេត្តកោះកុង', eng: 'Koh Kong' },
    { id: 9, kh: 'ខេត្តក្រចេះ', eng: 'Kratie' },
    { id: 10, kh: 'ខេត្តមណ្ឌលគិរី', eng: 'Mondulkiri' },
    { id: 11, kh: 'រាជធានីភ្នំពេញ', eng: 'Phnom Penh Capital' },
    { id: 12, kh: 'ខេត្តព្រះវិហារ', eng: 'Preah Vihear' },
    { id: 13, kh: 'ខេត្តព្រៃវែង', eng: 'Prey Veng' },
    { id: 14, kh: 'ខេត្តពោធិ៍សាត់', eng: 'Pursat' },
    { id: 15, kh: 'ខេត្តរតនគិរី', eng: 'Ratanakiri' },
    { id: 16, kh: 'ខេត្តសៀមរាប', eng: 'Siem Reap' },
    { id: 17, kh: 'ខេត្តព្រះសីហនុ', eng: 'Preah Sihanouk' },
    { id: 18, kh: 'ខេត្តស្ទឹងត្រែង', eng: 'Stung Treng' },
    { id: 19, kh: 'ខេត្តស្វាយរៀង', eng: 'Svay Rieng' },
    { id: 20, kh: 'ខេត្តតាកែវ', eng: 'Takeo' },
    { id: 21, kh: 'ខេត្តឧត្ដរមានជ័យ', eng: 'Oddar Meanchey' },
    { id: 22, kh: 'ខេត្តកែប', eng: 'Kep' },
    { id: 23, kh: 'ខេត្តប៉ៃលិន', eng: 'Pailin' },
    { id: 24, kh: 'ខេត្តត្បូងឃ្មុំ', eng: 'Tboung Khmum' },
    { id: 25, kh: 'ខេត្តបន្ទាយមានជ័យ', eng: 'Banteay Meanchey' }
];

window.onload = async () => {
    initializeProvinceDropdowns();
    await testConnection();
    await loadPeople();
    setupFilteringListeners();
    setupModalControls();
};

// 1. Verify network port socket handshake visibility
async function testConnection() {
    try {
        const res = await fetch(`${API_URL.replace('/api', '')}/`);
        const badge = document.getElementById('api-status');
        if (res.ok && badge) {
            badge.textContent = "Connected";
            badge.className = "text-sm bg-green-600 px-3 py-1 rounded-full";
        }
    } catch {
        const badge = document.getElementById('api-status');
        if (badge) {
            badge.textContent = "Offline Link Fail";
            badge.className = "text-sm bg-red-600 px-3 py-1 rounded-full";
        }
    }
}

// 2. Initialize filter controls layout views
function initializeProvinceDropdowns() {
    const searchDropdown = document.getElementById('searchProvince');
    const modalDropdown = document.getElementById('modalProvinceSelect');
    
    if (searchDropdown) searchDropdown.innerHTML = '<option value="">All Provinces (Cambodia)</option>';
    if (modalDropdown) modalDropdown.innerHTML = '<option value="">-- Select Province --</option>';

    const sortedProvinces = [...provincesList].sort((a, b) => a.eng.localeCompare(b.eng));
    sortedProvinces.forEach(prov => {
        const labelText = `${prov.eng} (${prov.kh})`;
        if (searchDropdown) searchDropdown.add(new Option(labelText, prov.id));
        if (modalDropdown) modalDropdown.add(new Option(labelText, prov.id));
    });
}

// 3. Read complete dataset row arrays from API endpoint
async function loadPeople() {
    try {
        const response = await fetch(`${API_URL}/people`);
        masterPeopleList = await response.json();
        renderTable(masterPeopleList);
    } catch (err) { 
        console.error("Network read fault encountered:", err); 
    }
}

// 4. Client-side age runtime rendering engine calculator
function calculateAge(dobString) {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return 'N/A';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// 5. Inject calculated records safely into DOM table row templates
function renderTable(dataArray) {
    const tbody = document.getElementById('peopleTableBody');
    const countDisplay = document.getElementById('record-count');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (countDisplay) countDisplay.textContent = `Showing ${Array.isArray(dataArray) ? dataArray.length : 0} profiles`;

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-gray-400 italic">No corresponding row profiles resolved.</td></tr>`;
        return;
    }

    dataArray.forEach(person => {
        const rawDob = person.dob || person.dateofbirth;
        const age = calculateAge(rawDob);
        const provinceObj = provincesList.find(p => p.id == person.province_id);
        const provinceName = provinceObj ? `${provinceObj.eng} (${provinceObj.kh})` : 'Unassigned';
        const displayGender = person.gender === 'M' ? 'Male' : person.gender === 'F' ? 'Female' : person.gender;

        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50 transition";
        row.innerHTML = `
            <td class="p-3 font-mono text-xs text-gray-400">#${person.id}</td>
            <td class="p-3 font-semibold text-gray-900">${person.surname || ''}</td>
            <td class="p-3 text-gray-700">${person.givenname || person.given_name || ''}</td>
            <td class="p-3 text-xs text-gray-800 font-bold">${age} yrs</td>
            <td class="p-3"><span class="px-2 py-0.5 rounded text-xs font-medium ${person.gender === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}">${displayGender}</span></td>
            <td class="p-3 text-xs text-gray-700 font-medium">${provinceName}</td>
            <td class="p-3 text-center whitespace-nowrap">
                <button class="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 font-medium py-1 px-3 rounded transition" id="edit-${person.id}">Edit</button>
                <button class="text-xs bg-red-50 hover:bg-red-100 text-red-600 font-medium py-1 px-3 rounded transition ml-1" id="del-${person.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);

        // Safe dynamic individual click handler bindings
        document.getElementById(`edit-${person.id}`).addEventListener('click', () => prepEdit(person));
        document.getElementById(`del-${person.id}`).addEventListener('click', () => deletePerson(person.id));
    });
}

// 6. Real-time composite multi-filtering function
function filterData() {
    const nameQuery = document.getElementById('searchName').value.toLowerCase();
    const maxAgeQuery = parseInt(document.getElementById('searchAge').value);
    const provinceQuery = document.getElementById('searchProvince').value;

    const filtered = masterPeopleList.filter(person => {
        const given = person.givenname || person.given_name || '';
        const sur = person.surname || '';
        const fullName = `${sur} ${given}`.toLowerCase();
        const rawDob = person.dob || person.dateofbirth;
        const age = calculateAge(rawDob);

        const matchesName = fullName.includes(nameQuery);
        const matchesAge = isNaN(maxAgeQuery) || (age !== 'N/A' && age <= maxAgeQuery);
        const matchesProvince = !provinceQuery || person.province_id == provinceQuery;

        return matchesName && matchesAge && matchesProvince;
    });

    renderTable(filtered);
}

function setupFilteringListeners() {
    const sName = document.getElementById('searchName');
    const sAge = document.getElementById('searchAge');
    const sProv = document.getElementById('searchProvince');
    const btnReset = document.getElementById('reset-filters');

    if (sName) sName.addEventListener('input', filterData);
    if (sAge) sAge.addEventListener('input', filterData);
    if (sProv) sProv.addEventListener('change', filterData);
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            document.getElementById('search-form').reset();
            renderTable(masterPeopleList);
        });
    }
}

// 7. Modal Lifecycle and State toggling operations
function setupModalControls() {
    const cancelBtn = document.getElementById('cancel-modal-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const addBtn = document.getElementById('open-add-modal-btn');

    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (addBtn) addBtn.addEventListener('click', () => openModal(false));
    
    window.onclick = (e) => { 
        if (e.target == document.getElementById('personModal')) closeModal(); 
    };
}

function openModal(isEdit = false) {
    const modal = document.getElementById('personModal');
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; 
    
    if (!isEdit) {
        document.getElementById('modalTitle').innerText = "Register New Entry Profile";
        document.getElementById('personId').value = "";
        document.getElementById('personForm').reset();
    } else {
        document.getElementById('modalTitle').innerText = "Modify Existing Profile Data";
    }
}

function closeModal() { 
    const modal = document.getElementById('personModal');
    if (modal) {
        modal.classList.add('hidden'); 
        modal.style.display = 'none';
    }
}

// Populates current active person metadata into modal form fields for mutations
function prepEdit(person) {
    openModal(true);
    const rawDob = person.dob || person.dateofbirth;
    document.getElementById('personId').value = person.id;
    document.getElementById('surname').value = person.surname || '';
    document.getElementById('givenName').value = person.givenname || person.given_name || '';
    document.getElementById('dob').value = rawDob ? rawDob.split('T')[0] : "";
    document.getElementById('gender').value = person.gender || 'M';
    document.getElementById('modalProvinceSelect').value = person.province_id || '';
}

// 8. Dynamic dual-action form submit handler (POST vs PUT)
document.getElementById('personForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('personId').value;
    
    const rawGender = document.getElementById('gender').value;
    const mappedGender = (rawGender === 'Male' || rawGender === 'M') ? 'M' : 'F';

    const payload = {
        surname: document.getElementById('surname').value,
        givenname: document.getElementById('givenName').value,
        dob: document.getElementById('dob').value,
        gender: mappedGender,
        province_id: document.getElementById('modalProvinceSelect').value ? parseInt(document.getElementById('modalProvinceSelect').value) : null
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/people/${id}` : `${API_URL}/people`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            closeModal();
            await loadPeople(); // Refresh the dataset view instantly
        } else {
            alert('Backend rejected processing execution validation parameters.');
        }
    } catch (err) { 
        console.error("Transmission error encountered:", err); 
    }
});

// 9. Resource DELETE trace trigger row mutator
async function deletePerson(id) {
    if (!confirm("Are you sure you want to drop this user record?")) return;
    try {
        const res = await fetch(`${API_URL}/people/${id}`, { method: 'DELETE' });
        if (res.ok) await loadPeople();
    } catch (err) {
        console.error(err);
    }
}
