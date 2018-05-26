import clientRouter from './api/controllers/client/router'
import authRouter from './api/controllers/auth/router'
import adminRouter from './api/controllers/admin/router'

export default function routes(app) {
  app.use('/api/v1/client', clientRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/admin', adminRouter)
}
