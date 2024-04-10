const request = require("supertest");
var session = require('supertest-session');
const app = require('../../app');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Club = require('../../models/clubModel')
const Interest = require('../../models/interestModel');
const Event = require('../../models/clubEventModel');
const Post = require('../../models/clubPostModel');
const ClubMembership = require('../../models/clubMembershipsModel');
const utils = require('../../utils/utils');
const InterestController = require('../../controllers/interestController');
const bcrypt = require('bcryptjs');

let mongoServer;
let testSession = null;


describe('Homepage Functions', () => {

    const INTERESTS = ['Art', 'Science', 'Music', 'Tech', 'Stars', 'School', 'Movies', 'Fitness', 'Trivia', 'Writing'];
    const USER_INTERESTS = ['Music', 'Tech', 'Stars', 'School', 'Movies'];

    const INTEREST_ALPHA = ['Art', 'Science', 'Music', 'Tech', 'Stars', 'School', 'Movies', 'Fitness'];   // Match: %100
    const INTEREST_BETA = ['Art', 'Science', 'Music', 'Tech', 'Stars', 'School'];    // Match; %80
    const INTEREST_GAMMA = ['Art', 'Science', 'Music', 'Tech', 'Writing'];   // Match %40
    const INTEREST_DELTA = ['Fitness', 'Trivia', 'Writing','Art', 'Science'];   // Match 0%
    const INTEREST_EPSILON = ['Art', 'Science','Fitness']; // Match 0%

    const INTEREST_PERCENTAGES = {
        Alpha:100,
        Beta:80,
        Gamma:40
    }

    const EXPECT_PERCENT_ORDER = [INTEREST_PERCENTAGES['Alpha'],INTEREST_PERCENTAGES['Beta'],INTEREST_PERCENTAGES['Gamma']];

    const DATE = new Date(2022, 2, 9, 12, 30, 0, 0);

    let user;

    let clubAlpha;
    let clubBeta;
    let clubGamma;
    let clubDelta;
    let clubEpsilon;

    let eventsAlpha;
    let eventsBeta;
    let eventsGamma;
    let eventsEpsilon;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);

        for (const interest of INTERESTS) {
            const newInterest = new Interest({
                name: interest
            })
            await newInterest.save();
        }

        await User.deleteMany();
        await Club.deleteMany();
        
        user = await User.create({ firstName: 'John', lastName: 'Doe', email: 'test@example.com', passwordHash: bcrypt.hashSync('password', 12) });
        await InterestController.createUserInterestsMiddleware(USER_INTERESTS,user.email);

        clubAlpha = await Club.create({ name: 'Alpha', email: 'Alpha@email.com' });
        clubBeta = await Club.create({ name: 'Beta', email: 'Beta@email.com' });
        clubGamma = await Club.create({ name: 'Gamma', email: 'Gamma@email.com' });
        clubDelta = await Club.create({ name: 'Delta', email: 'Delta@email.com' });
        clubEpsilon = await Club.create({ name: 'Epsilon', email: 'Epsilon@email.com' });

        await ClubMembership.create({user:user._id,club:clubEpsilon._id,role:"member"});

        await InterestController.createClubInterestsMiddleware(INTEREST_ALPHA,clubAlpha.name);
        await InterestController.createClubInterestsMiddleware(INTEREST_BETA,clubBeta.name);
        await InterestController.createClubInterestsMiddleware(INTEREST_GAMMA,clubGamma.name);
        await InterestController.createClubInterestsMiddleware(INTEREST_DELTA,clubDelta.name);
        await InterestController.createClubInterestsMiddleware(INTEREST_EPSILON,clubEpsilon.name);

        eventsAlpha = [
            await Event.create({title:"Alpha Event 1",date:DATE,club:clubAlpha._id}),
            await Event.create({title:"Alpha Event 2",date:DATE,club:clubAlpha._id})
        ];
        eventsBeta = [
            await Event.create({title:"Beta Event 1",date:DATE,club:clubBeta._id}),
            await Event.create({title:"Beta Event 2",date:DATE,club:clubBeta._id})
        ]
        eventsGamma = [
            await Event.create({title:"Gamma Event 1",date:DATE,club:clubGamma._id})
        ]
        eventsEpsilon = [
            await Event.create({title:"Epsilon Event 1",date:DATE,club:clubEpsilon._id}),
            await Event.create({title:"Epsilon Event 2",date:DATE,club:clubEpsilon._id})
        ]


        postsAlpha = [
            await Post.create({title:"Alpha Post 1",date:DATE,club:clubAlpha._id}),
            await Post.create({title:"Alpha Post 2",date:DATE,club:clubAlpha._id})
        ];
        postsBeta = [
            await Post.create({title:"Beta Post 1",date:DATE,club:clubBeta._id}),
            await Post.create({title:"Beta Post 2",date:DATE,club:clubBeta._id})
        ]
        postsGamma = [
            await Post.create({title:"Gamma Post 1",date:DATE,club:clubGamma._id})
        ]
        postsEpsilon = [
            await Post.create({title:"Epsilon Post 1",date:DATE,club:clubEpsilon._id}),
            await Post.create({title:"Epsilon Post 2",date:DATE,club:clubEpsilon._id})
        ]
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    describe('Clubs Browse', () => {
        test('Not logged in: Should return clubs with no isJoined or Percents',async () => {
            const res = await request(app)
            .post(`/club/browse`)
            .send({ includeJoined: true});

            const generalClubsToBrowse = res.body.clubs;
            
            const containsAccountData = (generalClubsToBrowse.filter(club => {
                return club.hasOwnProperty('isJoined') || club.hasOwnProperty('matchPercentage')
            })
            ).length;

            expect(containsAccountData).toBe(0);

            
        })

        test('Should return correct number of Clubs',async () => {
            const res = await request(app)
            .post(`/club/browse`)
            .send({ limit: 3, includeJoined: true});

            expect(res.body.clubs.length).toBe(3);
        })

        describe('Test Ordering of Sets of Clubs', () => {
            
            let clubsToBrowse;
            let recommendedClubs;

            beforeAll(async () => { 
                testSession = session(app);

                const loginRes = await testSession.post('/login')
                .send({ email: user.email, password: 'password' });
            })

            test('Should Return 200, and all 5 Clubs',async () => {
                const res = await testSession
                    .post(`/club/browse`)
                    .send({ includeJoined: true});

                clubsToBrowse = res.body.clubs;

                expect(res.status).toBe(200);
                expect(res.body.clubs.length).toBe(5);
            })

            test('Should Return Clubs in Specific order', async () => {
                const firstClubs = [clubsToBrowse[0]];
                const joinedClubs = clubsToBrowse.filter(club => club.isJoined);

                const secondClubs = clubsToBrowse.slice(1,4);
                recommendedClubs = clubsToBrowse.filter(club => club.percentMatch > 0 && !club.isJoined);

                const thirdClubs = [clubsToBrowse[4]];
                const otherClubs = clubsToBrowse.filter(club => !club.isJoined && club.percentMatch == 0)

                expect(firstClubs).toEqual(expect.arrayContaining(joinedClubs));
                expect(secondClubs).toEqual(expect.arrayContaining(recommendedClubs));
                expect(thirdClubs).toEqual(expect.arrayContaining(otherClubs));
            })

            test('Should return correct percentages', async () => {
                for(const club in recommendedClubs) {
                    const expectedPercent = INTEREST_PERCENTAGES[club.name];
                    expect(expectedPercent).toBe(club.percentMatch);
                }
            })

            test('Should Return Recommended Clubs in a specific order', async () => {
                const percentageOrder = recommendedClubs.map(club => club.percentMatch);
                expect(EXPECT_PERCENT_ORDER).toEqual(percentageOrder);
            })
        });

        
    });

    describe('Events Browse', () => {
        test('Not logged in: Should return events with no isJoined or Percents',async () => {
            const res = await request(app)
            .post(`/event/browse`)
            .send({ includeJoined: true});

            const generalEventsToBrowse = res.body.events;
            
            const containsAccountData = (generalEventsToBrowse.filter(event => {
                return event.hasOwnProperty('isJoined') || event.hasOwnProperty('matchPercentage')
            })
            ).length;

            expect(containsAccountData).toBe(0);
        })

        test('Should return correct number of Events',async () => {
            const res = await request(app)
            .post(`/event/browse`)
            .send({ limit: 3, includeJoined: true});

            expect(res.body.events.length).toBe(3);
        })

    });

    describe('Posts Browse', () => {
        test('Not logged in: Should return posts with no isJoined or Percents',async () => {
            const res = await request(app)
            .post(`/post/browse`)
            .send({ includeJoined: true});

            const generalPostsToBrowse = res.body.posts;
            
            const containsAccountData = (generalPostsToBrowse.filter(post => {
                return post.hasOwnProperty('isJoined') || post.hasOwnProperty('matchPercentage')
            })
            ).length;

            expect(containsAccountData).toBe(0);

            
        })

        test('Should return correct number of Posts',async () => {
            const res = await request(app)
            .post(`/post/browse`)
            .send({ limit: 3, includeJoined: true});

            expect(res.body.posts.length).toBe(3);
        })
    });

    describe('Test Ordering of Sets of Items (Events or Posts)', () => {
            
        let eventsToBrowse;
        let postsToBrowse;
        let recommendedEvents;
        let recommendedPosts;

        beforeAll(async () => { 
            testSession = session(app);

            const loginRes = await testSession.post('/login')
            .send({ email: user.email, password: 'password' });
        })

        test('Should Return 200, and all 7 Events/Posts',async () => {
            const resEvents = await testSession
                .post(`/event/browse`)
                .send({ includeJoined: true});

            const resPosts = await testSession
                .post(`/post/browse`)
                .send({ includeJoined: true});

            eventsToBrowse = resEvents.body.events;
            postsToBrowse = resPosts.body.posts;

            expect(resEvents.status).toBe(200);
            expect(resPosts.status).toBe(200);
            expect(eventsToBrowse.length).toBe(7);
            expect(postsToBrowse.length).toBe(7);
        })

        test('Should Return Events in Specific order', async () => {
            const firstEvents = eventsEpsilon.map(event => event._id.toString());;
            const joinedEvents = eventsToBrowse.filter(event => event.isJoined).map(event => event._id.toString());;

            const secondEvents = eventsToBrowse.slice(2);
            recommendedEvents = eventsToBrowse.filter(event => event.percentMatch > 0 && !event.isJoined);

            expect(firstEvents).toEqual(expect.arrayContaining(joinedEvents));
            expect(secondEvents).toEqual(expect.arrayContaining(recommendedEvents));
        })

        test('Should Return Posts in Specific order', async () => {
            const firstPosts = postsEpsilon.map(post => post._id.toString());
            const joinedPosts = postsToBrowse.filter(post => post.isJoined).map(post => post._id.toString());

            const secondPosts = postsToBrowse.slice(2);
            recommendedPosts = postsToBrowse.filter(post => post.percentMatch > 0 && !post.isJoined);

            expect(firstPosts).toEqual(expect.arrayContaining(joinedPosts));
            expect(secondPosts).toEqual(expect.arrayContaining(recommendedPosts));
        })

        test('Should return correct percentages', async () => {
            for(const event in recommendedEvents) {
                const expectedPercent = INTEREST_PERCENTAGES[event.clubName];
                expect(expectedPercent).toBe(event.percentMatch);
            }

            for(const post in recommendedPosts) {
                const expectedPercent = INTEREST_PERCENTAGES[post.clubName];
                expect(expectedPercent).toBe(post.percentMatch);
            }
        })

        test('Should Return Recommended Events/Posts in a specific order', async () => {
            const percentageOrderEvents = [...new Set(recommendedEvents.map(event => event.percentMatch))];
            expect(EXPECT_PERCENT_ORDER).toEqual(percentageOrderEvents);

            const percentageOrderPosts = [...new Set(recommendedPosts.map(post => post.percentMatch))];
            expect(EXPECT_PERCENT_ORDER).toEqual(percentageOrderPosts);
        })
    });

    describe('Test Randomness', () => {
        test('Testing basic randomness', () => {
            const sampleSize = 1000;
            const significanceLevel = sampleSize*0.99; 
            const sampleList = [0,1,2,3,4,5,6,7,8,9];
            let randomCount = 0;

            for (let i = 0; i < sampleSize; i++) {
                const deepCopy = sampleList.slice();
                const randomCopy = utils.getRandomElements(deepCopy);
                const isRandomOrder = JSON.stringify(sampleList) !== JSON.stringify(randomCopy);
                if(isRandomOrder) { randomCount++; }
            }

            expect(randomCount).toBeGreaterThan(significanceLevel);
          });
    })
});