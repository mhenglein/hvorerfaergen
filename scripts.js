const url = "http://localhost:3128";
let increment = 200;

const latCutoffGedser = 54.569;
const latCutoffRodby = 54.64873;

// DOM
const rodbyBtn = document.getElementById("rodbyBtn");
const gedserBtn = document.getElementById("gedserBtn");
const permissionsBtn = document.getElementById("permission");
const rickBtn = document.getElementById("rickSound");
const kevinBtn = document.getElementById("kevinSound");
const bellBtn = document.getElementById("bellSound");
const updateBtn = document.getElementById("updateNow");

const rodbySect = document.getElementById("rodby");
const gedserSect = document.getElementById("gedser");
const progressBar = document.getElementById("progressTimer");
const lastUpdated = document.getElementById("lastUpdated");

// SOUND PREFERENCE
let sound = localStorage.getItem("audioPreference");
if (sound === "rick.mp3") {
  rickBtn.classList.add("shadow");
  kevinBtn.classList.remove("shadow");
  bellBtn.classList.remove("shadow");
} else if (sound === "kevin.mp3") {
  rickBtn.classList.remove("shadow");
  kevinBtn.classList.add("shadow");
  bellBtn.classList.remove("shadow");
} else {
  sound = "bell.mp3";
  localStorage.setItem("audioPreference", "bell.mp3");

  rickBtn.classList.remove("shadow");
  kevinBtn.classList.remove("shadow");
  bellBtn.classList.add("shadow");
}

let howl = new Howl({ src: [sound], volume: 1.0 });

rickBtn.addEventListener("click", () => {
  sound = "rick.mp3";
  localStorage.setItem("audioPreference", "rick.mp3");

  rickBtn.classList.add("shadow");
  kevinBtn.classList.remove("shadow");
  bellBtn.classList.remove("shadow");
  howl.stop();
  howl = new Howl({ src: [sound], volume: 1.0 });

  makeSound();
});

kevinBtn.addEventListener("click", () => {
  sound = "kevin.mp3";
  localStorage.setItem("audioPreference", "kevin.mp3");

  rickBtn.classList.remove("shadow");
  kevinBtn.classList.add("shadow");
  bellBtn.classList.remove("shadow");
  howl.stop();
  howl = new Howl({ src: [sound], volume: 1.0 });

  makeSound();
});

bellBtn.addEventListener("click", () => {
  sound = "bell.mp3";
  localStorage.setItem("audioPreference", "bell.mp3");

  rickBtn.classList.remove("shadow");
  kevinBtn.classList.remove("shadow");
  bellBtn.classList.add("shadow");

  howl.stop();
  howl = new Howl({ src: [sound], volume: 1.0 });

  makeSound();
});

updateBtn.addEventListener("click", () => {
  sendRequests();
  i = 100;
});

// LOCAL STORAGE & MAIN HARBOUR TOGGLE
let currentState = localStorage.getItem("harbour");
if (currentState === "rodby") {
  rodbyBtn.classList.add("active");
  gedserBtn.classList.remove("active");
  rodbySect.hidden = false;
  gedserSect.hidden = true;
} else {
  rodbyBtn.classList.remove("active");
  gedserBtn.classList.add("active");
  rodbySect.hidden = true;
  gedserSect.hidden = false;
}

rodbyBtn.addEventListener("click", () => {
  if (!rodbyBtn.classList.contains("active")) {
    rodbyBtn.classList.add("active");
    gedserBtn.classList.remove("active");
    localStorage.setItem("harbour", "rodby");
    currentState = "rodby";
    rodbySect.hidden = !1;
    gedserSect.hidden = !0;
  }
});

gedserBtn.addEventListener("click", () => {
  if (!gedserBtn.classList.contains("active")) {
    rodbyBtn.classList.remove("active");
    gedserBtn.classList.add("active");
    localStorage.setItem("harbour", "gedser");
    currentState = "gedser";
    rodbySect.hidden = !0;
    gedserSect.hidden = !1;
  }
});

permissionsBtn.addEventListener("click", () => {
  askNotificationPermission();
});
function askNotificationPermission() {
  // function to actually ask the permissions
  function handlePermission(permission) {
    // set the button to shown or hidden, depending on what the user answers
    if (Notification.permission === "denied" || Notification.permission === "default") {
      // permissionsBtn.style.display = "block";
    } else {
      // permissionsBtn.style.display = "none";
    }
  }

  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission().then((permission) => {
        handlePermission(permission);
      });
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    }
  }
}

function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
}

let i = 100;

