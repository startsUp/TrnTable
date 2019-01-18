import placeholderIcon from './res/images/spotifyIcon.png'
export const parseData = (dataType, data, albumRef=null) => {
    if(dataType === 'songs' || dataType === 'albumSongs')
    {
        
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