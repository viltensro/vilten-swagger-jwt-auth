import AuthService from '../../services/auth/service';

export class Controller {
  login (req, res) {
    AuthService.login(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  logout (req, res) {
    AuthService.logout(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }
}
export default new Controller();