startTheClock();
sendRequests();

function startTheClock() {
  const e = setInterval(function () {
    i--;
    if (i > 0) {
      progressBar.style.width = i + "%";
    } else {
      sendRequests(currentState);
      i = 100;
      progressBar.style.width = i + "%";
    }
  }, increment);
}

function sendRequests() {
  const ferries = ["københavn", "berlin", "deutschland", "frederik", "holger", "richard", "schleswig", "benedikte"];
  ferries.forEach((el) => {
    sendRequest(el);
  });

  const now = new Date();
  lastUpdated.innerText = now.toLocaleTimeString();
}

function sendRequest(ferry) {
  // Constants
  const position = document.getElementById(`${ferry}Position`);
  const speed = document.getElementById(`${ferry}Speed`);
  const direction = document.getElementById(`${ferry}Direction`);
  const title = document.getElementById(`${ferry}Title`);
  const course = document.getElementById(`${ferry}Kurs`);
  const progress = document.getElementById(`${ferry}Progress`);
  const status = document.getElementById(`${ferry}Status`);
  const card = title.parentElement;
  const progressParent = progress.parentElement;

  // Fetch
  fetch(`${url}/${ferry}`)
    .then((response) => response.json())
    .then((data) => {
      let latThreshold = 0;
      if (currentState === "rodby") {
        latThreshold = latCutoffRodby;
      } else {
        latThreshold = latCutoffGedser;
      }

      if (data.status === "Inaktiv") {
        title.innerText = "Færgen er ikke i drift";
        card.classList.add("text-muted");
        progress.style.width = "0%";
        progress.classList.remove("progress-bar-reverse");
        progressParent.classList.remove("progress-reverse");
        direction.innerText = `${data.direction} (Stillestående)`;
        speed.innerText = "0 km/t (Ude af drift)";
        course.innerText = "N/A";
        status.innerText = data.status;
        position.innerText = `${data.lat}/${data.lon}`;
      } else {
        card.classList.remove("text-muted");
        direction.innerText = data.direction;
        speed.innerText = data.speed;
        position.innerText = `${data.lat}/${data.lon}`;
        course.innerText = data.course;
        status.innerText = data.status;
        progress.style.width = data.completed + "%";
        if (data.direction === "Nord") {
          if (data.speed === 0 && data.latitude > latThreshold) {
            title.innerText = "Færgen ser ud til at ligge stille i havn";
          } else if (data.speed === 0 && data.latitude < latThreshold) {
            title.innerText = "Færgen ligger stille i havet / ude for havnen";
          } else {
            title.innerText = "Færgen er på vej til Danmark";
          }
        } else {
          if (data.speed === 0) {
            title.innerText = "Færgen peger væk fra Danmark, men ligger stille";
          } else {
            title.innerText = "Færgen er på vej væk fra Danmark";
          }
        }
      }

      // Reverse
      if (data.direction === "Syd" && data.status !== "Inaktiv") {
        progress.classList.add("progress-bar-reverse");
        progressParent.classList.add("progress-reverse");
        progress.classList.remove("progress-bar-striped");
      } else if (direction === "Nord" && data.status !== "Inaktiv") {
        progress.classList.remove("progress-bar-reverse");
        progressParent.classList.remove("progress-reverse");
      }

      if (data.status !== "Inaktiv" && latitude > latThreshold && data.direction === "Nord") {
        if (speed === 0) {
          title.style.color = red;
          title.innerText = "Færgen er i havn";
        } else if (speed > 0) {
          if (currentState === "gedser") {
            if (ferry === "københavn" || ferry === "berlin") notifyMe();
          } else {
            if (ferry !== "københavn" && ferry !== "berlin") notifyMe();
          }
          title.style.color = red;
          title.innerText = "Færgen er NETOP NU på vej ind i havnen";
        } else {
          title.style.color = black;
        }
      }
    });
}

function makeSound() {
  howl.stop();
  howl.play();
}

function notifyMe() {
  document.title = "🔴 Færgen er snart i havnen!";
  makeSound();
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    alert("Færgen er i havn!");
  }

  // Let's check whether notification permissions have already been granted
  else if (Notification.permission === "granted") {
    // If it's okay let's create a notification
    var notification = new Notification("Færgen er i havn!");
  }

  // Otherwise, we need to ask the user for permission
  else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(function (permission) {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        var notification = new Notification("Færgen er i havn!");
      }
    });
  }

  i = 1000;

  // At last, if the user has denied notifications, and you
  // want to be respectful there is no need to bother them any more.
}
