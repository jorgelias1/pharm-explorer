import mongoose from 'mongoose'
import jsonData from './companies.json' assert {type: "json"}

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
`mongodb+srv://jorgelias:${password}@cluster0.ozsqwrv.mongodb.net/Pharm?retryWrites=true&w=majority`

mongoose.set('strictQuery',false)
export default CompanyModel;
mongoose.connect(url).then(() => {
  const companySchema = new mongoose.Schema({
    ticker: String,
    name: String,
    cik: Number,
  });

  const CompanyModel = mongoose.model('CompanyModel', companySchema);

  (async () => {
    for (const key in jsonData) {
      if (jsonData.hasOwnProperty(key)) {
        const entry = jsonData[key];

        try {
          const newEntry = new CompanyModel({
            ticker: entry.ticker,
            name: entry.name,
            cik: entry.cik,
          });

          await newEntry.save();
        } catch (err) {
          console.error('Error saving entry: ' + err);
        }
      }
    }

    // Close the Mongoose connection when all operations are done.
    mongoose.connection.close()
      .then(() => {
        console.log('Connection closed.');
        console.log('finished!');
      })
      .catch((err) => {
        console.error('Error closing connection: ' + err);
        console.log('finished with errors');
      });
  })();
})
.catch((err) => {
  console.error('Error connecting to MongoDB: ' + err);
  process.exit(1); // Exit the script if there's a connection error
});
