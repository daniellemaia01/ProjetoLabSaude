const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const userService = require('../services/user.service.js');

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token not provided' });
        }

        const parts = authHeader.split(' ');

        if (parts.length !== 2) {
            return res.status(401).json({ message: 'Token error' });
        }

        const [scheme, token] = parts;

        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ message: 'Token malformatted' });
        }

        jwt.verify(token, process.env.SECRET_JWT, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Token invalid' });
            }
            try {
                const user = await userService.getUserByIdService(decoded.id);

                if (!user) {
                    return res.status(401).json({ message: 'User not found' });
                }

                req.userId = user._id;
                req.user = user;
                return next();
            } catch (error) {
                return res.status(500).json({ message: 'Error fetching user' });
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error processing token' });
    }
}

module.exports = authMiddleware;