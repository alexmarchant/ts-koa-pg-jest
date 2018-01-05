import { Client, Query } from 'pg'

// Monkey patch in some logging
// var actualSubmit = Query.prototype.submit
// Query.prototype.submit = function() {
//   if (this.values) {
//     console.log(this.text, this.values)
//   } else {
//     console.log(this.text)
//   }
//   actualSubmit.apply(this, arguments)
// }

const client = new Client()

client.connect()
export default client
