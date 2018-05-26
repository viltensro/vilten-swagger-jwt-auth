// mailer
// author vilten
'use strict'

import nodemailer from 'nodemailer'
import l from '../logger'

var Transporter = null

const Mailer = {
  getMailer() {
    if (Transporter === null) {
      Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        secure: process.env.SMTP_SECURE === 'true',
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      })
      return Transporter
    } else {
      return Transporter
    }
  }
}

export default Mailer
