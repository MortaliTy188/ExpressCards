let isAuthenticated = false;
let jwtToken = "";

const routes = {
  "/": renderGiftCards,
  "/profile": renderCabinet,
  "/user-cards": renderCardByUser,
  "/admin": renderAdmin,
};

function renderLogin() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h1>Авторизация</h1>
        <form id="login-form">
            <input type="text" id="name" name="name" placeholder="Имя" required/><br><br>
            <input type="password" id="password" name="password" placeholder="Пароль" required/><br><br>
            <label class="remember">Запомнить меня<input type="checkbox" id="rememberMe" /></label>
            <button type="submit">Авторизоваться</button>
        </form>
        <p>Нет аккаунта? <button id="register-button">Зарегистрироваться</button></p>
    `;

  document
    .getElementById("register-button")
    .addEventListener("click", renderRegister);
  document.getElementById("login-form").addEventListener("submit", handleLogin);
}

function renderRegister() {
  const app = document.getElementById("app");
  app.innerHTML = `
        <h1>Регистрация</h1>
        <form id="register-form">
            <input type="text" id="name" name="name" placeholder="Имя" required/><br><br>
            <input type="text" id="middle_name" name="middle_name" placeholder="Отчество" required/><br><br>
            <input type="text" id="last_name" name="last_name" placeholder="Фамилия" required/><br><br>
            <input type="password" id="password" name="password" placeholder="Пароль" required/><br><br>
            <button type="submit">Зарегистрироваться</button>
        </form>
        <p>Уже есть аккаунт? <button id="login-button">Авторизоваться</button></p>
    `;

  document
    .getElementById("login-button")
    .addEventListener("click", renderLogin);
  document
    .getElementById("register-form")
    .addEventListener("submit", handleRegister);
}

async function renderAdmin() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>Панель администратора</h1>
    <div class="cabinet-container" style="display: flex; gap: 20px;">
      <div class="user-info" style="flex: 1;">
        <button id="loadUsers">Загрузить пользователей</button>
        <button id="loadCards" style="margin-top: 10px;">Загрузить карточки пользователей</button>
      </div>
      <div class="user-list" id="userList" style="flex: 2;">
        <p>Здесь появятся данные...</p>
      </div>
    </div>
  `;

  const jwtToken = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
  const loadUsersBtn = document.getElementById("loadUsers");
  const loadCardsBtn = document.getElementById("loadCards");
  const userListContainer = document.getElementById("userList");

  loadUsersBtn.addEventListener("click", async () => {
    userListContainer.innerHTML = "<p>Загрузка пользователей...</p>";
    try {
      const response = await fetch("http://localhost:3000/api/users/", {
        method: "GET",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const result = await response.json();
      const users = result.users.filter((user) => user.admin === false);

      if (users.length === 0) {
        userListContainer.innerHTML = "<p>Нет обычных пользователей.</p>";
        return;
      }

      userListContainer.innerHTML = "";
      users.forEach((user) => {
        const userBlock = document.createElement("div");
        userBlock.style = "border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; border-radius: 8px; background-color: #f9f9f9";

        userBlock.innerHTML = `
          <p><strong>ID:</strong> ${user.id}</p>
          <p><strong>Имя:</strong> ${user.name}</p>
          <p><strong>Отчество:</strong> ${user.middle_name}</p>
          <p><strong>Фамилия:</strong> ${user.last_name}</p>
          <button class="delete-user-btn" data-user-id="${user.id}">Удалить пользователя</button>
        `;

        userListContainer.appendChild(userBlock);

        const deleteButton = userBlock.querySelector(".delete-user-btn");
        deleteButton.addEventListener("click", async () => {
          if (!confirm("Удалить этого пользователя?")) return;

          try {
            const delResponse = await fetch(`http://localhost:3000/api/users/${user.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${jwtToken}` },
            });

            if (delResponse.ok) {
              alert("Пользователь удалён!");
              renderAdmin();
            } else {
              alert("Ошибка при удалении пользователя.");
            }
          } catch (err) {
            console.error("Ошибка:", err);
            alert("Не удалось удалить.");
          }
        });
      });
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      userListContainer.innerHTML = "<p>Не удалось получить пользователей.</p>";
    }
  });

  loadCardsBtn.addEventListener("click", async () => {
    userListContainer.innerHTML = "<p>Загрузка карточек...</p>";
    try {
      const response = await fetch("http://localhost:3000/api/cards", {
        method: "GET",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const result = await response.json();
      const cards = result.cards;

      if (cards.length === 0) {
        userListContainer.innerHTML = "<p>Нет карточек для отображения.</p>";
        return;
      }

      const userCache = new Map();
      const userIds = [...new Set(cards.map(c => c.user_id))];

      for (const id of userIds) {
        const res = await fetch(`http://localhost:3000/api/users/${id}`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (res.ok) {
          const userData = await res.json();
          userCache.set(id, `${userData.last_name} ${userData.name} ${userData.middle_name}`);
        } else {
          userCache.set(id, `Пользователь ID ${id}`);
        }
      }

      userListContainer.innerHTML = "";
      cards.forEach((card) => {
        const senderName = card.sender?.full_name || `ID ${card.sender?.id || "неизвестен"}`;
        const receiverName = card.receiver?.full_name || `ID ${card.receiver?.id || "неизвестен"}`;

        const cardBlock = document.createElement("div");
        cardBlock.style = "border: 1px solid #888; padding: 10px; margin-bottom: 10px; border-radius: 8px; background-color: #eef";

        cardBlock.innerHTML = `
    <p><strong>ID карточки:</strong> ${card.id}</p>
    <p><strong>Отправитель:</strong> ${senderName}</p>
    <p><strong>Получатель:</strong> ${receiverName}</p>
    <p><strong>Текст:</strong> ${card.card_text}</p>
    <button class="delete-card-btn" data-card-id="${card.id}" data-user-id="${card.sender?.id}">
      Удалить карточку
    </button>
  `;

        userListContainer.appendChild(cardBlock);

        cardBlock.querySelector(".delete-card-btn").addEventListener("click", async () => {
          if (!confirm("Удалить эту карточку?")) return;

          try {
            const deleteResponse = await fetch(`http://localhost:3000/api/cards/${card.id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwtToken}`,
              },
              body: JSON.stringify({ user_id: card.receiver?.id }),
            });

            if (deleteResponse.ok) {
              alert("Карточка удалена.");
              renderAdmin();
            } else {
              alert("Не удалось удалить карточку.");
            }
          } catch (err) {
            console.error("Ошибка удаления:", err);
            alert("Ошибка при удалении карточки.");
          }
        });
      });

    } catch (err) {
      console.error("Ошибка загрузки карточек:", err);
      userListContainer.innerHTML = "<p>Ошибка при получении карточек.</p>";
    }
  });
}


