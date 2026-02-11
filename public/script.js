const form = document.getElementById("complaintForm");
const list = document.getElementById("complaintList");
const searchBox = document.getElementById("searchBox");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const resolvedCount = document.getElementById("resolvedCount");
const rejectedCount = document.getElementById("rejectedCount");

let currentView = "dashboard";
let currentFilter = "all";
let masterData = [];

// handle user form submit
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

const data = {
  name: document.getElementById("name").value,
  room: document.getElementById("room").value,
  email: document.getElementById("email").value,
  category: document.getElementById("category").value,
  subject: document.getElementById("subject").value,
  description: document.getElementById("description").value,
};

    await fetch("/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    alert("Complaint Submitted");
    form.reset();
  });
}

// load complaints from server
async function loadComplaints() {
  if (!list) return;

  const res = await fetch("/complaints");
  masterData = await res.json();

  updateCounts(masterData);
  render();
}

// update dashboard numbers
function updateCounts(data) {
  if (!totalCount) return;

  totalCount.textContent = data.length;
  pendingCount.textContent = data.filter((c) => c.status === "pending").length;
  resolvedCount.textContent = data.filter((c) => c.status === "resolved").length;
  rejectedCount.textContent = data.filter((c) => c.status === "rejected").length;
}

// main render function
function render() {
  let data = [...masterData];
  list.innerHTML = "";

  if (currentView === "rooms") {
    renderRooms(data);
    return;
  }

  if (currentView === "students") {
    renderStudents(data);
    return;
  }

  if (currentView === "complaints") {
    currentFilter = "pending";
  }

  if (currentFilter !== "all") {
    data = data.filter((c) => c.status === currentFilter);
  }

  const search = searchBox ? searchBox.value.toLowerCase() : "";

  data = data.filter(
  (c) =>
    (c.name || "").toLowerCase().includes(search) ||
    (c.subject || "").toLowerCase().includes(search) ||
    (c.description || "").toLowerCase().includes(search)
);

  data.forEach(renderComplaintCard);
}

// render single complaint card
function renderComplaintCard(c) {
  const div = document.createElement("div");
  div.className = "card-item";

  div.innerHTML = `
    <h3>${c.category} | ${c.subject}</h3>
    <p><b>${c.id}</b> — Room ${c.room}</p>
    <p>${c.name || "Unknown"} (${c.email})</p>
    ${c.description ? `<p>${c.description}</p>` : ""}
    ${c.remarks ? `<p><b>Admin:</b> ${c.remarks}</p>` : ""}
    <span class="badge ${c.status}">${c.status}</span>

    <div class="actions">
      ${
        c.status === "pending"
          ? `
        <button class="btn primary" onclick="updateStatus('${c.id}','resolved')">Resolve</button>
        <button class="btn" onclick="updateStatus('${c.id}','rejected')">Reject</button>
      `
          : `<b>Final Decision ✔</b>`
      }

      <button class="btn" onclick="deleteComplaint('${c.id}')">Delete</button>
    </div>
  `;

  list.appendChild(div);
}

// render rooms view
function renderRooms(data) {
  const rooms = {};

  data.forEach((c) => {
    if (!rooms[c.room]) rooms[c.room] = [];
    rooms[c.room].push(c);
  });

  Object.keys(rooms).forEach((room) => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.style.cursor = "pointer";

    div.innerHTML = `<h3>Room ${room}</h3><p>${rooms[room].length} Complaints</p>`;

    div.onclick = () => {
      list.innerHTML = "";
      rooms[room].forEach(renderComplaintCard);
    };

    list.appendChild(div);
  });
}

// render students view
function renderStudents(data) {
  const students = {};

  data.forEach((c) => {
    const name = c.name || "Unknown";
    if (!students[name]) students[name] = [];
    students[name].push(c);
  });

  Object.keys(students).forEach((student) => {
    const div = document.createElement("div");
    div.className = "card-item";
    div.style.cursor = "pointer";

    div.innerHTML = `<h3>${student}</h3><p>${students[student].length} Complaints</p>`;

    div.onclick = () => {
      list.innerHTML = "";
      students[student].forEach(renderComplaintCard);
    };

    list.appendChild(div);
  });
}

// sidebar navigation
document.querySelectorAll(".menu").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".menu").forEach((b) =>
      b.classList.remove("active")
    );

    btn.classList.add("active");
    currentView = btn.dataset.view;
    currentFilter = "all";
    render();
  });
});

// stat card filter
document.querySelectorAll(".stat-card").forEach((card) => {
  card.addEventListener("click", () => {
    currentFilter = card.dataset.filter;
    currentView = "dashboard";
    render();
  });
});

// search
if (searchBox) {
  searchBox.addEventListener("input", render);
}

// update complaint
window.updateStatus = async (id, status) => {
  const remarks = prompt("Enter admin remarks:");
  if (remarks === null) return;

  await fetch(`/complaints/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, remarks }),
  });

  loadComplaints();
};

// delete complaint
window.deleteComplaint = async (id) => {
  await fetch(`/complaints/${id}`, { method: "DELETE" });
  loadComplaints();
};

if (list) loadComplaints();

window.logout = ()=>{
  localStorage.removeItem("admin");
  window.location="login.html";
};