const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const Card = sequelize.define("Card", {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    card_background: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    card_text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sender_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    timestamps: false,
    tableName: "cards",
})

const User = require("./userModel");

Card.belongsTo(User, {
    foreignKey: "user_id",
    as: "receiver",
});

Card.belongsTo(User, {
    foreignKey: "sender_id",
    as: "sender",
});

module.exports = Card;