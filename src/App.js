import React from 'react';
import './App.css';
import Playlist from './Components/Playlist/Playlist';
import SearchBar from './Components/SearchBar/SearchBar';
import SearchResults from './Components/SearchResults/SearchResults';
import Spotify from './util/Spotify';

class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      searchResults: [
        {id: 1, name: 'Tiny Dancer', artist: 'Elton John', album: 'Madman Across The Water'},
        {id: 2, name: 'Tiny Dancer', artist: 'Tim McGraw', album: 'Love Story'},
        {id: 3, name: 'Tiny Dancer', artist: 'Rockabye Baby!', album: 'Lullaby Renditions of Elton John'}
      ],
      playlistName: 'New Playlist',
      playlistTracks: [
        {id: 1, name: 'Tiny Dancer', artist: 'Elton John', album: 'Madman Across The Water'},
        {id: 2, name: 'Tiny Dancer', artist: 'Tim McGraw', album: 'Love Story'}
      ],
      accessTokenAvailable: false
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlayList = this.savePlayList.bind(this);
    this.search = this.search.bind(this);
    this.renderAction = this.renderAction.bind(this);
  }

  renderAction(){
    if (this.state.accessTokenAvailable || window.location.href.match(/access_token=([^&]*)/)){
      this.setState({accessTokenAvailable: true});
      return (
        <div className="App">
          <SearchBar
            onSearch={this.search}
          />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack}
            />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onNameChange={this.updatePlaylistName}
              onRemove={this.removeTrack}
              onSave={this.savePlayList}
            />
          </div>
        </div>
      );
    } else{
      return (
        <div className="App">
          <div className="Connect-Button">
            <a onClick={this.connectSpotify}>Click to <br /> Connect <br /> to Spotify</a>
          </div>
        </div>
      );
    }
  }

  connectSpotify(){
    Spotify.getAccessToken();
  }

  addTrack(track){
    let listCheck = Array.from(this.state.playlistTracks);
    let listCheckHit = false;
    listCheck.forEach(tracks => {
      if(tracks.id === track.id){
        listCheckHit = true;
      }
    });
    if(!listCheckHit){
      listCheck.push(track);
      this.setState({playlistTracks: listCheck});
    }
  }

  removeTrack(track){
    let removePlaylistTracks = this.state.playlistTracks.filter(tracks => {
      return tracks.id !== track.id;
    });
    this.setState({playlistTracks: removePlaylistTracks});
  }

  updatePlaylistName(name){
    this.setState({playlistName: name});
  }

  savePlayList(){
    let tempList = Array.from(this.state.playlistTracks);
    let trackURIs = 'uris=';
    tempList.forEach(track => {
      trackURIs = trackURIs + track.uri + ',';
    });
    trackURIs = trackURIs.slice(0,-1);
    let re = /:/gi;
    //console.log("App.js - savePlayList() - trackURIs before replace is: " + trackURIs); //Debugging
    trackURIs = trackURIs.replace(re,'%3A');
    //console.log("App.js - savePlayList() - trackURIs after replace is: " + trackURIs); //Debugging
    Spotify.save(this.state.playlistName,trackURIs);
    this.setState({
      playlistName: 'New Playlist',
      playlistTracks: []
    });
  }

  search(term){
    Spotify.search(term).then(results => {
      this.setState({searchResults: results});
    });
  }

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        {this.renderAction()}
      </div>
    );
  }
}

export default App;

/*

*/
