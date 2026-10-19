(function () {
  "use strict";

  const themeToggleBtn       = document.getElementById("themeToggleBtn");
  const srAnnouncement       = document.getElementById("srAnnouncement");

  const cameraVideo          = document.getElementById("cameraVideo");
  const cameraCanvas         = document.getElementById("cameraCanvas");
  const capturedImagePreview = document.getElementById("capturedImagePreview");
  const btnStartCamera       = document.getElementById("btnStartCamera");
  const btnCapture           = document.getElementById("btnCapture");
  const btnClearImage        = document.getElementById("btnClearImage");
  const imageDataInput       = document.getElementById("imageData");
  const fileInput            = document.getElementById("todoInputFile");

  let mediaStream = null;
  let objectUrl   = null;

  function announceToSR(message) {
    if (!srAnnouncement) return;
    srAnnouncement.textContent = "";
    window.setTimeout(function () { srAnnouncement.textContent = message; }, 60);
  }

  function applyThemeState(isDark) {
    if (!themeToggleBtn) return;
    themeToggleBtn.textContent = isDark ? "To Light Mode" : "To Dark Mode";
    themeToggleBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
    themeToggleBtn.setAttribute(
      "aria-label",
      isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"
    );
  }

  function initTheme() {
    const isDark = localStorage.getItem("theme") === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    applyThemeState(isDark);
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", function () {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      applyThemeState(isDark);
      announceToSR(isDark ? "Mode Gelap diaktifkan" : "Mode Terang diaktifkan");
    });
  }

  function stopCamera() {
    if (mediaStream) {
      mediaStream.getTracks().forEach(function (track) { track.stop(); });
      mediaStream = null;
    }
    if (cameraVideo) {
      cameraVideo.srcObject = null;
      cameraVideo.hidden = true;
    }
    if (btnCapture) btnCapture.hidden = true;
    if (btnStartCamera) btnStartCamera.hidden = false;
  }

  if (btnStartCamera && cameraVideo) {
    btnStartCamera.addEventListener("click", async function () {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        cameraVideo.srcObject = mediaStream;
        cameraVideo.hidden = false;
        if (btnCapture) btnCapture.hidden = false;
        btnStartCamera.hidden = true;
        announceToSR("Kamera diaktifkan. Tekan Ambil Foto untuk mengambil gambar.");
      } catch (err) {
        alert("Tidak dapat mengakses kamera: " + err.message);
        announceToSR("Gagal mengakses kamera.");
      }
    });
  }

  if (btnCapture && cameraVideo && cameraCanvas && capturedImagePreview) {
    btnCapture.addEventListener("click", function () {
      const ctx = cameraCanvas.getContext("2d");
      cameraCanvas.width  = cameraVideo.videoWidth  || 320;
      cameraCanvas.height = cameraVideo.videoHeight || 240;
      ctx.drawImage(cameraVideo, 0, 0, cameraCanvas.width, cameraCanvas.height);

      const dataUrl = cameraCanvas.toDataURL("image/jpeg", 0.85);
      if (imageDataInput) imageDataInput.value = dataUrl;

      capturedImagePreview.src = dataUrl;
      capturedImagePreview.hidden = false;
      if (btnClearImage) btnClearImage.hidden = false;
      if (fileInput) fileInput.value = "";

      stopCamera();
      announceToSR("Foto berhasil diambil dan siap dilampirkan.");
    });
  }

  if (btnClearImage) {
    btnClearImage.addEventListener("click", function () {
      if (imageDataInput) imageDataInput.value = "";
      if (capturedImagePreview) {
        capturedImagePreview.src = "";
        capturedImagePreview.hidden = true;
      }
      if (fileInput) fileInput.value = "";
      if (objectUrl) { URL.revokeObjectURL(objectUrl); objectUrl = null; }
      btnClearImage.hidden = true;
      stopCamera();
      announceToSR("Lampiran gambar dihapus.");
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", function () {
      if (!fileInput.files || fileInput.files.length === 0) return;

      if (imageDataInput) imageDataInput.value = "";
      stopCamera();

      if (objectUrl) { URL.revokeObjectURL(objectUrl); }
      objectUrl = URL.createObjectURL(fileInput.files[0]);

      if (capturedImagePreview) {
        capturedImagePreview.src = objectUrl;
        capturedImagePreview.hidden = false;
      }
      if (btnClearImage) btnClearImage.hidden = false;
      announceToSR("Berkas gambar dipilih.");
    });
  }

  document.querySelectorAll(".toggle-checkbox").forEach(function (cb) {
    cb.addEventListener("change", function () {
      if (cb.form) cb.form.submit();
    });
  });

  const flash = document.querySelector(".flash");
  if (flash) announceToSR(flash.textContent.trim());

  function showNotification(todo) {
    const opts = {
      body: todo.desc || "Waktunya menyelesaikan aktivitas ini!",
      tag: "todo-" + todo.id
    };
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(function (reg) {
        reg.showNotification("Pengingat: " + todo.title, opts);
      });
    } else if ("Notification" in window) {
      new Notification("Pengingat: " + todo.title, opts);
    }
  }

  function scheduleOne(todo) {
    if (!todo.notifyTime) return;
    const delay = new Date(todo.notifyTime).getTime() - Date.now();
    if (delay > 0 && delay < 2147483647) {
      window.setTimeout(function () { showNotification(todo); }, delay);
    }
  }

  function initNotifications() {
    const items = Array.isArray(window.__TODOS__) ? window.__TODOS__ : [];
    if (!items.length || !("Notification" in window)) return;

    const scheduleAll = function () { items.forEach(scheduleOne); };

    if (Notification.permission === "granted") {
      scheduleAll();
    } else if (Notification.permission === "default") {
      document.body.addEventListener(
        "click",
        function () {
          Notification.requestPermission().then(function (perm) {
            if (perm === "granted") scheduleAll();
          });
        },
        { once: true }
      );
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function (err) {
        console.warn("Registrasi Service Worker gagal:", err);
      });
    });
  }

  initTheme();
  initNotifications();
  registerServiceWorker();
})();