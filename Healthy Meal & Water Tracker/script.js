
document.addEventListener("DOMContentLoaded", () => {
    
    // ===== Date Input Initialization =====
    const dateInput = document.getElementById("track-date");
    const today = new Date().toISOString().split("T")[0];
    if (dateInput) {
        dateInput.value = today;
    }

    // ===== Helper: Date Key =====
    function getDateKey(key) {
        return `${dateInput.value}-${key}`;
    }

    let statsUpdateTimer = null;
    function scheduleStatsUpdate() {
        clearTimeout(statsUpdateTimer);
        statsUpdateTimer = setTimeout(updateWeeklyStats, 150);
    }
    
    // Select all Cups and Status
    const cups = document.querySelectorAll('.cup');
    const Status = document.getElementById('water-status');

    // Add click events
    cups.forEach((cup, index) => {
    cup.addEventListener("click", () => highlightCups(index));
    });

    function highlightCups(index) {
    // Fill/Unfill cups up to clicked index
        if (cups[index].classList.contains("full") &&
        !cups[index].nextElementSibling?.classList.contains("full")) {
            index--;    // Unfill last if clicked again
        }

        cups.forEach((cup, i) => {
            if (i <= index) {
                cup.classList.add("full");
            } else {
                cup.classList.remove("full");
            }
        });

        updateStatus();
        saveWater();
    }

    function updateStatus() {
    const fullCups = document.querySelectorAll(".cup.full").length;
    const totalCups = cups.length;
    Status.innerText = `${fullCups} / ${totalCups} cups`;

    updateSummary(); // update summary after water change
    scheduleStatsUpdate();
    }

//--------------------------------------------------------------------------------------

    // Meal Tracker
    const mealForm = document.getElementById('meal-form');
    const mealInput = document.getElementById('meal');
    const mealList = document.getElementById('meal-list');

    // Handle Form Submission
    mealForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const mealText = mealInput.value.trim();
    if (mealText === '') return;

    mealInput.value = ""; // Clear the input
    addMeal(mealText);

    });

    function addMeal(mealText, save = true) {
        const li = document.createElement('li');
        li.textContent = mealText;

        // Delete Button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Remove 🗑️';
        deleteBtn.addEventListener('click', () => {
            li.remove();
            saveMeals();
            updateSummary();
            updateWeeklyStats();
        });

        li.appendChild(deleteBtn);
        mealList.appendChild(li);

        if (save) saveMeals();
        updateSummary(); // update summary after meal add
        scheduleStatsUpdate();
    }

    // Save meals to LocalStorage
    function saveMeals() {
        const meals = [];
        document.querySelectorAll('#meal-list li').forEach((li) => {
            // remove the "X" from saved text
            meals.push(li.firstChild.textContent); 
        });
        localStorage.setItem(getDateKey("meals"), JSON.stringify(meals));
    }

    // Load saved meals on page load
    function loadMeals() {
        mealList.innerHTML = ""; // clears the old list
        const meals = JSON.parse(localStorage.getItem(getDateKey("meals"))) || [];
        meals.forEach((meal) => addMeal(meal, false));

        updateSummary();
        scheduleStatsUpdate();
    }

    loadMeals();

    //--------------------------------------------------------------------------------------

    // Daily Summary
    function updateSummary() {
        const waterCups = document.querySelectorAll('.cup.full').length;
        const meals = JSON.parse(localStorage.getItem(getDateKey("meals")) || "[]").length;

        const waterGoal = parseInt(localStorage.getItem("waterGoal")) || 8;
        const mealGoal = parseInt(localStorage.getItem("mealGoal")) || 3;

        // Simple Scoring System
        const waterScore = Math.min((waterCups / waterGoal) * 50, 50); 
        const mealScore = Math.min((meals / mealGoal) * 50, 50); 
        const totalScore = Math.min(waterScore + mealScore, 100);

        const summaryText = document.getElementById("summary-text");
        const progressBar = document.getElementById("progress-bar");

        // Update progress bar
        progressBar.style.width = `${totalScore}%`;

        progressBar.classList.remove("aura");

        if (totalScore < 40) {
            progressBar.style.backgroundColor = "red";
            summaryText.style.color = "red";
        } else if (totalScore < 80) {
            progressBar.style.backgroundColor = "orange";
            summaryText.style.color = "orange";
        } else {
            progressBar.style.backgroundColor = "green";
            summaryText.style.color = "green";
        }

        if (totalScore === 100) {
            progressBar.classList.add("aura");
        } else {
            progressBar.classList.remove("aura");
        }

        // Update motivational text
        if (totalScore === 0) {
            summaryText.innerText = "🚀 No progress yet... Start tracking!";
        } else if (totalScore < 50) {
            summaryText.innerText = "💧🥗 Good start, keep going! 💪";
        } else if (totalScore < 100) {
            summaryText.innerText = "🔥Great job, almost there!";
        } else {
            summaryText.innerText = "🏆 Mission accomplished, Buddy🙏!";
        }
    }
    updateStatus();
    updateSummary();
    scheduleStatsUpdate();

//-------------------------------- Toggle Button --------------------------------------
    document.getElementById('theme-toggle').addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        this.textContent = document.body.classList.contains('dark-mode') ? '☀️ Dark Mode' : '🌙 Dark Mode';
        updateWeeklyStats();
    });
