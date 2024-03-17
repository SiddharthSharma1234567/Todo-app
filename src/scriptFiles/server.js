require('dotenv').config();
const { ObjectId } = require('mongodb');
const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const { MongoClient } = require("mongodb");
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require("jsonwebtoken");

const secret = process.env.SECRET_KEY;
const PORT = 3001;
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let dbinstance;

MongoClient.connect("mongodb+srv://SiddharthSharma:siddharth@cluster0.gacgrpw.mongodb.net/")
    .then((client) => {
        dbinstance = client.db("project_todo");
        console.log("MongoDB connected");
    })
    .catch((err) => {
        console.log(err);
    });

const withAuth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
    } else {
        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
            } else {
                req.user = decoded;
                next();
            }
        });
    }
};

// ... (other server code)

app.get("/checkAuth", withAuth, (req, res) => {
    const email = req.user.email;
    dbinstance.collection("todo_data").findOne({ "email": email })
        .then((data) => {
            if (data.categories.length !== 0) {
                const categorydata = data.categories[0].category;
                res.status(200).json({ success: true, dashboardType: "actual", message: categorydata });
            } else {
                res.status(200).json({ success: true, dashboardType: "default", message: "empty" });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        });
});

// ... (other server code)


app.post("/logindata", async (req, res) => {
    try {
        let categorydata;
        const { email, password } = req.body;
        const user = await dbinstance.collection("todo_data").findOne({ "email": email });

        if (!user) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        // Use bcrypt.compareSync instead of bcrypt.compare
        const result = bcrypt.compareSync(password, user.password);

        if (result) {
            const payload = { email };
            const token = jwt.sign(payload, secret, {
                expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true, maxAge: 24 * 3600000 });

            if(user.categories.length!=0){
                categorydata=user.categories[0].category;
                res.status(200).json({ success: true, message: categorydata });
            }
            else{
                res.status(200).json({ success: true, message: "empty" });
            }
        } else {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post("/signupdata", (req, res) => {
    const { email, password } = req.body;

    bcrypt.hash(password, 2, (err, hashedPassword) => {
        if (err) {
            console.log(err);
        } else {
            const obj = {
                "email": email,
                "password": hashedPassword,
                "categories": []
            };

            dbinstance.collection("todo_data").insertOne(obj)
                .then(() => {
                    res.json({ success: true, message: "Signup successful" });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ success: false, error: "Internal Server Error" });
                });
        }
    });
});

app.get("/getcategories", withAuth, (req, res) => {
    try {
        const email = req.user.email;
        dbinstance.collection("todo_data").findOne({ "email": email })
            .then((data) => {
                res.status(200).json({ success: true, categories: data.categories });
            })
            .catch((err) => {
                console.log(err);
            })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
})

app.post("/addcategories", withAuth, (req, res) => {
    try {
        const email = req.user.email;
        const category = req.body.category;
        const obj = {
            "category": category,
            "tasks": []
        }
        dbinstance.collection("todo_data").updateOne({ "email": email }, { $push: { "categories": obj } })
            .then(() => {
                res.status(200).json({ success: true, message: "category added successfully" });
            })
            .catch((err) => {
                console.log(err);
            })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
})

app.post("/gettasks", withAuth, (req, res) => {
    const email = req.user.email;
    const category = req.body.category;

    dbinstance.collection("todo_data").findOne({
        "email": email
    })
        .then((result) => {
            const matchingCategory = result.categories.find(cat => cat.category === category);

            if (!matchingCategory) {
                return res.status(404).json({ success: false, error: "Category not found" });
            }

            const tasksIds = matchingCategory.tasks;

            dbinstance.collection("tasks").find({ _id: { $in: tasksIds } }).toArray()
                .then((data) => {
                    res.status(200).json({ success: true, tasksData: data });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ success: false, error: "Internal Server Error" });
                });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        });
});


app.post("/addtasks", withAuth, (req, res) => {
    const email = req.user.email;
    const category = req.body.category;
    const task = req.body.task;
    let taskId;
    dbinstance.collection("tasks").insertOne({ "task": task, "isCompleted": false })
        .then((result) => {
            taskId = result.insertedId;
            dbinstance.collection("todo_data").updateOne(
                {
                    "email": email,
                    "categories.category": category
                },
                {
                    $push: {
                        "categories.$.tasks": taskId
                    }
                }
            )
                .then(() => {
                    res.status(200).json({ success: true });
                })
                .catch((err) => {
                    console.log(err);
                    res.status(500).json({ success: false });
                })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ success: false });
        })
})

app.post("/completeState", withAuth, async (req, res) => {
    try {
        const taskId = req.body.taskId;
        const objectId = new ObjectId(taskId);

        dbinstance.collection("tasks").findOne({ "_id": objectId })
            .then((result) => {
                if (result.isCompleted) {
                    result.isCompleted = false;
                }
                else {
                    result.isCompleted = true;
                }
                dbinstance.collection("tasks").updateOne(
                    { "_id": objectId },
                    { $set: { "isCompleted": result.isCompleted } }
                )
                    .then((task) => {
                        res.status(200).json({ success: true, message: "Task updated successfully" });
                    })
                    .catch((err) => {
                        res.status(500).json({ success: false, message: "Failed to update task" });

                    })
            })
            .catch(() => {
                res.status(500).json({ success: false, message: "Internal Server Error" });
            })
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

app.post("/deletetask", withAuth, (req, res) => {
    const email = req.user.email;
    const taskId = req.body.taskId;
    const objectId = new ObjectId(taskId);
    const category = req.body.category;

    dbinstance.collection("todo_data").updateOne(
        { "email": email, "categories.category": category },
        { $pull: { "categories.$.tasks": objectId } }
    )
        .then(() => {
            return dbinstance.collection("tasks").deleteOne({ "_id": objectId });
        })
        .then(() => {
            res.status(200).json({ success: true, message: "Task deleted successfully" });
        })
        .catch((error) => {
            console.error("Error deleting task:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        });
});

app.post("/deletecat", withAuth, (req, res) => {
    const email = req.user.email;
    const categoryToDelete = req.body.category;
    let categoryLength;
    let catArray;

    dbinstance.collection("todo_data").findOne({ "email": email, "categories.category": categoryToDelete })
        .then((result) => {
            if (!result) {
                return res.status(404).json({ success: false, error: "Category not found" });
            }

            catArray = result.categories.filter(cat => cat.category !== categoryToDelete);
            categoryLength=result.categories.length;
            const tasksToDelete = result.categories.find(cat => cat.category === categoryToDelete).tasks;

            return dbinstance.collection("todo_data").updateOne(
                { "email": email },
                { $pull: { "categories": { "category": categoryToDelete } } }
            ).then(() => tasksToDelete);
        })
        .then((tasksToDelete) => {
            return dbinstance.collection("tasks").deleteMany({ "_id": { $in: tasksToDelete } });
        })
        .then(() => {
            if(categoryLength===1){
                res.status(200).json({ success: true, message: "Category and associated tasks deleted successfully",length:categoryLength });
            }
            else{
                res.status(200).json({ success: true, message: "Category and associated tasks deleted successfully",nextCat:catArray[0].category });
            }
        })
        .catch((error) => {
            console.error("Error deleting category and tasks:", error);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        });
});


app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log(`Server started on port ${PORT}`);
    }
});