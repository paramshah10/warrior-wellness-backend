import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { user_info, charts } from "./newUserTemplate";
const cors = require('cors')({origin: true});

admin.initializeApp()

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const createNewAccountTemplate = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        const uid = request.body.uid;
        
        const user = await admin.auth().getUser(uid);
        if (!user) {
            response.status(400).send("You are not authorized to perform this action");
        }

        user_info.firstName = request.body.firstName;
        user_info.lastName = request.body.lastName;
        user_info.email = request.body.email;

        var promises = [admin.firestore().collection('users').doc(`${uid}`).set(user_info)];

        Object.entries(charts).forEach((entry) => {
            promises.push(admin.firestore().collection('users').doc(`${uid}`).collection('charts').doc(entry[0]).set(entry[1]));
        });

        Promise.all(promises)
        .then(() => {
            response.status(200).send({ message: 'Success', code: 200 });
        })
        .catch(() => {
            console.log('Could not create new template when account created');
            throw new functions.https.HttpsError('unknown','Could not create new template when account created');
        });
    })
})

