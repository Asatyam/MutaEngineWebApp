const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;


exports.setUpPassport = (passport) => {

    passport.serializeUser((user, done)=>{
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done)=>{
        try{
            const user = await User.findById(id);
            done(null, user);
        }catch(err){
            done(err);
        }
    });

    passport.use(
        "jwt",
        new JWTStrategy(
            {
                jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
                secretOrKey: process.env.SECRET,
            },
            (jwtPayload, done)=>done(null, jwtPayload)
        )
    );



}