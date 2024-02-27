const express = require("express")//Importo LIbreria
const app = express()//Inicializacion de la variable que usara la libreria
const router = express.Router(); // Enrutar los servicion web
const port = 3000;//Escuchar la ejecucion del servidor
/** Importacion de variables de entorno */
//require('.env').config() // Obtenmos las variables de entorno

/** Conexion a BD */
//const DB_URL = process.env.DB_URL || '';
const mongoose = require('mongoose'); // Importo la libreria mongoose
mongoose.connect("mongodb+srv://maomolina0408:PovEgpJMWurgwHT2@cluster0.29sdcfm.mongodb.net/TalentoTech") // Creo la cadena de conexion
const UserSchema = require('./Models/User.js')

//const socket = require('socket.io'); //Importo libreria Socket.io
//const htpp = require('http').Server(app);
//const io = socket(http)

const userRoutes = require('./Routes/UserRoutes');
// const houseRoutes = require('./Routes/HouseRoutes');


//Metodo [GET, POST, PUT, PATCH,DELETE]
//Nombre del servicio [/]
//Funcion anonima
router.get('/', (req,res) => {
    //Informacion a Modificar
    res.send("Hello world")
})

// io.on('connect', (socket) => {
//     console.log("connected")
//     //Escuchamos eventos desde el sevidor
//     socket.on('message', (data) => {
//         console.log(data)
//         //Emitimos eventos hacia el cliente
//         socket.emit('message-receipt',{"message": "Mensaje recibido en el servidor"})
//     })
// })


app.use(express.urlencoded({extended: true}))// Acceder a la informacion de las urls
app.use(express.json())//Analizar infomacion en formato JSON
// app.use((req, res, next) => {
//     res.io = io
//     next()
// })




//Ejecutar el servidor 
app.use(router)
app.use('/uploads', express.static('uploads'));
app.use('/', userRoutes)
// app.use('/', HouseRoutes)
// app.use('/', MessageRoutes)
app.listen(port, () => {
    console.log('Listen on ' + port)
})