//-------------------------------------------------------------------------------------

    // // ===== Date Handling =====
    function saveWater() {
        const fullCups = document.querySelectorAll(".cup.full").length;
        localStorage.setItem(getDateKey("water"), fullCups);
        scheduleStatsUpdate();
    }

    function loadWater() {
        const saved = localStorage.getItem(getDateKey("water"));
        const cupsToFill = saved ? parseInt(saved) : 0;

        cups.forEach((cup, i) => {
            if (i < cupsToFill) {
                cup.classList.add("full");
            } else {
                cup.classList.remove("full");
            }
        });
        updateStatus();
    }

    dateInput.addEventListener("change", () => {
        loadWater();
        loadMeals();
    });

    //--------------------------------------------------------------------------------------

    // ===== Weekly Stats =====
    let statsChart;

    function updateWeeklyStats() {
        const canvas = document.getElementById("statsChart");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");


        const labels = [];
        const waterData = [];
        const mealData = [];

        // Last 7 days including today
        for (let i = 6; i>= 0; i--) {
            const date = new Date();
            const pastDate = new Date(date);
            pastDate.setDate(date.getDate() - i);

            const key = pastDate.toISOString().split("T")[0]; // YYYY-MM-DD
            labels.push(key.slice(5)); // shows MM-DD

            // Get stored data
            const water = parseInt(localStorage.getItem(`${key}-water`)) || 0;
            const meals = (JSON.parse(localStorage.getItem(`${key}-meals`)) || []).length;

            waterData.push(water);
            mealData.push(meals);
        }

        const isDark = document.body.classList.contains("dark-mode");
        const textColor = isDark ? '#fff' : '#000';
        const gridColor = isDark ? '#555' : '#778';
        
        //Destroy if old chart exists
        if (statsChart) {
            statsChart.destroy();
        }

        statsChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [
                    {label: "💧 Water (cups)", data: waterData, backgroundColor: "rgba(54, 162, 235, 0.7)"},
                    {label: "🥗 Meals", data: mealData, backgroundColor: "rgba(23, 216, 45, 0.7)"}
                ],
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {position: "top", labels: {color: textColor, font: {size: 12, weight: "bold"}}},
                    title: {display: true, color: textColor, text: "Your Last 7 Days Progress!", font: {size: 15}},
                },
                scales: {
                    x: {ticks: {color: textColor, font: {size: 12, weight: "bold"}}, grid: {color: gridColor}},
                    y: {beginAtZero: true, ticks: {stepSize: 1, color: textColor, font: {size:12, weight: "bold"}}, grid: {color: gridColor}}
                }
            }
        });
    }
    loadMeals();
    loadWater();
    updateStatus();
    updateSummary();
    scheduleStatsUpdate();

    function checkGoals() {
        const waterGoal = localStorage.getItem("waterGoal");
        const mealGoal = localStorage.getItem("mealGoal");
        const goalStatus = document.getElementById("goal-status");

        if (waterGoal && mealGoal) {
            goalStatus.textContent = `Your goals: 💧 ${waterGoal} cups, 🥗 ${mealGoal} meals`;
            goalStatus.style.color = "green";
        } else {
            goalStatus.textContent = "⚠️ No goals set yet. Please set your goals!";
            goalStatus.style.color = "orange";
        }
    }

    document.getElementById("goal-form").addEventListener("submit", (e) => {
        e.preventDefault();
        waterGoal = parseInt(document.getElementById("goal-water").value);
        mealGoal = parseInt(document.getElementById("goal-meals").value);

        localStorage.setItem("waterGoal", waterGoal);
        localStorage.setItem("mealGoal", mealGoal);

        alert(`✅ Goals updated successfully!\n💧 Drink at least 6 cups of water and🥗 eat 2 meals a day for good health!`);

        document.getElementById("goal-status").textContent =
            `Your goals: 💧 ${waterGoal} cups, 🥗 ${mealGoal} meals`;
        
        updateStatus();
    });

    // Reset today’s data
    document.getElementById("reset-today").addEventListener("click", () => {
        if (confirm("⚠️ Reset only today's data?")) {
            const today = new Date().toISOString().split("T")[0];
            localStorage.removeItem(`${today}-water`);
            localStorage.removeItem(`${today}-meals`);
            alert("✅ Today's data has been reset!");
            location.reload();
        }
    });

    // Reset ALL data
    document.getElementById("reset-all").addEventListener("click", () => {
        if (confirm("⚠️ This will erase ALL saved logs (meals & water). Continue?")) {

            const waterGoal = localStorage.getItem("waterGoal");
            const mealGoal = localStorage.getItem("mealGoal");

            // Clears everything
            localStorage.clear();

            if (waterGoal) localStorage.setItem("waterGoal", waterGoal);
            if (mealGoal) localStorage.setItem("mealGoal", mealGoal);

            alert("♻️ All logs have been reset, but your goals are safe!");
            location.reload();
        }
    });
    window.addEventListener('DOMContentLoaded', function() {   // Welcome Message
        const welcome = document.getElementById('welcomeMsg');
        if (welcome) {
            // Show on load, then remove after 3 seconds
            setTimeout(() => {
                welcome.classList.add('hide');
                this.setTimeout(() => welcome.remove(), 700);
            }, 2500); // time in ms (here: 1.5 seconds)
        }
    });

});
