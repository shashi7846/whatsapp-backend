//importing 
import express from "express"
import mongoose from "mongoose"
import Messages from  "./dbmessages.js";
import Pusher from "pusher"
import cors from "cors"
//app congif
const app = express()
const port = process.env.PORT || 9000;



const pusher = new Pusher({
  appId: "1204081",
  key: "12da8a1bc72fd978c131",
  secret: "28cf254f60ecaff2e545",
  cluster: "ap2",
  useTLS: true
});

//middleware
app.use(express.json())
app.use(cors())
app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Origin","*");
    next();
});

//db config
const connection_url = `mongodb+srv://user1509:shashi@cluster0.6frzn.mongodb.net/WhatsappDatabase?retryWrites=true&w=majority`
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})
//????
const db = mongoose.connection;
db.once("open",()=>{
    console.log("DB connected");
    
    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on('change',(change)=>{
        console.log(change)
        
        if(change.operationType === 'insert'){
            const messageDetails = change.fullDocument;
            pusher.trigger('message','inserted',
            {
                name: messageDetails.name,
                message:messageDetails.message,
                timestamp:messageDetails.timestamp,
                received:messageDetails.received

            })
        }else{
            console.log('error triggering pusher')
        }
    })
})
//api routes
app.get('/',(req,res)=>res.status(200).send('hello ra'));

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }
        else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbMessage = req.body
    Messages.create(dbMessage,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
        })
    })
//listen
app.listen(port,()=> console.log(`listening on localhost:${port}`));