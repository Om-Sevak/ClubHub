const Club = require("../models/clubModel");
const Post = require("../models/clubPostModel");
const clubRole = require("./clubroleController");
const uploadImage = require("./imgUploadController");
const multer = require('multer');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

exports.createPost = async (req, res) => {

    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create an post. Changes: ${JSON.stringify(req.body)}`);

        upload.single('image')(req, res, async (err) => {

            const body = JSON.parse(JSON.stringify(req.body));
            const { title, contents, date} = body;

            if (err) {
                console.error('Error uploading profile picture:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            try {
                const club = await Club.findOne({ name: req.params.name});
                if (!club) {
                    throw new Error('Not Found: Fail to create post as club DNE');
                }

                if (!req.session.isLoggedIn) {
                    throw new Error('Unauthorized: Must sign in to add post');
                }

                const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
                if (!isAdmin) {
                    throw new Error('Unauthorized: Only admins can add posts');
                }

                const clubObjectId = club._id;

                // Handle image upload
                let imageUrl = '';
                //If image is uploaded, upload to Azure Blob Storage
                //If not, use default image
                if (req.file){
                    //Azure Blob Storage configuration
                    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
                    const CONTAINER_NAME = process.env.CONTAINER_NAME;
                    //getting image buffer and type
                    const imageBuffer = req.file.buffer;
                    const imageType = req.file.mimetype;
                   
                    imageUrl = await uploadImage(imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME);
                } else{
                     imageUrl = process.env.DEFAULT_LOGO_URL; 
                }

                console.log(`${req.sessionID} - ${req.session.email} uploaded a poster.`);

                // Create the post
                const newPost = await Post.create({
                    title: title,
                    content: contents,
                    date: date,
                    imgUrl: imageUrl,
                    club: clubObjectId
                });

                res.status(200).json({ message: 'Post created successfully'});
                console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
            } catch (err) {
                if (err.message.includes('Unauthorized')) {
                    res.status(403).json({
                        status: "fail",
                        message: err.message,
                        description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
                    });
                } else if (err.message.includes('Not Found')) {
                    res.status(404).json({
                        status: 'fail',
                        message: err.message,
                        description: `Club ${req.params.name} does not exist`
                    });
                } else {
                    res.status(500).json({
                        status: 'fail',
                        message: 'An error occurred while processing your request',
                        description: 'Server Error'
                    });
                    console.error(`${req.sessionID} - Server Error: ${err}`);
                }
                console.log(`${req.sessionID} - Request Failed: ${err.message}`);
            }
        });

    } catch (err) {

        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Server Error: ${err}`)
        
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.getPostsForClub = async (req, res) => {
    try {
        // Find all posts for the given clubId
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.name}`);
        
        const club = await Club.findOne({ name: req.params.name});
        if (!club) {
            throw new Error('Not Found: Fail to get posts as club DNE');
        }
        const clubObjectId = club._id;
        const posts = await Post.find({ club: clubObjectId }).sort({date: 'desc'});

        res.status(200).json({
            posts: posts,
            message: "Posts found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get posts as ${req.params.name} DNE`,
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
};