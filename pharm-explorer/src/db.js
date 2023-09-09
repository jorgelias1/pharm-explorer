import mongoose from 'mongoose'
import jsonData from './company_tickers.json' assert {type: "json"}

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://jorgelias:${password}@cluster0.ozsqwrv.mongodb.net/CIK?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
mongoose.connect(url).then(() => {
  const companySchema = new mongoose.Schema({
    cik_str: Number,
    ticker: String,
    title: String,
  })

  const CompanyModel = mongoose.model('CompanyModel', companySchema)

  (async () => {
    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        const entry = jsonData[key]

        try {
          const newEntry = new CompanyModel({
            cik_str: entry.cik_str,
            ticker: entry.ticker,
            title: entry.title,
          });

          await newEntry.save()
        } catch (err) {
          console.error('Error saving entry: ' + err);
        }
      }
    }

    // Close the Mongoose connection when all operations are done.
    mongoose.connection.close()
      .then(() => {
        console.log('Connection closed.')
        console.log('finished!')
      })
      .catch((err) => {
        console.error('Error closing connection: ' + err)
        console.log('finished with errors')
      });
  })();
})
.catch((err) => {
  console.error('Error connecting to MongoDB: ' + err)
  process.exit(1) // Exit the script if there's a connection error
});