const axios = require("axios");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws")
const fs = require("fs")

const inst = axios.create({
    baseURL: 'https://discord.com/api/v10',
    timeout: 1000,
    headers: {"Authorization": 'Bot MTA2NDcyMDIzMjQxMDc3OTcwOA.GqFCwE.cSuStEiyTq-q-J-KO4Qkk9jCUgvlOet5QgkgCQ'}
})


var slashcommands = [
    {
        "name": "echo",
        "type": 1,
        "description": "this is a test slash command that does nothing",
        "options": [
            {
                "name": "string",
                "description": "the string to echo back to you",
                "type": 3,
                "required": true
            },
    
        ]
    },
    {
        "name": "debug",
        "type": 1,
        "description": "This takes in an argument, and prints it to the debug console. It will not respond.",
        "options": [
            {
                "name": "retvalue",
                "description": "this is the thing that will return to console",
                "type": 3,
                "required": true
            },
    
        ]
    },
    {
        "name": "nowplayingchannel",
        "type": 1,
        "description": 'Selects a channel to send the "Now Playing on Environmental" messages.',
        "options": [
            {
                "name": "channel",
                "description": "The channel in which to send aformentioned messages.",
                "type": 7,
                "required": true
            },
    
        ]
    },
    {
        "name": "togglenowplaying",
        "type": 1,
        "description": 'Selects a channel to send the "Now Playing on Environmental" messages.',
        "options": [
            {
                "name": "state",
                "description": "State to set the muzak system into (on or off)",
                "type": 5,
                "required": true
            },
    
        ]
    },
]

for (let i = 0; i < slashcommands.length; i++) {
    inst.post("/applications/1064720232410779708/commands", slashcommands[i])
}


var filecontents = JSON.parse(fs.readFileSync("serverconfigs.json").toString())




var hbresponse = {
	"op": 1,
	"d": 251
};

var identify = 
    {
        "op": 2,
        "d": {
          "token": "Bot MTA2NDcyMDIzMjQxMDc3OTcwOA.GqFCwE.cSuStEiyTq-q-J-KO4Qkk9jCUgvlOet5QgkgCQ",
          "intents": 3584,
          "properties": {
            "os": "linux",
            "browser": "my_library",
            "device": "my_library"
          }
        }
    }


var socket = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");

var heartbeat = undefined;

socket.on("message", (e) => {

    // console.log(JSON.parse(e.toString()))

    if (JSON.parse(e.toString()).op == 10) {
        heartbeat = JSON.parse(e.toString()).d.heartbeat_interval
        console.log("init");

        socket.send(JSON.stringify(identify))
        // console.log(JSON.parse(e.toString()))

        setInterval(() => {
            socket.send(JSON.stringify(hbresponse))
            console.log("beat");
        }, heartbeat)
    }

    if (JSON.parse(e.toString()).t == 'INTERACTION_CREATE') {
        // console.log()



        if (JSON.parse(e.toString()).d.data.name == "echo") {
            var contents = JSON.parse(e.toString()).d.data.options
            var token = JSON.parse(e.toString()).d.token
            var id = JSON.parse(e.toString()).d.id

            var endpoint = `/interactions/${id}/${token}/callback`

            var message = {
                "type": 4,
                "data": {
                    "content": `${contents[0].value}`
                }
            }

            inst.post(endpoint, message)

        }

        else if (JSON.parse(e.toString()).d.data.name == "debug") {
            var contents = JSON.parse(e.toString()).d.data.options
            console.log(contents)
            var token = JSON.parse(e.toString()).d.token
            var id = JSON.parse(e.toString()).d.id

            var endpoint = `/interactions/${id}/${token}/callback`

            var message = {
                "type": 4,
                "data": {
                    "content": "Thanks for the input!"
                }
            }

            inst.post(endpoint, message)

        }

        else if (JSON.parse(e.toString()).d.data.name == "togglenowplaying") {
            var contents = JSON.parse(e.toString()).d.data.options
            var guildid = JSON.parse(e.toString()).d.guild_id
            console.log(JSON.parse(e.toString()))
            var token = JSON.parse(e.toString()).d.token
            var id = JSON.parse(e.toString()).d.id

            var endpoint = `/interactions/${id}/${token}/callback`

            var message = {
                "type": 4,
                "data": {
                    "content": `The channel <#${contents[0].value}> has been set as the "Now Playing" channel of this guild.` 
                }
            }

            inst.post(endpoint, message)

            var entry = {
                guildid: `${guildid}`,
                nowPlayingCHID: `${contents[0].value}`,
                enabled: true
            }

            var dupe = false;
            

            for (let i = 0; i < filecontents.length; i++) {



                

                if (filecontents[i].guildid == guildid && filecontents[i].nowPlayingCHID != contents[0].value) {
                    filecontents[i].nowPlayingCHID = contents[0].value
                    filecontents[i].enabled = true
                    dupe = true
                }

                if (dupe == false && filecontents[i].guildid == guildid && filecontents[i].nowPlayingCHID == contents[0].value) {
                    filecontents[i].enabled = true
                    dupe = true;
                }


                // if (filecontents[i].guildid != guildid && filecontents[i].nowPlayingCHID != contents[0].value && dupe != true) {
                    
                // }

                

            }

            if (dupe != true) {
                filecontents.push(entry)
            }

            
            
       
            fs.writeFileSync("serverconfigs.json", JSON.stringify(filecontents))



            

        }


    }


    

})


