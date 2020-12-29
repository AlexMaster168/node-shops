const {Router} = require('express')
const router = Router()
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const keys = require('../../keys')
const regEmail = require('../../emails/registration')

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/', (req, res) => {
    res.render('auth/confirm', {
        title: 'Подтвердить почту',
        layout: 'empty'
    })
})

router.get('/time', (req, res) => {
    res.render('auth/confirm2', {
        title: 'Подтверждения почты',
        user: req.user.toObject()
    })
})

router.get('/:token', async(req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/confirm')
    }
    res.render('auth/finishRegister', {
        title: 'Вы зарегистрированы'
    })
    await transporter.sendMail(regEmail(email))
})

module.exports = router