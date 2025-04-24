const jwt = require('jsonwebtoken');

const JWT_SECRET = "secret_key";

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Авторизация отсутствует"
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            message: "Недействительный токен"
        });
    }
};

module.exports = authenticateJWT;