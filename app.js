const yargs = require("yargs")
const axios = require("axios")
const fahrenheitToCelsius = require("fahrenheit-to-celsius")

const argv = yargs
  .options({
    i: {
      demand: true,
      string: true
    }
  })
  .argv

const inputString = argv.i
const addressArray = inputString.split(',').map(function(address) {
  return address.trim()
})

for(let i = 0; i < addressArray.length; i++) {
  const address = addressArray[i]
  const encodedAddress = encodeURIComponent(address)
  const geocodeUrl = `http://www.mapquestapi.com/geocoding/v1/address?key=XIxJKxpTAiDBujA6xvsT68MqEVQQsEHd&location=?${encodedAddress}`
  axios
    .get(geocodeUrl)
    .then(geocodeData => {
      if (
        geocodeData.data === undefined ||
        geocodeData.data === "The AppKey submitted with this request is invalid." ||
        geocodeData.data.results[0].locations[0].adminArea5 === ""
      ) 
        throw new Error("Unable to find that address")

      const latitude = geocodeData.data.results[0].locations[0].latLng.lat
      const longitude = geocodeData.data.results[0].locations[0].latLng.lng
      const weatherUrl = `https://api.darksky.net/forecast/e4e2eb1b39b37c062f28580418052d42/${latitude},${longitude}`
      return axios.get(weatherUrl)
    })
    .then(weatherResponse => {
      const temperature = Math.round(
        fahrenheitToCelsius(weatherResponse.data.currently.temperature)
      )
      console.log(`"${address}": ${temperature} Degree Celsius.`)
    })
    .catch(error => {
      if (error.code === "ENOTFOUND") {
        console.log(`"${address}": Unable to connect to API servers.`)
      } else 
        console.log(`"${address}": ${error.message}`)
    })
}
