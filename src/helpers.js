/* Helper functions */

export function getSpotifyToken(uid){
    
    return new Promise((resolve, reject) => {
        fetch('https://jukebox-2952e.firebaseapp.com/refresh_token?uid=' + uid)
            .then((res) =>{
                resolve(res.json())
            })
            .catch((err) => reject(err))
        })
}
