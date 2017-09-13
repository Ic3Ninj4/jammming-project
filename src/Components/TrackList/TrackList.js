import React from 'react';
import './TrackList.css';
import Track from '../Track/Track';
let trackArray;

class TrackList extends React.Component {
  mapTracks(){
    trackArray = Array.from(this.props.tracks);
    return trackArray.map(track => {
      return (
        <Track
          key={track.id}
          track={track}
          onAdd={this.props.onAdd}
          isRemoval={this.props.isRemoval}
          onRemove={this.props.onRemove}
        />
      );
    });
  }
  render(){
    return (
      <div className="TrackList">
        {this.mapTracks()}
      </div>
    );
  }
}

export default TrackList;
