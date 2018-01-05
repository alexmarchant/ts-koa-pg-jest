import User from '../models/user'

console.log(User)
const testUser = new User({
  id: 1,
  email: 'test@test.com',
})

const UsersController = {}

UsersController.read = (ctx) => {
  ctx.body = testUser.serialize()
}

export default UsersController
