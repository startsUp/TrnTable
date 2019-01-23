import placeholderIcon from './res/images/spotifyIcon.png'
import { reject } from 'q';
export const parseData = (dataType, data, albumRef=null) => {
    if(dataType === 'songs' || dataType === 'albumSongs')
    {
        
        console.log('Data', data)
        var tracks = []
        data.items.forEach(item => { 
            var track = item.track ? item.track : item
            
            var icon = null
            var albumArt = null
            var name = null
            if(dataType === 'albumSongs'){
                track = item
                icon = albumRef.iconURL
                albumArt = albumRef.albumArt
                name = albumRef.name
            }else{
                icon = track.album.images[2].url
                albumArt = track.album.images
                name = track.album.name
            }
                

            var artists = track.artists.map(elem => {return elem.name}).join(", ")
            tracks.push({trackName: track.name,
                         content: track.name,
                         subContent: artists,
                         artists: artists,
                         iconURL: icon,
                         albumArt: albumArt,
                         albumName: name, 
                         id: track.id, 
                         uri: track.uri})
        })
        return tracks
    }
    else if (dataType === 'playlist')
    {
        var playlists = []
       
        data.items.forEach(item => { 
            playlists.push({name: item.name,
                         content: item.name,
                         iconURL: item.images.length > 0 ? item.images[0].url : placeholderIcon, 
                         id: item.id, 
                         uri: item.uri,
                         ownerID: item.owner.id})
        })
        return playlists
    }
    else if (dataType === 'albums')
    {
        var albums = []
        data.items.forEach(item => { 
            var album = item.album ? item.album : item
            var artists = album.artists.map(elem => {return elem.name}).join(", ")
            albums.push({name: album.name,
                         artists: artists,
                         content: album.name,
                         subContent: artists,
                         iconURL: album.images[2].url,
                         albumArt: album.images,
                         id: album.id,
                         totalTracks: album.total_tracks, 
                         uri: album.uri})
        })

        return albums
    } 
    else if (dataType === 'artists')
    {
        var artists = []
        data.items.forEach(item => {
            var icon = item.images[2] ?  item.images[2].url : placeholderIcon
            artists.push({
                            name: item.name,
                            content: item.name,
                            iconURL: icon,
                            id: item.id,
                            uri: item.uri
                        })
        })
        return artists
    }      
}

export const hostListeners = (dbRef, roomCode, initTimestamp, callback) => {
    var requests = dbRef.collection('tracksInRoom').doc(roomCode).collection('requested').orderBy('timeAdded').startAt(initTimestamp)
                .onSnapshot((snapshot) => {
                    console.log(snapshot)
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            var doc = change.doc
                            let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                            if (source === 'Server') {
                                callback('request', doc.data())
                            } else {
                            // Do nothing, it's a local update so ignore it
                            }
                            
                        }   
                    })
                })
    var users = dbRef.collection('rooms').doc(roomCode).collection('users').orderBy('joinedTimestamp').startAt(initTimestamp)
                    .onSnapshot((snapshot) => {
                        console.log(snapshot)
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                var doc = change.doc
                                let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                                if (source === 'Server') {
                                    //update local queueStat
                                    callback('guest', doc.data())
                                    
                                } else {
                                // Do nothing, it's a local update so ignore it
                                }
                                
                            }   
                        })
                    })
    
    var votes = dbRef.collection('nowPlaying').doc(roomCode)
                    .onSnapshot((doc) => {
                        
                        if(doc.exists){
                    
                            callback('votes', doc.data().votes)
                        }
                    })

    return [{unsubscribe: requests}, {unsubscribe:users}, {unsubscribe: votes}]
}

