const axios = require("axios")

const inst = axios.create({
    baseURL: 'https://discord.com/api/v10',
    timeout: 1000,
    headers: {"Authorization": 'Bot MTA2NDcyMDIzMjQxMDc3OTcwOA.GqFCwE.cSuStEiyTq-q-J-KO4Qkk9jCUgvlOet5QgkgCQ'}
})


let req = inst.get("/channels/1064721749742198857/messages").then((req) => {
    console.log(req)
})

