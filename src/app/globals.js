
//let LOCALHOST_PROTOTYPE = 'http://localhost:515';
let LOCALHOST_API = 'http://localhost:52876/api/';
let LOCALHOST_TIPCO = 'http://localhost:52876/api/tipco/';
var API = LOCALHOST_TIPCO;
try {
    API = window.location.hostname == 'localhost' ? LOCALHOST_TIPCO : (window.location.origin + "/api/tipco/" );
}catch(e){}

//API = LOCALHOST_API;


const HOMEPAGE = '/main-work/';
const ID_PROP = "ID"; // This tells the system what the name of the prop is to find the record id
const LOCALHOST = "http://localhost:5151/";
const API_BASE = API;

export {HOMEPAGE, ID_PROP, LOCALHOST, API_BASE};
