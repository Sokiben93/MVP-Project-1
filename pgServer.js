"use strict";
require("dotenv").config();

// var fs = require("fs"); // Setup fs and path
// var path = require("path");

const express = require("express"); // Setup express and app
const app = express();
// const Port = process.env.PORT || 3005;
const {DATABASE_URL, NODE_ENV, PORT} = process.env;
const morgan = require("morgan");
const cors = require("cors");


const { Pool } = require("pg");

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false,
//   },
//   user: "thanhhuyle",
//   host: "localhost",
//   database: "car",
//   port: 5432,
// });
// PORT = 3005
// DATABASE_URL = postgres://localhost:5432/car

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(process.env.NODE_ENV === "production"
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
});

/*---------- middleware -----------*/
app.use(morgan("short"));
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

////////////////////////////////////////////////////////////////////////////////////////////////////////
/* ------------------------- GET/cars -------------------------- */
app.route("/api/cars")

.get( async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query("SELECT * FROM cars");
    res.send(result.rows);
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
}) 

.post( async (req, res) => {
  try {
    const { make, model, year, owner_id } = req.body;
    console.log(typeof make);
    console.log(typeof model);
    console.log(typeof parseInt(year));
    console.log(typeof parseInt(owner_id));
    if (
      typeof make !== "string" ||
      typeof model !== "string" ||
      typeof parseInt(year) !== "number" ||
      typeof parseInt(owner_id) !== "number"
    ) {
      res.status(404).send("Bad Request");
    } else {
      const { rows } = await pool.query(
        `INSERT INTO cars (make, model, year, owner_id) VALUES ($1, $2, $3, $4) RETURNING *;`,
        [make, model, year, owner_id]
      );
      console.log('hi',rows[0]);
      res.status(200).send(rows[0]);
    }
  } catch (err) {
    console.log("Internal Server Error");
    res.status(500).send(err);
  }
});

app.get("/api/cars/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = await pool.query("SELECT * FROM cars WHERE car_id = $1;", [
      id,
    ]);
    res.status(200).send(rows);
  } catch (err) {
    console.log("Internal Server Error");
    res.status(500).send(err);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
/* ------------------------ POST/cars -------------------------- */
// app.post("/api/cars", async (req, res) => {
//   try {
//     const { make, model, year, owner_id } = req.body;
//     if (
//       typeof make !== "string" ||
//       typeof model !== "string" ||
//       typeof year !== "number" ||
//       typeof owner_id !== "number"
//     ) {
//       res.status(404).send("Bad Request");
//     } else {
//       const { rows } = await pool.query(
//         `INSERT INTO cars (make, model, year, owner_id) VALUES ($1, $2, $3, $4) RETURNING *;`,
//         [make, model, year, owner_id]
//       );
//       console.log('hi',rows[0]);
//       res.status(200).send(rows[0]);
//     }
//   } catch (err) {
//     console.log("Internal Server Error");
//     res.status(500).send(err);
//   }
// });

////////////////////////////////////////////////////////////////////////////////////////////////////////
/* ------------------------ PATCH/cars ------------------------ */
app.patch("/api/cars/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { make, model, year, owner_id } = req.body;
    console.log(typeof make);
    console.log(typeof model);
    console.log(typeof parseInt(year));
    console.log(typeof parseInt(owner_id));
    if (
      typeof make !== "string" ||
      typeof model !== "string" ||
      typeof parseInt(year) !== "number" ||
      typeof parseInt(owner_id) !== "number"
    ) {
      res.status(404).send("Bad Request");
    } else {
      const {rows} = await pool.query(
        `UPDATE cars 
      SET make = COALESCE($1, make),
          model = COALESCE($2, model),
          year = COALESCE($3, year),
          owner_id = COALESCE($4, owner_id)
            WHERE car_id = $5
            RETURNING *;`,
        [make, model, year, owner_id, id]
      );
      res.status(200).send(rows[0]);
    }
  } catch (err) {
    console.log("Internal Server Error");
    res.status(500).send(err);
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////
/* ------------------------ DELETE ------------------------ */
app.delete("/api/cars/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { rows } = pool.query(`DELETE FROM cars WHERE car_id = $1 RETURNING *`, [id]);
    res.status(200).send(rows);
  } catch (err) {
    console.log("Internal Server Error");
    res.status(500).send(err);
  }
});

// handle all internal server errors
app.get("/api/", (req, res, next) => {
  return res.sendStatus(500).send("Internal Server Error");
});

// handle all unknown HTTP requests
app.use(function (req, res) {
  res.sendStatus(404);
});

// Listening port
app.listen(PORT, function () {
  console.log(`Listening on Port ${PORT}`);
});

// /* ------------------------- GET/owners -------------------------- */
// app.get("/api/owners", (req, res) => {
//   pool.query("SELECT * FROM owners", (err, data) => {
//     res.json(data.rows);
//     //   console.log(data.rows);
//   });
// });

// app.get("/api/owners/:id", (req, res) => {
//   const id = req.params.id;
//   pool.query(`SELECT * FROM owners WHERE owner_id = $1;`, [id]).then((data) => {
//     const owner = data.rows[0];
//     if (owner) {
//       res.send(owner);
//     } else {
//       res.sendStatus(404);
//     }
//   });
// });

// /* ------------------------ POST/owners -------------------------- */
// app.post("/api/owners", (req, res) => {
//   const { name, age } = req.body;
//   pool
//     .query(`INSERT INTO owners (name, age) VALUES ($1, $2) RETURNING *;`, [
//       name,
//       age,
//     ])
//     .then((data) => {
//       res.send(data.rows[0]);
//     });
// });

// /* ------------------------ PATCH/owners ------------------------ */
// app.patch("/api/owners/:id", (req, res) => {
//   const { id } = req.params;
//   const { name, age, owner_id } = req.body;
//   pool
//     .query(
//       `UPDATE owners 
//     SET name = COALESCE($1, name),
//         age = COALESCE($2, age),
//         owner_id = COALESCE($3, owner_id)
//           WHERE owner_id = $4
//           RETURNING *;`,
//       [name, age, owner_id, id]
//     )
//     .then((data) => {
//       if (data.rows.length === 0) {
//         res.sendStatus(404);
//       } else {
//         res.send(data.rows[0]);
//         // console.log(data.rows[0])
//       }
//     });
// });

// /* ------------------------ DELETE/owners ------------------------ */
// app.delete("/api/owners/:id", (req, res) => {
//   const id = req.params.id;
//   pool
//     .query(`DELETE FROM owners WHERE owner_id = $1 RETURNING *`, [id])
//     .then((data) => {
//       if (data.rows.length === 0) {
//         res.sendStatus(404);
//       } else {
//         res.sendStatus(204);
//       }
//     });
// });