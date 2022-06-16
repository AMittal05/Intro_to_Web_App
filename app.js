//set up the server
const express = require( "express" );
const logger = require("morgan");
const db = require("./db/db_pool");
const app = express();

const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT;
// Configure Express to use EJS
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

// Configure Auth0
const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// Configure express to parse URL-encoded POST request bodies (traditional forms)
app.use(express.urlencoded({extended : false}))

app.use(logger("dev"));

app.use(express.static(__dirname + '/public'));

app.get('/testLogin', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
  });

const { requiresAuth } = require('express-openid-connect');

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
} );

const read_goods_all_sql = `
    SELECT
        id, item, quantity, cost, ingredients, link
    FROM
        bakedGood
    WHERE
        Email = ?
`

// define a route for the stuff inventory page
app.get( "/stuff", requiresAuth(), ( req, res ) => {   
    db.execute(read_goods_all_sql, [req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); // Internal Server Error = 500
        else
            res.render("stuff", {inventory : results, username : req.oidc.user.name});
            // inventory's shape:
            // [
            // {id : ___, item : ___, quantity : ___, cost : ___, ingredients : ___, link : ____}
            // ]
    });
} );

const read_baked_item = `
    SELECT
        id, item, quantity, cost, ingredients, link, description
    FROM
        bakedGood
    WHERE
        id = ?
        AND email = ?
`

// define a route for the item detail page
app.get( "/stuff/item/:id", requiresAuth(), ( req, res ) => {
    db.execute(read_baked_item, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error);
        else if (results.length == 0)
            res.status(404).send(`No item found with id = ${req.params.id}`);
        else {}
            let data = results[0]; // Results is still an array
            res.render('item', data);
    })
} );


const delete_good_sql = `
    DELETE 
    FROM
        bakedGood
    WHERE
        id = ?
        AND email = ?
`
app.get("/stuff/item/:id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_good_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/stuff");
        }
    });
})

const create_good_sql = `
    INSERT INTO bakedGood
        (item, quantity, cost, ingredients, link, email)
    VALUES
        (?, ?, ?, ?, ?, ?)
`
app.post("/stuff", requiresAuth(), (req, res) => {
    // to get the form input vaues:
    // req.body.name
    // req.body.quantity
    let quantity = null;
    if (req.body.quantity != "") {
        quantity = req.body.quantity;
    }
    db.execute(create_good_sql, [req.body.name, quantity, req.body.cost, req.body.ingredients, req.body.link, req.oidc.user.email], (error, results) => {
        if (error)
            res. status(500).send(error);
        else {
            res.redirect('/stuff');
        }
    })
})

const update_goods_sql = `
    UPDATE
        bakedGood
    SET
        item = ?,
        quantity = ?,
        description = ?,
        cost = ?,
        ingredients = ?,
        link = ?
    WHERE
        id = ?
        AND email = ?
`

app.post("/stuff/item/:id", requiresAuth(), ( req, res ) => {
    let quantity = null;
    if (req.body.quantity != "") {
        quantity = req.body.quantity;
    }
    db.execute(update_goods_sql, [req.body.name, quantity, req.body.description, req.body.cost, req.body.ingredients, req.body.link, req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res. status(500).send(error);
        else {
            res.redirect(`/stuff/item/${req.params.id}`);
        }
    })
})

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );