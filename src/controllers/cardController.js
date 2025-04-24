const Card = require("../models/cardModel");
const User = require("../models/userModel");

exports.createCard = async (req, res) => {
    try {
        const {user_id, card_background, card_text, sender_id} = req.body;
        let sender = await User.findOne({ where: {id: sender_id} });
        if (sender) {
            const newCard = await Card.create({user_id, card_background, card_text, sender_id});
            return res.status(201).json(newCard);
        } else {
            return res.status(409).json({
                message: "Пользователя, заявленного в качестве отправителя не существует",
            });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

exports.getAllCards = async (req, res) => {
    try {
        const cards = await Card.findAll({
            include: [
                {
                    model: User,
                    as: "receiver",
                    attributes: ["id", "name", "middle_name", "last_name"],
                },
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name", "middle_name", "last_name"],
                },
            ],
        });

        res.status(200).json({
            message: "All cards found",
            cards: cards.map((card) => ({
                id: card.id,
                card_background: card.card_background,
                card_text: card.card_text,
                receiver: {
                    id: card.receiver?.id,
                    full_name: `${card.receiver?.last_name || ""} ${card.receiver?.name || ""} ${card.receiver?.middle_name || ""}`.trim(),
                },
                sender: {
                    id: card.sender?.id,
                    full_name: `${card.sender?.last_name || ""} ${card.sender?.name || ""} ${card.sender?.middle_name || ""}`.trim(),
                },
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.cardByUser = async (req, res) => {
    try {
        const user = await User.findOne({ where: { id: req.params.user_id } });

        if (!user) {
            return res.status(404).json({
                message: "Пользователя не существует",
            });
        }

        const cards = await Card.findAll({
            where: { user_id: req.params.user_id },
            include: [
                {
                    model: User,
                    as: "receiver",
                    attributes: ["id", "name", "middle_name", "last_name"],
                },
                {
                    model: User,
                    as: "sender",
                    attributes: ["id", "name", "middle_name", "last_name"],
                },
            ],
        });

        if (cards.length === 0) {
            return res.status(404).json({
                message: "Открытки для данного пользователя не найдены",
            });
        }

        res.status(200).json({
            message: "Открытки найдены",
            cards: cards.map((card) => ({
                id: card.id,
                card_background: card.card_background,
                card_text: card.card_text,
                receiver: {
                    id: card.receiver?.id,
                    full_name: `${card.receiver?.last_name || ""} ${card.receiver?.name || ""} ${card.receiver?.middle_name || ""}`.trim(),
                },
                sender: {
                    id: card.sender?.id,
                    full_name: `${card.sender?.last_name || ""} ${card.sender?.name || ""} ${card.sender?.middle_name || ""}`.trim(),
                },
            })),
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCard = async (req, res) => {
    try {
        const { user_id, card_background, card_text, sender_id } = req.body;
        const { card_id } = req.params;

        const card = await Card.findOne({ where: { id: card_id } });

        if (!card) {
            return res.status(404).json({
                message: "Карточка не найдена",
            });
        }

        if (parseInt(card.user_id) !== parseInt(user_id)) {
            return res.status(403).json({
                message: "Вы не можете обновлять карточки другого пользователя",
            });
        }

        await card.update({ card_background, card_text, sender_id });

        return res.status(200).json({
            message: "Карточка успешно обновлена",
            card,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCard = async (req, res) => {
    try {
        const { card_id } = req.params;
        const { user_id } = req.body;

        const card = await Card.findOne({ where: { id: card_id } });

        if (!card) {
            return res.status(404).json({
                message: "Карточка не найдена",
            });
        }

        if (Number(card.user_id) !== Number(user_id)) {
            return res.status(403).json({
                message: "Вы не можете удалять карточки другого пользователя",
            });
        }

        await card.destroy();

        return res.status(200).json({
            message: "Карточка успешно удалена",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};