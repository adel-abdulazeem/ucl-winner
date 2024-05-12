const express = require('express')
const app = express()
const PORT = 2000
const cors = require('cors')

app.use(cors())
const finals ={
    2014: {
        'winner': 'Real Madrid',
        'loser': 'Atlitico Madrid'
    },
    2015: {
        'winner': 'Barchelona',
        'loser': 'Juventus'
    },
    2016: {
        'winner': 'Real Madrid',
        'loser': 'Atlitico Madrid'
    },
    2017: {
        'winner': 'Real Madrid',
        'loser': 'Juventus'
    },
    2018: {
        'winner': 'Real Madrid',
        'loser': 'Liverpool'
    },
    2019: {
        'winner': 'Liverpool',
        'loser': 'Totenham'
    },
    2020: {
        'winner': 'Bayern Munchin',
        'loser': 'PSG'
    },
    2021: {
        'winner': 'Chalsea',
        'loser': 'Man City'
    },
    2022: {
        'winner': 'Real Madrid',
        'loser': 'Liverpool'
    },
    2023: {
        'winner': 'Man City',
        'loser': 'Inter Milan'
    },
    2024: {
        'winner': 'Real Madrid, No doubt Aporla 15 is on the road!!!!!!!',
        'loser': 'Dortmand'
    },
    'not listed': {
        'year': 'sorry, not a listed year '
    }
}

app.get('/',(req, res)=>{
    res.sendFile(__dirname + '/index.html')
})

app.get('/api/:year', (req,res)=>{
const year = req.params.year
    console.log(year)
    if(finals[year]){
        res.json(finals[year])
    }else{
        res.json(finals['not listed'])
    }
})

app.listen(process.env.PORT || PORT, () =>{
    console.log(`The server is running on port:${PORT}`)
})