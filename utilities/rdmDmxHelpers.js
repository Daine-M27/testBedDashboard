const qs = require('qs');
const axios = require('axios');
const green = {
    1:'128',
    2:'0',
    3:'255',
    4:'0',
    5:'0',
    6:'0'
}

const rdmParams = {
    command_class:'10',
    destination:'7151:31323334',
    pid:'1000',
    data: '01'
}

function sendDMX(params){
    axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/v1/dmx',
        data: qs.stringify(params),
        headers: {
            'content-type':'application/x-www-form-urlencoded' 
        }
    }).then((res)=>{
        console.log(res.status);
    }, (err) => {
        console.log(err);
    })
}

function sendRDM(params){
    axios({
        method: 'post',
        url: 'http://127.0.0.1:5000/v1/rdm',
        data: qs.stringify(params),
        headers: {
            'content-type':'application/x-www-form-urlencoded' 
        }
    }).then((res)=>{
        console.log(res.status);
    }, (err) => {
        console.log(err);
    })
}

module.exports(sendDMX, sendRDM);