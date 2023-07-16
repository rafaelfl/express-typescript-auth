db.createUser(
    {
        user: "authusers",
        pwd: "authpass",
        roles: [
            {
                role: "readWrite",
                db: "authusers"
            }
        ]
    }
);