const UserModel = require('../models/UserModel');
const jwt = require('../library/jwt')

module.exports = (request, response, next) => {
    if (request.headers.authorization) {
        let accessToken = request.headers.authorization.split(" ")[1];
        let result = jwt.verifyAccessToken(accessToken);
        if (result) {
            UserModel.getById(result.id, (user) => {
                request.currentUser = user;
                request.accessToken = accessToken;
                next();
            });
        } else {
            return response.status(401).json({
                message: 'Unauthorized'
            });
        }
    } else {
        // if there is no authorization header
        return response.status(403).json({
            message: 'Invalid token'
        });
    }
};