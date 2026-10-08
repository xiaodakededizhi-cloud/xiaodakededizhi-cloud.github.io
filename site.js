(function () {
  const sidebar = document.querySelector(".sidebar");
  const menuButton = document.querySelector(".menu-button");
  const views = Array.from(document.querySelectorAll("[data-view]"));
  const routeLinks = Array.from(document.querySelectorAll("[data-route]"));
  const validRoutes = new Set(views.map((view) => view.dataset.view));

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  const audioManager = (function () {
    const audioSelector = "[data-audio-player] audio";
    let activeAudio = null;

    function isManagedAudio(target) {
      return Boolean(target && target.matches && target.matches(audioSelector));
    }

    function toggleFor(audio) {
      const player = audio.closest("[data-audio-player]");
      return player ? player.querySelector(".audio-toggle") : null;
    }

    function setLabel(audio, label) {
      const toggle = toggleFor(audio);
      if (toggle) {
        toggle.textContent = label;
      }
    }

    function resetAudio(audio) {
      if (!audio) {
        return;
      }

      if (!audio.paused) {
        audio.pause();
      }

      try {
        audio.currentTime = 0;
      } catch (error) {
        // The file may not have loaded enough metadata yet.
      }

      setLabel(audio, "Play");

      if (activeAudio === audio) {
        activeAudio = null;
      }
    }

    function resetAllExcept(exceptAudio) {
      document.querySelectorAll(audioSelector).forEach((audio) => {
        if (audio !== exceptAudio) {
          resetAudio(audio);
        }
      });
    }

    function playAudio(audio, fromStart) {
      if (fromStart) {
        try {
          audio.currentTime = 0;
        } catch (error) {
          // The file may not have loaded enough metadata yet.
        }
      }

      const playback = audio.play();

      if (playback && typeof playback.catch === "function") {
        playback.catch(function () {
          resetAudio(audio);
        });
      }
    }

    function toggleAudio(toggle) {
      const player = toggle.closest("[data-audio-player]");
      const audio = player ? player.querySelector("audio") : null;

      if (!audio) {
        return;
      }

      if (activeAudio === audio) {
        if (audio.paused) {
          playAudio(audio, false);
        } else {
          audio.pause();
          setLabel(audio, "Play");
        }
        return;
      }

      if (activeAudio) {
        resetAudio(activeAudio);
      }

      resetAllExcept(audio);
      activeAudio = audio;
      playAudio(audio, true);
    }

    document.addEventListener("click", function (event) {
      const toggle = event.target.closest
        ? event.target.closest(".audio-toggle")
        : null;

      if (toggle) {
        toggleAudio(toggle);
      }
    });

    document.addEventListener("play", function (event) {
      const audio = event.target;

      if (!isManagedAudio(audio)) {
        return;
      }

      if (activeAudio !== audio) {
        if (activeAudio) {
          resetAudio(activeAudio);
        }

        resetAllExcept(audio);
        activeAudio = audio;
      }

      setLabel(audio, "Pause");
    }, true);

    document.addEventListener("pause", function (event) {
      const audio = event.target;

      if (!isManagedAudio(audio)) {
        return;
      }

      setLabel(audio, "Play");
    }, true);

    document.addEventListener("ended", function (event) {
      const audio = event.target;

      if (!isManagedAudio(audio)) {
        return;
      }

      try {
        audio.currentTime = 0;
      } catch (error) {
        // The file may have been unloaded while ending.
      }

      setLabel(audio, "Play");
      if (activeAudio === audio) {
        activeAudio = null;
      }
    }, true);

    return {
      resetAll: function () {
        resetAllExcept(null);
      }
    };
  })();

  function currentRoute() {
    const requested = window.location.hash.replace(/^#/, "");
    return validRoutes.has(requested) ? requested : "home";
  }

  function showRoute(options) {
    const route = currentRoute();

    views.forEach((view) => {
      view.hidden = view.dataset.view !== route;
    });

    routeLinks.forEach((link) => {
      if (link.dataset.route === route) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.body.classList.toggle("home-active", route === "home");

    sidebar.classList.remove("menu-open");
    menuButton.setAttribute("aria-expanded", "false");

    if (options && options.scrollToTop) {
      window.scrollTo(0, 0);
    }
  }

  menuButton.addEventListener("click", function () {
    const open = sidebar.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });

  routeLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.location.hash === link.getAttribute("href")) {
        showRoute({ scrollToTop: true });
      }
    });
  });

  window.addEventListener("hashchange", function () {
    showRoute({ scrollToTop: true });
  });

  showRoute({ scrollToTop: true });
})();
