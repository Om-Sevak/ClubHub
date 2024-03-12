const Club = require("../models/clubModel");
const Post = require("../models/clubPostModel");
const User = require("../models/userModel");
const utils = require("../utils/utils");
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

exports.getPost = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.post}`);
        
        const post = await Post.findOne({_id: req.params.post});
        
        if (!post) {
            throw new Error('Not Found: Fail to get post as post DNE');
        }
        

        res.status(200).json({
            title: post.title,
            content: post.content,
            imgUrl: post.imgUrl,
            message: "Post Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get post as ${req.params.name} DNE`,
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

exports.editPost = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit post ${ req.params.post}. Changes: ${JSON.stringify(req.body)}`);
        const { title, contents, date} = req.body;
        
        // Checking if club exists first as we need a valid club to get possible role
        const post = await Post.findOne({ _id: req.params.post });  
        if (!post) {
            throw new Error('Not Found: Fail to edit club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to edit a club');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can modify the club.');
        }
        
        const updateStatus = await Post.updateOne({ _id: req.params.post },req.body);
        if (!updateStatus.acknowledged) {
            throw err;
        }

        res.status(201).json({
            status: "success",
            message: "post modified",
            data: {
                post: post,
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to edit post`
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit post as ${req.params.post} DNE`,
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

exports.deletePost = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete post ${req.params.post}`);
        
        // Find the post by its ID
        const post = await Post.findOne({ _id: req.params.post });  
        if (!post) {
            throw new Error('Not Found: Post does not exist');
        }

        // Check if the user is authorized to delete the post
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete an post');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete posts');
        }
        
        // Delete the post
        await Post.deleteOne({ _id: req.params.post });

        res.status(200).json({
            status: "success",
            message: "Post deleted successfully",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not an admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to delete post as ${req.params.post} does not exist`,
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

exports.getPostsBrowse = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Request for Posts to browse on ${JSON.stringify(req.body)}`);

        const body = JSON.parse(JSON.stringify(req.body));

        const { limit, includeJoined } = body;

        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'clubs', // Collecttion name for clubs
                    localField: 'club',
                    foreignField: '_id',
                    as: 'club_info'
                }
            },
            {
                $unwind: '$club_info'
            },
            {
                $lookup: {
                    from: 'clubinterests', // Collection name for clubinterests
                    localField: 'club',
                    foreignField: 'club',
                    as: 'club_interests'
                }
            },
            {
                $unwind: {
                    path: '$club_interests',
                    preserveNullAndEmptyArrays: true // Left outer join
                }
            },
            {
                $lookup: {
                    from: 'interests', // Collection name for interests
                    localField: 'club_interests.interest',
                    foreignField: '_id',
                    as: 'interests'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    title: { $first: '$title' },
                    content: { $first: '$content' },
                    date: { $first: '$date' },
                    club: { $first: '$club_info'},
                    interests: { $push: '$interests' }
                }
            },
            
        ];

        // perform aggregate mongo call
        var posts = await Post.aggregate(aggregationPipeline);

        // format each dictionary for easier reading
        posts.forEach(post => {
            post["clubName"] = post.club.name;
            post["imgUrl"] = post.club.imgUrl;
            post.club = post.club._id;
            post.interests = post.interests.flat();
            post.interests = post.interests.map(interest => interest.name);
        });

         // if user is logged in 
        if (req.session.isLoggedIn) {
            // get user info
            const userEmail = req.session.email
            const user = await User.findOne({ email: userEmail });
            const userObjectId = user._id;

            // used also by events
            posts = await utils.orderClubs(posts, userObjectId, includeJoined)
        } else {
            // .getRandomElements directly modifies the list, it does not return a copy unless we modify the length
            utils.getRandomElements(posts,posts.length);
        }

        if (limit > 0) {
            posts = posts.slice(0,limit);
        }
        
        res.status(200).json({
            posts: posts,
            message: "Posts Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`,
        });
        console.log(`${req.sessionID} - Server Error: ${err}`)
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};