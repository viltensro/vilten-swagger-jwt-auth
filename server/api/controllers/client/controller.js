import ClientService from '../../services/client/service';

export class Controller {
  test (req, res) {
    ClientService.test(req)
    .then(r => res.json(r))
    .catch(err => res
      .status(err.code)
      .json(err))
  }

  signup (req, res) {
    ClientService.signup(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  activateUser (req, res) {
    ClientService.activateUser(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  resendActivation (req, res) {
    ClientService.resendActivation(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  forgotPasswordPost (req, res) {
    ClientService.forgotPasswordPost(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  forgotPasswordResetPost (req, res) {
    ClientService.forgotPasswordResetPost(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  changePassword (req, res) {
    ClientService.changePassword(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userExtrasGet (req, res) {
    ClientService.userExtrasGet(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userExtrasPost (req, res) {
    ClientService.userExtrasPost(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  resetMfa (req, res) {
    ClientService.resetMfa(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  verifyMfa (req, res) {
    ClientService.verifyMfa(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  disableMfa (req, res) {
    ClientService.disableMfa(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }
}
export default new Controller();
