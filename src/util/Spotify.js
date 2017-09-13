const clientID = '125a68c2b3474a0a97081b0f39b7d123';
const redirectURI = 'http://localhost:3000/';
let accessToken;

const Spotify = {
  getAccessToken(){
    if(accessToken){
      //console.log("getAccessToken() - First If called for return 'new Promise'"); //Debugging
      return new Promise(resolve => resolve(accessToken));
    } else {
      let tokenCheck = window.location.href.match(/access_token=([^&]*)/);
      let expireCheck = window.location.href.match(/expires_in=([^&]*)/);
      //console.log("getAccessToken() - tokenCheck is: " + tokenCheck); //Debugging
      //console.log("getAccessToken() - expireCheck is: " + expireCheck); //Debugging
      if(tokenCheck){
        tokenCheck = tokenCheck[1];
      }
      //console.log("getAccessToken() - tokenCheck after reassign: " + tokenCheck); //Debugging
      if(expireCheck){
        expireCheck = expireCheck[1];
      }
      //console.log("getAccessToken() - expireCheck after reassign: " + expireCheck); //Debugging
      if(tokenCheck && expireCheck){
        accessToken = tokenCheck;
        let expireTime = expireCheck;
        //console.log("getAccessToken() - accessToken set to: " + accessToken); //Debugging
        //console.log("getAccessToken() - expireTime set to: " + expireTime); //Debugging
        window.setTimeout(() => accessToken = '', expireTime * 1000);
        window.history.pushState('Access Token', null, '/');
      } else {
        let scopes = "playlist-modify-public";
        window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=${scopes}&redirect_uri=${redirectURI}`;
      }
    }
  },
  search(term){
    if(!accessToken){
      Spotify.getAccessToken();
    }
    if(term.includes(' ')){
      //console.log("search() - term includes one or more spaces");
      term = term.trim();
      if(term.includes(' ')){
        let re = / /gi;
        //console.log("search() - term has more than spaces on either side of the string");
        term = term.replace(re,'%20');
      }
    }
    /*console.log("search() - accessToken is: " + accessToken); //Debugging
    console.log("search() - Search Term is: " + term); //Debugging
    console.log("search() ------------- search()"); //Debugging
    console.log("search() - Begin fetch operations"); //Debugging
    console.log("search() ------------- search()"); //Debugging */
    return (fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`,{
      headers: {Authorization: `Bearer ${accessToken}`}
    }).then(response => {
      let tempResponse = response.json();
      //console.log("search() - response.json() is: " + tempResponse); //Debugging
      return tempResponse;
    }).then(jsonResponse => {
      //console.log("search() - jsonResponse is: " + JSON.stringify(jsonResponse)); //Debugging
      //console.log("search() - jsonResponse.tracks is: " + jsonResponse.tracks); //Debugging
      if(jsonResponse.tracks){
        let jsonResArray = Array.from(jsonResponse.tracks.items);
        return jsonResArray.map(track => {
          /*console.log("search() --------- track start ---------"); //Debugging
          console.log("search() - track.id is: " + track.id); //Debugging
          console.log("search() - track.name is: " + track.name); //Debugging
          console.log("search() - track.artists[0].name is: " + track.artists[0].name); //Debugging
          console.log("search() - track.album.name is: " + track.album.name); //Debugging
          console.log("search() - track.uri is: " + track.uri); //Debugging
          console.log("search() ---------- track end ----------"); //Debugging */
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          };
        });
      }
      })
    );
  },
  save(name,trackURIs){
    //console.log("save() - name is: " + name); //Debugging
    //console.log("save() - trackURIs is: " + JSON.stringify(trackURIs)); //Debugging
    if(name && trackURIs.length > 5){
      let headers = {Authorization: `Bearer ${accessToken}`};
      let user;
      let playlistID;
      // Get the current user's user_id and set it to the user variable
      //console.log("save() - user is: " + user + " -- and playlistID is: " + playlistID); //Debugging
      return fetch(`https://api.spotify.com/v1/me`,{headers: headers}).then(response => {
        let tempResponse = response.json();
        //console.log("save() - response.json() is: " + tempResponse); //Debugging
        return tempResponse;
      }).then(jsonResponse => {
        //console.log("save() - jsonResponse is: " + JSON.stringify(jsonResponse)); //Debugging
        //console.log("save() - jsonResponse.tracks is: " + jsonResponse.id); //Debugging
        if(jsonResponse){
          user = jsonResponse.id;
          // Use the user variable to pass the request for creating a new Playlist
          return fetch(`https://api.spotify.com/v1/users/${user}/playlists`,{
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify({name: name})
          }).then(response => {
            let tempResponse = response.json();
            //console.log("save() - response.json() playlist is: " + tempResponse); //Debugging
            return tempResponse;
          }).then(jsonResponse => {
            //console.log("save() - jsonResponse playlist is: " + JSON.stringify(jsonResponse)); //Debugging
            playlistID = jsonResponse.id;
            //console.log("save() - jsonResponse.id playlist is: " + playlistID); //Debugging
            // Add tracks to the new Playlist
            let playlistNewTracks = `https://api.spotify.com/v1/users/${user}/playlists/${playlistID}/tracks?${trackURIs}`
            //console.log("save() - playlist tracks query is: " + playlistNewTracks); //Debugging
            return fetch(playlistNewTracks,{
              headers: {
                Authorization: `Bearer ${accessToken}`,
                //"Content-Type": "application/json"
              },
              method: 'POST'/*,
              body: JSON.stringify({uris: trackURIs})*/
            }).then(response => {
              let tempResponse = response.json();
              //console.log("save() - response.json() tracks is: " + tempResponse); //Debugging
              window.alert("Playlist saved to Spotify Account!");
              return tempResponse;
            });
          });
        }
      });
    } else{
      return console.log("No Playlist to Save");
    }
  }
};

export default Spotify;
