const User = require("../models/userModel");
const Card = require("../models/cardModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = "secret_key";

exports.createUser = async (req, res) => {
    try {
        const { name, middle_name, last_name, password, admin = false } = req.body;

        if (!name || !middle_name || !last_name || !password) {
            return res.status(400).json({
                message: "Все поля обязательны для заполнения"
            });
        }

        const userExists = await User.findOne({
            where: { name, middle_name, last_name },
        });

        if (userExists) {
            return res.status(409).json({
                message: "Пользователь уже зарегистрирован"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            middle_name,
            last_name,
            password: hashedPassword,
            admin,
        });

        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(201).json({
            message: "Пользователь успешно зарегистрирован",
            user: {
                id: user.id,
                name: user.name,
                middle_name: user.middle_name,
                last_name: user.last_name,
                admin: user.admin
            },
            token,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при создании пользователя",
            error: error.message,
        });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { name, password } = req.body;

        if (!name || !password) {
            return res.status(400).json({
                message: "Необходимо указать имя и пароль",
            });
        }

        const user = await User.findOne({ where: { name } });

        if (!user) {
            return res.status(401).json({
                message: "Неверное имя или пароль",
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Неверное имя пользователя или пароль",
            });
        }

        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({
            message: "Успешный вход",
            token,
            userId: user.id,
            isAdmin: user.admin,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при авторизации",
            error: error.message,
        });
    }
};


exports.deleteUserAndCards = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        const deletedCards = await Card.destroy({ where: { user_id } });

        if (deletedCards === 0) {
            console.log("У пользователя не было карточек для удаления");
        }

        await user.destroy();

        return res.status(200).json({
            message: "Пользователь и все его карточки успешно удалены",
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при удалении пользователя и карточек",
            error: error.message,
        });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { user_id } = req.params;
        const { name, middle_name, last_name } = req.body;

        if (!name && !middle_name && !last_name) {
            return res.status(400).json({
                message: "Необходимо указать хотя бы одно поле для обновления",
            });
        }

        const user = await User.findOne({ where: { id: user_id } });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        await user.update({ name, middle_name, last_name });

        return res.status(200).json({
            message: "Информация о пользователе успешно обновлена",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при обновлении информации о пользователе",
            error: error.message,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findOne({
            where: { id: user_id },
            attributes: ['id', 'name', 'middle_name', 'last_name']
        });

        if (!user) {
            return res.status(404).json({
                message: "Пользователь не найден",
            });
        }

        return res.status(200).json({
            message: "Пользователь найден",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при поиске пользователя",
            error: error.message,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();

        return res.status(200).json({
            message: "Список пользователей успешно получен",
            users,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Ошибка при получении списка пользователей",
            error: error.message,
        });
    }
};