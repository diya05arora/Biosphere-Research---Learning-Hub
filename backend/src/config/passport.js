import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {User} from "../models/user.models.js";
import { ADMIN_EMAILS } from "../constants.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile?.emails?.[0]?.value;
                let user = await User.findOne({email});

                if(!user) {
                    // create a unique username
                    let baseUsername = profile.displayName.replace(/\s+/g, '').toLowerCase();
                    let existing = await User.findOne({ username: baseUsername });
                    while(existing) {
                        baseUsername = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
                        existing = await User.findOne({ username: baseUsername });
                    }
                    const username = baseUsername;

                    const role = ADMIN_EMAILS.includes(email) ? "admin" : "user";

                    user = await User.create({
                        fullName: profile.displayName,
                        email,
                        username,
                        googleId: profile.id,
                        role,
                        authProvider: "google",
                    });

                }
                done(null, user);
                
            }
            catch (error) {
                done(error, null);
            }
        }
    )
);

export default passport;