async function renderCabinet() {
  const app = document.getElementById("app");
  const jwtToken =
    localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
  const userId =
    localStorage.getItem("userId") || sessionStorage.getItem("userId");

  if (!jwtToken || !userId) {
    alert("Вы не авторизованы.");
    return;
  }

  let user;

  try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");

    const userData = await response.json();
    user = userData.user;
  } catch (err) {
    console.error("Error loading user data:", err);
    app.innerHTML = `<p>Не удалось загрузить данные пользователя.</p>`;
    return;
  }

  app.innerHTML = `
        <h1>Управление аккаунтом</h1>
        <div class="cabinet-container">
            <div class="user-info">
                <label class="personal-label">
                    Имя
                    <input class="personal-input" id="user-name" type="text" value="${user.name}" disabled>
                </label>
                <label class="personal-label">
                    Отчество
                    <input class="personal-input" id="user-middle" type="text" value="${user.middle_name}" disabled>
                </label>
                <label class="personal-label">
                    Фамилия
                    <input class="personal-input" id="user-last" type="text" value="${user.last_name}" disabled>
                </label>
                <button id="edit-btn">Редактировать профиль</button>
                <button id="delete-profile">Удалить профиль</button>
                <button id="save-btn" class="hidden">Сохранить изменения</button>
            </div>
            <div class="send-card">
                <h2>Отправить подарочную карту</h2>
                <form id="card-form">
                    <input type="text" id="recipient-id" placeholder="ID получателя" required><br><br>
                    <input type="text" id="card-text" placeholder="Текст карточки" required><br><br>
                    <select id="card-background">
                        <option value="1">Красный</option>
                        <option value="2">Желтый</option>
                        <option value="3">Зеленый</option>
                    </select><br><br>
                    <button type="submit">Отправить карточку</button>
                </form>
            </div>
        </div>
    `;

  document.getElementById("edit-btn").addEventListener("click", () => {
    document
      .querySelectorAll(".personal-input")
      .forEach((input) => (input.disabled = false));
    document.getElementById("save-btn").classList.remove("hidden");
    document.getElementById("edit-btn").classList.add("hidden");
  });

  document.getElementById("save-btn").addEventListener("click", async () => {
    const updatedData = {
      name: document.getElementById("user-name").value,
      middle_name: document.getElementById("user-middle").value,
      last_name: document.getElementById("user-last").value,
    };

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (response.ok) {
        alert("Профиль успешно обновлен!");
        document
          .querySelectorAll(".personal-input")
          .forEach((input) => (input.disabled = true));
        document.getElementById("save-btn").classList.add("hidden");
        document.getElementById("edit-btn").classList.remove("hidden");
      } else {
        alert("Не получилось обновить профиль!");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  });

  document
    .getElementById("delete-profile")
    .addEventListener("click", async () => {
      const confirmDelete = confirm(
        "Вы уверены, что хотите удалить свой профиль? Это действие нельзя отменить."
      );
      if (!confirmDelete) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (response.ok) {
          alert("Профиль успешно удален!");
          localStorage.removeItem("jwt");
          localStorage.removeItem("userId");
          sessionStorage.removeItem("jwt");
          sessionStorage.removeItem("userId");
          renderRegister();
        } else {
          alert("Не удалось удалить профиль!");
        }
      } catch (error) {
        console.error("Delete error:", error);
      }
    });

  document
    .getElementById("card-form")
    .addEventListener("submit", async (event) => {
      event.preventDefault();
      const cardData = {
        user_id: document.getElementById("recipient-id").value,
        card_background: document.getElementById("card-background").value,
        card_text: document.getElementById("card-text").value,
        sender_id: userId,
      };

      try {
        const response = await fetch("http://localhost:3000/api/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(cardData),
        });

        if (response.ok) {
          alert("Card sent successfully!");
          document.getElementById("card-form").reset();
        } else {
          alert("Failed to send card!");
        }
      } catch (error) {
        console.error("Send card error:", error);
      }
    });
}

