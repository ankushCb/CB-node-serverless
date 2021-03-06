import { 
  takeLatest,
  put,
  select,
  call,
  take
} from 'redux-saga/effects';
import { Auth } from 'aws-amplify';

const loginFormSelector = state => state.form.login.values;

function* loginAttempt(action) {

  const signUpPromise = ({ username, password }) => Auth.signUp(username, password);
  const confirmSignUpPromise = ({ username, verification }) => Auth.confirmSignUp(username, verification);
  const loginPromise = ({ username, password }) => Auth.signIn(username, password);
  const currentCredentialsPromise = () => Auth.currentCredentials();

  try {
    if (action.payload.authScreen === 'register') {
      const {
        username,
        password,
      } = yield select(loginFormSelector);
      yield call(signUpPromise, { username, password });    
      yield take('CONFIRM_SIGNUP');

      const { verification } = yield select(loginFormSelector);
      yield call(confirmSignUpPromise,  { username, verification });

      yield call(loginPromise, { username, password });  
      
      const currentCredentials = yield call(currentCredentialsPromise);

      yield put({
        type: 'ATTEMPT_LOGIN_SUCCESS',
        payload: {
          identityId: currentCredentials.params.IdentityId,
        }
      });
    }
    else {
      const {
        username,
        password,
      } = yield select(loginFormSelector);
      
      yield call(loginPromise, { username, password });
      
      const currentCredentials = yield call(currentCredentialsPromise);

      yield put({
        type: 'ATTEMPT_LOGIN_SUCCESS',
        payload: {
          identityId: currentCredentials.params.IdentityId,
        }
      });
    }  
  } catch (e) {
    console.log(e);
    const errorMessage = typeof e === 'string' && e;
    yield put({
      type: 'ATTEMPT_LOGIN_FAILURE',
      payload: {
        errorMessage: e.message || errorMessage || 'Some error occured',
      }
    });

    try {
      yield take('CONFIRM_SIGNUP');
      const { username, password, verification } = yield select(loginFormSelector);

      yield call(confirmSignUpPromise, { username, verification });

      yield call(loginPromise, { username, password });  

      const currentCredentials = yield call(currentCredentialsPromise);

      yield put({
        type: 'ATTEMPT_LOGIN_SUCCESS',
        payload: {
          identityId: currentCredentials.params.IdentityId,
        }
      });

    } catch (e) {
      console.log(e);
    }
  }
}

function* attemptLoginSaga() {
  yield takeLatest('ATTEMPT_LOGIN', loginAttempt);
}

export default attemptLoginSaga;
