const express = require("express");
const {
    createUser,
    loginUser,
    deleteUserAndCards,
    updateUser,
    getUserById,
    getAllUsers
} = require("../controllers/userController");
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Зарегистрировать нового пользователя
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Иван"
 *               middle_name:
 *                 type: string
 *                 example: "Иванович"
 *               last_name:
 *                 type: string
 *                 example: "Иванов"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь успешно зарегистрирован"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Иван"
 *                     middle_name:
 *                       type: string
 *                       example: "Иванович"
 *                     last_name:
 *                       type: string
 *                       example: "Иванов"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       409:
 *         description: Пользователь уже зарегистрирован
 *       400:
 *         description: Некорректные данные в запросе
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/register", createUser);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Авторизовать пользователя
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Иван"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Успешный вход"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 userId:
 *                   type: string
 *                   example: "1"
 *       401:
 *         description: Неверное имя пользователя или пароль
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/login", loginUser);

/**
 * @swagger
 * /api/users/{user_id}:
 *   delete:
 *     summary: Удалить пользователя и все его карточки
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь и карточки успешно удалены
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Недействительный токен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete("/users/:user_id", authenticateJWT, deleteUserAndCards);

/**
 * @swagger
 * /api/users/{user_id}:
 *   put:
 *     summary: Обновить информацию о пользователе
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новое имя"
 *               middle_name:
 *                 type: string
 *                 example: "Новое отчество"
 *               last_name:
 *                 type: string
 *                 example: "Новая фамилия"
 *     responses:
 *       200:
 *         description: Информация о пользователе успешно обновлена
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Недействительный токен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.put("/users/:user_id", authenticateJWT, updateUser);


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить всех пользователей
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     responses:
 *       200:
 *         description: Список всех пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Список пользователей успешно получен"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Иван"
 *                       middle_name:
 *                         type: string
 *                         example: "Иванович"
 *                       last_name:
 *                         type: string
 *                         example: "Петров"
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Недействительный токен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/users", authenticateJWT, getAllUsers);

/**
 * @swagger
 * /api/users/{user_id}:
 *   get:
 *     summary: Получить информацию о конкретном пользователе
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Информация о пользователе успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь найден"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Иван"
 *                     middle_name:
 *                       type: string
 *                       example: "Иванович"
 *                     last_name:
 *                       type: string
 *                       example: "Петров"
 *       404:
 *         description: Пользователь не найден
 *       401:
 *         description: Неавторизован
 *       403:
 *         description: Недействительный токен
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/users/:user_id", authenticateJWT, getUserById);

module.exports = router;