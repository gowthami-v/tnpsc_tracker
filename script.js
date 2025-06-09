// script.js

let topics = JSON.parse(localStorage.getItem("topics")) || [];
let countdowns = JSON.parse(localStorage.getItem("countdowns")) || [];

const revisionPattern = [1, 1, 1, 3, 5, 7, 15, 30, 30, 30];

function saveData() {
  localStorage.setItem("topics", JSON.stringify(topics));
  localStorage.setItem("countdowns", JSON.stringify(countdowns));
}

// ========== 📅 Countdown Section ==========
function addCountdown() {
  const name = document.getElementById("exam-name").value;
  const date = document.getElementById("exam-date").value;
  if (!name || !date) return alert("Enter exam name and date");
  countdowns.push({ name, date });
  saveData();
  renderCountdowns();
}

function renderCountdowns() {
  const container = document.getElementById("countdown-list");
  container.innerHTML = "";
  countdowns.forEach((cd, index) => {
    const daysLeft = Math.ceil(
      (new Date(cd.date) - new Date()) / (1000 * 60 * 60 * 24)
    );
    container.innerHTML += `<div class="topic-card">

      <span style="color:Green;font-weight:bold;font-size:125%;font-family: 'Agbalumo', cursive;"> ${cd.name} Countdown  </span>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      <span style="color:Red;font-weight:bold;font-size:125%;font-family: 'Sofia', cursive;">
       ${daysLeft}  Days Left 📆💥 </span>
    </div>`;
  });
}

// ========== 📝 Topic Section ==========
function addTopic() {
  const subject = document.getElementById("subject-name").value;
  const title = document.getElementById("topic-title").value;
  if (!subject || !title) return alert("Enter subject and topic");

  const today = new Date().toISOString().split("T")[0];
  const revisions = revisionPattern.map(days => {
    let d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  });

  topics.push({
    subject,
    title,
    completed: false,
    completedDate: null,
    revisions,
    revisionDone: Array(10).fill(false)
  });

  saveData();
  renderTopics();
  renderRevisionTable();
  renderCharts();
}

function renderTopics() {
  const list = document.getElementById("topic-list");
  list.innerHTML = "";

  topics.forEach((topic, i) => {
    const doneCount = topic.revisionDone.filter(x => x).length;
    const card = document.createElement("div");
    card.className = "topic-card" + (topic.completed ? " completed" : "");
    card.innerHTML = `
      <strong>${topic.subject}:</strong> ${topic.title} <br>
      <span class="status">Status: ${topic.completed ? "✅ Completed" : "❌ Not Done"}</span><br>
      <span>Revisions Done: ${doneCount}/10</span><br>
      ${
        !topic.completed
          ? `<button onclick="markAsCompleted(${i})">Completed</button>`
          : ""
      }
    `;
    list.appendChild(card);
  });
}

function markAsCompleted(index) {
  topics[index].completed = true;
  topics[index].completedDate = new Date().toISOString().split("T")[0];
  saveData();
  renderTopics();
  renderRevisionTable();
  renderCharts();
}

// ========== 🔁 Today’s Revisions ==========
function renderTodayRevisions() {
  const today = new Date().toISOString().split("T")[0];
  const list = document.getElementById("revisions-list");
  list.innerHTML = "";

  topics.forEach((topic, tIndex) => {
    topic.revisions.forEach((revDate, rIndex) => {
      if (revDate === today && !topic.revisionDone[rIndex]) {
        const card = document.createElement("div");
        card.className = "revision-card";
        card.innerHTML = `
          <strong>${topic.subject}:</strong> ${topic.title} - Revision ${rIndex + 1}<br>
          <button onclick="markRevisionDone(${tIndex}, ${rIndex})">Mark Revision Done</button>
        `;
        list.appendChild(card);
      }
    });
  });
}

function markRevisionDone(tIndex, rIndex) {
  topics[tIndex].revisionDone[rIndex] = true;
  saveData();
  renderTodayRevisions();
  renderTopics();
  renderRevisionTable();
  renderCharts();
}

// ========== 📋 Revision Table ==========
function renderRevisionTable() {
  const table = document.getElementById("revision-table-body");
  table.innerHTML = "";

  topics.forEach(topic => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${topic.subject}</td>
      <td>${topic.title}</td>
      <td>${topic.completedDate || "-"}</td>
      ${ topic.revisions.map(date => {
  const d = new Date(date);
  const yy = String(d.getFullYear()).slice(2); // Get last two digits of year
  const mm = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const dd = String(d.getDate()).padStart(2, '0');
  return `<td>${yy}-${mm}-${dd}</td>`;
}).join("")}
    `;
    table.appendChild(row);
  });
}

// ========== 📊 Chart Rendering ==========
const subjectTotals = {
  Science: 28,
  Geography: 22,
  History: 28,
  Polity: 28,
  Economy: 37,
  Unit8: 20,
  Maths: 41,
  Tamil: 142
};

function getSubjectKey(subject) {
  return Object.keys(subjectTotals).find(s =>
    subject.toLowerCase().includes(s.toLowerCase())
  ) || "Others";
}

function renderCharts() {
  const counts = {};
  const weekly = [0, 0, 0, 0];
  const monthlyCounts = {};

  topics.forEach(topic => {
    const key = getSubjectKey(topic.subject);
    counts[key] = (counts[key] || 0) + (topic.completed ? 1 : 0);

    // Weekly
    if (topic.completedDate) {
      const day = new Date(topic.completedDate).getDate();
      const weekIndex = Math.floor((day - 1) / 7);
      weekly[weekIndex] += 1;

      // Monthly Subjectwise
      monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
    }
  });

  // Pie Chart - Subjectwise
  const ctx1 = document.getElementById("overallChart").getContext("2d");
  new Chart(ctx1, {
    type: "pie",
    data: {
      labels: Object.keys(subjectTotals),
      datasets: [
        {
          data: Object.keys(subjectTotals).map(
            s => counts[s] || 0
          ),
          backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#6366f1", "#84cc16"]
        }
      ]
    }
  });

  // Weekly Bar
  const ctx2 = document.getElementById("weeklyChart").getContext("2d");
  new Chart(ctx2, {
    type: "bar",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Topics Completed",
          data: weekly,
          backgroundColor: "#3b82f6"
        }
      ]
    }
  });

  // Monthly Subjectwise Pie
  const ctx3 = document.getElementById("monthlyChart").getContext("2d");
  new Chart(ctx3, {
    type: "pie",
    data: {
      labels: Object.keys(monthlyCounts),
      datasets: [
        {
          data: Object.values(monthlyCounts),
          backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#6366f1", "#84cc16"]
        }
      ]
    }
  });
}

// ========== INIT ==========
renderCountdowns();
renderTopics();
renderTodayRevisions();
renderRevisionTable();
renderCharts();
