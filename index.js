const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer");
const mongoose = require("mongoose")
const dotenv = require("dotenv").config();
const { Resend } = require("resend")
const resend = new Resend(process.env.RESEND_API_KEY)

const app = express()

app.use(cors({
    origin: "https://bulkmail-frontend-gray.vercel.app",
    methods: ["GET", "POST"]
}))

app.use(express.json())

mongoose.connect(process.env.MONGO_URI).then(function () {
    console.log("Connected to DB")
}).catch(function (error) {
    console.log("Failed to Connect DB")
    console.log(error)
})

const credential = mongoose.model(
    "credential",
    new mongoose.Schema({}, { strict: false }),
    "bulkmail")

app.get("/", function (req, res) {
    res.send("Server is running")
})

app.post("/sendemail", function (req, res) {

    var msg = req.body.msg
    var emailList = req.body.emailList

    console.log("Request received")
    console.log("msg:", msg)
    console.log("emailList:", emailList)

    credential.find().then(function (data) {
        console.log("Credential data:", data)
        // Create a transporter using SMTP
        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            auth: {
                user: data[0].toJSON().username,
                pass: data[0].toJSON().password,
            },
        });

        new Promise(async function (resolve, reject) {
            try {
                for (let i = 0; i < emailList.length; i++) {
                    console.log("Sending email to:", emailList[i]);
                    await resend.emails.send(
                        {
                            from: "hariharan20cs022@gmail.com",
                            to: emailList[i],
                            subject: "A Message from Bulk Mail App",
                            text: msg
                        }
                    )
                    console.log("Email sent to:" + emailList[i])
                }
                res.send(true)
                
            }
            catch (error) {
                console.log("ERROR:", error);
                res.send(false)
            }
        }).then(function () {
            res.send(true)
        }).catch(function (error) {
            console.log("SEND MAIL ERROR:", error);
            res.send(false)
        })

    }).catch(function (error) {
        console.log("ERROR:", error)
        res.send(false)
    })

})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("Server Started on port", PORT));