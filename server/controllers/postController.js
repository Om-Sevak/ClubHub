/*
----
Core Feature(s): Club Posts Management
Expected Input Type: Body (JSON), File (Image), URL (string)
Expected Input: Title (string), Contents (string), Date (date), Image (file), Club Name (string), Post ID (string), Limit (number), Include Joined (boolean)
Expected Output Structure: JSON objects with various fields depending on the function
Expected Errors: Throws errors with appropriate messages for various scenarios
Purpose: This module handles the management of posts within clubs. It allows users to create, retrieve, edit, and delete posts, as well as browse posts across multiple clubs. It includes features such as image upload to Azure Blob Storage, access control for post modification, and aggregation of posts for browsing with optional filtering. Functions are designed to interact with the database models for clubs, posts, and users, ensuring data integrity and security.
----
*/



const Club = require("../models/clubModel");
const Post = require("../models/clubPostModel");
const User = require("../models/userModel");
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');
const utils = require("../utils/utils");
const clubRole = require("./clubroleController");
const uploadImage = require("./imgUploadController");
const multer = require('multer');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/*
----
Core Feature(s): Create Post
Expected Input Type: Body (JSON), File (Image)
Expected Input: Title (string), Contents (string), Date (date), Image (file)
Expected Output Structure: JSON object with message field
Expected Errors: Throws an error with appropriate message
Purpose: Creates a new post for a club, allowing only club admins to perform this action. Handles image upload to Azure Blob Storage.
----
*/

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
                    throw new HttpError(404,'Not Found: Fail to create post as club DNE');
                }

                if (!req.session.isLoggedIn) {
                    throw new HttpError(403,'Unauthorized: Must sign in to add post');
                }

                const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
                if (!isAdmin) {
                    throw new HttpError(403,'Unauthorized: Only admins can add posts');
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
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Get Posts for Club
Expected Input Type: URL (string)
Expected Input: Club Name (string)
Expected Output Structure: JSON object with posts field
Expected Errors: Throws an error with appropriate message
Purpose: Retrieves all posts for a given club.
----
*/

exports.getPostsForClub = async (req, res) => {
    try {
        // Find all posts for the given clubId
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.name}`);
        
        const club = await Club.findOne({ name: req.params.name});
        if (!club) {
            throw new HttpError(404,'Not Found: Fail to get posts as club DNE');
        }
        const clubObjectId = club._id;
        const posts = await Post.find({ club: clubObjectId }).sort({date: 'desc'});

        res.status(200).json({
            posts: posts,
            message: "Posts found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Get Post
Expected Input Type: URL (string)
Expected Input: Post ID (string)
Expected Output Structure: JSON object with title, content, imgUrl fields
Expected Errors: Throws an error with appropriate message
Purpose: Retrieves a single post by its ID.
----
*/


exports.getPost = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.post}`);
        
        const post = await Post.findOne({_id: req.params.post});
        
        if (!post) {
            throw new HttpError(404,'Not Found: Fail to get post as post DNE');
        }
        

        res.status(200).json({
            title: post.title,
            content: post.content,
            imgUrl: post.imgUrl,
            message: "Post Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}

/*
----
Core Feature(s): Edit Post
Expected Input Type: Body (JSON), File (Image)
Expected Input: Post ID (string), Title (string), Contents (string), Date (date), Image (file)
Expected Output Structure: JSON object with status, message, and data fields
Expected Errors: Throws an error with appropriate message
Purpose: Allows club admins to edit an existing post, including updating the post content and image.
----
*/


exports.editPost = async (req, res) => {

    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit an post. Changes: ${JSON.stringify(req.body)}`);

        upload.single('image')(req, res, async (err) => {
            
            if (err) {
                console.error('Error uploading profile picture:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            try {
                console.log(`${req.sessionID} - ${req.session.email} is requesting to edit post ${req.params.post}. Changes: ${JSON.stringify(req.body)}`);
                
                const body = JSON.parse(JSON.stringify(req.body));
                const { title, contents, date} = body;

                // Checking if club exists first as we need a valid club to get possible role
                
                const post = await Post.findOne({ _id: req.params.post });
                if (!post) {
                    throw new HttpError(404,'Not Found: Fail to edit club as DNE');
                }

                if (!req.session.isLoggedIn) {
                    throw new HttpError(403,'Unauthorized: Must sign in to edit a club');
                }

                const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
                if (!isAdmin) {
                    throw new HttpError(403,'Unauthorized: Only admins can modify the club.');
                }

                // Handle image upload
                 //If image is uploaded, upload to Azure Blob Storage
                 //If not, use default image
                 if (req.file){
                    //Azure Blob Storage configuration
                    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
                    const CONTAINER_NAME = process.env.CONTAINER_NAME;
                    //getting image buffer and type
                    const imageBuffer = req.file.buffer;
                    const imageType = req.file.mimetype;
                   
                    body["imgUrl"] = await uploadImage(imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME);
                }

                const updateStatus = await Post.updateOne({ _id: req.params.post }, body);
                if (!updateStatus.acknowledged) {
                    throw new HttpError(400,'Bad Request: Failed to edit post.');
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
                handleError.returnError(err, req.sessionID, res);
            }
        });

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Delete Post
Expected Input Type: URL (string)
Expected Input: Post ID (string)
Expected Output Structure: JSON object with status and message fields
Expected Errors: Throws an error with appropriate message
Purpose: Deletes a post by its ID, allowing only club admins to perform this action.
----
*/

exports.deletePost = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete post ${req.params.post}`);
        
        // Find the post by its ID
        const post = await Post.findOne({ _id: req.params.post });  
        if (!post) {
            throw new HttpError(404,'Not Found: Post does not exist');
        }

        // Check if the user is authorized to delete the post
        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to delete an post');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new HttpError(403,'Unauthorized: Only admins can delete posts');
        }
        
        // Delete the post
        await Post.deleteOne({ _id: req.params.post });

        res.status(200).json({
            status: "success",
            message: "Post deleted successfully",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Get Posts for Browsing
Expected Input Type: Body (JSON)
Expected Input: Limit (number), Include Joined (boolean)
Expected Output Structure: JSON object with posts field
Expected Errors: Throws an error with appropriate message
Purpose: Retrieves posts for browsing, with optional filtering by limit and inclusion of posts from clubs that the user has joined.
----
*/

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
                    imgUrl: { $first: '$imgUrl'},
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
            post["clubIconImgUrl"] = post.club.imgUrl;
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
        handleError.returnError(err, req.sessionID, res);
    }
};