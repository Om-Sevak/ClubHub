const Club = require('../models/clubModel');
const User = require('../models/userModel');
const ClubMemberships = require('../models/clubMembershipsModel');

exports.getRoleMiddleware = async (email,clubName) => {
    try {
        // Find the user by email (in the session)
        const user = await User.findOne({ email: email });

        // Find the club by id (in the request)
        const club = await Club.findOne({ name: clubName })

        // Check if user exists
        if (!user || !club) {
            return;
        }

        const role = await ClubMemberships.findOne({user:user.id, club:club.id })

        return !role ? role : role.role;

    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

exports.isClubAdminMiddleware = async (email,clubName) => {
    try {
        return (await this.getRoleMiddleware(email,clubName) == 'admin');

    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

exports.getRole = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting role for club ${ req.params.name}`);
        const role = await this.getRoleMiddleware(req.session.email, req.params.name); 
        
        if (!role) {
            throw new Error(`Not Found: Could not find role`);
        }

        res.status(200).json({
            status: "success",
            message: `${req.session.email} is part of ${req.params.name}`,
            data: {
                role: role
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Could not find role for user ${req.session.email} and club ${req.params.name}`,
                data: {
                    role: null
                }
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}
