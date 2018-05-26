import AdminService from '../../services/admin/service';

export class Controller {
  userDelete (req, res) {
    AdminService.userDelete(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userList (req, res) {
    AdminService.userList(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userExtrasGet (req, res) {
    AdminService.userExtrasGet(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userExtrasSet (req, res) {
    AdminService.userExtrasSet(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }

  userResetPassword (req, res) {
    AdminService.userResetPassword(req)
      .then(r => res.json(r))
      .catch(err => res
        .status(err.code)
        .json(err))
  }
}
export default new Controller();
