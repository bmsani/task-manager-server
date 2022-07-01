const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lacgx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db('todo_task').collection('task');

        app.get('/task', async (req, res) => {
            const email = req.query.email
            const query = { email: email }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })

        app.get('/completedTask', async (req, res) => {
            const query = { done: true }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        }) 

        app.get('/todo', async (req, res) => {
            const query = { done: false }
            const result = await taskCollection.find(query).toArray()
            res.send(result)
        })        

        app.post('/task', async (req, res) => {
            const task = req.body;
            // const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const result = await taskCollection.insertOne(task);
            res.send({ success: true, result });
        })

        app.put('/task/:id', async (req, res) => {
            const id = req.params.id;
            const taskDone = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedTask = {
                $set: {
                    done: taskDone.done
                }
            };
            const result = await taskCollection.updateOne(filter, updatedTask, options);
            res.send({ success: true, result });
        })

        // delete
        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello From task app!')
})

app.listen(port, () => {
    console.log(`Task listening on port ${port}`)
})