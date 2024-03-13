## App Access:
Access this deployed webpage on https://agreeable-stone-0a547f410.4.azurestaticapps.net/
## Team Members:
1. Simon Wermie
2. Om Sevak
3. Meshvi Patel
4. Itay Nudel
5. Eyal Zingerman

## Overview
ClubHub is a comprehensive online tool that is meant to be the main place where University of Manitoba students can meet people that share the same interests as them. The site is meant to make it easier to find clubs and join them. It also has tools for making and running new clubs.
## Problem Statement
While the University of Manitoba currently provides a club site for students, there exists an opportunity to enhance the platform's effectiveness in serving as a central hub for club-related activities. The current club-related infrastructure, while providing valuable resources, lacks a cohesive and user-friendly approach. As a result, students encounter difficulties in efficiently exploring and joining clubs that align with their passions. Therefore, ClubHub aims to provide the current resources available in a more user-friendly environment, while making it easier for clubs to engage with members, and for students to find new clubs.
## Vision Statement
ClubHub aims to foster a dynamic and cohesive University of Manitoba community by offering a smooth and intuitive platform that allows all students to find, join, and organize clubs that enrich their academic and social lives. Our goal is to dismantle obstacles so that exploring a wide range of passions and interests is easy and joyful. ClubHub wants to be the focal point that encourages deep relationships, teamwork, and personal development. In the end, we want to create a campus culture where all students have a feeling of community and are equipped to actively participate in the vibrant fabric of university life.
### Key Objectives
•	Increase Club Participation: Double the number of students actively involved in clubs within the first year.
•	Empower Club organizers: Collaborate with the university to develop resources and support mechanisms that empower existing and potential club organizers. Facilitate workshops or training sessions to enhance their skills, ultimately encouraging the establishment of at least 10 new clubs within the first year of launch.
### Stakeholders
•	Students: Primary users and beneficiaries of the platform.
•	Club Organizers: Essential partners in building a diverse club ecosystem.
•	University Administration: Collaborative partners in promoting student engagement and community building.
### Success Criteria
•	User Engagement: Achieve a monthly user engagement rate of at least 70%.
•	Club Growth: See a 50% increase in the number of active clubs within the first year.
•	Positive Impact: Receive positive testimonials and feedback from both students and club organizers.

## Core features
1.	Have a page for each club, including calendar and general info (Sprint 2)
•	We imagine each club will have a landing page, which includes information like club summary, interests associated with the club, contact info, club events (past and present), promotional material, exec club members, number of participants and historical data.
2.	Login as guest/user or admin (Sprint 2)
•	Users will be able to login as a guest or a User Account (basic data would be stored in this case) and an Admin Account (which manages the clubs’ landing page)
3.	Have a home feed, that shows off the club feed (Sprint 3)
•	This would be the first page after a user login into ClubHUB. This page would be the home page for our website. The club feed will include events, posts from admins that users follow as well as those that may be interesting to the user.
4.	Find clubs based off interests (Sprint 3)
•	User Accounts will select some interests when creating an account, an Admin Account associates some interests with their club and the feed shows non-followed clubs but ones that would be considered "compatible" with the user. Users Accounts can look for clubs based off their interests.
5.	Concurrency Validation (Sprint 2 + 3)
•	Only one admin per club should be able to make changes at a given instance of time, so backend validation will exist to ensure that changes made to the page are compatible with concurrent changes and may result in errors returned to the user. Users Accounts sessions should also not interfere with Admins manipulating a club’s landing page and vice versa.

## Technologies
ReactJS: Front end development \
MongoDB: Database management system\
Node.js + Express.js: Server-side processing and back-end development\
GitHub: Managing source code, documents as well as dev issues\
Docker: Used to automate CI/CD pipeline, consistent environment across development