export const guestListeners = (dbRef, roomCode, initTimestamp, callback) => {
    var requests = dbRef.collection('tracksInRoom').doc(roomCode).collection('requested').orderBy('timeAdded').startAt(initTimestamp)
                .onSnapshot((snapshot) => {
                    console.log(snapshot)
                    snapshot.docChanges().forEach((change) => {
                        if (change.type === "added") {
                            var doc = change.doc
                            let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                            if (source === 'Server') {
                                callback('request', doc.data())
                            } else {
                            // Do nothing, it's a local update so ignore it
                            }
                            
                        }   
                    })
                })
    var users = dbRef.collection('rooms').doc(roomCode).collection('users').orderBy('joinedTimestamp').startAt(initTimestamp)
                    .onSnapshot((snapshot) => {
                        console.log(snapshot)
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === "added") {
                                var doc = change.doc
                                let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                                if (source === 'Server') {
                                    //update local queueStat
                                    callback('guest', doc.data())
                                    
                                } else {
                                // Do nothing, it's a local update so ignore it
                                }
                                
                            }   
                        })
                    })

    var queue = dbRef.collection('tracksInRoom').doc(roomCode).collection('tracks').orderBy('timeAdded').startAt(initTimestamp)
        .onSnapshot((snapshot) => {
            console.log(snapshot)
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    var doc = change.doc
                    let source = doc.metadata.hasPendingWrites ? 'Local' : 'Server'
                    if (source === 'Server') {
                        //update local queueStat
                        callback('queue', doc.data())
                        
                    } else {
                    // Do nothing, it's a local update so ignore it
                    }
                    
                }   
            })
        })


    var nowPlaying = dbRef.collection('nowPlaying').doc(roomCode)
                    .onSnapshot((doc) => {
                        
                        if(doc.exists){
                    
                            callback('nowPlaying', doc.data().trackID)
                        }
                    })

    return [{unsubscribe: requests}, {unsubscribe:users}, {unsubscribe: queue}, {unsubscribe: nowPlaying}]
}

export const getGuests = async (dbRef, roomCode) => {
    return new Promise((resolve, reject) => {
        dbRef.collection('rooms').doc(roomCode).collection('users').orderBy('timeJoined').get()
            .then((snapshot)=>{
                resolve(snapshot.docs.map(doc=> doc.data()))
            })
            .catch(err => reject(err))
    })
} 
export const getRequests = async (dbRef, roomCode) => {
    return new Promise((resolve, reject) => {
        dbRef.collection('tracksInRoom').doc(roomCode).collection('requested').orderBy('timeAdded').get()
            .then((snapshot)=>{
                resolve(snapshot.docs.map(doc=> doc.data()))
            })
            .catch(err => reject(err))
    })
}

export const updateNowPlaying = async (dbRef, roomCode) => {
    return new Promise((resolve, reject) => {
        dbRef.collection('')
    })
}

export const getViewDescription = (view, playlist, album) => {
    var desc = null
    switch (view) {
        case 'queue':
            desc = 'Tracks Added'
            break;
        case 'search':
            desc = 'Search Results'
            break;
        case 'playlist':
            desc = 'Saved Playlists'
            break;
        case 'songs': 
            desc = 'Saved Songs'
            break;
        case 'albums': 
            desc = 'Saved Albums'
            break;
        case 'playlistTracks': 
            desc = playlist.name
            break;  
        case 'albumTracks': 
            desc = album.name
            break;  
        default:
            break;
    }
    return desc
} 


export const isAlreadyInQueue = (queue, track) => {
    for (let i = 0; i < queue.length; i++) {
        if(queue[i].id === track.id)
            return true
    }
    return false
}

export const updateVote = (dbRef, roomCode, vote, prevVote) => {
    
    var nowPlayingRef = dbRef.collection('nowPlaying').doc(roomCode)

    dbRef.runTransaction((transaction) => {
        return transaction.get(nowPlayingRef).then((nowPlayingDoc) => {
            if (!nowPlayingDoc.exists || !nowPlayingDoc.data().votes) {
                throw "Document does not exist!";
            }
            var like = (vote.like ? 1:(prevVote.like ? -1: 0))
            var dislike = (vote.dislike ? 1:(prevVote.dislike ? -1: 0))
            var updatedLikes = nowPlayingDoc.data().votes.likes + like
            var updatedDislikes = nowPlayingDoc.data().votes.dislikes + dislike;

            if (updatedDislikes <= 1000000 || updatedLikes <= 1000000) {
                transaction.update(nowPlayingRef, {votes:{likes: updatedLikes, 
                                                         dislikes: updatedDislikes}})
                return [updatedLikes, updatedDislikes]
            } else {
                return Promise.reject("Sorry! Votes exceeded.")
            }
        })
        }).then((votes)=> {
            console.log({votes: votes})
        }).catch((err) =>{
            console.error(err)
        })
}