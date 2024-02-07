const Club = require("../models/clubModel");

// Boilerplate code

// Example: function to create a new CLub in the DB
exports.createClub = async(req, res) => {
    try {
        console.log(req.body);
        let newClub = await Club.create(req.body);
        
        res.status(201).json({
            status: "success",
            message: "new club created",
            data: {
                newClub,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
            description: "Fail to create new club",
        });
    }
};

// Example: get a club from the DB based on the name passed in the request json
exports.getClub = async(req, res) => {
    try {
        const club = await Club.findOne({ name: req.params.name });

        if (club == null) {
            throw err;
        }
        res.status(200).json({
            status: "success",
            message: "Found club",
            data: {
                club: club,
            },
        });
       
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err.message,
            description: "not found club",
        });
    }
};