async function renderCardByUser() {
  const app = document.getElementById("app");
  const jwtToken = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

  app.innerHTML = `
    <h1>Подарочные карточки пользователя</h1>
    <div class="user-info">
        <label class="personal-label">
        Введите id нужного пользователя
        <input class="personal-input" id="searchingId" type="number" min="1" placeholder="1" required>
        </label>
        <button id="findCards">Посмотреть карточки</button>
        <div class="user-cards-container"></div>
    </div>
  `;

  document.querySelector("#findCards").addEventListener("click", async () => {
    try {
      const id = document.getElementById("searchingId").value;
      if (!id) {
        alert("Введите ID пользователя!");
        return;
      }

      const response = await fetch(`http://localhost:3000/api/user_cards/${id}`, {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const userData = await response.json();
      if (!response.ok) throw new Error(userData.message || "Не удалось получить карточки");

      const cards = userData.cards;
      const container = document.querySelector(".user-cards-container");
      container.innerHTML = "";

      if (!cards || cards.length === 0) {
        container.innerHTML = "<p>Карточки не найдены.</p>";
      } else {
        cards.forEach((card) => {
          const cardElement = document.createElement("div");
          cardElement.className = "gift-card";

          let backgroundColor = {
            1: "red",
            2: "yellow",
            3: "green"
          }[card.card_background] || "white";

          cardElement.innerHTML = `
            <div class="card" style="background-color: ${backgroundColor}; padding: 20px; border-radius: 10px; color: black;">
              <h3>${card.card_text}</h3>
              <p><strong>От кого:</strong> ${card.sender.full_name}</p>
              <p><strong>Кому:</strong> ${card.receiver.full_name}</p>
            </div><br>
          `;
          container.appendChild(cardElement);
        });
      }
    } catch (error) {
      console.error("Ошибка:", error);
      alert(`Ошибка: ${error.message}`);
    }
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
    });

    const result = await response.json();

    if (response.ok) {
      isAuthenticated = true;
      const jwtToken = result.token;
      const userId = result.userId;
      const isAdmin = result.isAdmin;

      if (rememberMe) {
        localStorage.setItem("jwt", jwtToken);
        localStorage.setItem("userId", userId);
        localStorage.setItem("isAdmin", isAdmin);
        localStorage.setItem("rememberMe", "true");
      } else {
        sessionStorage.setItem("jwt", jwtToken);
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("isAdmin", isAdmin);
        localStorage.removeItem("rememberMe");
      }

      showNavigation();
      navigateTo("/");
    } else {
      alert("Неправильный логин или пароль!");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Ошибка в процессе авторизации!");
  }
}


async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("name").value;
  const middle_name = document.getElementById("middle_name").value;
  const last_name = document.getElementById("last_name").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:3000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, middle_name, last_name, password }),
    });
    if (response.ok) {
      alert("Регистрация прошла успешно! Пожалуйста, авторизуйтесь.");
      renderLogin();
    } else {
      alert("Ошибка регистрации!");
    }
  } catch (error) {
    console.error("Registration error:", error);
    alert("Ошибка в процессе регистрации!");
  }
}

