const mongoose = require('mongoose') // Importando la libreria
const fetch = require('node-fetch'); // Importar fetch si estás en un entorno de Node.js

// Creando el modelo de users
const HouseSchema = new mongoose.Schema({
    state: {
        required: true,
        type: String,
        validate: {
            validator: async function(state) {
              // Validacion del departamento
              var response = await fetch('https://api-colombia.com/api/v1/Department');
              var departments = await response.json()
              return departments.some(department => department.name.toUpperCase().includes(state.toUpperCase()));
            },
            message: props => `${props.value} no es un Departamento de Colombia!`
          }
    },
    city: {
      required: true,
      type: String,
      validate: {
          validator: async function(city) {
            // Validacion del departamento
            var response = await fetch('https://api-colombia.com/api/v1/City');
            var cities = await response.json()
            return cities.some(object => object.name.toUpperCase().includes(city.toUpperCase()));
          },
          message: props => `${props.value} no es una Ciudad de Colombia!`
        }
    }
})

module.exports = mongoose.model('house', HouseSchema) 