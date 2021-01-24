# CodeBit

## Introduction:

Codebit is a web application where users can practice programming problems,
data structure and algorithms.There is a facility of doubt session where users can ask their
doubts and others to solve their doubts.There is a Leaderboard for competing with others.
In the market there are many platforms but it is difficult to find appropriate questions for
practice data structure and algorithms and programming problems. Codebit provides relevant
questions that help to understand data structure and algorithms help students to crack
company interviews.

## Tools, Technologies, and Platform used:

**Back-end:** _NodeJS,MongoDB,Mongoose,JavaScript, ExpressJS._

### Dependencies:

_bcrypt,compile-run,compile-run,cors,express,express-session,mongoose and nodemon._

## End-Point:

1. **/getLeaderboard:**
   This endpoint is used for initially fetching data on loading of the leaderboard page.
2. **/getProfile**
   This endpoint for getting information about the user.
3. **/deleteDoubt:**
   This endpoint for deleting doubt from doubt section.
4. **/deleteComment:**
   This endpoint for deleting comment from the doubt section
5. **/addComment:**
   This endpoint for add comment to the doubt section
6. **/doubtSectionLoad:**
   This endpoint is used for initially fetching data on loading of the comment section.
7. **/doubtSection:**
   This endpoint adds doubt to the doubt section.
8. **/signup:**
   This endpoint used to add a new user to the database.
9. **/login:**
   This endpoint is used for login the user.
10.   **/logout:**
      This endpoint is used for logging out the user.
11.   **/isdone:**
      If a user successfully passed all test cases for a particular endpoint then this end point is used to update the question info.
12.   **/runTestCase:**
      This end point runs standard code.
13.   **/runUserCode:**
      This end point runs user code against standard code.
14.   **/defaultCode:**
      This endpoint loads default code when the user interacts for the first time.
15.   **/getProblemSet/:tag**
      This endpoint used to get all problems of a particular data structure on page load.
16.   **/getProblem/:topic/:key**
      This endpoint loads a particular question of a specific data structure.
17.   **/getInitialCode/:key**
      This endpoint loads a particular questions source code of a specific data structure for a specific user.
18.   **/saveProblem:**
      This end point is used by the admin to save a new problem.
19.   **/saveUserCode:**
      This end point for saving data of users in the database.
20.   **/runCode:**
      This end point for run code.

## Run Project on local:

1. Open vscode or any IDE new window , open terminal and **clone git repo**.
2. “git clone **https://github.com/rambhajansonti/codebit-backend**”.
3. Open folder as **“codebit-backend”** or **“cd code-bit”**.
4. _“npm install”._
5. _“npm start”._
6. Now you can see the terminal backend is started on port **9999**.

## Repository Link

[codebit-backcend](https://github.com/rambhajansonti/codebit-backend).
