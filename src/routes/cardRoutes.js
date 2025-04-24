const express = require("express");
const {
    createCard,
    getAllCards,
    cardByUser,
    updateCard,
    deleteCard
} = require("../controllers/cardController");
const authenticateJWT = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /api/create:
 *   post:
 *     summary: Создать новую карточку
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               card_background:
 *                 type: integer
 *                 example: 101
 *               card_text:
 *                 type: string
 *                 example: "Поздравляю с праздником!"
 *               sender_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Карточка успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 101
 *                 user_id:
 *                   type: integer
 *                   example: 1
 *                 card_background:
 *                   type: integer
 *                   example: 101
 *                 card_text:
 *                   type: string
 *                   example: "Поздравляю с праздником!"
 *                 sender_id:
 *                   type: integer
 *                   example: 2
 *       409:
 *         description: Пользователя, заявленного в качестве отправителя, не существует
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователя, заявленного в качестве отправителя не существует"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка сервера"
 */
router.post("/create", authenticateJWT, createCard);

/**
 * @swagger
 * /api/cards:
 *   get:
 *     summary: Получить все карточки
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     responses:
 *       200:
 *         description: Список всех карточек
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All cards found"
 *                 cards:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       card_background:
 *                         type: integer
 *                         example: 101
 *                       card_text:
 *                         type: string
 *                         example: "Поздравляю с праздником!"
 *                       sender_id:
 *                         type: integer
 *                         example: 2
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка сервера"
 */
router.get("/cards", authenticateJWT, getAllCards);

/**
 * @swagger
 * /api/user_cards/{user_id}:
 *   get:
 *     summary: Получить карточки пользователя
 *     tags:
 *       - Cards
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
 *         description: Список карточек пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Открытки найдены"
 *                 card:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       user_id:
 *                         type: integer
 *                         example: 1
 *                       card_background:
 *                         type: integer
 *                         example: 101
 *                       card_text:
 *                         type: string
 *                         example: "Поздравляю с праздником!"
 *                       sender_id:
 *                         type: integer
 *                         example: 2
 *       404:
 *         description: Пользователь не найден или открытки отсутствуют
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь не найден или открытки отсутствуют"
 *       500:
 *         description: Внутренняя ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Ошибка сервера"
 */

router.get("/user_cards/:user_id", authenticateJWT, cardByUser);

/**
 * @swagger
 * /api/cards/{card_id}:
 *   put:
 *     summary: Обновить карточку пользователя
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID карточки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID пользователя, которому принадлежит карточка
 *               card_background:
 *                 type: integer
 *                 description: Новый фон карточки
 *               card_text:
 *                 type: string
 *                 description: Новый текст карточки
 *               sender_id:
 *                 type: integer
 *                 description: ID отправителя
 *     responses:
 *       200:
 *         description: Карточка успешно обновлена
 *       403:
 *         description: Пользователь не имеет права обновлять карточку
 *       404:
 *         description: Карточка не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.put("/cards/:card_id", authenticateJWT, updateCard);

/**
 * @swagger
 * /api/cards/{card_id}:
 *   delete:
 *     summary: Удалить карточку пользователя
 *     tags:
 *       - Cards
 *     security:
 *       - bearerAuth: [] # Защищённый маршрут
 *     parameters:
 *       - in: path
 *         name: card_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID карточки
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID пользователя, которому принадлежит карточка
 *     responses:
 *       200:
 *         description: Карточка успешно удалена
 *       403:
 *         description: Пользователь не имеет права удалять карточку
 *       404:
 *         description: Карточка не найдена
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete("/cards/:card_id", authenticateJWT, deleteCard);

module.exports = router;