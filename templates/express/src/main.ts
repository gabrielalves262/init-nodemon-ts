import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const { PORT = 3000 } = process.env

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!')
})

app.listen(PORT, () => {
  console.log('Server is running on port %s', PORT)
})