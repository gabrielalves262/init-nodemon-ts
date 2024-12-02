import { str, cleanEnv, url } from 'envalid'

export const validateEnvs = () => {
  cleanEnv(process.env, {
    // PORT: port(),
    // HOST: host(),
  })
}