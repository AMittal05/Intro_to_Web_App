const db = require("./db_connection");

// delete the table if it already exists
const drop_baked_goods_sql = "DROP TABLE IF EXISTS bakedGood"

db.execute(drop_baked_goods_sql);
// create the table with suitable columns and such

const create_baked_goods_table_sql = `
    CREATE TABLE bakedGood (
        Email VARCHAR(45) NULL,
        id INT NOT NULL AUTO_INCREMENT,
        Item VARCHAR(45) NOT NULL,
        Quantity INT,
        Description VARCHAR(150) NULL,
        Cost VARCHAR(20) NOT NULL,
        Ingredients VARCHAR(200) NOT NULL,
        Link VARCHAR(1000) NOT NULL,
        PRIMARY KEY (id));
`

db.execute(create_baked_goods_table_sql);

// add some sample data to the table
const insert_baked_goods_table_sql = `
    INSERT INTO bakedGood
        (item, quantity, description, cost, ingredients, link)
    Values
        (?, ?, ?, ?, ?, ?)
`
db.execute(insert_baked_goods_table_sql, ["Cupcake", "24", "Cupcakes are tasty", "1.00", "Insert Ingredients", "Insert Link"]);

db.execute(insert_baked_goods_table_sql, ["Crepe", "10", "Crepes are tasty", "2.00", "Insert Ingredients", "Insert Link"]);

db.execute(insert_baked_goods_table_sql, ["Cake", "2", "Cakes are tasty", "15.00", "Insert Ingredients", "Insert Link"]);

db.execute(insert_baked_goods_table_sql, ["Bread", "5", "Bread is tasty", "4.00", "Insert Ingredients", "Insert Link"]);

db.execute(insert_baked_goods_table_sql, ["Scone", "12", "Scones are tasty", "3.00", "Insert Ingredients", "Insert Link"]);

db.execute(insert_baked_goods_table_sql, ["Cookies", "30", "Cookies are tasty", "1.00", "Insert Ingredients", "Insert Link"]);

/**** Read the sample items inserted ****/

const read_baked_Good_table_sql = "SELECT * FROM bakedGood";

db.execute(read_baked_Good_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'bakedGood' initialized with:")
        console.log(results);
    }
);

db.end();