const ClubMembership = require('../models/clubMembershipsModel');
const interests = require("../controllers/interestController");

exports.getRandomElements = (list, number) => {
    const shuffled = list.sort(() => 0.5 - Math.random());
    return selected = shuffled.slice(0, number);
}

exports.orderClubs = async (clubItems, userObjectId, includeJoined) => {
    try {
        // find and demark clubs that are joined by user
        const clubMemberships = await ClubMembership.find({ user: userObjectId });
        const joinedClubsObjectIds = clubMemberships.map(joinedClub => joinedClub.club.toString());
        clubItems.forEach(item => {
            item["isJoined"] = joinedClubsObjectIds.includes(item.club.toString());
        })

         // get user interests
        const userInterestsStringList = await interests.getUserInterestsMiddleware(userObjectId);
        
        // algorithm to get percentage match and format interests by random(matching) the fill last 5 with random(not matching)
        clubItems.forEach(item => {

            var sameInterests = 0;

            // we define matching as interets in the club and user, non matching as those that exist in club but not user
            for (const interest of item.interests) {
                if (userInterestsStringList.includes(interest)) {
                    sameInterests++;
                }
            }

            // ternary operation to prevent nan
            const matchingPercent = item.interests.length > 0 ? sameInterests / item.interests.length : 0;

            item["percentMatch"] = Math.floor(matchingPercent * 100); // percentage
        })

         // .getRandomElements directly modifies the list, it does not return a copy unless we modify the length
        const joinedClubsItems = clubItems.filter(item => item.isJoined);
        this.getRandomElements(joinedClubsItems, joinedClubsItems.length);

        // we do not include joined clubs that are also recommended (they already appear!)
        const recommendedClubsItems = clubItems.filter(item => item.percentMatch > 0 && !item.isJoined);
        if (recommendedClubsItems.length > 0) {
            recommendedClubsItems.sort((itemA, itemB) => itemB.percentMatch - itemA.percentMatch);
        }

        const otherClubsItems = clubItems.filter(item => !item.isJoined && item.percentMatch == 0);
        this.getRandomElements(otherClubsItems, otherClubsItems.length);

        // order is joined=>recommended=>other, though we don't always include joined
        const allReturnedClubsItems = includeJoined ?
        joinedClubsItems.concat(recommendedClubsItems).concat(otherClubsItems) :
            recommendedClubsItems.concat(otherClubsItems);

        return allReturnedClubsItems;
    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
}