export default function (app) {
  app.get('/p/:username', (req, res) => {
    const { user } = req;
    const { username, description } = user;
    res.render('users/profile', {
      username,
      description,
      lud16: user.lud16(),
    });
  });
}
