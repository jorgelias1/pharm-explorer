const express = require('express')
const axios=require('axios')
const app = express()
const OAuth=require('oauth-1.0a')
const crypto=require('crypto')
const cors = require('cors')
app.use(cors())


app.get('/api/svg', (request, response) => {
        const iconId='4477632';
        const apikey='1445d0ba0dc94fdf967062479562436e';
        const secret='ddd4495bcb8748fc9975ebc06e24f55b';
        const oauth = OAuth({
            consumer: { key: apikey, secret: secret },
            signature_method: 'HMAC-SHA1',
            hash_function(base_string, key) {
                const hmac = crypto.createHmac('sha1', key);
                hmac.update(base_string);
                return hmac.digest('base64');
            },
          });
          const apiEndpoint=`https://api.thenounproject.com/v2/icon/${iconId}`
          const requestData = {
            url: apiEndpoint,
            method: 'GET',
          };
          const authorization = oauth.authorize(requestData);
          const axiosInstance = axios.create({
            headers: {
              Authorization: oauth.toHeader(authorization).Authorization,
            },
          });
          // Make the authenticated API request
          axiosInstance
          .get(apiEndpoint)
          .then(resp=>{
            const svgURL=resp.data.icon.thumbnail_url
            response.send(svgURL);
          })
          .catch(()=>{
            console.log('error')
        })
  })

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})