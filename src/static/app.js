document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and previous content
      activitiesList.innerHTML = "";
      // Clear previous select options (keep placeholder)
      activitySelect.querySelectorAll("option:not([value=''])").forEach(o => o.remove());

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build card content
        const h4 = document.createElement("h4");
        h4.textContent = name;

        const desc = document.createElement("p");
        desc.textContent = details.description;

        const sched = document.createElement("p");
        sched.innerHTML = `<strong>Schedule:</strong> ${details.schedule}`;

        const avail = document.createElement("p");
        avail.innerHTML = `<strong>Availability:</strong> ${spotsLeft} spots left`;

        // Participants section
        const partSection = document.createElement("div");
        partSection.className = "participants-section";
        const partHeading = document.createElement("strong");
        partHeading.textContent = "Participants:";
        partSection.appendChild(partHeading);

        const ul = document.createElement("ul");
        ul.className = "participants-list";
        if (Array.isArray(details.participants) && details.participants.length) {
          details.participants.forEach(p => {
            const li = document.createElement("li");
            li.textContent = p;
            ul.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet";
          li.className = "muted";
          ul.appendChild(li);
        }
        partSection.appendChild(ul);

        // Assemble card
        activityCard.appendChild(h4);
        activityCard.appendChild(desc);
        activityCard.appendChild(sched);
        activityCard.appendChild(avail);
        activityCard.appendChild(partSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "message success";
        signupForm.reset();
        // Refresh activities to show new participant
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "message error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
