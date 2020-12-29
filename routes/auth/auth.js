const {Router} = require('express')
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator/check')
const User = require('../../models/user')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../../keys')
const confirmEmail = require('../../emails/confirm')
const {registerValidators} = require('../../utils/validators')
const router = Router()

const transporter = nodemailer.createTransport(sendgrid({
  auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
  res.render('auth/login', {
    title: 'Авторизация',
    isLogin: true,
    loginError: req.flash('loginError'),
    registerError: req.flash('registerError')
  })
})

router.get('/logout', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login#login')
  })
})

router.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password)

      if (areSame) {
        req.session.user = candidate
        req.session.isAuthenticated = true
        req.session.save(err => {
          if (err) {
            throw err
          }
          res.redirect('/')
        })
      } else {
        req.flash('loginError', 'Неверный пароль')
        res.redirect('/auth/login#login')
      }
    } else {
      req.flash('loginError', 'Такого пользователя не существует')
      res.redirect('/auth/login#login')
    }
  } catch (e) {
    console.log(e)
  }
})

router.post('/register', registerValidators, async (req, res) => {
  try {
    const {email, password, name} = req.body
    const token = Math.random() * 10000
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      req.flash('registerError', errors.array()[0].msg)
      return res.status(422).redirect('/auth/login#register')
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const user = new User({
      email, name, password: hashPassword, notFinished: true, cart: {items: []}
    })
    res.redirect('/confirm')
    await user.save()
    await transporter.sendMail(confirmEmail(email, token))
  } catch (e) {
    console.log(e)
  }
})

module.exports = router