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

// Configure express to parse URL-encoded POST request bodies (traditional forms)
app.use(express.urlencoded({extended : false}))

app.use(logger("dev"));

app.use(express.static(__dirname + '/public'));

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
} );

const read_goods_all_sql = `
    SELECT
        id, item, quantity, cost, ingredients, link
    FROM
        bakedGood
`

// define a route for the stuff inventory page
app.get( "/stuff", ( req, res ) => {   
    db.execute(read_goods_all_sql, (error, results) => {
        if (error)
            res.status(500).send(error); // Internal Server Error = 500
        else
            res.render("stuff", {inventory : results});
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
`

// define a route for the item detail page
app.get( "/stuff/item/:id", ( req, res ) => {
    db.execute(read_baked_item, [req.params.id], (error, results) => {
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
`
app.get("/stuff/item/:id/delete", ( req, res ) => {
    db.execute(delete_good_sql, [req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/stuff");
        }
    });
})

const create_good_sql = `
    INSERT INTO bakedGood
        (item, quantity, cost, ingredients, link)
    VALUES
        (?, ?, ?, ?, ?)
`
app.post("/stuff", (req, res) => {
    // to get the form input vaues:
    // req.body.name
    // req.body.quantity
    let quantity = null;
    if (req.body.quantity != "") {
        quantity = req.body.quantity;
    }
    db.execute(create_good_sql, [req.body.name, quantity, req.body.cost, req.body.ingredients, req.body.link], (error, results) => {
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
`

app.post("/stuff/item/:id", ( req, res ) => {
    let quantity = null;
    if (req.body.quantity != "") {
        quantity = req.body.quantity;
    }
    db.execute(update_goods_sql, [req.body.name, quantity, req.body.description, req.body.cost, req.body.ingredients, req.body.link, req.params.id], (error, results) => {
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