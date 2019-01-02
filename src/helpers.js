/* Helper functions */

export function getRefreshToken(){
    fetch('https://jukebox-2952e.firebaseapp.com/refresh_token?refresh_token=' + this.state.refreshToken)
        .then((res) => console.log(res))
        .catch((err) => console.log(err))
}