import express from 'express'
const app = express()
import cors from 'cors'
import svg from '../src/services/queryDb.js'

app.use(cors())


app.get('/api/svg', (request, response) => {
    svg.getSvgUrl()
    .then(url=>{
        response.send(url)
    })
    .catch(error=>{console.error(error)})
  })
app.get('/api/sec/:cik', (request, response)=>{
    const {cik}=request.params;
    svg.getSECLogic(cik)
    .then(re=>{
        response.send(re[0].data)
    })
    .catch(error=>{
        console.error(error)
    })
  })


const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})