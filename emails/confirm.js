const keys = require('../keys')

module.exports = function (email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Подтвердите свою почту',
        html: `
      <h1>Вы практически зарегистрировались,но вам необходимо подтвердить свою почту</h1>
      <p>Если это были не вы, то проигнорируйте данное письмо</p>
      <p><a href="${keys.BASE_URL}/confirm/${token}">Подтвердить почту</a></p>
      <hr />
      <a href="${keys.BASE_URL}">Магазин курсов</a>
    `
    }
}