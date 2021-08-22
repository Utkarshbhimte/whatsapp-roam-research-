// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const RoamPrivateApi = require("roam-research-private-api")
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')

require('dotenv').config();

const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())


const port = process.env.PORT || 3000


const TWILLIO_NUMBER = process.env.TWILLIO_NUMBER
const TWILLIO_URL = process.env.TWILLIO_URL
const GRAPH_NAME = process.env.GRAPH_NAME
const ROAM_EMAIL = process.env.ROAM_EMAIL
const ROAM_PASSWORD = process.env.ROAM_PASSWORD


if (!TWILLIO_URL) {
    throw new Error('TWILLIO_URL must be set')
}
const sendMessage = async (number, text) => {
    const request = await fetch(
        TWILLIO_URL, {
        method: 'POST',
        body: `To=${number}&From=${TWILLIO_NUMBER}&Body=${text}`,
    });

    return request.json();
}

const handler = async (req, res) => {
    try {
        const input = req.body.Body

        const roam = new RoamPrivateApi(
            GRAPH_NAME,
            ROAM_EMAIL,
            ROAM_PASSWORD,
            { headless: true }
        );

        await roam.logIn();
        const dailyNoteId = await roam.dailyNoteUid();
        await roam.createBlock(input, dailyNoteId)

        await sendMessage(req.body.To, `👍`)
        res.status(200).json({ ok: false })
        console.log(`added ${input}`)
    } catch (error) {
        console.error(error)
        await sendMessage(req.body.To, `There was some error: ${error.message}`)
        res.status(500).json({ ok: false })
    }
}

app.post('/', handler)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

