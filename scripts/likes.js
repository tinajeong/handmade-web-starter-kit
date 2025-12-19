(function () {
  const STORAGE_KEY = "post-heart-state";
  const listeners = new Set();

  const hasStorage = (() => {
    try {
      const testKey = "__heart_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn("LocalStorage unavailable, heart state won't persist.", error);
      return false;
    }
  })();

  const readState = () => {
    if (!hasStorage) return {};
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.warn("Failed to parse heart state.", error);
      return {};
    }
  };

  let state = readState();

  const persist = () => {
    if (!hasStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Failed to save heart state.", error);
    }
  };

  const isLiked = (postId) => Boolean(state[postId]);

  const setLiked = (postId, liked) => {
    if (!postId) return false;
    if (liked) {
      state[postId] = true;
    } else {
      delete state[postId];
    }
    persist();
    notify(postId);
    return liked;
  };

  const toggle = (postId) => setLiked(postId, !isLiked(postId));

  const notify = (postId) => {
    const liked = isLiked(postId);
    listeners.forEach((handler) => {
      try {
        handler(postId, liked);
      } catch (error) {
        console.error("Heart listener error", error);
      }
    });
  };

  const subscribe = (handler) => {
    if (typeof handler !== "function") return () => {};
    listeners.add(handler);
    return () => listeners.delete(handler);
  };

  const updateButtonVisualState = (button, liked) => {
    button.classList.toggle("is-active", liked);
    button.setAttribute("aria-pressed", liked ? "true" : "false");
    const label = button.querySelector("[data-heart-label]");
    if (label) label.textContent = liked ? "좋아요 취소" : "좋아요";
  };

  const bindButton = (button) => {
    if (!button || button.dataset.heartBound === "true") return () => {};
    const postId = Number(button.dataset.postId);
    if (!postId) return () => {};

    button.dataset.heartBound = "true";
    if (!button.type) button.type = "button";

    const sync = () => updateButtonVisualState(button, isLiked(postId));
    sync();

    const handleClick = (event) => {
      event.preventDefault();
      updateButtonVisualState(button, toggle(postId));
    };

    button.addEventListener("click", handleClick);

    const unsubscribe = subscribe((changedPostId) => {
      if (changedPostId === postId) sync();
    });

    return () => {
      button.removeEventListener("click", handleClick);
      unsubscribe();
    };
  };

  window.PostHearts = {
    isLiked,
    toggle,
    subscribe,
    bindButton,
  };
})();