function handleLogout() {
  isAuthenticated = false;
  jwtToken = "";
  localStorage.removeItem("jwt");
  localStorage.removeItem("rememberMe");
  sessionStorage.removeItem("jwt");
  renderLogin();
  document.getElementById("nav-bar").classList.add("hidden");
}

function showNavigation() {
  const navBar = document.getElementById("nav-bar");
  navBar.classList.remove("hidden");

  const existingAdminLink = document.getElementById("admin-link");
  if (existingAdminLink) {
    existingAdminLink.remove();
  }

  const isAdmin =
      localStorage.getItem("isAdmin") === "true" ||
      sessionStorage.getItem("isAdmin") === "true";

  if (isAdmin) {
    const adminLink = document.createElement("a");
    adminLink.href = "#/admin";
    adminLink.textContent = "Панель администратора";
    adminLink.id = "admin-link";
    adminLink.style.marginLeft = "15px";
    navBar.appendChild(adminLink);
  }
}
async function renderGiftCards() {
  const jwtToken = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
  const app = document.getElementById("app");
  app.innerHTML = '<h1>Все подарочные карточки</h1><div id="gift-cards-list">Загрузка...</div>';
  const list = document.getElementById("gift-cards-list");

  try {
    const response = await fetch("http://localhost:3000/api/cards", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });

    const data = await response.json();
    if (!response.ok) {
      list.innerHTML = `<p>Ошибка: ${data.message || "Неизвестная ошибка"}</p>`;
      return;
    }

    const cards = data.cards;
    if (!cards.length) {
      list.innerHTML = "<p>Нет доступных подарочных карт.</p>";
      return;
    }

    list.innerHTML = "";
    cards.forEach((card) => {
      const cardElement = document.createElement("div");
      cardElement.className = "gift-card";

      let backgroundColor = {
        1: "red",
        2: "yellow",
        3: "green"
      }[card.card_background] || "white";

      cardElement.innerHTML = `
        <div class="card" style="background-color: ${backgroundColor}; padding: 20px; border-radius: 10px; color: black;">
          <h3>${card.card_text}</h3>
          <p><strong>От кого:</strong> ${card.sender.full_name}</p>
          <p><strong>Кому:</strong> ${card.receiver.full_name}</p>
        </div><br>
      `;
      list.appendChild(cardElement);
    });
  } catch (error) {
    console.error("Fetch gift cards error:", error);
    list.innerHTML = "<p>Ошибка загрузки карточек.</p>";
  }
}


function navigateTo(path) {
  const route = routes[path];
  if (typeof route === "function") {
    route();
  } else {
    const app = document.getElementById("app");
    app.innerHTML = route || "<h1>404 - Страница не найдена</h1>";
  }
}

window.addEventListener("hashchange", () => {
  const path = window.location.hash.slice(1) || "/";
  if (isAuthenticated) {
    navigateTo(path);
  } else {
    renderLogin();
  }
});

window.addEventListener("load", () => {
  const remember = localStorage.getItem("rememberMe") === "true";
  const token = remember
    ? localStorage.getItem("jwt")
    : sessionStorage.getItem("jwt");

  if (token) {
    isAuthenticated = true;
    jwtToken = token;
    showNavigation();
    navigateTo("/");
  } else {
    renderLogin();
  }
});
